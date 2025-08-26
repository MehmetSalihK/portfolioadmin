import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { FiTrendingUp, FiUsers, FiEye, FiClock, FiBarChart2, FiMonitor, FiSmartphone, FiTablet } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface AnalyticsStats {
  totalVisits: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  topPages: Array<{
    page: string;
    visits: number;
    avgTimeSpent: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
  }>;
  dailyVisits: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  period: string;
  startDate: string;
  endDate: string;
}

interface MaintenanceStatus {
  isEnabled: boolean;
  title: string;
  message: string;
  estimatedEndTime?: string;
  enabledAt?: string;
  enabledBy?: string;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsStats | null>(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/stats?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const fetchMaintenanceStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/maintenance');
      if (!response.ok) throw new Error('Failed to fetch maintenance status');
      const data = await response.json();
      setMaintenanceStatus(data);
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  }, []);

  const toggleMaintenance = async () => {
    try {
      setMaintenanceLoading(true);
      const response = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: !maintenanceStatus?.isEnabled,
          title: 'Maintenance en cours',
          message: 'Le site est actuellement en maintenance. Nous serons de retour bientôt.',
        }),
      });
      if (!response.ok) throw new Error('Failed to toggle maintenance');
      await fetchMaintenanceStatus();
    } catch (error) {
      console.error('Error toggling maintenance:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchAnalytics();
      fetchMaintenanceStatus();
    }
  }, [status, router, fetchAnalytics, fetchMaintenanceStatus]);

  useEffect(() => {
    fetchAnalytics();
  }, [period, fetchAnalytics]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <FiSmartphone className="w-4 h-4" />;
      case 'tablet':
        return <FiTablet className="w-4 h-4" />;
      default:
        return <FiMonitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-white">Chargement des analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FiBarChart2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Analytics & Maintenance</h1>
            </div>
            
            {/* Maintenance Toggle */}
            <div className="flex items-center gap-4">
              <span className="text-white">Mode Maintenance:</span>
              <button
                onClick={toggleMaintenance}
                disabled={maintenanceLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  maintenanceStatus?.isEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {maintenanceLoading ? 'Chargement...' : maintenanceStatus?.isEnabled ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {(['24h', '7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p === '24h' ? '24 heures' : p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>

          {/* Analytics Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2 text-blue-400">
                <FiEye className="w-5 h-5" />
                <span>Total Visites</span>
              </div>
              <p className="text-3xl font-bold text-white">{analyticsData?.totalVisits || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2 text-purple-400">
                <FiUsers className="w-5 h-5" />
                <span>Visiteurs Uniques</span>
              </div>
              <p className="text-3xl font-bold text-white">{analyticsData?.uniqueVisitors || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2 text-green-400">
                <FiClock className="w-5 h-5" />
                <span>Temps Moyen</span>
              </div>
              <p className="text-3xl font-bold text-white">{formatTime(analyticsData?.avgTimeSpent || 0)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2 text-orange-400">
                <FiTrendingUp className="w-5 h-5" />
                <span>Taux de Rebond</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {analyticsData?.totalVisits ? Math.round(((analyticsData.totalVisits - analyticsData.uniqueVisitors) / analyticsData.totalVisits) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#2A2A2A]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-blue-500" />
                Pages Populaires
              </h3>
              <div className="space-y-3">
                {analyticsData?.topPages?.slice(0, 5).map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{page.page}</div>
                      <div className="text-gray-400 text-sm">{page.visits} visites</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-medium">{formatTime(page.avgTimeSpent)}</div>
                      <div className="text-gray-500 text-xs">temps moyen</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-gray-400 text-center py-4">Aucune donnée disponible</div>
                )}
              </div>
            </div>

            {/* Device Stats */}
            <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#2A2A2A]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiMonitor className="w-5 h-5 text-green-500" />
                Appareils
              </h3>
              <div className="space-y-3">
                {analyticsData?.deviceStats?.map((device, index) => {
                  const percentage = analyticsData.totalVisits > 0 
                    ? Math.round((device.count / analyticsData.totalVisits) * 100) 
                    : 0;
                  return (
                    <div key={device.device} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          {getDeviceIcon(device.device)}
                        </div>
                        <div>
                          <div className="text-white font-medium capitalize">{device.device}</div>
                          <div className="text-gray-400 text-sm">{device.count} visites</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">{percentage}%</div>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-gray-400 text-center py-4">Aucune donnée disponible</div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Visits Chart */}
          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#2A2A2A]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-purple-500" />
              Visites Quotidiennes
            </h3>
            <div className="space-y-2">
              {analyticsData?.dailyVisits?.slice(-7).map((day, index) => {
                const maxVisits = Math.max(...(analyticsData.dailyVisits?.map(d => d.visits) || [1]));
                const percentage = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0;
                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-400">
                      {new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-[#2A2A2A] rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                        {day.visits} visites
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-400 text-right">
                      {day.uniqueVisitors} uniques
                    </div>
                  </div>
                );
              }) || (
                <div className="text-gray-400 text-center py-4">Aucune donnée disponible</div>
              )}
            </div>
          </div>
      </AdminLayout>
  );
}
