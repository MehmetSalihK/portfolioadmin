import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import TwoFactorAuth from '@/models/TwoFactorAuth';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

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

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Le code doit contenir exactement 6 chiffres' });
    }

    await connectDB();

    // Chercher le code 2FA
    const twoFactorAuth = await TwoFactorAuth.findOne({ 
      email, 
      code,
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

    // Incrémenter les tentatives
    await twoFactorAuth.incrementAttempts();

    // Vérifier le code
    if (twoFactorAuth.code !== code) {
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

    // Créer un token JWT temporaire pour NextAuth
    const token = jwt.sign(
      { 
        user,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 heures
      },
      process.env.NEXTAUTH_SECRET!
    );

    console.log(`Authentification 2FA réussie pour ${email}`);

    // Supprimer le code 2FA utilisé
    await TwoFactorAuth.deleteOne({ _id: twoFactorAuth._id });

    res.status(200).json({ 
      success: true, 
      message: 'Authentification réussie',
      token,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la vérification 2FA:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}