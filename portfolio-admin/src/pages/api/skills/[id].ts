import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';
import { requireAdmin } from '@/lib/auth-guard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Écriture (DELETE/PUT/PATCH) → rôle admin exigé, pas seulement « connecté ».
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid skill ID' });
  }

  await connectDB();

  switch (req.method) {
    case 'DELETE':
      try {
        const skill = await Skill.findByIdAndDelete(id);
        
        if (!skill) {
          return res.status(404).json({ message: 'Skill not found' });
        }

        return res.status(200).json({ message: 'Skill deleted successfully' });
      } catch (error) {
        console.error('Error deleting skill:', error);
        return res.status(500).json({ message: 'Failed to delete skill' });
      }

    case 'PUT':
      try {
        // Liste blanche de champs (anti mass-assignment / opérateurs Mongo
        // injectés via le corps de la requête).
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const allowed: Record<string, unknown> = {};
        if (typeof body.name === 'string' && body.name.trim() && body.name.length <= 100) {
          allowed.name = body.name.trim();
        }
        if (typeof body.isVisible === 'boolean') allowed.isVisible = body.isVisible;
        if (typeof body.isHidden === 'boolean') allowed.isHidden = body.isHidden;
        if (typeof body.displayOrder === 'number' && Number.isFinite(body.displayOrder)) {
          allowed.displayOrder = body.displayOrder;
        }
        if (typeof body.categoryId === 'string' && mongoose.Types.ObjectId.isValid(body.categoryId)) {
          allowed.categoryId = body.categoryId;
        }
        if (Object.keys(allowed).length === 0) {
          return res.status(400).json({ message: 'Aucun champ valide' });
        }

        const skill = await Skill.findByIdAndUpdate(id, allowed, {
          new: true,
          runValidators: true,
        });

        if (!skill) {
          return res.status(404).json({ message: 'Skill not found' });
        }

        return res.status(200).json(skill);
      } catch (error) {
        console.error('Error updating skill:', error);
        return res.status(500).json({ message: 'Failed to update skill' });
      }

    case 'PATCH':
      try {
        const { isVisible } = req.body;
        
        // Vérifier que isVisible est un booléen
        if (typeof isVisible !== 'boolean') {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid visibility value' 
          });
        }

        const updatedSkill = await Skill.findByIdAndUpdate(
          id, 
          { isVisible }, 
          { new: true, runValidators: true }
        );

        if (!updatedSkill) {
          return res.status(404).json({ 
            success: false, 
            message: 'Skill not found' 
          });
        }

        return res.status(200).json({ 
          success: true, 
          data: updatedSkill 
        });
      } catch (error: any) {
        console.error('Error updating skill visibility:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Mise à jour impossible' 
        });
      }

    default:
      res.setHeader('Allow', ['DELETE', 'PUT', 'PATCH']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
