import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const project = await Project.findByIdAndDelete(id);
        
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }

        return res.status(200).json({ message: 'Project deleted successfully' });
      } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({ message: 'Failed to delete project' });
      }

    case 'PUT':
      try {
        const project = await Project.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }

        return res.status(200).json(project);
      } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({ message: 'Failed to update project' });
      }

    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
