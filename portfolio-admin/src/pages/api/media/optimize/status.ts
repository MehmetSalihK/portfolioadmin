import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { optimizationJobs } from './batch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { jobId } = req.query;

    if (jobId && typeof jobId === 'string') {
      // Récupérer un job spécifique
      const job = optimizationJobs.get(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job non trouvé' });
      }
      return res.status(200).json({ job });
    }

    // Récupérer tous les jobs actifs
    const allJobs = Array.from(optimizationJobs.values())
      .filter(job => job.status === 'processing' || job.status === 'pending')
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));

    // Statistiques globales
    const stats = {
      total: optimizationJobs.size,
      pending: Array.from(optimizationJobs.values()).filter(j => j.status === 'pending').length,
      processing: Array.from(optimizationJobs.values()).filter(j => j.status === 'processing').length,
      completed: Array.from(optimizationJobs.values()).filter(j => j.status === 'completed').length,
      failed: Array.from(optimizationJobs.values()).filter(j => j.status === 'failed').length,
    };

    res.status(200).json({
      success: true,
      jobs: allJobs,
      stats,
    });

  } catch (error) {
    console.error('Erreur API statut optimisation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}