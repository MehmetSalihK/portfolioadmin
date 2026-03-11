import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import EducationModal from '@/components/modals/EducationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiBook, FiEdit2, FiTrash2, FiExternalLink, FiEye, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EducationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [educations, setEducations] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddEducation = async (formData: any) => {
    try {
      console.log('Données envoyées à l\'API:', formData);
      console.log('isDiplomaNotObtained:', formData.isDiplomaNotObtained);
      console.log('isDiplomaPassed:', formData.isDiplomaPassed);
      console.log('isCurrentlyStudying:', formData.isCurrentlyStudying);
      
      if (selectedEducation) {
        const response = await fetch(`/api/education/${(selectedEducation as any)._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la modification de la formation');
        }

        toast.success('Formation modifiée avec succès');
      } else {
        const response = await fetch('/api/education', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout de la formation');
        }

        toast.success('Formation ajoutée avec succès');
      }
      
      fetchEducations(); // Rafraîchir la liste
      setIsModalOpen(false);
      setSelectedEducation(null);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(selectedEducation 
        ? 'Erreur lors de la modification de la formation'
        : 'Erreur lors de l\'ajout de la formation'
      );
    }
  };

  const fetchEducations = async () => {
    try {
      const response = await fetch('/api/education');  // Retiré le 's'
      if (response.ok) {
        const data = await response.json();
        console.log('Données récupérées de la DB:', data);
        data.forEach((edu: any, index: number) => {
          console.log(`Formation ${index}:`, {
            school: edu.school,
            isDiplomaNotObtained: edu.isDiplomaNotObtained,
            isDiplomaPassed: edu.isDiplomaPassed,
            isCurrentlyStudying: edu.isCurrentlyStudying
          });
        });
        setEducations(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des formations');
    }
  };

  const handleToggleVisibility = async (educationId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/education/${educationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isVisible: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update education visibility');
      }

      await fetchEducations();
      toast.success(`Formation ${!currentStatus ? 'affichée sur' : 'masquée de'} la page publique`);
    } catch (error) {
      console.error('Error updating education visibility:', error);
      toast.error('Erreur lors de la mise à jour de la visibilité');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        const educationToDelete = educations.find((edu: any) => edu._id === id);
        
        const response = await fetch(`/api/education/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        if (educationToDelete && ((educationToDelete as any).diplomaFilePath || (educationToDelete as any).diplomaFile)) {
          const filePath = (educationToDelete as any).diplomaFilePath || (educationToDelete as any).diplomaFile;
          const fileResponse = await fetch('/api/upload', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath }),
          });

          if (!fileResponse.ok) {
            console.error('Erreur lors de la suppression du fichier de diplôme');
          }
        }

        setEducations(prevEducations => prevEducations.filter((edu: any) => edu._id !== id));
        toast.success('Formation supprimée avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la suppression de la formation');
      }
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

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
              Formations
              <span className="text-zinc-700 text-lg font-medium tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {educations.length}
              </span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">
              Gérez votre parcours académique et vos certifications.
            </p>
          </div>
          
          <button
            onClick={() => {
              setSelectedEducation(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95 border border-indigo-500"
          >
            <FiPlus className="w-4 h-4" /> Ajouter une formation
          </button>
        </motion.div>

        {/* Liste des formations */}
        <div className="grid gap-6">
          {educations.map((education: any, index: number) => (
            <motion.div 
              key={education._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-background-card border border-border-subtle p-6 rounded-2xl group hover:border-border-strong transition-all duration-300 shadow-xl shadow-black/20"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <FiBook className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors duration-300">{education.school}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-zinc-400 font-bold text-xs">{education.degree}</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                        <span className="text-zinc-500 font-medium text-xs">{education.field}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center text-zinc-500 font-medium text-xs">
                      <FiCalendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                      {education.startDate && (
                        <span>
                          {new Date(education.startDate).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })}
                          {education.endDate && !education.isCurrentlyStudying && (
                            <span> - {new Date(education.endDate).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })}</span>
                          )}
                          {education.isCurrentlyStudying && <span> - En cours</span>}
                        </span>
                      )}
                    </div>
                    {education.location && (
                      <div className="flex items-center text-zinc-500 font-medium text-xs">
                         <span className="w-1 h-1 bg-zinc-700 rounded-full mr-4" />
                         {education.location}
                      </div>
                    )}
                  </div>

                  <p className="text-zinc-500 text-sm mt-5 leading-relaxed font-medium line-clamp-2 max-w-2xl">{education.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    {education.isCurrentlyStudying ? (
                      <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 animate-pulse">
                        <span className="w- relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        En cours
                      </div>
                    ) : education.isPaused ? (
                      <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        En pause
                      </div>
                    ) : education.isDiplomaPassed ? (
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          ✓ Diplôme obtenu
                        </div>
                        {(education.diplomaFilePath || education.diplomaFile || education.diplomaData) && (
                          <a 
                            href={`/api/certificate/${education._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-bold text-[10px] uppercase tracking-wider transition-colors"
                          >
                            <FiExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            {education.diplomaFileName ? education.diplomaFileName : 'Certificat'}
                          </a>
                        )}
                      </div>
                    ) : education.isDiplomaNotObtained ? (
                      <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                        ✗ Non obtenu
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleVisibility(education._id, education.isVisible)}
                    className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      education.isVisible 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500 hover:bg-zinc-500/20'
                    }`}
                    title={education.isVisible ? 'Masquer' : 'Afficher'}
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEducation(education);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEducation(education._id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all duration-300"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal d'ajout/modification de formation */}
        <EducationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEducation(null);
          }}
          onSubmit={handleAddEducation}
          education={selectedEducation || undefined}
        />
      </div>
    </AdminLayout>
  );
}