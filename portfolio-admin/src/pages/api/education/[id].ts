import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Education from '@/models/Education';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { id } = req.query;

  await connectDB();

  switch (req.method) {
    case 'PUT':
      try {
        const updatedEducation = await Education.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );
        if (!updatedEducation) {
          return res.status(404).json({ error: 'Formation non trouvée' });
        }
        res.status(200).json(updatedEducation);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la modification de la formation' });
      }
      break;

    case 'DELETE':
      try {
        const deletedEducation = await Education.findByIdAndDelete(id);
        if (!deletedEducation) {
          return res.status(404).json({ error: 'Formation non trouvée' });
        }
        res.status(200).json({ message: 'Formation supprimée avec succès' });
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la formation' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}