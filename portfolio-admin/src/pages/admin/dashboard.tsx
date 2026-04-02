import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCode, FiBriefcase, FiMail, FiBookOpen, FiImage, FiTag,
  FiShield, FiGlobe, FiTrendingUp, FiActivity, FiMonitor,
  FiSmartphone, FiTablet, FiClock, FiCheckCircle, FiAlertTriangle,
  FiArrowUpRight, FiCalendar, FiArrowDownRight
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

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
  };
  performance: {
    lastBackup: Date | null;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

interface RecentActivity {
  _id: string;
  type: string;
  description: string;
  date: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard/stats?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        const activityResponse = await fetch('/api/dashboard/activity');
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.recentActivity || []);
        }
      } else {
        throw new Error('Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchDashboardData();
    }
  }, [status, router, fetchDashboardData]);

  const StatCard = ({ title, value, icon: Icon, onClick, color = "primary", grow = 0 }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    onClick?: () => void;
    color?: string;
    grow?: number;
  }) => {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={`p-6 rounded-2xl border transition-all duration-300 ${
          theme === 'dark' 
          ? 'bg-background-card/40 border-white/5 hover:bg-background-card/60' 
          : 'bg-white border-slate-100 shadow-premium hover:shadow-premium-lg'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${
            theme === 'dark' ? 'bg-primary-500/10 text-primary-400' : 'bg-primary-50 text-primary-600'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          {grow !== 0 && (
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${grow > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {grow > 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
              {Math.abs(grow)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</h3>
          <p className="text-2xl font-extrabold tracking-tight dark:text-white text-slate-900">{value}</p>
        </div>
      </motion.div>
    );
  };

  const SystemHealthIndicator = ({ health }: { health: string }) => {
    const config = {
      excellent: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', text: 'Opérationnel' },
      good: { color: 'text-blue-500', bg: 'bg-blue-500/10', text: 'Stable' },
      warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', text: 'Attention' },
      critical: { color: 'text-red-500', bg: 'bg-red-500/10', text: 'Critique' },
    }[health] || { color: 'text-slate-500', bg: 'bg-slate-500/10', text: 'Inconnu' };

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.color.replace('text', 'bg')}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{config.text}</span>
      </div>
    );
  };

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

  if (!stats) return null;

  const deviceData = [
    { name: 'Desktop', value: stats.charts.deviceStats.desktop, color: '#4f46e5' },
    { name: 'Mobile', value: stats.charts.deviceStats.mobile, color: '#10B981' },
    { name: 'Tablet', value: stats.charts.deviceStats.tablet, color: '#F59E0B' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">Tableau de bord</h1>
            <p className="text-slate-500 text-sm font-medium">Bon retour, voici un aperçu de vos activités.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-1 rounded-xl shadow-sm">
              <button onClick={() => setTimeRange('7')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === '7' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}>7j</button>
              <button onClick={() => setTimeRange('30')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === '30' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}>30j</button>
              <button onClick={() => setTimeRange('90')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === '90' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}>90j</button>
            </div>
            <button onClick={fetchDashboardData} className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:text-primary-500 transition-colors shadow-sm">
              <FiClock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Projets" value={stats.overview.totalProjects} icon={FiCode} onClick={() => router.push('/admin/projects')} grow={4.2} />
          <StatCard title="Messages" value={stats.overview.unreadMessages} icon={FiMail} onClick={() => router.push('/admin/messages')} grow={-2.1} />
          <StatCard title="Vues Totales" value={stats.analytics.totalPageViews} icon={FiTrendingUp} grow={12.5} />
          <StatCard title="Utilisateurs" value={stats.analytics.uniqueVisitors} icon={FiUsers} grow={8.3} />
        </div>

        {/* Secondary Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Médias', value: stats.overview.totalMedia, icon: FiImage },
            { label: 'Compétences', value: stats.overview.totalSkills, icon: FiTag },
            { label: 'Formations', value: stats.overview.totalEducation, icon: FiBookOpen },
            { label: 'Backups', value: stats.overview.totalBackups, icon: FiShield },
            { label: 'Expériences', value: stats.overview.totalExperiences, icon: FiBriefcase },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between group hover:border-primary-500/20 transition-all">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
                <p className="text-lg font-extrabold dark:text-white text-slate-800">{item.value}</p>
              </div>
              <item.icon className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 p-8 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-background-card/40 shadow-premium overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h3 className="text-lg font-bold dark:text-white text-slate-900">Activité des visites</h3>
                <p className="text-slate-400 text-xs font-medium">Vues de pages quotidiennes sur la période.</p>
              </div>
              <div className="flex items-center gap-2 text-primary-500 text-xs font-bold bg-primary-500/5 px-3 py-1 rounded-lg">
                <FiActivity /> Live
              </div>
            </div>
            
            <div className="h-72 w-full mt-4 -ml-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts.dailyViews}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
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
          </div>

          {/* System & Device Info */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-background-card/40 shadow-premium">
              <h3 className="text-lg font-bold dark:text-white text-slate-900 mb-6">État Système</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <FiMonitor className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Service</span>
                  </div>
                  <SystemHealthIndicator health={stats.performance.systemHealth} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 tracking-tight">Dernière Backup</span>
                  </div>
                  <span className="text-xs font-bold dark:text-white text-slate-900">
                    {stats.performance.lastBackup ? new Date(stats.performance.lastBackup).toLocaleDateString('fr-FR') : '---'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-background-card/40 shadow-premium">
              <h3 className="text-lg font-bold dark:text-white text-slate-900 mb-2">Appareils</h3>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                      {deviceData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px', padding: '4px 8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <FiSmartphone className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid: Popular Pages & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity Table */}
          <div className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-background-card/40 shadow-premium overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white text-slate-900">Activité récente</h3>
              <button className="text-xs font-bold text-primary-500 hover:text-primary-600">Tout voir</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-4 text-left">Événement</th>
                    <th className="px-8 py-4 text-left">Description</th>
                    <th className="px-8 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {recentActivity.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 text-sm font-medium">Aucun événement à afficher.</td></tr>
                  ) : (
                    recentActivity.slice(0, 5).map((activity) => (
                      <tr key={activity._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 rounded-lg bg-primary-500/5 text-primary-500 text-[10px] font-bold">
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs font-semibold dark:text-slate-300 text-slate-600 truncate max-w-[200px]">
                          {activity.description}
                        </td>
                        <td className="px-8 py-4 text-right text-xs font-medium text-slate-400">
                          {activity.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Pages */}
          <div className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-background-card/40 shadow-premium overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-bold dark:text-white text-slate-900">Pages populaires</h3>
            </div>
            <div className="p-8 space-y-6">
              {stats.analytics.topPages.slice(0, 5).map((page, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                    <span className="dark:text-slate-300 text-slate-700 truncate max-w-[250px]">{page.page}</span>
                    <span className="text-primary-500 underline decoration-primary-500/20 underline-offset-4">{page.views} vues</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(page.views / stats.analytics.totalPageViews) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary-500/50 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
