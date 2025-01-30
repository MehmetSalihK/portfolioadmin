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

  await connectDB();

  switch (req.method) {
    case 'POST':
      try {
        const experience = await Experience.create(req.body);
        return res.status(201).json(experience);
      } catch (error: any) {
        console.error('Error creating experience:', error);
        return res.status(400).json({
          message: error.message || 'Failed to create experience',
        });
      }

    case 'GET':
      try {
        const experiences = await Experience.find({}).sort({ startDate: -1 });
        return res.status(200).json(experiences);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        return res.status(500).json({ message: 'Failed to fetch experiences' });
      }

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
