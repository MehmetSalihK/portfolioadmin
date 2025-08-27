import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import dbConnect from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import Message from '@/models/Message';

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

  try {
    await dbConnect();

    // Récupérer l'activité récente des analytics
    const recentAnalytics = await Analytics.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('page userAgent country device createdAt')
      .lean();

    // Récupérer les dernières modifications de contenu
    const recentProjects = await Project.find({})
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('title updatedAt')
      .lean();

    const recentSkills = await Skill.find({})
      .sort({ updatedAt: -1 })
      .limit(2)
      .select('name updatedAt')
      .lean();

    const recentExperiences = await Experience.find({})
      .sort({ updatedAt: -1 })
      .limit(2)
      .select('company position updatedAt')
      .lean();

    const recentMessages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name email subject createdAt')
      .lean();

    // Combiner toutes les activités récentes
    const recentActivity = [
      ...recentProjects.map(project => ({
        _id: project._id.toString(),
        type: 'Projet',
        description: `Projet "${project.title}" mis à jour`,
        date: new Date(project.updatedAt).toLocaleDateString('fr-FR'),
        timestamp: project.updatedAt
      })),
      ...recentSkills.map(skill => ({
        _id: skill._id.toString(),
        type: 'Compétence',
        description: `Compétence "${skill.name}" mise à jour`,
        date: new Date(skill.updatedAt).toLocaleDateString('fr-FR'),
        timestamp: skill.updatedAt
      })),
      ...recentExperiences.map(experience => ({
        _id: experience._id.toString(),
        type: 'Expérience',
        description: `Expérience chez ${experience.company} mise à jour`,
        date: new Date(experience.updatedAt).toLocaleDateString('fr-FR'),
        timestamp: experience.updatedAt
      })),
      ...recentMessages.map(message => ({
        _id: message._id.toString(),
        type: 'Message',
        description: `Nouveau message de ${message.name}`,
        date: new Date(message.createdAt).toLocaleDateString('fr-FR'),
        timestamp: message.createdAt
      })),
      ...recentAnalytics.map(analytics => ({
        _id: analytics._id.toString(),
        type: 'Visite',
        description: `Visite sur ${analytics.page}${analytics.country ? ` depuis ${analytics.country}` : ''}`,
        date: new Date(analytics.createdAt).toLocaleDateString('fr-FR'),
        timestamp: analytics.createdAt
      }))
    ];

    // Trier par timestamp et limiter à 10 éléments
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(({ timestamp, ...activity }) => activity); // Retirer timestamp du résultat final

    return res.status(200).json({
      recentActivity: sortedActivity,
      totalActivities: sortedActivity.length
    });

  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'activité',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
