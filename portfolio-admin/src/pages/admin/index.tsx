import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiMail, FiBriefcase, FiCode, FiFolder, FiActivity, FiBarChart2 } from 'react-icons/fi';
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
      <div className="space-y-12">
        {/* Header Section - Command Center Identity */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <span className="w-8 h-[1px] bg-indigo-500"></span>
              Main Terminal
            </div>
            <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight">
              Tableau de bord <span className="text-indigo-600 dark:text-indigo-500">HQ</span>
            </h1>
            <p className="dark:text-zinc-500 text-zinc-600 font-bold text-sm max-w-xl">
              Bienvenue, <span className="dark:text-zinc-300 text-zinc-900 border-b border-indigo-500/30 pb-0.5">{session?.user?.name || session?.user?.email}</span>. Surveillance système activée.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="h-12 px-6 rounded-2xl dark:bg-zinc-900/40 bg-white dark:border-white/5 border-zinc-200 border text-[10px] font-black uppercase tracking-widest dark:text-zinc-400 text-zinc-600 hover:dark:bg-white/5 hover:bg-zinc-50 hover:dark:text-white hover:text-zinc-900 transition-all flex items-center gap-2"
            >
              <FiActivity className={`${loading ? 'animate-spin' : ''}`} />
              Serrer Sync
            </button>
          </div>
        </motion.div>

        {/* Stats Grid - High Density Metrics */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 rounded-[2rem] dark:bg-zinc-900/40 bg-white dark:border-white/5 border-zinc-200 border animate-pulse" />
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

        {/* Main Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Data Visualizations - 8/12 */}
          <div className="lg:col-span-8 space-y-10">
            {!loading && data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 gap-10"
              >
                <div className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] p-10 dark:border-white/5 border-zinc-200 border hover:shadow-2xl transition-all duration-500">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                         <FiBarChart2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest dark:text-zinc-300 text-zinc-700">Analytics Projets</h3>
                   </div>
                   <StatsChart data={data.charts.projectsByCategory} type="bar" />
                </div>

                <div className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] p-10 dark:border-white/5 border-zinc-200 border hover:shadow-2xl transition-all duration-500">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                         <FiCode className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest dark:text-zinc-300 text-zinc-700">Distribution Skills</h3>
                   </div>
                   <StatsChart data={data.charts.skillsByCategory} type="pie" />
                </div>
              </motion.div>
            )}
            
            {loading && (
              <div className="space-y-10">
                <div className="h-[500px] rounded-[2.5rem] dark:bg-zinc-900/40 bg-white dark:border-white/5 border-zinc-200 border animate-pulse" />
                <div className="h-[500px] rounded-[2.5rem] dark:bg-zinc-900/40 bg-white dark:border-white/5 border-zinc-200 border animate-pulse" />
              </div>
            )}
          </div>

          {/* Activity Logs - 4/12 */}
          <aside className="lg:col-span-4">
            {!loading && data ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="h-full"
              >
                <RecentActivity activities={data.recentActivity} />
              </motion.div>
            ) : (
              <div className="h-[800px] rounded-[2.5rem] dark:bg-zinc-900/40 bg-white dark:border-white/5 border-zinc-200 border animate-pulse" />
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
