import React, { useState } from 'react';

interface ExperienceFormProps {
  onSubmit: (data: ExperienceFormData) => void;
  initialData?: ExperienceFormData;
}

interface ExperienceFormData {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  isVisible: boolean;
  companyUrl?: string;
  isCurrentPosition?: boolean;
}

export default function ExperienceForm({ onSubmit, initialData }: ExperienceFormProps) {
  const [formData, setFormData] = useState<ExperienceFormData>({
    title: initialData?.title || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    description: initialData?.description || '',
    isVisible: initialData?.isVisible ?? true,
    companyUrl: initialData?.companyUrl || '',
    isCurrentPosition: initialData?.isCurrentPosition || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Développeur Full Stack"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Entreprise
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Google"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Localisation
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Paris, France"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL de l'entreprise <span className="text-gray-500">(facultatif)</span>
          </label>
          <input
            type="url"
            value={formData.companyUrl}
            onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date de début
          </label>
          <input
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date de fin
          </label>
          <input
            type="month"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500"
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

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => onSubmit(formData)}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
} 