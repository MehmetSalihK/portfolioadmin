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
    return res.status(401).json({ message: 'Non autorisé' });
  }

  await connectDB();
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const experience = await Experience.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(experience);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

    case 'DELETE':
      try {
        await Experience.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Expérience supprimée' });
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
