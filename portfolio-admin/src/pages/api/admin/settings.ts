import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import HomePage from '@/models/HomePage';
import Setting from '@/models/Setting';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'POST') {
    try {
      await connectDB();
      console.log('Received data:', req.body);

      // Créer ou mettre à jour les settings
      const settings = await Settings.findOneAndUpdate(
        {},
        {
          ...req.body,
          phone: req.body.phone || '',
          whatsapp: req.body.whatsapp || '',
          telegram: req.body.telegram || ''
        },
        { upsert: true, new: true }
      );

      // Mettre à jour HomePage
      await HomePage.findOneAndUpdate(
        {},
        {
          title: req.body.siteTitle,
          siteDescription: req.body.siteDescription,
          email: req.body.email,
          phone: req.body.phone,
          socialLinks: {
            github: req.body.github,
            linkedin: req.body.linkedin,
            twitter: req.body.twitter,
            whatsapp: req.body.whatsapp,
            telegram: req.body.telegram
          }
        },
        { upsert: true, new: true }
      );

      console.log('Updated settings:', settings);
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Settings update error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  if (req.method === 'GET') {
    try {
      await connectDB();
      
      // Récupérer les settings ou créer des valeurs par défaut si elles n'existent pas
      let settings = await Setting.findOne();
      
      if (!settings) {
        settings = {
          email: 'contact@mehmetsalihk.fr',
          github: 'https://github.com/mehmetsalihk',
          linkedin: 'https://www.linkedin.com/in/mehmetsalihk/',
          siteTitle: 'Portfolio',
          siteDescription: 'Mon portfolio professionnel',
        };
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 