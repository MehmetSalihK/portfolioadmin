import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';
import SkillCategory from '@/models/SkillCategory';
import { requireAdmin } from '@/lib/auth-guard';

const detectCategory = (skillName: string): string => {
  const name = skillName.toLowerCase();
  
  if (name.includes('html') || name.includes('css') || name.includes('javascript') || 
      name.includes('typescript') || name.includes('react') || name.includes('vue') || 
      name.includes('angular') || name.includes('next') || name.includes('nuxt')) {
    return 'Développement Web';
  }
  
  if (name.includes('sql') || name.includes('mongo') || name.includes('postgres') || 
      name.includes('node') || name.includes('express') || name.includes('django') || 
      name.includes('php') || name.includes('laravel') || name.includes('api')) {
    return 'Base de données & Backend';
  }
  
  if (name.includes('git') || name.includes('docker') || name.includes('kubernetes') || 
      name.includes('npm') || name.includes('yarn') || name.includes('webpack') || 
      name.includes('babel') || name.includes('vscode') || name.includes('pip')) {
    return 'Outils de Développement';
  }
  
  if (name.includes('wordpress') || name.includes('drupal') || name.includes('joomla') || 
      name.includes('framework') || name.includes('bootstrap') || name.includes('tailwind')) {
    return 'CMS & Frameworks';
  }
  
  if (name.includes('photoshop') || name.includes('illustrator') || name.includes('premiere') || 
      name.includes('word') || name.includes('excel') || name.includes('powerpoint')) {
    return 'Logiciels';
  }
  
  return 'Développement Web'; // Catégorie par défaut
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Écriture en base → réservée admin (avant : aucune vérification).
    const guard = await requireAdmin(req, res);
    if (!guard) return;

    try {
      await connectDB();

      const { name, level } = req.body;

      // Types stricts + longueurs bornées (anti injection / pollution).
      if (typeof name !== 'string' || typeof level !== 'string') {
        return res.status(400).json({ error: 'Nom et niveau requis' });
      }
      const trimmedName = name.trim();
      const trimmedLevel = level.trim();
      if (!trimmedName || trimmedName.length > 100 || !trimmedLevel || trimmedLevel.length > 50) {
        return res.status(400).json({ error: 'Valeurs invalides' });
      }
      
      const categoryName = detectCategory(trimmedName);
      
      let category = await SkillCategory.findOne({ name: categoryName });
      
      if (!category) {
        category = await SkillCategory.create({
          name: categoryName,
          isVisible: true,
          displayOrder: 0
        });
      }

      const skill = await Skill.create({
        name: trimmedName,
        level: trimmedLevel,
        categoryId: category._id,
        isHidden: false
      });

      return res.status(201).json(skill);
    } catch (error) {
      console.error('Error in skills API:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 