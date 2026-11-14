import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import fs from 'fs';
import path from 'path';

/** Rejette les clés d'opérateur Mongo ($set, $unset…) et la pollution de
 *  prototype : `findByIdAndUpdate(id, req.body)` traitait sinon n'importe
 *  quelle clé comme un opérateur d'écriture. */
function unsafeKey(body: unknown): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'corps invalide';
  const key = Object.keys(body).find(
    (k) => k.startsWith('$') || ['__proto__', 'constructor', 'prototype'].includes(k)
  );
  return key || null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }

        // Nettoyage best-effort des fichiers uploadés référencés
        // (imageUrl + gallery) pour éviter les orphelins.
        const filesToClean = new Set<string>();
        const collect = (u: unknown) => {
          if (typeof u !== 'string') return;
          if (u.startsWith('/uploads/')) filesToClean.add(u);
        };
        collect(project.imageUrl);
        (project.gallery || []).forEach(collect);
        for (const rel of Array.from(filesToClean)) {
          try {
            const full = path.join(process.cwd(), 'public', rel.replace(/^\/+/, ''));
            if (fs.existsSync(full)) fs.unlinkSync(full);
          } catch (e) {
            console.warn('Cleanup fichier projet échoué:', rel, e);
          }
        }

        await Project.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Project deleted successfully' });
      } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({ message: 'Failed to delete project' });
      }

    case 'PUT':
      try {
        const badKey = unsafeKey(req.body);
        if (badKey) {
          return res.status(400).json({ message: `Champ de mise à jour invalide : ${badKey}` });
        }

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
