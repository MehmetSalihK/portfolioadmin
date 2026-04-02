import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import EducationModal from '@/components/modals/EducationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiBook, FiEdit2, FiTrash2, FiExternalLink, FiEye, FiCalendar, FiLoader, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EducationPage() {
  const [educations, setEducations] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<any>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchEducations();
    }
  }, [status, router]);

  const fetchEducations = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/education');
      if (response.ok) {
        const data = await response.json();
        setEducations(data);
      }
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddEducation = async (formData: any) => {
    try {
      const method = selectedEducation ? 'PUT' : 'POST';
      const url = selectedEducation ? `/api/education/${selectedEducation._id}` : '/api/education';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erreur');
      toast.success(selectedEducation ? 'Formation mise à jour' : 'Formation ajoutée');
      fetchEducations();
      setIsModalOpen(false);
      setSelectedEducation(null);
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      const response = await fetch(`/api/education/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !current }),
      });
      if (response.ok) {
        toast.success('Visibilité mise à jour');
        fetchEducations();
      }
    } catch (error) {
      toast.error('Erreur de modification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    try {
      const response = await fetch(`/api/education/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Supprimée');
        fetchEducations();
      }
    } catch (error) {
      toast.error('Erreur de suppression');
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
                   <FiBook className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Parcours Académique</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-4">
                Formations
                <span className="text-sm font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full text-slate-500">
                   {educations.length}
                </span>
             </h1>
             <p className="text-slate-500 font-medium max-w-lg">Valorisez vos diplômes et certifications avec un affichage premium structuré.</p>
           </div>

           <button
             onClick={() => { setSelectedEducation(null); setIsModalOpen(true); }}
             className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 border border-primary-400 hover:bg-primary-600 transition-all flex items-center gap-2"
           >
             <FiPlus className="w-5 h-5" /> Ajouter formation
           </button>
        </div>

        {/* Content */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calcul du cursus…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {educations.map((edu: any, idx) => (
                <motion.div
                  key={edu._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 flex flex-col hover:shadow-premium-lg transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-primary-500/30 transition-all duration-500">
                        <FiBook className="w-7 h-7 text-primary-500" />
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleToggleVisibility(edu._id, edu.isVisible)} className={`p-2.5 rounded-xl transition-all border ${edu.isVisible ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5'}`}><FiEye className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedEducation(edu); setIsModalOpen(true); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary-500 transition-all"><FiEdit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(edu._id)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-rose-500 transition-all"><FiTrash2 className="w-4 h-4" /></button>
                     </div>
                  </div>

                  <div className="space-y-1 mb-8">
                     <h3 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-tight group-hover:text-primary-500 transition-colors uppercase">{edu.school}</h3>
                     <p className="text-sm font-bold text-slate-400">{edu.degree} — {edu.field}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                     <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <FiCalendar className="w-3.5 h-3.5 text-primary-500" />
                        {new Date(edu.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} — {edu.isCurrentlyStudying ? 'En cours' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Terminé'}
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                     {edu.isDiplomaPassed && (
                       <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Diplôme obtenu</div>
                     )}
                     {edu.isCurrentlyStudying && (
                       <div className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-primary-500/20 flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary-500 rounded-full animate-pulse"></span> Apprentissage
                       </div>
                     )}
                     {(edu.diplomaFilePath || edu.diplomaFile) && (
                        <a href={`/api/certificate/${edu._id}`} target="_blank" rel="noreferrer" className="text-primary-500 hover:text-primary-600 transition-colors">
                           <FiExternalLink className="w-4 h-4" />
                        </a>
                     )}
                  </div>
                </motion.div>
             ))}
          </div>
        )}
      </div>

      <EducationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedEducation(null); }}
        onSubmit={handleAddEducation}
        education={selectedEducation || undefined}
      />
    </AdminLayout>
  );
}