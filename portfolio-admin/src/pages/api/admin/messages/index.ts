import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
    
    const { filter = 'all' } = req.query;
    
    let query = {};
    if (filter !== 'all') {
      query = { status: filter };
    }
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
} 