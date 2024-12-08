import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { FiTrendingUp, FiGithub, FiExternalLink, FiEye, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProjectStats {
  _id: string;
  title: string;
  imageUrl: string;
  stats: {
    demoClicks: number;
    githubClicks: number;
    views: number;
    lastClicked: string | null;
    clickHistory: Array<{
      type: string;
      timestamp: string;
    }>;
    dailyStats: Array<{
      date: string;
      demoClicks: number;
      githubClicks: number;
      views: number;
    }>;
  };
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectStats[]>([]);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'day'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchProjects();
    }
  }, [status, timeRange]); 

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      console.log('Fetched projects:', data); 
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStats = (project: ProjectStats) => {
    if (!project.stats) {
      return {
        demoClicks: 0,
        githubClicks: 0,
        views: 0,
        lastClicked: null
      };
    }

    if (timeRange === 'all') {
      return {
        demoClicks: project.stats.demoClicks || 0,
        githubClicks: project.stats.githubClicks || 0,
        views: project.stats.views || 0,
        lastClicked: project.stats.lastClicked
      };
    }

    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'day':
        filterDate.setDate(now.getDate() - 1);
        break;
    }

    return (project.stats.dailyStats || []).reduce((acc, stat) => {
      const statDate = new Date(stat.date);
      if (statDate >= filterDate) {
        acc.demoClicks += stat.demoClicks || 0;
        acc.githubClicks += stat.githubClicks || 0;
        acc.views += stat.views || 0;
      }
      return acc;
    }, {
      demoClicks: 0,
      githubClicks: 0,
      views: 0,
      lastClicked: project.stats.lastClicked
    });
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const statsA = getFilteredStats(a);
    const statsB = getFilteredStats(b);
    const totalA = statsA.demoClicks + statsA.githubClicks + statsA.views;
    const totalB = statsB.demoClicks + statsB.githubClicks + statsB.views;
    return totalB - totalA;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Statistiques des Projets</h1>
          </div>

          <div className="flex gap-2">
            {(['all', 'month', 'week', 'day'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]'
                }`}
              >
                {range === 'all' ? 'Tout' : 
                 range === 'month' ? '30 jours' :
                 range === 'week' ? '7 jours' : '24h'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {sortedProjects.map((project, index) => {
            const stats = getFilteredStats(project);
            const totalClicks = stats.demoClicks + stats.githubClicks;
            const lastClick = stats.lastClicked 
              ? new Date(stats.lastClicked).toLocaleDateString()
              : 'Jamais';

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-[#2A2A2A]"
              >
                <div className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-white">
                          #{index + 1} - {project.title}
                        </h3>
                        {index === 0 && totalClicks > 0 && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                            Plus populaire
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#252525] rounded-lg p-4">
                          <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <FiExternalLink className="w-4 h-4" />
                            <span>Démo</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {stats.demoClicks}
                          </p>
                        </div>

                        <div className="bg-[#252525] rounded-lg p-4">
                          <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <FiGithub className="w-4 h-4" />
                            <span>GitHub</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {stats.githubClicks}
                          </p>
                        </div>

                        <div className="bg-[#252525] rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-400 mb-2">
                            <FiEye className="w-4 h-4" />
                            <span>Vues</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {stats.views}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          <FiTrendingUp className="w-4 h-4 inline mr-1" />
                          {totalClicks} interactions totales
                        </span>
                        <span>
                          <FiClock className="w-4 h-4 inline mr-1" />
                          Dernier clic: {lastClick}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
