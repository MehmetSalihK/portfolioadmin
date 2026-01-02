import { NextApiRequest, NextApiResponse } from 'next';
import { githubService } from '@/services/github';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const projects = await githubService.fetchRepositories();

    res.status(200).json({
      success: true,
      projects,
      total: projects.length,
      lastFetch: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub repositories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}