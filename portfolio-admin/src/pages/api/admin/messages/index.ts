import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

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