import { NextApiRequest, NextApiResponse } from 'next';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  archived: boolean;
  disabled: boolean;
  private: boolean;
}

interface TransformedProject {
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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const githubToken = process.env.GITHUB_SECRET;
    const githubUsername = process.env.GITHUB_ID;

    if (!githubToken || !githubUsername) {
      return res.status(500).json({ 
        message: 'GitHub credentials not configured' 
      });
    }

    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    const projects: TransformedProject[] = repos
      .filter(repo => 
        !repo.private && 
        !repo.archived && 
        !repo.disabled &&
        !repo.name.includes('.github') && // Exclure les repos de configuration
        !repo.name.toLowerCase().includes('readme') // Exclure les repos README
      )
      .map(repo => {
        const technologies = [
          ...(repo.language ? [repo.language] : []),
          ...repo.topics.slice(0, 5) // Limiter à 5 topics
        ].filter((tech, index, arr) => arr.indexOf(tech) === index); // Supprimer les doublons

        const featured = repo.stargazers_count >= 5 || 
                        repo.topics.includes('featured') || 
                        repo.topics.includes('portfolio');

        const getDefaultImage = (language: string | null): string => {
          const imageMap: { [key: string]: string } = {
            'JavaScript': '/images/js-project.svg',
            'TypeScript': '/images/ts-project.svg',
            'Python': '/images/python-project.svg',
            'Java': '/images/default-project.svg',
            'React': '/images/js-project.svg',
            'Next.js': '/images/ts-project.svg',
            'Vue': '/images/js-project.svg',
            'PHP': '/images/default-project.svg',
            'C++': '/images/default-project.svg',
            'C#': '/images/default-project.svg',
            'Go': '/images/default-project.svg',
            'Rust': '/images/default-project.svg'
          };
          return imageMap[language || ''] || '/images/default-project.svg';
        };

        return {
          title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
          description: repo.description || 'Aucune description disponible',
          technologies,
          githubUrl: repo.html_url,
          demoUrl: repo.homepage || undefined,
          featured,
          imageUrl: getDefaultImage(repo.language),
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          lastUpdated: repo.updated_at
        };
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.stars !== b.stars) return b.stars - a.stars;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      })
      .slice(0, 20); // Limiter à 20 projets

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