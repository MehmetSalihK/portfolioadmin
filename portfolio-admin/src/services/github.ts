import Project from '@/models/Project';

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

export interface TransformedProject {
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

export interface SyncResult {
    success: boolean;
    stats: {
        total: number;
        synced: number;
        created: number;
        updated: number;
        errors: number;
    };
    errors?: string[];
}

export const githubService = {
    async fetchRepositories(): Promise<TransformedProject[]> {
        const githubToken = process.env.GITHUB_SECRET;
        const githubUsername = process.env.GITHUB_ID;

        if (!githubToken || !githubUsername) {
            throw new Error('GitHub credentials not configured');
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

        return repos
            .filter(repo =>
                !repo.private &&
                !repo.archived &&
                !repo.disabled &&
                !repo.name.includes('.github') &&
                !repo.name.toLowerCase().includes('readme')
            )
            .map(repo => {
                const technologies = [
                    ...(repo.language ? [repo.language] : []),
                    ...repo.topics.slice(0, 5)
                ].filter((tech, index, arr) => arr.indexOf(tech) === index);

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
            .slice(0, 20);
    },

    async syncRepositories(archiveRemoved = false): Promise<SyncResult> {
        try {
            const projects = await this.fetchRepositories();

            let syncedCount = 0;
            let updatedCount = 0;
            let createdCount = 0;
            const errors: string[] = [];

            for (const githubProject of projects) {
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

                        if (updated) updatedCount++;
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
                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`Error syncing project ${githubProject.title}:`, msg);
                    errors.push(`Failed to sync ${githubProject.title}: ${msg}`);
                }
            }

            if (archiveRemoved) {
                const githubUrls = projects.map(p => p.githubUrl);
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

            return {
                success: true,
                stats: {
                    total: projects.length,
                    synced: syncedCount,
                    created: createdCount,
                    updated: updatedCount,
                    errors: errors.length
                },
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            console.error('GitHub Sync Service Error:', error);
            throw error;
        }
    }
};
