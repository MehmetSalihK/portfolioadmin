import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

interface GitHubProject {
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
  imageUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  lastUpdated: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const githubResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/github/repos`);
    
    if (!githubResponse.ok) {
      throw new Error('Failed to fetch GitHub repositories');
    }

    const { projects: githubProjects }: { projects: GitHubProject[] } = await githubResponse.json();

    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    const errors: string[] = [];

    for (const githubProject of githubProjects) {
      try {
        const existingProject = await Project.findOne({ 
          githubUrl: githubProject.githubUrl 
        });

        if (existingProject) {
          const updated = await Project.findByIdAndUpdate(
            existingProject._id,
            {
              title: githubProject.title,
              description: githubProject.description,
              technologies: githubProject.technologies,
              demoUrl: githubProject.demoUrl || existingProject.demoUrl,
              featured: githubProject.featured || existingProject.featured,
              imageUrl: existingProject.imageUrl.includes('/uploads/') 
                ? existingProject.imageUrl 
                : githubProject.imageUrl,
              githubData: {
                language: githubProject.language,
                stars: githubProject.stars,
                forks: githubProject.forks,
                lastUpdated: githubProject.lastUpdated
              },
              lastSyncedAt: new Date()
            },
            { new: true }
          );
          
          if (updated) {
            updatedCount++;
          }
        } else {
          const newProject = new Project({
            title: githubProject.title,
            description: githubProject.description,
            imageUrl: githubProject.imageUrl,
            technologies: githubProject.technologies,
            demoUrl: githubProject.demoUrl,
            githubUrl: githubProject.githubUrl,
            featured: githubProject.featured,
            isFromGitHub: true,
            githubData: {
              language: githubProject.language,
              stars: githubProject.stars,
              forks: githubProject.forks,
              lastUpdated: githubProject.lastUpdated
            },
            stats: {
              views: 0,
              demoClicks: 0,
              githubClicks: 0,
              dailyStats: []
            },
            lastSyncedAt: new Date()
          });

          await newProject.save();
          createdCount++;
        }
        
        syncedCount++;
      } catch (projectError) {
        console.error(`Error syncing project ${githubProject.title}:`, projectError);
        errors.push(`Failed to sync ${githubProject.title}: ${projectError instanceof Error ? projectError.message : 'Unknown error'}`);
      }
    }

    if (req.body.archiveRemoved) {
      const githubUrls = githubProjects.map(p => p.githubUrl);
      await Project.updateMany(
        { 
          isFromGitHub: true,
          githubUrl: { $nin: githubUrls }
        },
        { 
          archived: true,
          archivedAt: new Date()
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'GitHub projects synchronized successfully',
      stats: {
        total: githubProjects.length,
        synced: syncedCount,
        created: createdCount,
        updated: updatedCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
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