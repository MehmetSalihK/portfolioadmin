import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiEdit2, FiSearch, FiSave, FiX, FiCheck, FiLoader, FiActivity, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface SEOData {
    _id?: string;
    page: string;
    title: string;
    title_en?: string;
    title_tr?: string;
    description: string;
    description_en?: string;
    description_tr?: string;
    keywords: string[];
    ogImage?: string;
    updatedAt?: string;
}

const DEFAULT_PAGES = ['home', 'projects', 'about', 'contact', 'blog'];

export default function SEOPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [seoList, setSeoList] = useState<SEOData[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeLang, setActiveLang] = useState<'fr' | 'en' | 'tr'>('fr');
    const [editingSeo, setEditingSeo] = useState<SEOData>({ page: '', title: '', title_en: '', title_tr: '', description: '', description_en: '', description_tr: '', keywords: [] });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        } else if (status === 'authenticated') {
            fetchSEOData();
        }
    }, [status, router]);

    const fetchSEOData = async () => {
        setIsFetching(true);
        try {
            const res = await fetch('/api/admin/seo');
            if (res.ok) {
                const data = await res.json();
                const mergedData = DEFAULT_PAGES.map(page => {
                    const existing = data.find((d: SEOData) => d.page === page);
                    return existing || { page, title: '', description: '', keywords: [] };
                });
                setSeoList(mergedData);
            }
        } catch (error) {
            toast.error('Erreur de chargement');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/seo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSeo)
            });
            if (res.ok) {
                toast.success('SEO mis à jour');
                setIsModalOpen(false);
                fetchSEOData();
            }
        } catch (error) {
            toast.error('Erreur de mise à jour');
        } finally {
            setIsLoading(false);
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
                           <FiSearch className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Performance Organique</span>
                     </div>
                     <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-4">
                        SEO Search
                        <span className="text-sm font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full text-slate-500">
                           {seoList.length}
                        </span>
                     </h1>
                     <p className="text-slate-500 font-medium max-w-lg">Optimisez la visibilité de vos pages pour dominer les résultats de recherche.</p>
                   </div>
                   
                   <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <FiActivity className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Score de santé : 98%</span>
                   </div>
                </div>

                {/* Content */}
                {isFetching ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                     <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analyse de l'indexation…</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                     {seoList.map((seo, idx) => (
                        <motion.div
                          key={seo.page}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group relative bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 hover:shadow-premium-lg transition-all duration-500"
                        >
                          <div className="flex justify-between items-start mb-10">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-primary-500/30 transition-all duration-500">
                                   <FiGlobe className="w-7 h-7 text-primary-500" />
                                </div>
                                <div>
                                   <h3 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight capitalize group-hover:text-primary-500 transition-colors uppercase">{seo.page}</h3>
                                   <div className="flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${seo.title ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{seo.title ? 'Indexé' : 'À configurer'}</span>
                                   </div>
                                </div>
                             </div>
                             <button onClick={() => { setEditingSeo(seo); setIsModalOpen(true); }} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-slate-400 hover:text-primary-500 transition-all shadow-sm"><FiEdit2 className="w-4 h-4"/></button>
                          </div>

                          <div className="space-y-4 mb-8">
                             <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group-hover:border-primary-500/20 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FiTag className="text-primary-500"/> Meta Title</p>
                                <p className="text-sm font-bold dark:text-slate-200 text-slate-700 truncate">{seo.title || 'Page sans titre…'}</p>
                             </div>
                             <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group-hover:border-primary-500/20 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">Description</p>
                                <p className="text-xs font-medium dark:text-slate-400 text-slate-500 italic line-clamp-2 leading-relaxed">"{seo.description || 'Aucune méta description existante.'}"</p>
                             </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                             {(seo.keywords || []).slice(0, 3).map((k, i) => (
                               <span key={i} className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[8px] font-black uppercase tracking-widest border border-primary-500/20">#{k}</span>
                             ))}
                             {seo.keywords?.length > 3 && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">+{seo.keywords.length - 3} plus</span>}
                          </div>
                        </motion.div>
                     ))}
                  </div>
                )}
            </div>

            {/* Redesigned SEO Modal */}
            <AnimatePresence>
               {isModalOpen && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsModalOpen(false)}>
                    <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-10">
                           <div>
                              <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Méta-Paramètres</span>
                              <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 capitalize">Page : {editingSeo.page}</h2>
                           </div>
                           <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit border border-slate-200 dark:border-white/10 mb-8">
                           {(['fr', 'en', 'tr'] as const).map((lang) => (
                             <button
                               key={lang}
                               type="button"
                               onClick={() => setActiveLang(lang)}
                               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                 activeLang === lang
                                   ? 'bg-white dark:bg-white/10 text-primary-500 shadow-sm'
                                   : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                               }`}
                             >
                               {lang === 'fr' ? '🇫🇷 FR' : lang === 'en' ? '🇬🇧 EN' : '🇹🇷 TR'}
                             </button>
                           ))}
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                                Méta Titre {activeLang !== 'fr' && `(${activeLang.toUpperCase()})`}
                              </label>
                              
                              {activeLang === 'fr' && (
                                <input required value={editingSeo.title} onChange={e => setEditingSeo({ ...editingSeo, title: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm placeholder:text-slate-300" placeholder="Ex: Portfolio de Jean Dupont — Développeur Web" />
                              )}
                              {activeLang === 'en' && (
                                <input value={editingSeo.title_en} onChange={e => setEditingSeo({ ...editingSeo, title_en: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm placeholder:text-slate-300" placeholder="Ex: Jean Dupont's Portfolio — Web Developer" />
                              )}
                              {activeLang === 'tr' && (
                                <input value={editingSeo.title_tr} onChange={e => setEditingSeo({ ...editingSeo, title_tr: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm placeholder:text-slate-300" placeholder="Ex: Jean Dupont'un Portfolyosu — Web Geliştirici" />
                              )}
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                                Méta Description {activeLang !== 'fr' && `(${activeLang.toUpperCase()})`}
                              </label>
                              
                              {activeLang === 'fr' && (
                                <textarea rows={4} required value={editingSeo.description} onChange={e => setEditingSeo({ ...editingSeo, description: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none placeholder:text-slate-300" placeholder="Une brève description pour les moteurs de recherche…" />
                              )}
                              {activeLang === 'en' && (
                                <textarea rows={4} value={editingSeo.description_en} onChange={e => setEditingSeo({ ...editingSeo, description_en: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none placeholder:text-slate-300" placeholder="A brief description for search engines…" />
                              )}
                              {activeLang === 'tr' && (
                                <textarea rows={4} value={editingSeo.description_tr} onChange={e => setEditingSeo({ ...editingSeo, description_tr: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none placeholder:text-slate-300" placeholder="Arama motorları için kısa bir açıklama…" />
                              )}
                           </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Mots-Clés (Séparés par virgules)</label>
                             <input value={editingSeo.keywords.join(', ')} onChange={e => setEditingSeo({ ...editingSeo, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm placeholder:text-slate-300" placeholder="Ex: react, development, portfolio" />
                          </div>

                          <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                             <button type="submit" disabled={isLoading} className="flex-1 bg-primary-500 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                               {isLoading ? <FiLoader className="animate-spin" /> : <FiSave className="w-5 h-5" />} Actualiser les Métas
                             </button>
                             <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-[24px] font-black uppercase text-sm transition-all tracking-widest">Annuler</button>
                          </div>
                       </form>
                    </motion.div>
                 </motion.div>
               )}
            </AnimatePresence>
        </AdminLayout>
    );
}
