import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ExperienceModal({ isOpen, onClose, onSubmit }: ExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    companyUrl: '',
    isCurrentPosition: false,
    isVisible: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Préparer les dates en ajoutant le premier jour du mois
      const startDateWithDay = formData.startDate ? `${formData.startDate}-01` : null;
      const endDateWithDay = formData.endDate ? `${formData.endDate}-01` : null;

      // Préparer les données
      const dataToSubmit = {
        ...formData,
        startDate: startDateWithDay ? new Date(startDateWithDay).toISOString() : null,
        endDate: formData.isCurrentPosition ? null : 
                endDateWithDay ? new Date(endDateWithDay).toISOString() : null,
      };

      onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Ajouter une expérience</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
                placeholder="Ex: Développeur Full Stack"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Entreprise</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
                placeholder="Ex: Google"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Localisation</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
                placeholder="Ex: Paris, France"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">
                URL de l'entreprise <span className="text-gray-500">(facultatif)</span>
              </label>
              <input
                type="url"
                value={formData.companyUrl}
                onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
                className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Date de début</label>
              <input
                type="month"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Date de fin</label>
              <input
                type="month"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
                disabled={formData.isCurrentPosition}
              />
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isCurrentPosition}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        isCurrentPosition: e.target.checked,
                        endDate: e.target.checked ? '' : formData.endDate
                      });
                    }}
                    className="form-checkbox rounded bg-[#2E2E2E] text-blue-500 border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-300">Poste actuel</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 min-h-[150px]"
              placeholder="Décrivez vos responsabilités et réalisations..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="form-checkbox rounded bg-[#2E2E2E] text-blue-500 border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-300">Visible sur le portfolio</span>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 