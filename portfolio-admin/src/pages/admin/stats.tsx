import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { FiTrendingUp, FiGithub, FiExternalLink, FiEye, FiClock, FiActivity, FiBarChart2, FiArrowUp, FiLoader, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ProjectStats {
  _id: string;
  title: string;
  imageUrl: string;
  stats: {
    demoClicks: number;
    githubClicks: number;
    views: number;
    lastClicked: string | null;
    clickHistory: Array<{
      type: string;
      timestamp: string;
    }>;
    dailyStats: Array<{
      date: string;
      demoClicks: number;
      githubClicks: number;
      views: number;
    }>;
  };
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectStats[]>([]);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'day'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login'); }, [status, router]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setProjects(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === 'authenticated') fetchProjects(); }, [status, fetchProjects]);

  const getFilteredStats = (project: ProjectStats) => {
    if (!project.stats) return { demoClicks: 0, githubClicks: 0, views: 0, lastClicked: null };
    if (timeRange === 'all') return { demoClicks: project.stats.demoClicks || 0, githubClicks: project.stats.githubClicks || 0, views: project.stats.views || 0, lastClicked: project.stats.lastClicked };
    const now = new Date();
    const filterDate = new Date();
    if (timeRange === 'month') filterDate.setMonth(now.getMonth() - 1);
    else if (timeRange === 'week') filterDate.setDate(now.getDate() - 7);
    else if (timeRange === 'day') filterDate.setDate(now.getDate() - 1);
    return (project.stats.dailyStats || []).reduce((acc, stat) => {
      if (new Date(stat.date) >= filterDate) {
        acc.demoClicks += stat.demoClicks || 0;
        acc.githubClicks += stat.githubClicks || 0;
        acc.views += stat.views || 0;
      }
      return acc;
    }, { demoClicks: 0, githubClicks: 0, views: 0, lastClicked: project.stats.lastClicked });
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const sA = getFilteredStats(a); const sB = getFilteredStats(b);
    return (sB.demoClicks + sB.githubClicks + sB.views) - (sA.demoClicks + sA.githubClicks + sA.views);
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
           <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4">Calcul des performances…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiActivity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Popularité & Engagement</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Stats Projets</h1>
             <p className="text-slate-500 font-medium max-w-lg">Suivez l'intérêt suscité par vos créations et analysez les clics par destination.</p>
           </div>
           
           <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              {(['all', 'month', 'week', 'day'] as const).map((range) => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-premium' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   {range === 'all' ? 'Total' : range === 'month' ? '30 J' : range === 'week' ? '7 J' : '24 H'}
                </button>
              ))}
           </div>
        </div>

        {/* Global Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Top Performance', value: sortedProjects[0]?.title || 'Aucun', icon: FiTrendingUp, color: 'primary' },
             { label: 'Réactivité Moyenne', value: 'Élevée', icon: FiZap, color: 'emerald' },
             { label: 'Projets Analysés', value: projects.length.toString(), icon: FiBarChart2, color: 'indigo' },
             { label: 'Status Hub', value: 'Synchro', icon: FiActivity, color: 'rose' },
           ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 hover:shadow-premium transition-all">
                 <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 shadow-sm`}><stat.icon /></div>
                    <FiArrowUp className={`text-${stat.color}-500 w-4 h-4 opacity-30`} />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                 <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight truncate uppercase">{stat.value}</h3>
              </motion.div>
           ))}
        </div>

        {/* Project List Redesign */}
        <div className="space-y-8">
           <AnimatePresence>
             {sortedProjects.map((project, idx) => {
                const s = getFilteredStats(project);
                const total = s.demoClicks + s.githubClicks + s.views;
                return (
                  <motion.div key={project._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 group hover:shadow-premium-lg transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors" />
                    
                    <div className="flex flex-col xl:flex-row items-center gap-10 relative">
                       {/* Project Thumb */}
                       <div className="relative w-full xl:w-48 h-32 rounded-[28px] overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm shrink-0">
                          <Image src={project.imageUrl} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">#{idx + 1} Classement</span>
                          </div>
                       </div>

                       {/* Info Hub */}
                       <div className="flex-1 space-y-6 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div>
                                <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">{project.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                   <FiClock className="text-primary-500" /> Dernier clic : {s.lastClicked ? new Date(s.lastClicked).toLocaleDateString() : '—'}
                                </p>
                             </div>
                             {idx === 0 && <span className="w-fit px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Elite Performance</span>}
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                             {[
                               { label: 'Démo Hub', value: s.demoClicks, icon: FiExternalLink, color: 'primary' },
                               { label: 'GitHub Hub', value: s.githubClicks, icon: FiGithub, color: 'indigo' },
                               { label: 'Vues Totales', value: s.views, icon: FiEye, color: 'emerald' },
                               { label: 'Total Score', value: total, icon: FiActivity, color: 'rose' },
                             ].map((chip, cIdx) => (
                                <div key={cIdx} className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 p-5 rounded-[24px] space-y-3 group/chip hover:border-primary-500/30 transition-all">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-7 h-7 rounded-lg bg-${chip.color}-500/10 flex items-center justify-center text-${chip.color}-500 transition-transform group-hover/chip:rotate-12`}><chip.icon size={14} /></div>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{chip.label}</span>
                                   </div>
                                   <p className="text-2xl font-black dark:text-white text-slate-900 tabular-nums">{chip.value}</p>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                );
             })}
           </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}
