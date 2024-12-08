import { useTranslation } from 'next-i18next';

interface ProjectFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const ProjectFilters = ({ currentFilter, onFilterChange }: ProjectFiltersProps) => {
  const { t } = useTranslation('projects');

  const filters = [
    { id: 'all', label: t('filters.all') },
    { id: 'featured', label: t('filters.featured') },
    { id: 'web', label: t('filters.web') },
    { id: 'mobile', label: t('filters.mobile') },
    { id: 'other', label: t('filters.other') },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-full transition-colors ${
            currentFilter === filter.id
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default ProjectFilters;
