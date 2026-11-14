import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import TwoFactorAuth from '@/models/TwoFactorAuth';
import Admin from '@/models/Admin';
import { buildTwoFaSetCookie } from '@/lib/two-fa';
import { enforceRateLimit } from '@/utils/rateLimit';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Limite stricte : un code à 6 chiffres ne doit pas pouvoir être forcé.
  if (await enforceRateLimit(req, res, 'auth:verify-2fa', 10)) {
    return;
  }

  try {
    const { email, code } = req.body;

    // Types stricts : évite les objets injectés ({ $ne: null }) dans la
    // requête Mongo et les valeurs non chaînes.
    if (typeof email !== 'string' || typeof code !== 'string' || !email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Le code doit contenir exactement 6 chiffres' });
    }

    await connectDB();

    // Chercher le code 2FA (non vérifié) pour cet email
    const twoFactorAuth = await TwoFactorAuth.findOne({ 
      email, 
      verified: false 
    });

    if (!twoFactorAuth) {
      return res.status(401).json({ error: 'Code invalide ou expiré' });
    }

    // Vérifier si le code est encore valide
    if (!twoFactorAuth.isValid()) {
      await TwoFactorAuth.deleteOne({ _id: twoFactorAuth._id });
      return res.status(401).json({ 
        error: 'Code expiré ou trop de tentatives. Veuillez demander un nouveau code.' 
      });
    }

    // Comparaison en temps constant pour éviter les fuites par timing
    const storedBuf = Buffer.from(twoFactorAuth.code);
    const inputBuf = Buffer.from(code);
    const codesMatch =
      storedBuf.length === inputBuf.length &&
      crypto.timingSafeEqual(storedBuf, inputBuf);

    // Incrémenter les tentatives (anti brute-force)
    await twoFactorAuth.incrementAttempts();

    if (!codesMatch) {
      const remainingAttempts = 3 - twoFactorAuth.attempts;
      if (remainingAttempts <= 0) {
        await TwoFactorAuth.deleteOne({ _id: twoFactorAuth._id });
        return res.status(401).json({ 
          error: 'Trop de tentatives. Veuillez demander un nouveau code.' 
        });
      }
      return res.status(401).json({ 
        error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s).` 
      });
    }

    // Marquer le code comme vérifié
    await twoFactorAuth.markAsVerified();

    // Récupérer les informations de l'utilisateur
    let user;
    if (email === process.env.ADMIN_EMAIL) {
      user = {
        id: 'default-admin',
        email: process.env.ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
      };
    } else {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
      
      // Mettre à jour la dernière connexion
      await Admin.findByIdAndUpdate(admin._id, {
        lastLogin: new Date(),
      });
      
      user = {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
    }

    // Supprimer le code 2FA utilisé (anti-rejeu)
    await TwoFactorAuth.deleteOne({ _id: twoFactorAuth._id });

    // Émettre la preuve 2FA signée (cookie HttpOnly) : c'est elle qui
    // autorise `authorize()` à créer la session NextAuth. L'ancien JWT
    // auto-signé de 24 h (jeton transportable) est supprimé.
    res.setHeader('Set-Cookie', buildTwoFaSetCookie(String(email)));

    // Adresse non journalisée (PII) dans les logs serveur.
    console.log('Authentification 2FA réussie');

    res.status(200).json({ 
      success: true, 
      message: 'Authentification réussie',
      user
    });
  } catch (error) {
    console.error('Erreur lors de la vérification 2FA:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}