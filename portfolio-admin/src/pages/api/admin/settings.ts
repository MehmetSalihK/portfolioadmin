import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import HomePage from '@/models/HomePage';

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
      
      // Récupérer les données des deux collections
      const settings = await Settings.findOne() || {};
      const homePage = await HomePage.findOne() || {};

      // Combiner les données avec la bonne structure
      const combinedData = {
        siteTitle: settings.siteTitle || homePage.title || '',
        siteDescription: settings.siteDescription || homePage.siteDescription || '',
        email: settings.email || homePage.email || '',
        phone: settings.phone || homePage.phone || '',
        github: settings.github || homePage.socialLinks?.github || '',
        linkedin: settings.linkedin || homePage.socialLinks?.linkedin || '',
        twitter: settings.twitter || homePage.socialLinks?.twitter || '',
        whatsapp: settings.whatsapp || homePage.socialLinks?.whatsapp || '',
        telegram: settings.telegram || homePage.socialLinks?.telegram || ''
      };

      return res.status(200).json(combinedData);
    } catch (error) {
      console.error('Settings fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 