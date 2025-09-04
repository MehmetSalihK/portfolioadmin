import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiBriefcase, FiX, FiCalendar, FiMapPin, FiLink, FiEdit2, FiTrash2 } from 'react-icons/fi';
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
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    companyUrl: '',
    currentPosition: false
  });
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchExperiences();
    }
  }, [status, router]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experiences');
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des expériences');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
      try {
        const response = await fetch(`/api/experiences/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Expérience supprimée avec succès');
          fetchExperiences();
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'expérience');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExperience 
        ? `/api/experiences/${editingExperience._id}`
        : '/api/experiences';
      
      const method = editingExperience ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExperience),
      });

      if (response.ok) {
        await fetchExperiences();
        setIsAddingExperience(false);
        setEditingExperience(null);
        setNewExperience({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          companyUrl: '',
          currentPosition: false
        });
        toast.success(`Expérience ${editingExperience ? 'modifiée' : 'ajoutée'} avec succès`);
      }
    } catch (error) {
      toast.error(`Erreur lors de ${editingExperience ? 'la modification' : 'l\'ajout'} de l'expérience`);
    }
  };

  const startEditing = (experience: Experience) => {
    setEditingExperience(experience);
    setIsAddingExperience(true);
    setNewExperience({
      title: experience.title,
      company: experience.company,
      location: experience.location,
      startDate: experience.startDate.split('T')[0],
      endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
      description: experience.description,
      companyUrl: experience.companyUrl || '',
      currentPosition: !experience.endDate
    });
  };

  const closeModal = () => {
    setIsAddingExperience(false);
    setEditingExperience(null);
    setNewExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      companyUrl: '',
      currentPosition: false
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiBriefcase className="w-8 h-8" />
            Gestion des Expériences
          </h1>
          <button
            onClick={() => setIsAddingExperience(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" /> Ajouter une expérience
          </button>
        </div>

        {/* Liste des expériences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((experience) => (
            <motion.div
              key={experience._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg flex flex-col h-full shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{experience.title}</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <FiBriefcase className="w-4 h-4 mr-2" />
                    {experience.company}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    {experience.location}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    {new Date(experience.startDate).toLocaleDateString('fr-FR', {
                      month: 'short',
                      year: 'numeric'
                    })}
                    {' - '}
                    {experience.endDate 
                      ? new Date(experience.endDate).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Présent'
                    }
                  </div>
                  {experience.companyUrl && (
                    <a 
                      href={experience.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mb-2"
                    >
                      <FiLink className="w-4 h-4 mr-2" />
                      Site web
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(experience)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-500/10"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(experience._id)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                <p className="line-clamp-3">{experience.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      !experience.endDate ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {!experience.endDate ? 'Poste actuel' : 'Terminé'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal d'ajout d'expérience */}
        <AnimatePresence>
          {isAddingExperience && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl text-gray-900 dark:text-white">
                    {editingExperience ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                      <input
                        type="text"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">Entreprise</label>
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                      <input
                        type="text"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">
                        URL de l'entreprise <span className="text-gray-500 dark:text-gray-400 text-sm">(facultatif)</span>
                      </label>
                      <input
                        type="url"
                        value={newExperience.companyUrl}
                        onChange={(e) => setNewExperience({ ...newExperience, companyUrl: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                      <input
                        type="date"
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                      <input
                        type="date"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                        className={`w-full p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 transition-colors
                          ${newExperience.currentPosition 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50' 
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        disabled={newExperience.currentPosition}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={newExperience.currentPosition}
                        onChange={(e) => {
                          setNewExperience({
                            ...newExperience,
                            currentPosition: e.target.checked,
                            endDate: e.target.checked ? '' : newExperience.endDate
                          });
                        }}
                        className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                      />
                      Poste actuel
                    </label>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      {editingExperience ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
