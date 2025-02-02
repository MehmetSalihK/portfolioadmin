import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const skills = await Skill.find({}).sort('name');
        return res.status(200).json(skills);
      } catch (error) {
        return res.status(500).json({ error: 'Erreur lors du chargement des compétences' });
      }

    case 'POST':
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      try {
        const skill = await Skill.create(req.body);
        return res.status(201).json(skill);
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
        await Skill.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Compétence supprimée' });
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
