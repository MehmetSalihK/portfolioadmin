import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import Project from '../../../models/Project';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        const projects = await Project.find({}).lean();
        
        const projectsWithStats = projects.map(project => {
          if (!project.stats) {
            project.stats = {
              demoClicks: 0,
              githubClicks: 0,
              views: 0,
              lastClicked: null,
              clickHistory: [],
              dailyStats: []
            };
          }
          return project;
        });

        return res.status(200).json(projectsWithStats);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
