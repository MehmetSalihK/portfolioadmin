import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../Modal';
import MediaManager from '../media/MediaManager';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().min(1, 'Image URL is required'),
  gallery: z.array(z.string()).optional(),
  demoUrl: z.string().optional(),
  githubUrl: z.string().min(1, 'GitHub URL is required'),
  technologies: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === 'string') return val.split(',').map((t) => t.trim()).filter(Boolean);
    return val;
  }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  title: string;
  initialData?: ProjectFormData;
}

export default function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div>
                <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
                </div>

                <div>
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                    </p>
                )}
                </div>

                <div>
                <label
                    htmlFor="technologies"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    Technologies (comma-separated)
                </label>
                <input
                    type="text"
                    id="technologies"
                    placeholder="React, Next.js, TextView"
                    {...register('technologies')} // Note: This expects a string in input, but Zod schema expects array. We might need transformation.
                    // Actually, let's keep it simple for now or fix the schema/usage if needed.
                    // The original code used input type="text" and register('technologies'). 
                    // This implies the original Zod schema might have been loose or there was a transformer?
                    // Original schema: technologies: z.array(z.string())
                    // React Hook form with text input returns string. This will fail validation.
                    // Let's assume the user handles comma separation manually or I should fix it here.
                    // I'll leave it as is for now to avoid breaking existing logic if there was a transformer I missed, 
                    // BUT I see the previous code just did {...register}. I will assume I need to fix it if it breaks.
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                 {errors.technologies && (
                    <p className="mt-1 text-sm text-red-600">
                    {errors.technologies.message}
                    </p>
                )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                    <label
                        htmlFor="demoUrl"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Demo URL
                    </label>
                    <input
                        type="text"
                        id="demoUrl"
                        {...register('demoUrl')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    </div>

                    <div>
                    <label
                        htmlFor="githubUrl"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        GitHub URL
                    </label>
                    <input
                        type="text"
                        id="githubUrl"
                        {...register('githubUrl')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                     {errors.githubUrl && (
                        <p className="mt-1 text-sm text-red-600">
                        {errors.githubUrl.message}
                        </p>
                    )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 {/* Main Image Manager */}
                 <div>
                    <MediaManager
                        label="Main Image (Thumbnail)"
                        initialImages={watch('image') ? [watch('image')] : []}
                        onImagesChange={(imgs) => setValue('image', imgs[0] || '')}
                        maxFiles={1}
                        allowCrop={true}
                    />
                    {errors.image && (
                        <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                    )}
                 </div>

                 {/* Gallery Manager */}
                 <div>
                     <MediaManager
                        label="Project Gallery"
                        initialImages={watch('gallery') || []}
                        onImagesChange={(imgs) => setValue('gallery', imgs)}
                        maxFiles={5}
                        allowCrop={false}
                    />
                 </div>
            </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Save Project
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
