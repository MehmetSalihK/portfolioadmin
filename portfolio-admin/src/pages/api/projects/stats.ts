import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Project from '../../../models/Project';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await dbConnect();

    const { projectId, type } = req.body;
    
    if (!projectId || !type) {
      return res.status(400).json({ error: 'ProjectId et type sont requis' });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Initialiser les stats si elles n'existent pas
    if (!project.stats) {
      project.stats = {
        demoClicks: 0,
        githubClicks: 0,
        views: 0,
        lastClicked: null,
        clickHistory: [],
        dailyStats: []
      };
    }

    // Mettre à jour le compteur approprié
    switch (type) {
      case 'demo':
        project.stats.demoClicks = (project.stats.demoClicks || 0) + 1;
        break;
      case 'github':
        project.stats.githubClicks = (project.stats.githubClicks || 0) + 1;
        break;
      case 'view':
        project.stats.views = (project.stats.views || 0) + 1;
        break;
      default:
        return res.status(400).json({ error: 'Type invalide' });
    }

    // Mettre à jour lastClicked
    project.stats.lastClicked = new Date();

    // Ajouter à l'historique des clics
    if (!Array.isArray(project.stats.clickHistory)) {
      project.stats.clickHistory = [];
    }

    project.stats.clickHistory.push({
      type,
      timestamp: new Date()
    });

    // Mettre à jour les stats quotidiennes
    if (!Array.isArray(project.stats.dailyStats)) {
      project.stats.dailyStats = [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyStat = project.stats.dailyStats.find(stat => {
      const statDate = new Date(stat.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === today.getTime();
    });

    if (!dailyStat) {
      dailyStat = {
        date: today,
        demoClicks: 0,
        githubClicks: 0,
        views: 0
      };
      project.stats.dailyStats.push(dailyStat);
    }

    switch (type) {
      case 'demo':
        dailyStat.demoClicks = (dailyStat.demoClicks || 0) + 1;
        break;
      case 'github':
        dailyStat.githubClicks = (dailyStat.githubClicks || 0) + 1;
        break;
      case 'view':
        dailyStat.views = (dailyStat.views || 0) + 1;
        break;
    }

    // Marquer les champs comme modifiés
    project.markModified('stats');
    project.markModified('stats.dailyStats');
    project.markModified('stats.clickHistory');

    // Sauvegarder les modifications
    await project.save();

    return res.status(200).json({ 
      success: true,
      stats: project.stats 
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Erreur lors de la mise à jour des stats'
    });
  }
}
