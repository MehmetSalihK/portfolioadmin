import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import { FiTrendingUp, FiUsers, FiEye, FiClock, FiBarChart2, FiMonitor, FiSmartphone, FiTablet, FiSettings, FiActivity, FiShield, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
  startTime?: string;
  endTime?: string;
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
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    message: '',
    startTime: '',
    endTime: ''
  });

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
      const response = await fetch('/api/maintenance', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance status');
      const data = await response.json();
      setMaintenanceStatus(data);
      if (data) {
        setMaintenanceForm({
          title: data.title || 'Site en maintenance',
          message: data.message || 'Le site est actuellement en maintenance. Veuillez revenir plus tard.',
          startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
          endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ''
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  }, []);

  const handleSaveMaintenance = async () => {
    try {
      setMaintenanceLoading(true);
      const response = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...maintenanceForm,
          estimatedEndTime: maintenanceForm.endTime // Sync for backward compatibility
        }),
      });
      if (!response.ok) throw new Error('Failed to save maintenance settings');
      await fetchMaintenanceStatus();
      setIsMaintenanceModalOpen(false);
    } catch (error) {
      console.error('Error saving maintenance settings:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

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

  if (loading && !analyticsData) {
    return (
      <AdminLayout>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Chargement des analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <FiBarChart2 className="w-5 h-5 text-indigo-500" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
              </div>
              <p className="text-zinc-500 font-medium">Suivez l'activité et le trafic de votre portfolio.</p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 px-3">
                <div className={`w-2 h-2 rounded-full ${maintenanceStatus?.isEnabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Maintenance</span>
              </div>
              <button
                onClick={toggleMaintenance}
                disabled={maintenanceLoading}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${maintenanceStatus?.isEnabled
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                  } disabled:opacity-50`}
              >
                {maintenanceLoading ? '...' : maintenanceStatus?.isEnabled ? 'Actif' : 'Désactivé'}
              </button>
              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-white/5"
              >
                <FiSettings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl border border-white/5 w-fit">
            {(['24h', '7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${period === p
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-zinc-500 hover:text-white'
                  }`}
              >
                {p === '24h' ? '24H' : p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : '90 Jours'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
             <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <FiEye className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Visites totales</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{analyticsData?.totalVisits.toLocaleString() || 0}</h3>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
             <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <FiUsers className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Visiteurs uniques</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{analyticsData?.uniqueVisitors.toLocaleString() || 0}</h3>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
             <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <FiClock className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Temps moyen</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{formatTime(analyticsData?.avgTimeSpent || 0)}</h3>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>
             <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <FiTrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Tendance</p>
                <h3 className="text-3xl font-black text-white tracking-tight">+{Math.round(((analyticsData?.totalVisits || 0) / (period === '24h' ? 1 : period === '7d' ? 7 : 30)) * 100) / 100}%</h3>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Top Pages */}
          <div className="lg:col-span-2 bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FiActivity className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Pages populaires</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {analyticsData?.topPages?.map((page, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:text-indigo-400 transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{page.page}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{formatTime(page.avgTimeSpent)} temps moyen</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-white">{page.visits}</span>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Vues</p>
                  </div>
                </motion.div>
              )) || (
                  <div className="text-zinc-600 font-bold text-xs uppercase tracking-widest text-center py-10 italic">Aucune donnée disponible</div>
                )}
            </div>
          </div>

          {/* Device Stats */}
          <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FiMonitor className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Appareils</h3>
              </div>
            
            <div className="space-y-4">
              {analyticsData?.deviceStats?.map((device, index) => {
                const total = analyticsData.deviceStats.reduce((acc, curr) => acc + curr.count, 0);
                const percent = (device.count / total) * 100;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    key={index} 
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
                          {getDeviceIcon(device.device)}
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest">{device.device}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-500">{Math.round(percent)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              }) || (
                  <div className="text-zinc-600 font-bold text-xs uppercase tracking-widest text-center py-10 italic">Aucune donnée disponible</div>
                )}
            </div>
          </div>
        </div>

        {/* Daily Visits Chart */}
        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FiActivity className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">Activité temporelle</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-zinc-400">Visites</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                <span className="text-zinc-400">Uniques</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {analyticsData?.dailyVisits?.map((day, index) => {
              const maxVisits = Math.max(...(analyticsData.dailyVisits?.map(d => d.visits) || [1]));
              const percentage = (day.visits / maxVisits) * 100;

              return (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="w-24 text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">
                    {new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-full h-8 relative overflow-hidden border border-white/5 group-hover:border-indigo-500/20 transition-all duration-300">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.div>
                    <div className="absolute inset-y-0 left-0 flex items-center px-4">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">{day.visits} vues</span>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{day.uniqueVisitors} uniques</span>
                    </div>
                  </div>
                </div>
              );
            }) || (
                <div className="text-zinc-600 font-bold text-xs uppercase tracking-widest text-center py-10 italic">Aucune donnée disponible</div>
              )}
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Configuration Maintenance"
      >
        <div className="space-y-8 py-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <FiAlertCircle className="w-5 h-5 text-amber-500" />
             </div>
             <div>
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Attention</h4>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                  L'activation du mode maintenance rendra le portfolio inaccessible aux visiteurs publics. L'administration reste accessible.
                </p>
             </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Titre de l'écran</label>
              <input
                type="text"
                value={maintenanceForm.title}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                placeholder="Ex: Site en maintenance"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Message d'accompagnement</label>
              <textarea
                value={maintenanceForm.message}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, message: e.target.value })}
                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300 min-h-[100px]"
                placeholder="Expliquez la raison de la maintenance..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Début prévu</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.startTime}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, startTime: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-white/10 transition-all duration-300 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Fin estimée</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.endTime}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, endTime: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-white/10 transition-all duration-300 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button
              onClick={() => setIsMaintenanceModalOpen(false)}
              className="px-6 py-2.5 text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveMaintenance}
              disabled={maintenanceLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
            >
              {maintenanceLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}