import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import EducationModal from '@/components/modals/EducationModal';
import { FiPlus, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EducationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [educations, setEducations] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddEducation = async (formData: any) => {
    try {
      const response = await fetch('/api/education', {  // Retiré le 's'
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
      fetchEducations(); // Rafraîchir la liste
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout de la formation');
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" /> Ajouter une formation
          </button>
        </div>

        {/* Liste des formations */}
        <div className="grid gap-4">
          {educations.map((education: any) => (
            <div key={education._id} className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">{education.school}</h3>
              <p className="text-gray-300">{education.degree}</p>
            </div>
          ))}
        </div>

        {/* Modal d'ajout de formation */}
        <EducationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddEducation}
        />
      </div>
    </AdminLayout>
  );
}