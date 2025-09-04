import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/db';
import mongoose from 'mongoose';

// Schéma pour les événements analytics
const eventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  page: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: false
  },
  ip: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
eventSchema.index({ event: 1, createdAt: -1 });
eventSchema.index({ sessionId: 1 });
eventSchema.index({ page: 1 });

const AnalyticsEvent = mongoose.models.AnalyticsEvent || 
  mongoose.model('AnalyticsEvent', eventSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    return handleCreateEvent(req, res);
  } else if (req.method === 'GET') {
    return handleGetEvents(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleCreateEvent(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    const {
      event,
      data,
      page,
      sessionId,
      timestamp
    } = req.body;

    // Validation des données requises
    if (!event || !page || !sessionId) {
      return res.status(400).json({ 
        message: 'Event, page et sessionId sont requis' 
      });
    }

    // Récupérer l'IP du client
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection as any)?.socket?.remoteAddress ||
                     '127.0.0.1';

    // Créer l'événement
    const analyticsEvent = new AnalyticsEvent({
      event,
      data: data || {},
      page,
      sessionId,
      userAgent: req.headers['user-agent'] || '',
      ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await analyticsEvent.save();

    res.status(201).json({ 
      message: 'Événement tracké avec succès',
      id: analyticsEvent._id
    });
  } catch (error) {
    console.error('Erreur lors du tracking d\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function handleGetEvents(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    const { 
      period = '7d', 
      event: eventFilter, 
      page: pageFilter,
      limit = 100 
    } = req.query;

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Construire le filtre
    const filter: any = {
      createdAt: { $gte: startDate }
    };

    if (eventFilter && eventFilter !== 'all') {
      filter.event = eventFilter;
    }

    if (pageFilter && pageFilter !== 'all') {
      filter.page = pageFilter;
    }

    // Récupérer les événements
    const events = await AnalyticsEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Statistiques des événements
    const eventStats = await AnalyticsEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          event: '$_id',
          count: 1,
          uniqueSessions: { $size: '$uniqueSessions' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Événements par page
    const eventsByPage = await AnalyticsEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { page: '$page', event: '$event' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.page',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count'
            }
          },
          totalEvents: { $sum: '$count' }
        }
      },
      {
        $project: {
          page: '$_id',
          events: 1,
          totalEvents: 1
        }
      },
      { $sort: { totalEvents: -1 } }
    ]);

    res.status(200).json({
      events,
      eventStats,
      eventsByPage,
      period,
      startDate,
      endDate: now,
      total: events.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}