import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import GitHubSync from '@/components/admin/github/GitHubSync';
import { FiGithub, FiInfo, FiSettings, FiRefreshCw, FiCheck, FiX, FiZap, FiLoader, FiGlobe, FiFilter, FiArrowUpRight, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface GitHubRepo {
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
  language: string | null;
  stars: number;
  forks: number;
  lastUpdated: string;
}

export default function GitHubSyncPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login'); }, [status, router]);

  const fetchGitHubRepos = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (data.success) setRepos(data.projects); else setError(data.message || 'Erreur API');
    } catch (e) { setError('Erreur de connexion'); } finally { setLoading(false); }
  };

  if (status === 'loading') return (<AdminLayout><div className="flex flex-col items-center justify-center min-h-[400px]"><FiLoader className="w-10 h-10 text-primary-500 animate-spin" /></div></AdminLayout>);

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white border border-white/5 shadow-premium">
                   <FiGithub className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Automated Pipeline</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">GitHub Sync</h1>
             <p className="text-slate-500 font-medium max-w-lg">Synchronisez vos dépôts distants avec votre portfolio en temps réel.</p>
           </div>
           
           <button onClick={fetchGitHubRepos} disabled={loading} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-black/20 border border-white/5 flex items-center gap-3 hover:bg-black transition-all disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" /> : <FiRefreshCw className="w-4 h-4" />} Analyser GitHub
           </button>
        </div>

        {/* Sync Core Hub */}
        <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[48px] p-2 relative overflow-hidden shadow-premium">
           <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 blur-3xl -mr-20 -mt-20 pointer-events-none" />
           <GitHubSync />
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* Config Box */}
           <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-10 group hover:shadow-premium transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform shadow-sm"><FiSettings className="w-6 h-6" /></div>
                 <div>
                    <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Configuration Hub</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">État du déploiement & Crédentials</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-[24px]">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifiant Cible</span>
                       <p className="text-sm font-black dark:text-white text-slate-900">{process.env.NEXT_PUBLIC_GITHUB_ID || 'Non défini'}</p>
                    </div>
                    <FiGithub className="text-slate-300" size={24} />
                 </div>
                 
                 <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-[24px]">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tunnel de Sécurité</span>
                       <div className="flex items-center gap-3">
                          <p className="text-sm font-black dark:text-white text-slate-900">{process.env.GITHUB_SECRET ? 'Token Détecté' : 'Non Configuré'}</p>
                          <div className={`w-2 h-2 rounded-full ${process.env.GITHUB_SECRET ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                       </div>
                    </div>
                    {process.env.GITHUB_SECRET ? <FiCheck className="text-emerald-500" size={24} /> : <FiX className="text-rose-500" size={24} />}
                 </div>
              </div>
           </div>

           {/* How it works */}
           <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-10 group hover:shadow-premium transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shadow-sm"><FiInfo className="w-6 h-6" /></div>
                 <div>
                    <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Intelligence Pipeline</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Méthodologie de synchronisation</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   { label: 'Ingestion Auto', text: 'Récupération des dépôts publics.', icon: FiGlobe },
                   { label: 'Filtrage', text: 'Analyse par mots-clés & tags.', icon: FiFilter },
                   { label: 'Mapping Tech', text: 'Détection auto du langage.', icon: FiZap },
                   { label: 'No Overwrite', text: 'Préserve vos modifications.', icon: FiCheck },
                 ].map((item, i) => (
                    <div key={i} className="space-y-2 p-5 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/[0.03]">
                       <div className="flex items-center gap-2 mb-2">
                          <item.icon className="text-indigo-500" size={14} />
                          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</h4>
                       </div>
                       <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"{item.text}"</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Repository Preview Center */}
        {repos.length > 0 && (
           <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <h3 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight">Stream de Prévisualisation <span className="text-primary-500 ml-2">({repos.length})</span></h3>
                 <div className="h-0.5 grow bg-slate-100 dark:bg-white/5" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 <AnimatePresence>
                    {repos.map((repo, idx) => (
                       <motion.div key={repo.githubUrl} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 group hover:shadow-premium-lg transition-all duration-500 overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:scale-110 transition-all shadow-sm">
                                <FiGithub size={24} />
                             </div>
                             {repo.featured && <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20 rounded-full">Spotlight</span>}
                          </div>
                          
                          <h4 className="text-lg font-black dark:text-white text-slate-900 tracking-tight group-hover:text-primary-500 transition-colors uppercase truncate mb-3">{repo.title}</h4>
                          <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mb-6 italic">"{repo.description || 'Aucune description fournie.'}"</p>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                             <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-500" /> {repo.language || 'Code'}</div>
                                <div className="flex items-center gap-1.5">⭐ {repo.stars}</div>
                             </div>
                             <div className="flex gap-2">
                                {repo.technologies.slice(0, 2).map(t => (
                                   <span key={t} className="px-2 py-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg text-[8px] font-bold text-slate-500 uppercase">{t}</span>
                                ))}
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        )}

        {/* Exception Display */}
        <AnimatePresence>
           {error && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-500/10 border border-rose-500/20 rounded-[32px] p-8 flex items-center gap-6">
                <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10"><FiX size={28} /></div>
                <div>
                   <h3 className="text-lg font-black text-rose-500 uppercase tracking-tight">Sync Exception</h3>
                   <p className="text-xs font-bold text-rose-400/70">{error}</p>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}