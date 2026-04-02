import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiBriefcase, FiCode, FiFolder, FiActivity, FiBarChart2, FiZap, FiLoader, FiTerminal, FiChevronRight, FiClock } from 'react-icons/fi';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import StatsChart from '@/components/admin/StatsChart';
import RecentActivity from '@/components/admin/RecentActivity';
import StatsCards from '@/components/admin/StatsCards';

interface DashboardStats {
  counts: { unreadMessages: number; projects: number; skills: number; experiences: number; messages: number; };
  recentActivity: any[];
  charts: { projectsByCategory: { name: string; value: number }[]; skillsByCategory: { name: string; value: number }[]; };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login'); }, [status, router]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) setData(await res.json());
    } catch (e) { toast.error('Erreur chargement'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === 'authenticated') fetchStats(); }, [status, fetchStats]);

  return (
    <AdminLayout>
      <div className="space-y-12">
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
                Bienvenue, <span className="text-slate-900 dark:text-white font-black underline decoration-primary-500/30 underline-offset-4">{session?.user?.name || 'Administrator'}</span>. Analyseur de métriques actif.
             </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Système Optimal</span>
              </div>
              <button 
                onClick={fetchStats} disabled={loading}
                className="h-12 px-6 rounded-2xl bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all flex items-center gap-3 shadow-sm"
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiActivity />}
                Sync Data
              </button>
           </div>
        </div>

        {/* Top Tier Metrics */}
        <section className="relative">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/5 blur-[100px] pointer-events-none" />
           <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-white/5 rounded-[40px] animate-pulse" />)}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                   <StatsCards stats={{
                      unreadMessages: data?.counts.unreadMessages || 0,
                      totalProjects: data?.counts.projects || 0,
                      totalSkills: data?.counts.skills || 0,
                      totalExperiences: data?.counts.experiences || 0,
                   }} />
                </motion.div>
              )}
           </AnimatePresence>
        </section>

        {/* Main Operational Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Primary Visuals (Left) */}
           <div className="lg:col-span-8 space-y-10">
              <AnimatePresence mode="wait">
                 {!loading && data ? (
                   <div className="grid grid-cols-1 gap-10">
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[48px] p-12 hover:shadow-premium-lg transition-all duration-500 group relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />
                         <div className="flex items-center justify-between mb-10 relative">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-[20px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm group-hover:rotate-6 transition-transform"><FiBarChart2 size={24} /></div>
                               <div>
                                  <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Focus Projets</h3>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Répartition par catégorie d'expertise</p>
                               </div>
                            </div>
                            <FiChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                         </div>
                         <div className="min-h-[400px] flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[32px] p-6 border border-slate-100 dark:border-white/[0.03]">
                            <StatsChart data={data.charts.projectsByCategory} type="bar" />
                         </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[48px] p-12 hover:shadow-premium-lg transition-all duration-500 group relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                         <div className="flex items-center justify-between mb-10 relative">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-[20px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm group-hover:rotate-6 transition-transform"><FiCode size={24} /></div>
                               <div>
                                  <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Radar Compétences</h3>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Densité technologique globale</p>
                               </div>
                            </div>
                            <FiChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                         </div>
                         <div className="min-h-[400px] flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[32px] p-6 border border-slate-100 dark:border-white/[0.03]">
                            <StatsChart data={data.charts.skillsByCategory} type="pie" />
                         </div>
                      </motion.div>
                   </div>
                 ) : (
                   <div className="space-y-10">
                      <div className="h-[500px] rounded-[48px] bg-slate-100 dark:bg-white/5 animate-pulse" />
                      <div className="h-[500px] rounded-[48px] bg-slate-100 dark:bg-white/5 animate-pulse" />
                   </div>
                 )}
              </AnimatePresence>
           </div>

           {/* Logs & Interactions (Right) */}
           <aside className="lg:col-span-4 h-full">
              <AnimatePresence mode="wait">
                 {!loading && data ? (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-full">
                      <RecentActivity activities={data.recentActivity} />
                   </motion.div>
                 ) : (
                   <div className="h-[800px] rounded-[48px] bg-slate-100 dark:bg-white/5 animate-pulse" />
                 )}
              </AnimatePresence>
           </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
