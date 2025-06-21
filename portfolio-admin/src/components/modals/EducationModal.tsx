import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiBook, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  education?: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description: string;
    location: string;
    isCurrentlyStudying?: boolean;
    isDiplomaPassed?: boolean;
    isDiplomaNotObtained?: boolean;
    diplomaFile?: string;
  };
}

export default function EducationModal({ isOpen, onClose, onSubmit, education }: EducationModalProps) {
  // Fonction pour formater une date en format YYYY-MM pour les inputs de type month
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [formData, setFormData] = useState({
    school: education?.school || '',
    degree: education?.degree || '',
    field: education?.field || '',
    startDate: formatDateForInput(education?.startDate || '') || '',
    endDate: formatDateForInput(education?.endDate || '') || '',
    description: education?.description || '',
    location: education?.location || '',
    isCurrentlyStudying: education?.isCurrentlyStudying || false,
    isDiplomaPassed: education?.isDiplomaPassed || false,
    isDiplomaNotObtained: education?.isDiplomaNotObtained || false,
    diplomaFile: education?.diplomaFile || ''
  });

  // Ajout de useEffect pour mettre à jour le formulaire quand education change
  useEffect(() => {
    if (education) {
      setFormData({
        school: education.school || '',
        degree: education.degree || '',
        field: education.field || '',
        startDate: formatDateForInput(education.startDate) || '',
        endDate: formatDateForInput(education.endDate || '') || '',
        description: education.description || '',
        location: education.location || '',
        isCurrentlyStudying: education.isCurrentlyStudying || false,
        isDiplomaPassed: education.isDiplomaPassed || false,
        isDiplomaNotObtained: education.isDiplomaNotObtained || false,
        diplomaFile: education.diplomaFile || ''
      });
    } else {
      // Réinitialiser le formulaire si pas d'éducation
      setFormData({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
        location: '',
        isCurrentlyStudying: false,
        isDiplomaPassed: false,
        isDiplomaNotObtained: false,
        diplomaFile: ''
      });
    }
  }, [education]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
  
      const data = await response.json();
      setFormData((prevState) => ({
        ...prevState,
        diplomaFile: `${data.fileId}/${data.filename}`
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1E1E1E] p-6 shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              {education ? 'Modifier la formation' : 'Nouvelle formation'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiBook className="inline-block mr-2" />
                École / Établissement
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Ex: Université Paris-Saclay"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diplôme
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Master"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domaine d'études
                </label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Informatique"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiMapPin className="inline-block mr-2" />
                Localisation
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Paris, France"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline-block mr-2" />
                  Date de début
                </label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline-block mr-2" />
                  Date de fin
                </label>
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={formData.isCurrentlyStudying}
                />
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isCurrentlyStudying}
                      disabled={formData.isDiplomaPassed || formData.isDiplomaNotObtained}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          isCurrentlyStudying: e.target.checked,
                          endDate: e.target.checked ? '' : formData.endDate,
                          isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed,
                          isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                        });
                      }}
                      className="form-checkbox rounded bg-[#2A2A2A] text-blue-500 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`ml-2 text-sm ${(formData.isDiplomaPassed || formData.isDiplomaNotObtained) ? 'text-gray-500' : 'text-gray-300'}`}>En cours</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                placeholder="Décrivez votre formation..."
                required
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDiplomaPassed}
                    disabled={formData.isCurrentlyStudying || formData.isDiplomaNotObtained}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isDiplomaPassed: e.target.checked,
                      isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                      isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                    })}
                    className="form-checkbox rounded bg-[#2A2A2A] text-blue-500 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`ml-2 text-sm ${(formData.isCurrentlyStudying || formData.isDiplomaNotObtained) ? 'text-gray-500' : 'text-gray-300'}`}>Diplôme obtenu</span>
                </label>
                
                <label className="inline-flex items-center">
                   <input
                     type="checkbox"
                     checked={formData.isDiplomaNotObtained}
                     disabled={formData.isCurrentlyStudying || formData.isDiplomaPassed}
                     onChange={(e) => setFormData({ 
                       ...formData, 
                       isDiplomaNotObtained: e.target.checked,
                       isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                       isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed
                     })}
                     className="form-checkbox rounded bg-[#2A2A2A] text-blue-500 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   />
                   <span className={`ml-2 text-sm ${(formData.isCurrentlyStudying || formData.isDiplomaPassed) ? 'text-gray-500' : 'text-gray-300'}`}>Diplôme non obtenu</span>
                 </label>
              </div>

              {formData.isDiplomaPassed && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificat de diplôme
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Ici, vous devrez implémenter la logique pour télécharger le fichier
                        handleFileUpload(file);
                      }
                    }}
                    className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {formData.diplomaFile && (
                    <div className="mt-2">
                      <a 
                        href={formData.diplomaFile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500"
                      >
                        Voir le certificat
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white bg-[#2A2A2A] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {education ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}