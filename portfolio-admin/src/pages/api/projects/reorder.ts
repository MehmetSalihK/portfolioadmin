import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    const { projectIds } = req.body;

    if (!projectIds || !Array.isArray(projectIds)) {
      return res.status(400).json({ message: 'Invalid project IDs array' });
    }

    // Mettre à jour l'ordre de chaque projet
    const updatePromises = projectIds.map((projectId: string, index: number) => {
      return Project.findByIdAndUpdate(
        projectId,
        { order: index },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Project order updated successfully' });
  } catch (error) {
    console.error('Error updating project order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}