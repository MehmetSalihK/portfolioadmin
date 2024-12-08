import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid experience ID' });
  }

  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const experience = await Experience.findByIdAndDelete(id);
        
        if (!experience) {
          return res.status(404).json({ message: 'Experience not found' });
        }

        return res.status(200).json({ message: 'Experience deleted successfully' });
      } catch (error) {
        console.error('Error deleting experience:', error);
        return res.status(500).json({ message: 'Failed to delete experience' });
      }

    case 'PUT':
      try {
        const experience = await Experience.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!experience) {
          return res.status(404).json({ message: 'Experience not found' });
        }

        return res.status(200).json(experience);
      } catch (error) {
        console.error('Error updating experience:', error);
        return res.status(500).json({ message: 'Failed to update experience' });
      }

    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
