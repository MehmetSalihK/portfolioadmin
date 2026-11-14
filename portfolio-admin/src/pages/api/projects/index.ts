import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import Project from '../../../models/Project';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Écritures (POST) → rôle admin exigé (session seule insuffisante).
  if (req.method !== 'GET') {
    const guard = await requireAdmin(req, res);
    if (!guard) return;
  }

  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        const { category, tags } = req.query;
        const query: any = {};

        if (category && category !== 'All') {
          query.category = String(category); // Ensure string
        }

        if (tags) {
          // Escape special characters for regex to prevent ReDoS
          const escapedTags = String(tags).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.tags = { $regex: new RegExp(escapedTags, 'i') };
        }

        // Phase 5 — filtre serveur : l'API publique ne doit jamais exposer
        // les projets archivés. Les sessions admin (dashboard) gardent un accès
        // complet via le paramètre `?archived=true`.
        const session = await getServerSession(req, res, authOptions);
        if (req.query.archived !== 'true' && !session?.user) {
          query.archived = { $ne: true };
        }

        // Sort by 'order' ascending, then by 'createdAt' descending
        const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
        
        // Re-add the projectsWithStats logic if it was intended to be kept
        const projectsWithStats = projects.map(project => {
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
          return project;
        });

        return res.status(200).json(projectsWithStats);

      case 'POST':
        try {
          // Anti mass-assignment : pas de clé d'opérateur Mongo ni de
          // prototype dans le corps (le spread partait tel quel en base).
          if (
            !req.body ||
            typeof req.body !== 'object' ||
            Array.isArray(req.body) ||
            Object.keys(req.body).some(
              (k) => k.startsWith('$') || ['__proto__', 'constructor', 'prototype'].includes(k)
            )
          ) {
            return res.status(400).json({ error: 'Corps de requête invalide' });
          }

          // Obtenir le nombre total de projets pour définir l'ordre
          const projectCount = await Project.countDocuments();
          
          const projectData = {
            ...req.body,
            order: projectCount, // Nouveau projet à la fin
            stats: {
              demoClicks: 0,
              githubClicks: 0,
              views: 0,
              lastClicked: null,
              clickHistory: [],
              dailyStats: []
            }
          };

          const project = new Project(projectData);
          await project.save();

          return res.status(201).json(project);
        } catch (error) {
          console.error('Error creating project:', error);
          return res.status(500).json({ error: 'Erreur lors de la création du projet' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
