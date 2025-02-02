import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const experiences = await Experience.find({}).sort({ startDate: -1 });
      return res.status(200).json(experiences);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  switch (req.method) {
    case 'POST':
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      try {
        const experience = await Experience.create(req.body);
        return res.status(201).json(experience);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

    case 'DELETE':
      const deleteSession = await getServerSession(req, res, authOptions);
      if (!deleteSession) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      try {
        const { id } = req.query;
        await Experience.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Expérience supprimée' });
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
