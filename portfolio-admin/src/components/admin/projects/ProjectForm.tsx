import { useEffect } from 'react';
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

  // Adding useEffect to reset form when initialData or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          // Ensure technologies is a string for the input if receiving an array
             // @ts-ignore - handling the union type for the form input
          technologies: Array.isArray(initialData.technologies) 
            ? initialData.technologies.join(', ') 
            : initialData.technologies
        });
      } else {
        reset({
          title: '',
          description: '',
          image: '',
          gallery: [],
          demoUrl: '',
          githubUrl: '',
          technologies: '', // Reset to empty string
        } as any);
      }
    }
  }, [isOpen, initialData, reset]);

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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                <label
                    htmlFor="title"
                    className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2"
                >
                    Titre du projet
                </label>
                <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                    placeholder="Mon super projet..."
                />
                {errors.title && (
                    <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.title.message}</p>
                )}
                </div>

                <div>
                <label
                    htmlFor="description"
                    className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                    placeholder="Décrivez votre projet en quelques lignes..."
                />
                {errors.description && (
                    <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    {errors.description.message}
                    </p>
                )}
                </div>

                <div>
                <label
                    htmlFor="technologies"
                    className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2"
                >
                    Technologies (séparées par des virgules)
                </label>
                <input
                    type="text"
                    id="technologies"
                    placeholder="React, Next.js, Tailwind..."
                    {...register('technologies')}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                />
                 {errors.technologies && (
                    <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    {errors.technologies.message}
                    </p>
                )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                    <label
                        htmlFor="demoUrl"
                        className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2"
                    >
                        URL Démo
                    </label>
                    <input
                        type="text"
                        id="demoUrl"
                        placeholder="https://..."
                        {...register('demoUrl')}
                        className="w-full bg-white/5 text-white px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                    />
                    </div>

                    <div>
                    <label
                        htmlFor="githubUrl"
                        className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2"
                    >
                        URL GitHub
                    </label>
                    <input
                        type="text"
                        id="githubUrl"
                        placeholder="https://github.com/..."
                        {...register('githubUrl')}
                        className="w-full bg-white/5 text-white px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                    />
                     {errors.githubUrl && (
                        <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        {errors.githubUrl.message}
                        </p>
                    )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 {/* Main Image Manager */}
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <MediaManager
                        label="Image Principale (Miniature)"
                        initialImages={watch('image') ? [watch('image')] : []}
                        onImagesChange={(imgs) => setValue('image', imgs[0] || '')}
                        maxFiles={1}
                        allowCrop={true}
                    />
                    {errors.image && (
                        <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.image.message}</p>
                    )}
                 </div>

                 {/* Gallery Manager */}
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                     <MediaManager
                        label="Galerie du projet"
                        initialImages={watch('gallery') || []}
                        onImagesChange={(imgs) => setValue('gallery', imgs)}
                        maxFiles={5}
                        allowCrop={false}
                    />
                 </div>
            </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border-subtle flex flex-row-reverse gap-4">
          <button
            type="submit"
            className="flex-1 md:flex-none md:min-w-[150px] bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95 border border-indigo-500 text-center"
          >
            Enregistrer le projet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 md:flex-none md:min-w-[120px] px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-300 font-bold text-xs uppercase tracking-wider text-center"
          >
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}
