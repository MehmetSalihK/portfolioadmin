import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [newSkill, setNewSkill] = useState({ 
    name: '',
    isVisible: true
  });

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSkill),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');

      const addedSkill = await response.json();
      setSkills(prevSkills => [...prevSkills, addedSkill]);
      
      toast.success('Compétence ajoutée avec succès');
      setIsModalOpen(false);
      setNewSkill({ name: '', isVisible: true });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la compétence');
    }
  };

  const handleDelete = async (skillId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      try {
        const response = await fetch(`/api/skills?id=${skillId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        setSkills(prevSkills => prevSkills.filter(skill => skill._id !== skillId));
        toast.success('Compétence supprimée avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de la compétence');
      }
    }
  };

  const handleToggleVisibility = async (skillId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });

      if (!response.ok) throw new Error('Erreur lors de la modification');

      setSkills(prevSkills => 
        prevSkills.map(skill => 
          skill._id === skillId 
            ? { ...skill, isVisible: !skill.isVisible }
            : skill
        )
      );

      toast.success('Visibilité modifiée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification de la visibilité');
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec bouton */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-95 text-sm font-bold uppercase tracking-wider"
        >
          <FiPlus className="w-5 h-5" />
          Ajouter une compétence
        </button>
      </div>

      {/* Grille des compétences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const SkillIcon = getSkillIcon(skill.name);
          return (
            <div
              key={skill._id}
              className="bg-background-card border border-border-subtle rounded-xl p-6 flex items-center justify-between group hover:border-border-strong transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <SkillIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div className="text-white font-bold tracking-tight">{skill.name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${skill.isVisible ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {skill.isVisible ? 'Visible' : 'Masquée'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(skill._id, skill.isVisible)}
                  className={`p-2 rounded-lg transition-all duration-300 border ${
                    skill.isVisible 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500 hover:bg-zinc-500/20'
                  }`}
                  title={skill.isVisible ? "Masquer" : "Afficher"}
                >
                  {skill.isVisible ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(skill._id)}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 p-2 rounded-lg transition-all duration-300"
                  title="Supprimer"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout amélioré */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-background-card border border-border-strong rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-indigo-500/10"
          >
            <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Nouvelle compétence</h2>
            <form onSubmit={handleAddSkill} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Nom de la compétence
                </label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: JavaScript, Python, React..."
                />
              </div>
              <div className="flex items-center bg-white/5 p-4 rounded-xl border border-white/10 group hover:border-indigo-500/30 transition-all duration-300">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={newSkill.isVisible}
                  onChange={(e) => setNewSkill({ ...newSkill, isVisible: e.target.checked })}
                  className="w-5 h-5 text-indigo-500 bg-zinc-800 rounded-lg focus:ring-indigo-500 focus:ring-offset-0 border-white/10"
                />
                <label htmlFor="isVisible" className="ml-3 text-sm font-medium text-zinc-300 select-none group-hover:text-white transition-colors">
                  Visible sur le portfolio
                </label>
              </div>
              <div className="flex justify-end gap-4 mt-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}