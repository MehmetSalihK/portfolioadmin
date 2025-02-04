import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';
import Category from '@/models/Category';

const skillCategoryMapping: { [key: string]: string } = {
  // Langages de programmation
  'JavaScript': 'Langages de programmation',
  'TypeScript': 'Langages de programmation',
  'Python': 'Langages de programmation',
  
  // Frameworks & Librairies
  'React.js': 'Frameworks & Librairies',
  'Next.js': 'Frameworks & Librairies',
  'Vue.js': 'Frameworks & Librairies',
  'Flutter': 'Frameworks & Librairies',
  'Express Js': 'Frameworks & Librairies',
  'React Native': 'Frameworks & Librairies',

  // Base de données
  'MongoDB': 'Base de données',
  'MySQL': 'Base de données',
  'PostgreSQL': 'Base de données',
  'MariaDB': 'Base de données',
  'SQL': 'Base de données',

  // Outils & DevOps
  'Git': 'Outils & DevOps',
  'GitHub': 'Outils & DevOps',
  'GitLab': 'Outils & DevOps',
  'Docker': 'Outils & DevOps',
  'Linux': 'Outils & DevOps',
  'Kali Linux': 'Outils & DevOps',
  'AWS': 'Outils & DevOps',
  'Google Cloud': 'Outils & DevOps',
  'API': 'Outils & DevOps',
  'API REST': 'Outils & DevOps',
  'Endpoints': 'Outils & DevOps',

  // Design
  'Figma': 'Design',
  'Canva': 'Design'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();

    // S'assurer que les catégories existent
    const categories = await Category.find();
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Langages de programmation", displayOrder: 1 },
        { name: "Frameworks & Librairies", displayOrder: 2 },
        { name: "Base de données", displayOrder: 3 },
        { name: "Outils & DevOps", displayOrder: 4 },
        { name: "Design", displayOrder: 5 }
      ];
      await Category.insertMany(defaultCategories);
    }

    // Récupérer toutes les catégories
    const updatedCategories = await Category.find();
    const categoryMap = new Map(updatedCategories.map(cat => [cat.name, cat._id]));

    // Mettre à jour chaque compétence
    const skills = await Skill.find();
    let updatedCount = 0;

    for (const skill of skills) {
      const categoryName = skillCategoryMapping[skill.name];
      if (categoryName) {
        const categoryId = categoryMap.get(categoryName);
        if (categoryId) {
          await Skill.findByIdAndUpdate(skill._id, { categoryId });
          updatedCount++;
        }
      }
    }

    return res.status(200).json({
      message: `${updatedCount} compétences mises à jour avec succès`,
      updatedCount
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des catégories:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour des catégories' });
  }
} 