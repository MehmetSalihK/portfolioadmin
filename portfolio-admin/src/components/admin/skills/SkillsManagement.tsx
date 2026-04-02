import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiAward, FiX, FiCheck } from 'react-icons/fi';
import { getSkillIcon } from '@/utils/skillIcons';

interface Skill {
  _id: string;
  name: string;
  isVisible: boolean;
}

interface SkillsManagementProps {
  initialSkills: Skill[];
}

export default function SkillsManagement({ initialSkills }: SkillsManagementProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', isVisible: true });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });
      if (!response.ok) throw new Error('Erreur d\'ajout');
      const addedSkill = await response.json();
      setSkills(prev => [...prev, addedSkill]);
      toast.success('Compétence ajoutée');
      setIsModalOpen(false);
      setNewSkill({ name: '', isVisible: true });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!window.confirm('Supprimer cette compétence ?')) return;
    try {
      const response = await fetch(`/api/skills?id=${skillId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur');
      setSkills(prev => prev.filter(s => s._id !== skillId));
      toast.success('Supprimée');
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const handleToggleVisibility = async (skillId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });
      if (!response.ok) throw new Error('Erreur');
      setSkills(prev => prev.map(s => s._id === skillId ? { ...s, isVisible: !s.isVisible } : s));
      toast.success('Visibilité mise à jour');
    } catch (error) {
      toast.error('Erreur de modification');
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-primary-500 text-white rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95 flex items-center gap-3 border border-primary-400"
        >
          <FiPlus className="w-5 h-5" /> Ajouter
        </button>
      </div>

      {/* Modern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skills.map((skill, idx) => {
          const SkillIcon = getSkillIcon(skill.name);
          return (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[28px] p-6 group hover:shadow-premium-lg transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-primary-500/30 transition-all duration-500">
                  <SkillIcon className="w-7 h-7 text-primary-500" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleToggleVisibility(skill._id, skill.isVisible)} className={`p-2 rounded-xl transition-all ${skill.isVisible ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-100 dark:bg-white/5'}`}>{skill.isVisible ? <FiEye /> : <FiEyeOff />}</button>
                   <button onClick={() => handleDelete(skill._id)} className="p-2 rounded-xl text-rose-500 bg-rose-500/10"><FiTrash2 /></button>
                </div>
              </div>
              
              <div>
                 <h3 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight mb-1">{skill.name}</h3>
                 <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${skill.isVisible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{skill.isVisible ? 'Affiché' : 'Masqué'}</span>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Glassmorphism Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsModalOpen(false)}>
             <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Nouveau Talent</span>
                      <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">Ajout</h2>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
                </div>

                <form onSubmit={handleAddSkill} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nom de la compétence</label>
                      <input 
                        required
                        value={newSkill.name}
                        onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 transition-all text-sm placeholder:text-slate-300" 
                        placeholder="Ex: TypeScript, Figma..."
                      />
                   </div>

                   <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary-500 py-5 rounded-[24px] text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                   >
                     {isLoading ? <FiAward className="animate-spin" /> : <FiCheck className="w-5 h-5" />} Confirmer
                   </button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}