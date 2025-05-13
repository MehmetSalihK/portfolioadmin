import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Education from '@/models/Education';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const educations = await Education.find().sort({ startDate: -1 });
        res.status(200).json(educations);
      } catch (error) {
        res.status(500).json({ error: 'Error retrieving educations' });
      }
      break;

    case 'POST':
      try {
        const education = await Education.create(req.body);
        res.status(201).json(education);
      } catch (error) {
        res.status(500).json({ error: 'Error creating education' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}