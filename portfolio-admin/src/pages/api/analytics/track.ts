import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Analytics from '@/models/Analytics';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  await connectDB();

  try {
    const {
      page,
      sessionId,
      timeSpent,
      action = 'visit'
    } = req.body;

    if (!page) {
      return res.status(400).json({ message: 'Page is required' });
    }

    // Obtenir les informations de la requête
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const referrer = req.headers.referer || '';

    // Déterminer le type d'appareil
    const getDeviceType = (ua: string): string => {
      if (/tablet|ipad/i.test(ua)) return 'tablet';
      if (/mobile|android|iphone/i.test(ua)) return 'mobile';
      return 'desktop';
    };

    const device = getDeviceType(userAgent);

    if (action === 'visit') {
      // Nouvelle visite
      const newSessionId = sessionId || uuidv4();
      
      const analytics = new Analytics({
        page,
        userAgent,
        ip: Array.isArray(ip) ? ip[0] : ip,
        referrer,
        sessionId: newSessionId,
        device,
        entryTime: new Date(),
        isActive: true
      });

      await analytics.save();
      
      return res.status(201).json({ 
        message: 'Visit tracked successfully',
        sessionId: newSessionId
      });
    } else if (action === 'update') {
      // Mise à jour du temps passé
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required for update' });
      }

      const analytics = await Analytics.findOne({
        sessionId,
        page,
        isActive: true
      }).sort({ createdAt: -1 });

      if (analytics) {
        analytics.timeSpent = timeSpent || 0;
        analytics.exitTime = new Date();
        await analytics.save();
      }

      return res.status(200).json({ message: 'Time updated successfully' });
    } else if (action === 'exit') {
      // Sortie de la page
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required for exit' });
      }

      await Analytics.updateMany(
        { sessionId, isActive: true },
        { 
          isActive: false,
          exitTime: new Date(),
          timeSpent: timeSpent || 0
        }
      );

      return res.status(200).json({ message: 'Exit tracked successfully' });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return res.status(500).json({ message: 'Failed to track analytics' });
  }
}