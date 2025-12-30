import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import Message from '@/models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Strict Admin Role Check
  if ((session.user as any).role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // 1. Fetch Integration Counts
    const [projectCount, skillCount, experienceCount, messageCount] = await Promise.all([
      Project.countDocuments(),
      Skill.countDocuments(),
      Experience.countDocuments(),
      Message.countDocuments(),
    ]);

    const unreadMessagesCount = await Message.countDocuments({ read: false });

    // 2. Fetch Recent Activity (Limit 5 from each, then sort and take top 10)
    // We fetch a bit more to merge and sort in memory since they are different collections
    const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5).select('title createdAt _id').lean();
    const recentSkills = await Skill.find().sort({ createdAt: -1 }).limit(5).select('name createdAt _id').lean();
    const recentExperiences = await Experience.find().sort({ createdAt: -1 }).limit(5).select('position company createdAt _id').lean();

    const activityFeed = [
      ...recentProjects.map(p => ({ type: 'project', action: 'created', title: p.title, date: p.createdAt, id: p._id })),
      ...recentSkills.map(s => ({ type: 'skill', action: 'created', title: s.name, date: s.createdAt, id: s._id })),
      ...recentExperiences.map(e => ({ type: 'experience', action: 'created', title: `${e.position} at ${e.company}`, date: e.createdAt, id: e._id })),
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Keep top 5 most recent

    // 3. Data for Charts
    // Example: Projects by Category
    const projectsByCategory = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Example: Skills by Category
    const skillsByCategory = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      counts: {
        projects: projectCount,
        skills: skillCount,
        experiences: experienceCount,
        messages: messageCount,
        unreadMessages: unreadMessagesCount,
      },
      recentActivity: activityFeed,
      charts: {
        projectsByCategory: projectsByCategory.map(p => ({ name: p._id || 'Uncategorized', value: p.count })),
        skillsByCategory: skillsByCategory.map(s => ({ name: s._id || 'Uncategorized', value: s.count })),
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
