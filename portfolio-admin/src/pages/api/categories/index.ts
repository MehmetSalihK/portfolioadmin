import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { defaultCategories } from '@/lib/defaultCategories';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      let categories = await Category.find().sort('displayOrder');
      
      if (categories.length === 0) {
        categories = await Category.insertMany(defaultCategories);
      }
      
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
} 