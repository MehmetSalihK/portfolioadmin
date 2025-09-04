import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import Education from '@/models/Education';
import Media from '@/models/Media';
import Category from '@/models/Category';
import Analytics from '@/models/Analytics';
import { Backup } from '@/models/Backup';


// Interface pour les statistiques du dashboard
interface DashboardStats {
  overview: {
    unreadMessages: number;
    totalProjects: number;
    totalSkills: number;
    totalExperiences: number;
    totalEducation: number;
    totalMedia: number;
    totalCategories: number;
    totalBackups: number;

  };
  analytics: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    topPages: Array<{
      page: string;
      views: number;
    }>;
    recentActivity: Array<{
      page: string;
      timestamp: Date;
      country?: string;
      device?: string;
    }>;
  };
  charts: {
    dailyViews: Array<{
      date: string;
      views: number;
    }>;
    deviceStats: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  performance: {
    lastBackup: Date | null;

    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

// Fonction pour calculer les statistiques analytics
async function getAnalyticsStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const totalPageViews = await Analytics.countDocuments({
      createdAt: { $gte: startDate }
    });

    const uniqueVisitors = await Analytics.distinct('sessionId', {
      createdAt: { $gte: startDate }
    }).then(sessions => sessions.length);

    const sessionDurations = await Analytics.aggregate([
      { $match: { createdAt: { $gte: startDate }, timeSpent: { $gt: 0 } } },
      { $group: { _id: '$sessionId', totalTime: { $sum: '$timeSpent' } } },
      { $group: { _id: null, avgDuration: { $avg: '$totalTime' } } }
    ]);

    const averageSessionDuration = sessionDurations[0]?.avgDuration || 0;

    const topPages = await Analytics.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { page: '$_id', views: 1, _id: 0 } }
    ]);

    const recentActivity = await Analytics.find(
      { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { page: 1, createdAt: 1, country: 1, device: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      totalPageViews,
      uniqueVisitors,
      averageSessionDuration: Math.round(averageSessionDuration),
      topPages,
      recentActivity: recentActivity.map(a => ({
        page: a.page,
        timestamp: a.createdAt,
        country: a.country,
        device: a.device
      }))
    };
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      averageSessionDuration: 0,
      topPages: [],
      recentActivity: []
    };
  }
}

// Fonction pour les données de graphiques
async function getChartData(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const dailyViews = await Analytics.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          views: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    const deviceStats = await Analytics.aggregate([
      { $match: { createdAt: { $gte: startDate }, device: { $exists: true } } },
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    const deviceData = { desktop: 0, mobile: 0, tablet: 0 };
    deviceStats.forEach(stat => {
      if (stat._id && deviceData.hasOwnProperty(stat._id)) {
        deviceData[stat._id as keyof typeof deviceData] = stat.count;
      }
    });

    return {
      dailyViews: dailyViews.map(d => ({
        date: d.date.toISOString().split('T')[0],
        views: d.views
      })),
      deviceStats: deviceData
    };
  } catch (error) {
    console.error('Error getting chart data:', error);
    return {
      dailyViews: [],
      deviceStats: { desktop: 0, mobile: 0, tablet: 0 }
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStats | { message: string }>
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
    const { days = '30' } = req.query;
    const daysNumber = parseInt(days as string, 10);

    // Statistiques générales
    const [
      unreadMessages,
      totalProjects,
      totalSkills,
      totalExperiences,
      totalEducation,
      totalMedia,
      totalCategories,
      totalBackups
    ] = await Promise.all([
      Contact.countDocuments({ status: 'unread' }),
      Project.countDocuments(),
      Skill.countDocuments(),
      Experience.countDocuments(),
      Education.countDocuments().catch(() => 0),
      Media.countDocuments().catch(() => 0),
      Category.countDocuments().catch(() => 0),
      Backup.countDocuments().catch(() => 0)
    ]);

    // Statistiques analytics et graphiques
    const [analytics, charts] = await Promise.all([
      getAnalyticsStats(daysNumber),
      getChartData(daysNumber)
    ]);

    // Métriques de performance
    const lastBackup = await Backup.findOne({}, {}, { sort: { createdAt: -1 } }).catch(() => null);
    const daysSinceBackup = lastBackup ? 
      Math.floor((Date.now() - lastBackup.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 999;

    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    if (daysSinceBackup > 7) systemHealth = 'critical';
    else if (daysSinceBackup > 3) systemHealth = 'warning';

    const dashboardStats: DashboardStats = {
      overview: {
        unreadMessages,
        totalProjects,
        totalSkills,
        totalExperiences,
        totalEducation,
        totalMedia,
        totalCategories,
        totalBackups
      },
      analytics,
      charts,
      performance: {
        lastBackup: lastBackup?.createdAt || null,
        systemHealth
      }
    };

    return res.status(200).json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
}
