import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const messages = await Message.find({})
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 