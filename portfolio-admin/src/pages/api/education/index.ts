import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Education from '@/models/Education';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectDB();

    switch (req.method) {
      case 'GET':
        try {
          const educations = await Education.find().sort({ startDate: -1 });
          res.status(200).json(educations);
        } catch (error) {
          console.error('Erreur GET:', error);
          res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
        }
        break;

      case 'POST':
        try {
          console.log('Données reçues:', req.body);
          const education = await Education.create(req.body);
          res.status(201).json(education);
        } catch (error) {
          console.error('Erreur POST:', error);
          res.status(500).json({ 
            error: 'Erreur lors de la création de la formation',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}