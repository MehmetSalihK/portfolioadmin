import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import TwoFactorAuth from '@/models/TwoFactorAuth';
import Admin from '@/models/Admin';
import { send2FACode, generate2FACode } from '@/services/emailService';
import { enforceRateLimit } from '@/utils/rateLimit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Protection credential-storming / spam d'emails (5 envois par minute).
  if (await enforceRateLimit(req, res, 'auth:send-2fa', 5)) {
    return;
  }

  try {
    const { email, password } = req.body;

    // Types stricts : empêche l'injection NoSQL via des objets
    // ({ email: { $ne: null } }) et les valeurs non chaînes.
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (!email || !password || email.length > 254 || password.length > 128) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    await connectDB();

    // Vérifier les identifiants d'abord.
    // Aucun log de debug ici : ni email (PII), ni référence au mot de passe.
    let isValidCredentials = false;

    // Vérifier si c'est l'admin par défaut
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      isValidCredentials = true;
    } else {
      // Vérifier dans la base de données (email déjà typé string → pas
      // d'injection NoSQL possible dans la requête)
      const admin = await Admin.findOne({ email }).select('+password');
      if (admin) {
        const passwordMatch = await admin.comparePassword(password);
        if (passwordMatch) {
          isValidCredentials = true;
        }
      }
    }

    if (!isValidCredentials) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }

    // Supprimer les anciens codes 2FA pour cet email
    await TwoFactorAuth.deleteMany({ email });

    // Générer un nouveau code 2FA
    const code = generate2FACode();

    // Sauvegarder le code en base
    const twoFactorAuth = new TwoFactorAuth({
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await twoFactorAuth.save();

    // Envoyer l'email avec le code (jamais le code ni l'adresse en log)
    try {
      await send2FACode({ userEmail: email, code });
    } catch (emailError) {
      console.error("Erreur lors de l'envoi d'email 2FA:", emailError);
      throw emailError;
    }

    console.log('Code 2FA envoyé (adresse non journalisée)');

    res.status(200).json({
      success: true,
      // Aucune adresse email dans la réponse (PII) : l'expéditeur reste
      // identique à l'adresse saisie, sans révéler d'adresse en clair.
      message: 'Code de vérification envoyé'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code 2FA:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}