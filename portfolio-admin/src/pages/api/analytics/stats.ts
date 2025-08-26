import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Analytics from '@/models/Analytics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  await connectDB();

  try {
    const { period = '7d', page } = req.query;

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Construire le filtre
    const filter: any = {
      createdAt: { $gte: startDate }
    };

    if (page && page !== 'all') {
      filter.page = page;
    }

    // Statistiques générales
    const [totalVisits, uniqueVisitors, avgTimeSpent, topPages, deviceStats, dailyVisits] = await Promise.all([
      // Total des visites
      Analytics.countDocuments(filter),
      
      // Visiteurs uniques (par sessionId)
      Analytics.distinct('sessionId', filter).then(sessions => sessions.length),
      
      // Temps moyen passé
      Analytics.aggregate([
        { $match: filter },
        { $match: { timeSpent: { $gt: 0 } } },
        { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
      ]).then(result => result[0]?.avgTime || 0),
      
      // Pages les plus visitées
      Analytics.aggregate([
        { $match: filter },
        { $group: { _id: '$page', visits: { $sum: 1 }, avgTime: { $avg: '$timeSpent' } } },
        { $sort: { visits: -1 } },
        { $limit: 10 }
      ]),
      
      // Statistiques par appareil
      Analytics.aggregate([
        { $match: filter },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Visites par jour
      Analytics.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            visits: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$sessionId' }
          }
        },
        {
          $project: {
            _id: 1,
            visits: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Formater les données pour les graphiques
    const formattedDailyVisits = dailyVisits.map(day => ({
      date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
      visits: day.visits,
      uniqueVisitors: day.uniqueVisitors
    }));

    const formattedTopPages = topPages.map(page => ({
      page: page._id,
      visits: page.visits,
      avgTimeSpent: Math.round(page.avgTime || 0)
    }));

    const formattedDeviceStats = deviceStats.map(device => ({
      device: device._id || 'unknown',
      count: device.count
    }));

    return res.status(200).json({
      totalVisits,
      uniqueVisitors,
      avgTimeSpent: Math.round(avgTimeSpent),
      topPages: formattedTopPages,
      deviceStats: formattedDeviceStats,
      dailyVisits: formattedDailyVisits,
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics stats' });
  }
}