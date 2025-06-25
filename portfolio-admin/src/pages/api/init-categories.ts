import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { defaultCategories } from '@/lib/defaultCategories';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();

    await Category.deleteMany({});

    const categories = await Category.insertMany(defaultCategories);

    return res.status(200).json({ 
      message: 'Catégories initialisées avec succès',
      categories 
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'initialisation des catégories' });
  }
} 