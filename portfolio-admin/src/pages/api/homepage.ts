import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import HomePage from '../../models/HomePage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        let homePage = await HomePage.findOne().lean();
        
        if (!homePage) {
          homePage = await HomePage.create({});
        }
        
        return res.status(200).json(homePage);

      case 'POST':
        const { _id, ...updateData } = req.body;
        
        const updatedHomePage = await HomePage.findOneAndUpdate(
          {},
          { $set: updateData },
          { new: true, upsert: true }
        );

        try {
          await res.revalidate('/');
        } catch (err) {
          console.error('Erreur lors de la revalidation:', err);
        }
        
        return res.status(200).json(updatedHomePage);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
