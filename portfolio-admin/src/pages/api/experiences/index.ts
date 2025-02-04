import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';
import { format } from 'date-fns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const experiences = await Experience.find().lean();
      
      // Formater les dates pour l'affichage
      const formattedExperiences = experiences.map(exp => ({
        ...exp,
        startDate: exp.startDate ? format(new Date(exp.startDate), 'yyyy-MM') : null,
        endDate: exp.endDate ? format(new Date(exp.endDate), 'yyyy-MM') : null,
      }));

      return res.status(200).json(formattedExperiences);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des expériences' });
    }
  }

  switch (req.method) {
    case 'POST':
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      try {
        const { startDate, endDate, ...otherData } = req.body;
        
        // Convertir les dates au format YYYY-MM en Date
        const formattedStartDate = new Date(startDate);
        // Si c'est un poste actuel ou si pas de date de fin, mettre à null
        const formattedEndDate = endDate ? new Date(endDate) : null;

        const experience = await Experience.create({
          ...otherData,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });

        return res.status(201).json(experience);
      } catch (error: any) {
        console.error('Erreur création expérience:', error);
        return res.status(400).json({ 
          error: 'Erreur lors de la création de l\'expérience',
          details: error.message 
        });
      }

    case 'DELETE':
      const deleteSession = await getServerSession(req, res, authOptions);
      if (!deleteSession) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      try {
        const { id } = req.query;
        await Experience.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Expérience supprimée' });
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
