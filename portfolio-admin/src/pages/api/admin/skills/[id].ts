import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      await connectDB();

      const skill = await Skill.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );

      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      return res.status(200).json(skill);    } catch (error) {
      console.error('Error updating skill:', error);
      return res.status(500).json({ error: 'Failed to update skill' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 