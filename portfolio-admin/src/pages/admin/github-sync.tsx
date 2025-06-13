import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import GitHubSync from '@/components/admin/github/GitHubSync';
import { FiGithub, FiInfo, FiSettings, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface GitHubRepo {
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
  language: string | null;
  stars: number;
  forks: number;
  lastUpdated: string;
}

export default function GitHubSyncPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  const fetchGitHubRepos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/github/repos');
      const data = await response.json();
      
      if (data.success) {
        setRepos(data.projects);
      } else {
        setError(data.message || 'Erreur lors de la récupération des repositories');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FiGithub className="w-8 h-8 text-gray-300" />
            <h1 className="text-2xl font-bold text-white">Synchronisation GitHub</h1>
          </div>
          
          <button
            onClick={fetchGitHubRepos}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Chargement...' : 'Prévisualiser'}</span>
          </button>
        </div>

        {/* Synchronization Component */}
        <div className="mb-8">
          <GitHubSync />
        </div>

        {/* Configuration Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiSettings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuration GitHub
              </h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Username GitHub:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_GITHUB_ID || 'Non configuré'}
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Token configuré:</span>
                <div className="flex items-center space-x-2">
                  {process.env.GITHUB_SECRET ? (
                    <>
                      <FiCheck className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Oui</span>
                    </>
                  ) : (
                    <>
                      <FiX className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">Non</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiInfo className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comment ça marche
              </h3>
            </div>
            
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Récupération automatique de vos repositories publics</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Filtrage intelligent (description requise, pas de repos système)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Génération automatique des technologies basée sur le langage</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Mise à jour des projets existants sans perdre vos personnalisations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Preview Section */}
        {repos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Aperçu des repositories GitHub ({repos.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo, index) => (
                <motion.div
                  key={repo.githubUrl}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {repo.title}
                    </h4>
                    {repo.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {repo.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {repo.language && (
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{repo.language}</span>
                        </span>
                      )}
                      <span>⭐ {repo.stars}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {repo.technologies.slice(0, 2).map((tech) => (
                        <span
                          key={tech}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {repo.technologies.length > 2 && (
                        <span className="text-gray-500">+{repo.technologies.length - 2}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}