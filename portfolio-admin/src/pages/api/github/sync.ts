import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import { githubService } from '@/services/github';
import { requireAdmin } from '@/lib/auth-guard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Synchronisation en écriture en base (+ appel API GitHub) → réservé admin.
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  try {
    await connectDB();

    const result = await githubService.syncRepositories(!!req.body.archiveRemoved);

    res.status(200).json({
      success: result.success,
      message: 'GitHub projects synchronized successfully',
      stats: result.stats,
      errors: result.errors,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error synchronizing GitHub projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize GitHub projects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}