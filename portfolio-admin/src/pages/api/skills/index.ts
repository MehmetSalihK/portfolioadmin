import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

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
        
        // Organiser les compétences par catégorie
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
      try {
        const { name, isVisible } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'Le nom est requis' });
        }

        // Trouver la catégorie pour cette compétence
        let skillCategory = null;
        for (const [category, skills] of Object.entries(DEFAULT_CATEGORIES)) {
          if (skills.includes(name)) {
            skillCategory = category;
            break;
          }
        }

        const skill = await Skill.create({
          name,
          isVisible,
          category: skillCategory
        });

        return res.status(201).json(skill);
      } catch (error: any) {
        console.error('Erreur détaillée:', error);
        return res.status(500).json({ error: 'Erreur lors de la création de la compétence' });
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
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
