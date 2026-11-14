import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import path from 'path';
import fs from 'fs';
import { resolveSafePath } from '@/utils/pathSafety';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Écriture (PUT/DELETE) → rôle admin exigé.
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  const { id } = req.query;

  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }

  await connectDB();

  switch (req.method) {
    case 'PUT':
      try {
        // Garde anti mass-assignment : aucune clé d'opérateur Mongo ni de
        // prototype dans le corps (évite $unset/$rename et le pollution).
        const body =
          req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
        const unsafeKey = Object.keys(body).find(
          (key) => key.startsWith('$') || ['__proto__', 'constructor', 'prototype'].includes(key)
        );
        if (unsafeKey) {
          return res.status(400).json({ error: 'Clé de mise à jour invalide' });
        }

        // Si un nouveau diplôme est uploadé, supprimer l'ancien fichier.
        // Chemin résolu puis contraint à public/ (le startsWith acceptait
        // « /uploads/../../... » → suppression hors du dossier uploads).
        if (body.diplomaFilePath || body.diplomaFile) {
          const existingEducation = await Education.findById(id);
          if (existingEducation && (existingEducation.diplomaFilePath || existingEducation.diplomaFile)) {
            const oldFilePath = existingEducation.diplomaFilePath || existingEducation.diplomaFile;
            if (oldFilePath && oldFilePath.startsWith('/uploads/')) {
              const fullPath = resolveSafePath(
                path.join(process.cwd(), 'public'),
                String(oldFilePath).replace(/^\/+/, '')
              );
              if (fullPath && fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            }
          }
        }

        const updatedEducation = await Education.findByIdAndUpdate(
          id,
          body,
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