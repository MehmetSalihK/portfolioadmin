import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiBriefcase, FiX, FiCalendar, FiMapPin, FiLink, 
  FiEdit2, FiTrash2, FiCheck, FiLoader, FiGlobe, FiNavigation
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  companyUrl?: string;
}

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', startDate: '', endDate: '',
    description: '', companyUrl: '', currentPosition: false
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchExperiences();
    }
  }, [status, router]);

  const fetchExperiences = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/experiences');
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingExperience ? `/api/experiences/${editingExperience._id}` : '/api/experiences';
      const method = editingExperience ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success(editingExperience ? 'Mise à jour réussie' : 'Expérience ajoutée');
        setIsModalOpen(false);
        setEditingExperience(null);
        resetForm();
        fetchExperiences();
      }
    } catch (error) {
      toast.error('Erreur d\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette expérience ?')) return;
    try {
      const response = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Supprimée');
        fetchExperiences();
      }
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const startEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setFormData({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate.split('T')[0],
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      description: exp.description,
      companyUrl: exp.companyUrl || '',
      currentPosition: !exp.endDate
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', company: '', location: '', startDate: '', endDate: '',
      description: '', companyUrl: '', currentPosition: false
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiBriefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Chronologie</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-4">
                Parcours
                <span className="text-sm font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full text-slate-500">
                   {experiences.length}
                </span>
             </h1>
             <p className="text-slate-500 font-medium max-w-lg">Racontez votre histoire professionnelle avec un design clair et structuré.</p>
           </div>

           <button
             onClick={() => { resetForm(); setEditingExperience(null); setIsModalOpen(true); }}
             className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 border border-primary-400 hover:bg-primary-600 transition-all flex items-center gap-2"
           >
             <FiPlus className="w-5 h-5" /> Ajouter expérience
           </button>
        </div>

        {/* Content */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reconstitution de l'historique…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
             {experiences.map((exp, idx) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 flex flex-col hover:shadow-premium-lg transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-primary-500/30 transition-all duration-500">
                        <FiBriefcase className="w-8 h-8 text-primary-500" />
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => startEdit(exp)} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary-500 hover:shadow-lg transition-all"><FiEdit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(exp._id)} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all"><FiTrash2 className="w-4 h-4"/></button>
                     </div>
                  </div>

                  <div className="space-y-4 mb-8">
                     <h3 className="text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-tight group-hover:text-primary-500 transition-colors">{exp.title}</h3>
                     <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                           <FiGlobe className="w-3.5 h-3.5" /> {exp.company}
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                           <FiCalendar className="w-3.5 h-3.5" />
                           {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} — {exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Présent'}
                        </div>
                     </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed italic line-clamp-3 mb-8">"{exp.description}"</p>

                  <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <FiNavigation className="text-primary-500" /> {exp.location}
                     </div>
                     {!exp.endDate && (
                       <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                       </span>
                     )}
                  </div>
                </motion.div>
             ))}
          </div>
        )}
      </div>

      {/* Redesigned Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsModalOpen(false)}>
             <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{editingExperience ? 'Édition' : 'Ajout'}</span>
                      <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">Expérience</h2>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Poste</label>
                         <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Lead Engineer" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Entreprise</label>
                         <input required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Microsoft" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Début</label>
                         <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm [color-scheme:dark]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fin</label>
                         <input type="date" disabled={formData.currentPosition} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm [color-scheme:dark] disabled:opacity-30 disabled:grayscale" />
                      </div>
                   </div>

                   <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/5">
                      <input type="checkbox" id="current" checked={formData.currentPosition} onChange={e => setFormData({ ...formData, currentPosition: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })} className="w-5 h-5 accent-primary-500" />
                      <label htmlFor="current" className="text-xs font-bold text-slate-400 uppercase tracking-widest">En poste actuellement</label>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                      <textarea rows={4} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none" placeholder="Décrivez vos accomplissements…" />
                   </div>

                   <div className="flex gap-4 pt-6">
                      <button type="submit" disabled={isLoading} className="flex-1 bg-primary-500 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                        {isLoading ? <FiLoader className="animate-spin" /> : <FiCheck className="w-5 h-5" />} Enregistrer
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
