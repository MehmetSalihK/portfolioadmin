import React, { useState } from 'react';

interface EducationFormData {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  isVisible: boolean;
  isCurrentlyStudying: boolean;
}

interface EducationFormProps {
  onSubmit: (data: EducationFormData) => void;
  initialData?: EducationFormData;
}

export default function EducationForm({ onSubmit, initialData }: EducationFormProps) {
  const [formData, setFormData] = useState<EducationFormData>({
    school: initialData?.school || '',
    degree: initialData?.degree || '',
    field: initialData?.field || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    isVisible: initialData?.isVisible ?? true,
    isCurrentlyStudying: initialData?.isCurrentlyStudying || false,
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
            École / Établissement
          </label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
            placeholder="Ex: Université Paris-Saclay"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Diplôme
          </label>
          <input
            type="text"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
            placeholder="Ex: Master"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Domaine d'études
        </label>
        <input
          type="text"
          value={formData.field}
          onChange={(e) => setFormData({ ...formData, field: e.target.value })}
          className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
          placeholder="Ex: Informatique"
          required
        />
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
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
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
            className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
            disabled={formData.isCurrentlyStudying}
          />
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.isCurrentlyStudying}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    isCurrentlyStudying: e.target.checked,
                    endDate: e.target.checked ? '' : formData.endDate
                  });
                }}
                className="form-checkbox rounded bg-[#2E2E2E] text-blue-500 border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-300">En cours</span>
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
          className="w-full bg-[#2E2E2E] text-white rounded-lg p-3 min-h-[150px]"
          placeholder="Décrivez votre formation..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Localisation
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full bg-[#2E2E2E] text-white rounded-lg p-3"
          placeholder="Ex: Paris, France"
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
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}