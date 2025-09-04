import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import EducationModal from '@/components/modals/EducationModal';
import { FiPlus, FiBook, FiEdit2, FiTrash2, FiExternalLink, FiEye } from 'react-icons/fi';
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiBook className="w-8 h-8" />
            Gestion des Formations
          </h1>
          <button
            onClick={() => {
              setSelectedEducation(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" /> Ajouter une formation
          </button>
        </div>

        {/* Liste des formations */}
        <div className="grid gap-4">
          {educations.map((education: any) => (
            <div key={education._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{education.school}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{education.degree} - {education.field}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{education.location}</p>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {education.startDate && (
                      <span>
                        {new Date(education.startDate).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })}
                        {education.endDate && !education.isCurrentlyStudying && (
                          <span> - {new Date(education.endDate).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })}</span>
                        )}
                        {education.isCurrentlyStudying && <span> - En cours</span>}
                        {education.isPaused && <span> - En pause</span>}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{education.description}</p>
                  <div className="mb-2">
                    {education.isCurrentlyStudying ? (
                      <span className="text-blue-400 text-sm animate-pulse bg-yellow-400/20 px-2 py-1 rounded-md shadow-lg shadow-yellow-400/30">📚 En cours</span>
                    ) : education.isPaused ? (
                      <span className="text-orange-400 text-sm animate-pulse bg-orange-400/20 px-2 py-1 rounded-md shadow-lg shadow-orange-400/30">⏸️ En pause</span>
                    ) : education.isDiplomaPassed ? (
                      <>
                        <span className="text-green-400 text-sm animate-pulse bg-yellow-400/20 px-2 py-1 rounded-md shadow-lg shadow-yellow-400/30">✓ Diplôme obtenu</span>
                        {(education.diplomaFilePath || education.diplomaFile || education.diplomaData) && (
                          <a 
                            href={`/api/certificate/${education._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm underline ml-2 flex items-center gap-1"
                          >
                            <FiExternalLink size={12} />
                            {education.diplomaFileName ? `Voir ${education.diplomaFileName}` : 'Voir le certificat'}
                          </a>
                        )}
                      </>
                    ) : education.isDiplomaNotObtained ? (
                      <span className="text-red-400 text-sm animate-pulse bg-yellow-400/20 px-2 py-1 rounded-md shadow-lg shadow-yellow-400/30">✗ Diplôme non obtenu</span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Statut non défini</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleVisibility(education._id, education.isVisible)}
                    className={`p-2 rounded-lg transition-all ${
                      education.isVisible 
                        ? 'text-green-400 hover:text-green-500 hover:bg-green-500/10' 
                        : 'text-red-400 hover:text-red-500 hover:bg-red-500/10'
                    }`}
                    title={education.isVisible ? 'Masquer de la page publique' : 'Afficher sur la page publique'}
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEducation(education);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEducation(education._id)}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
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