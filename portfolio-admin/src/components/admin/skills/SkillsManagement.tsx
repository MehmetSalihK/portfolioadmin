import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCode } from 'react-icons/fi';
import { getSkillIcon } from '@/utils/skillIcons';

interface Skill {
  _id: string;
  name: string;
  isVisible: boolean;
}

export default function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (!response.ok) throw new Error('Erreur lors du chargement des compétences');
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des compétences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-white">Liste des compétences</h2>
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          <FiPlus className="w-5 h-5" />
          Ajouter une compétence
        </button>
      </div>

      <div className="bg-[#1E1E1E] rounded-xl shadow-lg overflow-hidden">
        {skills.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Aucune compétence trouvée</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {skills.map((skill) => {
              const SkillIcon = getSkillIcon(skill.name) || FiCode;
              return (
                <li 
                  key={skill._id} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <SkillIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-white font-medium">{skill.name}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      title="Modifier"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
} 