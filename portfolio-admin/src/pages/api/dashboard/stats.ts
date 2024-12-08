import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  await connectDB();

  try {
    const [unreadMessages, totalProjects, totalSkills, totalExperiences] =
      await Promise.all([
        Contact.countDocuments({ status: 'unread' }),
        Project.countDocuments(),
        Skill.countDocuments(),
        Experience.countDocuments(),
      ]);

    return res.status(200).json({
      unreadMessages,
      totalProjects,
      totalSkills,
      totalExperiences,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
}
