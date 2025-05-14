import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import EducationModal from '@/components/modals/EducationModal';
import { FiPlus, FiBook, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EducationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [educations, setEducations] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddEducation = async (formData: any) => {
    try {
      // Si nous avons un selectedEducation, c'est une modification
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
        // C'est un nouvel ajout
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
        setEducations(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des formations');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        const response = await fetch(`/api/education/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        // Mettre à jour l'état local immédiatement après une suppression réussie
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
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
            <div key={education._id} className="bg-[#1E1E1E] p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{education.school}</h3>
                  <p className="text-gray-300">{education.degree} - {education.field}</p>
                  <p className="text-gray-400 text-sm">{education.location}</p>
                  <p className="text-gray-400 text-sm mt-2">{education.description}</p>
                </div>
                <div className="flex gap-2">
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