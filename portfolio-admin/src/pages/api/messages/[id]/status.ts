import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  if (!status || !['unread', 'read', 'archived'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  await connectDB();

  try {
    const message = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.status(200).json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    return res.status(500).json({ message: 'Failed to update message status' });
  }
}
