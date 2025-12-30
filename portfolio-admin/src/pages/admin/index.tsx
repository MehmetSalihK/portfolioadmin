import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiMail, FiBriefcase, FiCode, FiFolder, FiActivity } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import StatsChart from '@/components/admin/StatsChart';
import RecentActivity from '@/components/admin/RecentActivity';

interface DashboardStats {
  counts: {
    unreadMessages: number;
    projects: number;
    skills: number;
    experiences: number;
    messages: number;
  };
  recentActivity: any[];
  charts: {
    projectsByCategory: { name: string; value: number }[];
    skillsByCategory: { name: string; value: number }[];
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const statsData = await response.json();
      setData(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Messages non lus',
      value: loading ? '...' : data?.counts.unreadMessages || 0,
      icon: FiMail,
      description: 'Nouveaux messages',
      color: 'from-blue-400 to-blue-600',
      link: '/admin/messages'
    },
    {
      title: 'Projets',
      value: loading ? '...' : data?.counts.projects || 0,
      icon: FiFolder,
      description: 'Projets portfolio',
      color: 'from-purple-400 to-purple-600',
      link: '/admin/projects'
    },
    {
      title: 'Compétences',
      value: loading ? '...' : data?.counts.skills || 0,
      icon: FiCode,
      description: 'Technologies',
      color: 'from-green-400 to-green-600',
      link: '/admin/skills'
    },
    {
      title: 'Expériences',
      value: loading ? '...' : data?.counts.experiences || 0,
      icon: FiBriefcase,
      description: 'Parcours pro',
      color: 'from-orange-400 to-orange-600',
      link: '/admin/experience'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FiActivity className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(card.link)}
                >
                  <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                            {card.value}
                          </h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg shadow-blue-500/20`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Charts Section - Takes up 2/3 */}
            <div className="lg:col-span-2 space-y-8">
              {!loading && data && (
                <>
                  <StatsChart 
                    title="Répartition des Projets par Catégorie" 
                    data={data.charts.projectsByCategory} 
                    type="bar" 
                  />
                  <StatsChart 
                    title="Compétences par Catégorie" 
                    data={data.charts.skillsByCategory} 
                    type="pie" 
                  />
                </>
              )}
            </div>

            {/* Recent Activity - Takes up 1/3 */}
            <div className="lg:col-span-1">
              {!loading && data && (
                <RecentActivity activities={data.recentActivity} />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
