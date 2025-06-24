import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import path from 'path';
import fs from 'fs';

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
        // Debug: Afficher les données reçues
        console.log('Données reçues dans l\'API PUT:', req.body);
        
        // Si un nouveau diplôme est uploadé, supprimer l'ancien
        if (req.body.diplomaFilePath || req.body.diplomaFile) {
          const existingEducation = await Education.findById(id);
          if (existingEducation && (existingEducation.diplomaFilePath || existingEducation.diplomaFile)) {
            const oldFilePath = existingEducation.diplomaFilePath || existingEducation.diplomaFile;
            if (oldFilePath && oldFilePath.startsWith('/uploads/')) {
              const fullPath = path.join(process.cwd(), 'public', oldFilePath);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            }
          }
        }
        
        const updatedEducation = await Education.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );
        
        // Debug: Afficher ce qui a été sauvegardé
        console.log('Formation mise à jour:', updatedEducation);
        
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