import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import {
  FiFolder, FiMail, FiTrendingUp, FiUsers, FiRefreshCw, FiChevronRight, FiActivity,
  FiImage, FiAward, FiBookOpen, FiBriefcase, FiShield, FiLayers, FiCheckCircle, FiAlertTriangle, FiClock,
  FiTerminal, FiBarChart2
} from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsChart from '@/components/admin/StatsChart';
import RecentActivity, { RecentActivityItem } from '@/components/admin/RecentActivity';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

interface DashboardStats {
  overview: {
    unreadMessages: number;
    totalProjects: number;
    totalSkills: number;
    totalExperiences: number;
    totalEducation: number;
    totalMedia: number;
    totalCategories: number;
    totalBackups: number;
  };
  analytics: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    topPages: Array<{
      page: string;
      views: number;
    }>;
    recentActivity: Array<{
      page: string;
      timestamp: Date;
      country?: string;
      device?: string;
    }>;
  };
  charts: {
    dailyViews: Array<{
      date: string;
      views: number;
    }>;
    deviceStats: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    projectsByCategory: Array<{
      name: string;
      value: number;
    }>;
    skillsByCategory: Array<{
      name: string;
      value: number;
    }>;
  };
  performance: {
    lastBackup: Date | null;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

interface Kpi {
  title: string;
  value: number;
  icon: any;
  onClick?: string;
  description: string;
  color: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, activityRes] = await Promise.all([
        fetch(`/api/dashboard/stats?days=${timeRange}`),
        fetch('/api/dashboard/activity'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      } else {
        throw new Error('Erreur lors du chargement des données');
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        const items: RecentActivityItem[] = (activityData.recentActivity || []).map((a: any) => ({
          id: String(a._id),
          type: a.type,
          description: a.description,
          timestamp: a.timestamp,
        }));
        setActivity(items);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router, fetchDashboardData]);

  const healthConfig: Record<string, { label: string; className: string }> = {
    excellent: { label: 'Opérationnel', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    good: { label: 'Stable', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    warning: { label: 'Attention', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    critical: { label: 'Critique', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };
  const currentHealth = healthConfig[stats?.performance?.systemHealth || 'excellent'] || healthConfig.excellent;

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent shadow-lg shadow-primary-500/20"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-3xl bg-red-500/10 mb-6">
            <FiAlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold dark:text-white text-slate-900 mb-2">Une erreur est survenue</h2>
          <p className="text-slate-500 max-w-sm mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-all">
            Réessayer
          </button>
        </div>
      </AdminLayout>
    );
  }

  const kpis: Kpi[] = stats
    ? [
        {
          title: 'Projets',
          value: stats.overview.totalProjects,
          icon: FiFolder,
          onClick: '/admin/projects',
          description: 'Portfolio items',
          color: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          title: 'Messages',
          value: stats.overview.unreadMessages,
          icon: FiMail,
          onClick: '/admin/messages',
          description: 'Non lues',
          color: 'bg-rose-500/10 text-rose-500',
        },
        {
          title: 'Vues Totales',
          value: stats.analytics.totalPageViews,
          icon: FiTrendingUp,
          description: `Sur les ${timeRange} derniers jours`,
          color: 'bg-sky-500/10 text-sky-500',
        },
        {
          title: 'Visiteurs Uniques',
          value: stats.analytics.uniqueVisitors,
          icon: FiUsers,
          description: 'Sessions uniques',
          color: 'bg-violet-500/10 text-violet-500',
        },
      ]
    : [];

  const secondaryStats = stats
    ? [
        { label: 'Médias', value: stats.overview.totalMedia, icon: FiImage, href: '/admin/media' },
        { label: 'Compétences', value: stats.overview.totalSkills, icon: FiAward, href: '/admin/skills' },
        { label: 'Formations', value: stats.overview.totalEducation, icon: FiBookOpen, href: '/admin/education' },
        { label: 'Expériences', value: stats.overview.totalExperiences, icon: FiBriefcase, href: '/admin/experience' },
        { label: 'Sauvegardes', value: stats.overview.totalBackups, icon: FiShield, href: '/admin/backup' },
        { label: 'Catégories', value: stats.overview.totalCategories, icon: FiLayers, href: '/admin/skill-categories' },
      ]
    : [];

  const topPages = stats?.analytics.topPages?.slice(0, 5) || [];
  const maxPageViews = Math.max(...topPages.map((p) => p.views), 1);

  return (
    <AdminLayout>
      <div className="space-y-10 pb-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 shadow-sm">
                <FiTerminal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary-500">Node Central v2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black dark:text-white text-slate-900 tracking-tighter">
              Control <span className="text-primary-500">Center</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-xl flex items-center gap-2">
              Bienvenue, <span className="text-slate-900 dark:text-white font-black underline decoration-primary-500/30 underline-offset-4">{session?.user?.name || 'Administrator'}</span>.
              Vue consolidée de votre écosystème.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {stats && (
              <div className={`flex items-center gap-2 px-4 py-2 border rounded-2xl ${currentHealth.className}`}>
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{currentHealth.label}</span>
              </div>
            )}
            <div className="flex items-center bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 p-1 rounded-xl shadow-sm">
              {(['7', '30', '90'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setTimeRange(day)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === day ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {day}j
                </button>
              ))}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="h-12 px-6 rounded-2xl bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all flex items-center gap-3 shadow-sm disabled:opacity-60"
            >
              {loading ? <FiRefreshCw className="animate-spin" /> : <FiRefreshCw />}
              Sync Data
            </button>
          </div>
        </div>

        {/* Top Tier Metrics */}
        <section className="relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/5 blur-[100px] pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {kpis.map((kpi, idx) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => kpi.onClick && router.push(kpi.onClick)}
                className={`p-8 rounded-[40px] border transition-all duration-300 ${
                  theme === 'dark'
                  ? 'bg-background-card/40 border-white/5 hover:bg-background-card/60'
                  : 'bg-white border-slate-100 shadow-premium hover:shadow-premium-lg'
                } ${kpi.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  {kpi.onClick && <FiChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{kpi.title}</h3>
                  <p className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 tabular-nums">{kpi.value}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FiActivity className="w-3 h-3" />
                    {kpi.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Secondary Strip */}
        {secondaryStats.length > 0 && (
          <section className="grid grid-cols-2 xl:grid-cols-6 gap-4">
            {secondaryStats.map((item) => (
              <Link key={item.label} href={item.href} className="group p-5 rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-background-card/40 hover:border-primary-500/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.label}</span>
                    <p className="text-xl font-black dark:text-white text-slate-800 tabular-nums">{item.value}</p>
                  </div>
                  <item.icon className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Main Operational Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Analytics Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[48px] p-12 hover:shadow-premium-lg transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-10 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm group-hover:rotate-6 transition-transform"><FiBarChart2 className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Activité des visites</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vues de pages quotidiennes sur la période</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary-500 text-xs font-bold bg-primary-500/5 px-3 py-1 rounded-lg">
                  <FiActivity />
                  Live
                </div>
              </div>
              <div className="h-[340px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.charts.dailyViews || []}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f5f9'} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5' }}
                      labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Skills Radar */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[48px] p-12 hover:shadow-premium-lg transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-10 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm group-hover:rotate-6 transition-transform"><FiAward className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Radar Compétences</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Densité technologique globale</p>
                  </div>
                </div>
                <FiChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="h-[340px] flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[32px] p-6 border border-slate-100 dark:border-white/[0.03]">
                <StatsChart data={stats?.charts.skillsByCategory || []} type="pie" />
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Popular Pages */}
          <aside className="lg:col-span-4 h-full">
            <div className="space-y-10">
              <RecentActivity activities={activity} />
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[48px] p-12 hover:shadow-premium-lg transition-all duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-sm"><FiTrendingUp className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Pages populaires</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top {topPages.length} pages</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {topPages.map((page, index) => (
                    <div key={page.page} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                        <span className="dark:text-slate-300 text-slate-700 truncate max-w-[250px]">{page.page}</span>
                        <span className="text-primary-500 underline decoration-primary-500/20 underline-offset-4">{page.views} vues</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(page.views / maxPageViews) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-primary-500/50 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
