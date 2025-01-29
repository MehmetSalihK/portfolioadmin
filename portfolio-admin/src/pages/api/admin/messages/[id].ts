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

  const { id } = req.query;

  await connectDB();

  if (req.method === 'PATCH') {
    try {
      const message = await Message.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update message' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Message.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 