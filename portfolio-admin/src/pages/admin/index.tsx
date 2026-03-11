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

import StatsCards from '@/components/admin/StatsCards';

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

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <span className="w-8 h-[1px] bg-primary"></span>
              Overview
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">
              Bienvenue, <span className="text-zinc-300">{session?.user?.name || session?.user?.email}</span>. Voici l'état actuel de votre portfolio.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              Raffraîchir
            </button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <StatsCards stats={{
              unreadMessages: data?.counts.unreadMessages || 0,
              totalProjects: data?.counts.projects || 0,
              totalSkills: data?.counts.skills || 0,
              totalExperiences: data?.counts.experiences || 0,
            }} />
          )}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Area - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {!loading && data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <StatsChart 
                  title="Répartition des Projets" 
                  data={data.charts.projectsByCategory} 
                  type="bar" 
                />
                <StatsChart 
                  title="Compétences par Catégorie" 
                  data={data.charts.skillsByCategory} 
                  type="pie" 
                />
              </motion.div>
            )}
            
            {loading && (
              <div className="space-y-8">
                <div className="h-[400px] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                <div className="h-[400px] rounded-xl bg-white/5 animate-pulse border border-white/5" />
              </div>
            )}
          </div>

          {/* Sidebar Area - 1/3 */}
          <aside className="lg:col-span-1">
            {!loading && data ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <RecentActivity activities={data.recentActivity} />
              </motion.div>
            ) : (
              <div className="h-[600px] rounded-xl bg-white/5 animate-pulse border border-white/5" />
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
