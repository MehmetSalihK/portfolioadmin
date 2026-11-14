import { NextApiRequest, NextApiResponse } from 'next';
import initializeAdmin from '@/lib/init-admin';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { requireAdmin } from '@/lib/auth-guard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Synchronisation = réécriture des identifiants admin → réservée admin.
  // (Avant : appelable par n'importe qui, même anonyme.)
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  try {
    await dbConnect();

    await initializeAdmin();

    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    return res.status(200).json({ 
      message: 'Admin synchronisé avec succès',
      admin: admin
        ? {
            // Pas d'email (PII) ni de stack : ni l'un ni l'autre n'est
            // nécessaire à l'appelant et ne doit transiter par l'API.
            name: admin.name,
            role: admin.role,
            createdAt: admin.formattedCreatedAt,
            updatedAt: admin.formattedUpdatedAt,
            lastLogin: admin.formattedLastLogin
          }
        : null
    });
  } catch (error: any) {
    console.error('Erreur lors de la synchronisation:', error?.message || error);
    return res.status(500).json({ 
      // Message générique : jamais de message/stack interne en réponse.
      error: 'Erreur lors de la synchronisation'
    });
  }
}
