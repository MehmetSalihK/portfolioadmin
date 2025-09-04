import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import TwoFactorAuth from '@/models/TwoFactorAuth';
import Admin from '@/models/Admin';
import { send2FACode, generate2FACode } from '@/services/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    await connectDB();

    // Vérifier les identifiants d'abord
    let isValidCredentials = false;
    
    console.log('DEBUG: Email reçu =', email);
    console.log('DEBUG: ADMIN_EMAIL =', process.env.ADMIN_EMAIL);
    console.log('DEBUG: Email match =', email === process.env.ADMIN_EMAIL);
    console.log('DEBUG: Password match =', password === process.env.ADMIN_PASSWORD);
    
    // Vérifier si c'est l'admin par défaut
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      console.log('DEBUG: Admin par défaut valide');
      isValidCredentials = true;
    } else {
      console.log('DEBUG: Vérification en base de données');
      // Vérifier dans la base de données
      const admin = await Admin.findOne({ email }).select('+password');
      console.log('DEBUG: Admin trouvé =', !!admin);
      if (admin) {
        const passwordMatch = await admin.comparePassword(password);
        console.log('DEBUG: Password match =', passwordMatch);
        if (passwordMatch) {
          isValidCredentials = true;
        }
      }
    }

    if (!isValidCredentials) {
      console.log('DEBUG: Authentification échouée');
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }
    
    console.log('DEBUG: Authentification réussie');

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

    // Envoyer l'email avec le code
    console.log('DEBUG: Tentative d\'envoi d\'email avec code:', code);
    try {
      await send2FACode({ userEmail: email, code });
      console.log(`DEBUG: Email envoyé avec succès pour ${email}`);
    } catch (emailError) {
      console.error('DEBUG: Erreur lors de l\'envoi d\'email:', emailError);
      throw emailError;
    }

    console.log(`Code 2FA généré et envoyé pour ${email}`);

    res.status(200).json({ 
          success: true, 
          message: 'Code de vérification envoyé à salihketur60@gmail.com',
          email: 'salihketur60@gmail.com' // Indiquer où le code a été envoyé
        });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code 2FA:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}