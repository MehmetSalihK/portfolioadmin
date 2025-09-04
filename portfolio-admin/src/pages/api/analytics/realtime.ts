import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/db';
import Analytics from '../../../models/Analytics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Définir "temps réel" comme les 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

    // Visiteurs actifs (sessions actives dans les 5 dernières minutes)
    const activeVisitors = await Analytics.distinct('sessionId', {
      createdAt: { $gte: fiveMinutesAgo },
      isActive: true
    }).then(sessions => sessions.length);

    // Nouvelles visites dans la dernière minute
    const newVisitsLastMinute = await Analytics.countDocuments({
      createdAt: { $gte: oneMinuteAgo }
    });

    // Pages les plus visitées en temps réel
    const realtimeTopPages = await Analytics.aggregate([
      { $match: { createdAt: { $gte: fiveMinutesAgo } } },
      {
        $group: {
          _id: '$page',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
          lastVisit: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          page: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          lastVisit: 1
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 5 }
    ]);

    // Activité récente (dernières visites)
    const recentActivity = await Analytics.find({
      createdAt: { $gte: fiveMinutesAgo }
    })
    .select('page sessionId createdAt country city device')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Formater l'activité récente pour l'affichage
    const formattedActivity = recentActivity.map(activity => ({
      id: activity._id,
      page: activity.page,
      sessionId: activity.sessionId.substring(0, 8) + '...', // Anonymiser
      timestamp: activity.createdAt,
      location: activity.country && activity.city ? 
        `${activity.city}, ${activity.country}` : 
        activity.country || 'Inconnu',
      device: activity.device || 'desktop',
      timeAgo: getTimeAgo(activity.createdAt)
    }));

    // Statistiques par appareil en temps réel
    const realtimeDeviceStats = await Analytics.aggregate([
      { $match: { createdAt: { $gte: fiveMinutesAgo } } },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          device: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par pays en temps réel
    const realtimeCountryStats = await Analytics.aggregate([
      { $match: { 
        createdAt: { $gte: fiveMinutesAgo },
        country: { $exists: true, $ne: '' }
      }},
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          country: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Évolution minute par minute (dernières 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const minuteByMinute = await Analytics.aggregate([
      { $match: { createdAt: { $gte: tenMinutesAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
            minute: { $minute: '$createdAt' }
          },
          visits: { $sum: 1 }
        }
      },
      {
        $project: {
          timestamp: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
              hour: '$_id.hour',
              minute: '$_id.minute'
            }
          },
          visits: 1
        }
      },
      { $sort: { timestamp: 1 } }
    ]);

    const realtimeData = {
      activeVisitors,
      newVisitsLastMinute,
      topPages: realtimeTopPages,
      recentActivity: formattedActivity,
      deviceStats: realtimeDeviceStats,
      countryStats: realtimeCountryStats,
      minuteByMinute,
      lastUpdated: new Date(),
      timeRange: '5 minutes'
    };

    // Ajouter les en-têtes pour le cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(realtimeData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données temps réel:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  }
}