import { useState } from 'react';

interface SkillFormProps {
  onSubmit: (data: { 
    name: string;
    level: number;
    icon: string;
    category: string;
    ordering: number;
  }) => void;
  onCancel: () => void;
}

export default function SkillForm({ onSubmit, onCancel }: SkillFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      level: 50, // valeur par défaut
      icon: 'default',
      category: 'other',
      ordering: 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
        placeholder="Nom de la compétence"
      />
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="text-gray-400">
          Annuler
        </button>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Ajouter
        </button>
      </div>
    </form>
  );
}
