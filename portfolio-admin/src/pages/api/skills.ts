import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const skills = await Skill.find({}).lean();
      return res.status(200).json(skills);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
  }
} 