import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import Modal from '../Modal';

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  level: z.number().min(1).max(100),
  icon: z.string().min(1, 'Icon is required'),
  ordering: z.number().int().min(0),
});

type SkillFormData = z.infer<typeof skillSchema>;

const categoryOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Other' },
];

const iconOptions = [
  { value: 'FaReact', label: 'React' },
  { value: 'FaNodeJs', label: 'Node.js' },
  { value: 'FaPython', label: 'Python' },
  { value: 'FaJava', label: 'Java' },
  { value: 'FaDatabase', label: 'Database' },
  { value: 'FaDocker', label: 'Docker' },
  { value: 'FaAws', label: 'AWS' },
  // Add more icons as needed
];

interface SkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SkillFormData) => Promise<void>;
  initialData?: Partial<SkillFormData>;
  title: string;
}

export default function SkillForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: SkillFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: '',
      category: '',
      level: 50,
      icon: '',
      ordering: 0,
      ...initialData,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        category: '',
        level: 50,
        icon: '',
        ordering: 0,
        ...initialData,
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: SkillFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting skill:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                options={categoryOptions}
                value={categoryOptions.find((option) => option.value === value)}
                onChange={(option) => onChange(option?.value)}
                className="mt-1"
                classNamePrefix="select"
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: 'var(--primary-500)',
                    primary75: 'var(--primary-400)',
                    primary50: 'var(--primary-300)',
                    primary25: 'var(--primary-200)',
                  },
                })}
              />
            )}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Skill Level (1-100)
          </label>
          <input
            type="number"
            id="level"
            min="1"
            max="100"
            {...register('level', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
          {errors.level && (
            <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="icon"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Icon
          </label>
          <Controller
            name="icon"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                options={iconOptions}
                value={iconOptions.find((option) => option.value === value)}
                onChange={(option) => onChange(option?.value)}
                className="mt-1"
                classNamePrefix="select"
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: 'var(--primary-500)',
                    primary75: 'var(--primary-400)',
                    primary50: 'var(--primary-300)',
                    primary25: 'var(--primary-200)',
                  },
                })}
              />
            )}
          />
          {errors.icon && (
            <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="ordering"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Display Order
          </label>
          <input
            type="number"
            id="ordering"
            min="0"
            {...register('ordering', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
          {errors.ordering && (
            <p className="mt-1 text-sm text-red-600">{errors.ordering.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
