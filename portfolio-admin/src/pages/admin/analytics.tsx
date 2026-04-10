import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import { FiTrendingUp, FiUsers, FiEye, FiClock, FiBarChart2, FiMonitor, FiSmartphone, FiTablet, FiSettings, FiActivity, FiShield, FiAlertCircle, FiLoader, FiCheck, FiSave, FiX, FiCalendar, FiGlobe } from 'react-icons/fi';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...maintenanceForm, estimatedEndTime: maintenanceForm.endTime }),
      });
      if (!response.ok) throw new Error('Failed to save');
      await fetchMaintenanceStatus();
      setIsMaintenanceModalOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    try {
      setMaintenanceLoading(true);
      const response = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !maintenanceStatus?.isEnabled, title: 'Maintenance en cours', message: 'Le site est actuellement en maintenance. Nous serons de retour bientôt.' }),
      });
      if (!response.ok) throw new Error('Failed to toggle');
      await fetchMaintenanceStatus();
    } catch (error) {
      console.error('Error toggling:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/admin/login'); } else if (status === 'authenticated') { fetchAnalytics(); fetchMaintenanceStatus(); }
  }, [status, router, fetchAnalytics, fetchMaintenanceStatus]);

  useEffect(() => { fetchAnalytics(); }, [period, fetchAnalytics]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <FiSmartphone className="w-5 h-5" />;
      case 'tablet': return <FiTablet className="w-5 h-5" />;
      default: return <FiMonitor className="w-5 h-5" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiBarChart2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Audience & Performance</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Analytics</h1>
             <p className="text-slate-500 font-medium max-w-lg">Analysez le trafic et optimisez l'expérience utilisateur en temps réel.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-2xl">
                 <div className={`w-2.5 h-2.5 rounded-full ${maintenanceStatus?.isEnabled ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mode Maintenance</span>
                 <button onClick={toggleMaintenance} disabled={maintenanceLoading} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${maintenanceStatus?.isEnabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary-500'}`}>
                    {maintenanceLoading ? '...' : maintenanceStatus?.isEnabled ? 'Actif' : 'Désactivé'}
                 </button>
                 <button onClick={() => setIsMaintenanceModalOpen(true)} className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:text-primary-500 transition-colors"><FiSettings className="w-4 h-4"/></button>
              </div>

              <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                {(['24h', '7d', '30d', '90d'] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-premium' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    {p}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Visites Totales', value: analyticsData?.totalVisits.toLocaleString() || 0, icon: FiEye, color: 'primary', delay: 0 },
             { label: 'Visiteurs Uniques', value: analyticsData?.uniqueVisitors.toLocaleString() || 0, icon: FiUsers, color: 'emerald', delay: 0.1 },
             { label: 'Temps Moyen', value: formatTime(analyticsData?.avgTimeSpent || 0), icon: FiClock, color: 'indigo', delay: 0.2 },
             { label: 'Tendance Mensuelle', value: `+${Math.round((analyticsData?.totalVisits || 1) * 0.05)}%`, icon: FiTrendingUp, color: 'rose', delay: 0.3 },
           ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 hover:shadow-premium-lg transition-all duration-500 group relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-colors`} />
                 <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 mb-6 group-hover:scale-110 transition-transform`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight">{stat.value}</h3>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Detailed Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
           {/* Activity Chart Area */}
           <div className="xl:col-span-2 bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-10 group hover:shadow-premium-lg transition-all duration-500">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:rotate-12 transition-transform">
                       <FiActivity className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Timeline d'Activité</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Évolution des visites quotidiennes</p>
                    </div>
                 </div>
                 <div className="flex h-fit bg-slate-50 dark:bg-white/5 p-1 rounded-xl">
                    <div className="flex items-center gap-2 px-3 py-1.5"><div className="w-2 h-2 rounded-full bg-primary-500" /><span className="text-[8px] font-black uppercase text-slate-500">Visites</span></div>
                    <div className="flex items-center gap-2 px-3 py-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" /><span className="text-[8px] font-black uppercase text-slate-500">Uniques</span></div>
                 </div>
              </div>

              <div className="space-y-4">
                 {analyticsData?.dailyVisits?.map((day, i) => {
                    const max = Math.max(...(analyticsData.dailyVisits.map(d => d.visits) || [1]));
                    const percent = (day.visits / max) * 100;
                    return (
                       <div key={i} className="flex items-center gap-6 group/row">
                          <div className="w-32 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] group-hover/row:text-primary-500 transition-colors">
                             {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex-1 h-10 bg-slate-50 dark:bg-white/5 rounded-2xl relative overflow-hidden border border-slate-100 dark:border-white/5 group-hover/row:border-primary-500/20 transition-all">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ delay: i * 0.05, duration: 1 }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                             <div className="absolute inset-0 flex items-center justify-between px-5">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-sm">{day.visits} vues</span>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{day.uniqueVisitors} uniques</span>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>

           {/* Devices & Pages Sidebar */}
           <div className="space-y-10">
              {/* Top Pages Box */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 group hover:shadow-premium-lg transition-all duration-500">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                       <FiGlobe className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Top Pages</h3>
                 </div>
                 <div className="space-y-3">
                    {analyticsData?.topPages?.slice(0, 5).map((page, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl group/page hover:border-primary-500/20 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[8px] font-black text-slate-500 group-hover/page:text-primary-500 transition-colors uppercase">{i + 1}</div>
                             <span className="text-xs font-bold dark:text-slate-300 text-slate-700 capitalize limit-line-1">{page.page}</span>
                          </div>
                          <span className="text-[10px] font-black text-primary-500">{page.visits}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Devices Box */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 group hover:shadow-premium-lg transition-all duration-500">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <FiMonitor className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Devices</h3>
                 </div>
                 <div className="space-y-5">
                    {analyticsData?.deviceStats?.map((device, i) => {
                       const total = analyticsData.deviceStats.reduce((a, c) => a + c.count, 0);
                       const pct = (device.count / total) * 100;
                       return (
                          <div key={i} className="space-y-2">
                             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2 text-slate-500">
                                   {getDeviceIcon(device.device)}
                                   {device.device}
                                </div>
                                <span className="text-emerald-500">{Math.round(pct)}%</span>
                             </div>
                             <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-emerald-500" />
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modern Maintenance Modal */}
      <AnimatePresence>
         {isMaintenanceModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsMaintenanceModalOpen(false)}>
               <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-[80px] -mr-10 -mt-10" />
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Security Module</span>
                       <h2 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight">Maintenance</h2>
                    </div>
                    <button onClick={() => setIsMaintenanceModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 mb-10 flex gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><FiAlertCircle className="w-6 h-6" /></div>
                     <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">"Le mode maintenance bloque l'accès public au portfolio mais conserve un accès total pour vous ici même."</p>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); handleSaveMaintenance(); }} className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Titre de l'écran</label>
                        <input required value={maintenanceForm.title} onChange={e => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 font-bold dark:text-white text-slate-900 text-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Message explicatif</label>
                        <textarea required value={maintenanceForm.message} onChange={e => setMaintenanceForm({ ...maintenanceForm, message: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Début</label>
                           <input type="datetime-local" value={maintenanceForm.startTime} onChange={e => setMaintenanceForm({ ...maintenanceForm, startTime: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-3 rounded-xl dark:text-white text-slate-900 text-xs font-bold [color-scheme:dark]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Fin prévue</label>
                           <input type="datetime-local" value={maintenanceForm.endTime} onChange={e => setMaintenanceForm({ ...maintenanceForm, endTime: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-3 rounded-xl dark:text-white text-slate-900 text-xs font-bold [color-scheme:dark]" />
                        </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={maintenanceLoading} className="flex-1 bg-primary-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-3">
                           {maintenanceLoading ? <FiLoader className="animate-spin" /> : <FiSave className="w-5 h-5" />} Appliquer
                        </button>
                        <button type="button" onClick={() => setIsMaintenanceModalOpen(false)} className="px-8 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-[24px] font-black uppercase text-sm tracking-widest">Annuler</button>
                     </div>
                  </form>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </AdminLayout>
  );
}