import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCode, FiBriefcase, FiMail, FiBookOpen, FiImage, FiTag,
  FiShield, FiGlobe, FiTrendingUp, FiActivity, FiMonitor,
  FiSmartphone, FiTablet, FiClock, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
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
    totalSEOEntries: number;
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
    seoScore: number;
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
        // Fetch recent activity separately if needed
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

  const StatCard = ({ title, value, icon: Icon, onClick, color = "blue" }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    onClick?: () => void;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500/10 text-blue-400",
      green: "bg-green-500/10 text-green-400",
      purple: "bg-purple-500/10 text-purple-400",
      red: "bg-red-500/10 text-red-400",
      yellow: "bg-yellow-500/10 text-yellow-400",
      indigo: "bg-indigo-500/10 text-indigo-400",
      pink: "bg-pink-500/10 text-pink-400",
      gray: "bg-gray-500/10 text-gray-400",
      teal: "bg-teal-500/10 text-teal-400"
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-lg shadow-xl transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#1E2533]' : 'bg-white'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm uppercase font-medium mb-2 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{title}</h3>
            <p className={`text-2xl font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </motion.div>
    );
  };

  const SystemHealthIndicator = ({ health }: { health: string }) => {
    const getHealthConfig = (health: string) => {
      switch (health) {
        case 'excellent':
          return { color: 'bg-green-500', text: 'Excellent', icon: FiCheckCircle };
        case 'good':
          return { color: 'bg-blue-500', text: 'Bon', icon: FiCheckCircle };
        case 'warning':
          return { color: 'bg-yellow-500', text: 'Attention', icon: FiAlertTriangle };
        case 'critical':
          return { color: 'bg-red-500', text: 'Critique', icon: FiAlertTriangle };
        default:
          return { color: 'bg-gray-500', text: 'Inconnu', icon: FiClock };
      }
    };

    const config = getHealthConfig(health);
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <span className="text-sm font-medium text-gray-300">{config.text}</span>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
          <div className="text-center">
            <FiAlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erreur</h2>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  // Données pour le graphique en secteurs des appareils
  const deviceData = [
    { name: 'Desktop', value: stats.charts.deviceStats.desktop, color: '#3B82F6' },
    { name: 'Mobile', value: stats.charts.deviceStats.mobile, color: '#10B981' },
    { name: 'Tablet', value: stats.charts.deviceStats.tablet, color: '#F59E0B' }
  ];

  return (
    <AdminLayout>
      <div className={`min-h-screen p-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#1A1F2C]' : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Dashboard</h1>
            <p className={`mt-1 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Vue d'ensemble de votre portfolio</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-2 border rounded-lg transition-colors duration-300 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-[#1E2533] text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Projets"
            value={stats.overview.totalProjects}
            icon={FiCode}
            color="blue"
            onClick={() => router.push('/admin/projects')}
          />
          <StatCard
            title="Compétences"
            value={stats.overview.totalSkills}
            icon={FiUsers}
            color="green"
            onClick={() => router.push('/admin/skills')}
          />
          <StatCard
            title="Expériences"
            value={stats.overview.totalExperiences}
            icon={FiBriefcase}
            color="purple"
            onClick={() => router.push('/admin/experience')}
          />
          <StatCard
            title="Messages non lus"
            value={stats.overview.unreadMessages}
            icon={FiMail}
            color="red"
            onClick={() => router.push('/admin/messages')}
          />
        </div>

        {/* Cartes de statistiques secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Éducation"
            value={stats.overview.totalEducation}
            icon={FiBookOpen}
            color="indigo"
          />
          <StatCard
            title="Médias"
            value={stats.overview.totalMedia}
            icon={FiImage}
            color="pink"
          />
          <StatCard
            title="Catégories"
            value={stats.overview.totalCategories}
            icon={FiTag}
            color="yellow"
          />
          <StatCard
            title="Sauvegardes"
            value={stats.overview.totalBackups}
            icon={FiShield}
            color="gray"
          />
          <StatCard
            title="Entrées SEO"
            value={stats.overview.totalSEOEntries}
            icon={FiGlobe}
            color="teal"
          />
        </div>

        {/* Analytics et Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Analytics */}
          <div className={`lg:col-span-2 rounded-lg shadow-xl p-6 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#1E2533]' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.analytics.totalPageViews}</p>
                <p className="text-sm text-gray-400">Vues de page</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{stats.analytics.uniqueVisitors}</p>
                <p className="text-sm text-gray-400">Visiteurs uniques</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{stats.analytics.averageSessionDuration}s</p>
                <p className="text-sm text-gray-400">Durée moyenne</p>
              </div>
            </div>
            
            {/* Graphique des vues quotidiennes */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.charts.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance */}
          <div className={`rounded-lg shadow-xl p-6 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#1E2533]' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Santé du système</p>
                <SystemHealthIndicator health={stats.performance.systemHealth} />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Score SEO</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stats.performance.seoScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {stats.performance.seoScore}%
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Dernière sauvegarde</p>
                <p className="text-sm font-medium text-white">
                  {stats.performance.lastBackup 
                    ? new Date(stats.performance.lastBackup).toLocaleDateString('fr-FR')
                    : 'Aucune sauvegarde'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Répartition par appareil */}
          <div className={`rounded-lg shadow-xl p-6 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#1E2533]' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Répartition par appareil</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pages les plus visitées */}
          <div className={`rounded-lg shadow-xl p-6 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#1E2533]' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Pages populaires</h3>
            <div className="space-y-3">
              {stats.analytics.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {page.page}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {page.views} vues
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-xl overflow-hidden transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#1E2533]' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b transition-colors duration-300 ${
            theme === 'dark' ? 'border-[#2A3241]' : 'border-gray-200'
          }`}>
            <h2 className={`font-medium transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-sm uppercase transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-[#252D3C] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  <th className="px-6 py-4 text-left font-medium">Type</th>
                  <th className="px-6 py-4 text-left font-medium">Description</th>
                  <th className="px-6 py-4 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={`px-6 py-8 text-center transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((activity) => (
                    <tr 
                      key={activity._id}
                      className={`border-t transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'border-[#2A3241] hover:bg-[#252D3C]' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                          {activity.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{activity.description}</td>
                      <td className={`px-6 py-4 transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{activity.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
};
