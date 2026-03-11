import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
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
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
              <span className="w-8 h-[1px] bg-primary"></span>
              Management
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
              Parcours
              <span className="text-zinc-700 text-lg font-medium tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {experiences.length}
              </span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">
              Gérez vos expériences professionnelles et académiques.
            </p>
          </div>
          
          <button
            onClick={() => setIsAddingExperience(true)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95 border border-indigo-500"
          >
            <FiPlus className="w-4 h-4" /> Ajouter une expérience
          </button>
        </motion.div>

        {/* Liste des expériences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <motion.div
              key={experience._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-card border border-border-subtle rounded-2xl p-6 flex flex-col h-full group hover:border-border-strong transition-all duration-300 shadow-xl shadow-black/20"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors duration-300">
                    {experience.title}
                  </h3>
                  <div className="flex items-center text-zinc-400 font-medium text-sm mb-2">
                    <FiBriefcase className="w-4 h-4 mr-2 text-indigo-500" />
                    {experience.company}
                  </div>
                  <div className="flex items-center text-zinc-500 font-medium text-xs mb-4">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    {experience.location}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                       <FiCalendar className="w-3 h-3 text-indigo-500" />
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
                  </div>

                  {experience.companyUrl && (
                    <a 
                      href={experience.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-bold text-[10px] uppercase tracking-wider transition-colors"
                    >
                      <FiLink className="w-3.5 h-3.5 mr-1.5" />
                      Site de l'entreprise
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(experience)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(experience._id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all duration-300"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-zinc-500 text-sm flex-1 leading-relaxed font-medium">
                <p className="line-clamp-4">{experience.description}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-border-subtle">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      !experience.endDate ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500/40'
                    }`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      !experience.endDate ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                      {!experience.endDate ? 'En poste' : 'Terminé'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal d'ajout d'expérience */}
        <Modal 
          isOpen={isAddingExperience} 
          onClose={closeModal} 
          title={editingExperience ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Titre du poste</label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Développeur Fullstack"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Entreprise</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Google, Vercel..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Localisation</label>
                <input
                  type="text"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Paris, Remote..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">URL de l'entreprise</label>
                <input
                  type="url"
                  value={newExperience.companyUrl}
                  onChange={(e) => setNewExperience({ ...newExperience, companyUrl: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Date de début</label>
                <input
                  type="date"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300 [color-scheme:dark]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border transition-all duration-300 [color-scheme:dark]
                    ${newExperience.currentPosition 
                      ? 'bg-zinc-900/50 text-zinc-600 border-white/5 cursor-not-allowed' 
                      : 'bg-white/5 text-white border-white/10'
                    }`}
                  disabled={newExperience.currentPosition}
                />
              </div>
            </div>

            <div className="flex items-center bg-white/5 p-4 rounded-xl border border-white/10 group hover:border-indigo-500/30 transition-all duration-300">
              <input
                type="checkbox"
                id="currentPosition"
                checked={newExperience.currentPosition}
                onChange={(e) => {
                  setNewExperience({
                    ...newExperience,
                    currentPosition: e.target.checked,
                    endDate: e.target.checked ? '' : newExperience.endDate
                  });
                }}
                className="w-5 h-5 text-indigo-500 bg-zinc-800 rounded-lg focus:ring-indigo-500 focus:ring-offset-0 border-white/10"
              />
              <label htmlFor="currentPosition" className="ml-3 text-sm font-medium text-zinc-300 select-none group-hover:text-white transition-colors">
                En poste actuellement
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Description des missions</label>
              <textarea
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                rows={5}
                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                placeholder="Détaillez vos réalisations et responsabilités..."
                required
              />
            </div>

            <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-border-subtle">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95 border border-indigo-500"
              >
                {editingExperience ? 'Mettre à jour' : 'Ajouter l\'expérience'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
