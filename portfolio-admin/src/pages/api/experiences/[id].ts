import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  await connectDB();
  const { id } = req.query;

  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        // Anti opérateur Mongo / pollution de prototype (mass-assignment).
        const body =
          req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : null;
        const unsafeKey = body
          ? Object.keys(body).find(
              (k) => k.startsWith('$') || ['__proto__', 'constructor', 'prototype'].includes(k)
            )
          : 'corps invalide';
        if (unsafeKey) {
          return res.status(400).json({ error: `Champ de mise à jour invalide : ${unsafeKey}` });
        }

        const experience = await Experience.findByIdAndUpdate(id, body, { new: true });
        return res.status(200).json(experience);
      } catch (error) {
        console.error('Error updating experience:', error);
        // Message générique : pas de message d'erreur interne en réponse.
        return res.status(400).json({ error: 'Mise à jour impossible' });
      }

    case 'DELETE':
      try {
        await Experience.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Expérience supprimée' });
      } catch (error) {
        console.error('Error deleting experience:', error);
        return res.status(400).json({ error: 'Suppression impossible' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
