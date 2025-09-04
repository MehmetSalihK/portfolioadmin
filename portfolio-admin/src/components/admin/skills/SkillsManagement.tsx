import { useState } from 'react';
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
        >
          <FiPlus className="w-5 h-5" />
          Ajouter une compétence
        </button>
      </div>

      {/* Grille des compétences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const SkillIcon = getSkillIcon(skill.name);
          return (
            <div
              key={skill._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
                  <SkillIcon className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">{skill.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {skill.isVisible ? 'Visible' : 'Masquée'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleVisibility(skill._id, skill.isVisible)}
                  className={`p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${
                    skill.isVisible 
                      ? 'text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={skill.isVisible ? "Masquer" : "Afficher"}
                >
                  {skill.isVisible ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleDelete(skill._id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  title="Supprimer"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout amélioré */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Nouvelle compétence</h2>
            <form onSubmit={handleAddSkill} className="space-y-5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Nom de la compétence
                </label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600"
                  placeholder="Ex: JavaScript, Python, React..."
                />
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={newSkill.isVisible}
                  onChange={(e) => setNewSkill({ ...newSkill, isVisible: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-gray-100 dark:bg-gray-600 rounded focus:ring-blue-500 focus:ring-2 border-gray-300 dark:border-gray-500"
                />
                <label htmlFor="isVisible" className="ml-3 text-gray-900 dark:text-white select-none">
                  Visible sur le portfolio
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}