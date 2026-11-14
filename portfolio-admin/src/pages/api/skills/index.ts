import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';
import { requireAdmin } from '@/lib/auth-guard';

const DEFAULT_CATEGORIES = {
  "Langages de programmation": ["JavaScript", "TypeScript", "Python"],
  "Frameworks & Librairies": ["React.js", "Next.js", "Vue.js", "Flutter", "Express Js", "React Native"],
  "Base de données": ["MongoDB", "MySQL", "PostgreSQL", "MariaDB", "SQL"],
  "Outils & DevOps": ["Git", "GitHub", "GitLab", "Docker", "Linux", "Kali Linux", "AWS", "Google Cloud", "API", "API REST", "Endpoints"],
  "Design": ["Figma", "Canva"]
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const skills = await Skill.find().lean();
        
        const skillsByCategory = Object.entries(DEFAULT_CATEGORIES).map(([category, skillNames]) => ({
          name: category,
          skills: skills.filter(skill => skillNames.includes(skill.name))
        }));

        return res.status(200).json(skillsByCategory);
      } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des compétences' });
      }

    case 'POST':
      // Écriture en base → réservée admin (avant : aucune vérification).
      {
        const postGuard = await requireAdmin(req, res);
        if (!postGuard) return;
      }
      try {
        const { name, isVisible } = req.body;
        
        if (typeof name !== 'string' || !name.trim() || name.length > 100) {
          return res.status(400).json({ error: 'Le nom est requis' });
        }
        const trimmedName = name.trim();
        const visible = typeof isVisible === 'boolean' ? isVisible : true;

        let skillCategory = null;
        for (const [category, skills] of Object.entries(DEFAULT_CATEGORIES)) {
          if (skills.includes(trimmedName)) {
            skillCategory = category;
            break;
          }
        }

        const skill = await Skill.create({
          name: trimmedName,
          isVisible: visible,
          category: skillCategory
        });

        return res.status(201).json(skill);
      } catch (error: any) {
        console.error('Erreur détaillée:', error);
        return res.status(500).json({ error: 'Erreur lors de la création de la compétence' });
      }

    case 'DELETE':
      // Suppression → rôle admin exigé (avant : simple session).
      {
        const deleteGuard = await requireAdmin(req, res);
        if (!deleteGuard) return;
      }

      try {
        const id = req.query.id;
        if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Identifiant invalide' });
        }
        await Skill.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Compétence supprimée' });
      } catch (error: any) {
        return res.status(400).json({ error: 'Suppression impossible' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
