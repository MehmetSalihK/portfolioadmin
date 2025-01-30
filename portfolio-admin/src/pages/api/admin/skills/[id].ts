import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      await connectDB();
      console.log('Updating skill:', id, req.body); // Debug log

      const skill = await Skill.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );

      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      console.log('Updated skill:', skill); // Debug log
      return res.status(200).json(skill);
    } catch (error) {
      console.error('Error updating skill:', error);
      return res.status(500).json({ error: 'Failed to update skill' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 