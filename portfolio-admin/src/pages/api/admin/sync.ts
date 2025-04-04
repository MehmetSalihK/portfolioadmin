import { NextApiRequest, NextApiResponse } from 'next';
import initializeAdmin from '@/lib/init-admin';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Connexion à la base de données
    await dbConnect();

    // Synchroniser l'admin
    await initializeAdmin();

    // Récupérer l'admin pour avoir les dates formatées
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    return res.status(200).json({ 
      message: 'Admin synchronisé avec succès',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        createdAt: admin.formattedCreatedAt,
        updatedAt: admin.formattedUpdatedAt,
        lastLogin: admin.formattedLastLogin
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la synchronisation:', error?.message || error);
    return res.status(500).json({ 
      error: error?.message || 'Erreur lors de la synchronisation',
      details: error?.stack
    });
  }
}
