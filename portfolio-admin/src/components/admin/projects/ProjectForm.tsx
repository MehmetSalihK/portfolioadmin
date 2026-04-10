import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../Modal';
import MediaManager from '../media/MediaManager';
import { FiSave, FiX, FiCheck, FiLayers, FiLink, FiGithub, FiInfo } from 'react-icons/fi';

const projectSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  image: z.string().min(1, 'L\'image principale est requise'),
  gallery: z.array(z.string()).optional(),
  demoUrl: z.string().optional(),
  githubUrl: z.string().min(1, 'L\'URL GitHub est requise'),
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
  isOpen, onClose, onSubmit, title, initialData,
}: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          technologies: (Array.isArray(initialData.technologies) 
            ? initialData.technologies.join(', ') : initialData.technologies) as any
        });
      } else {
        reset({ title: '', description: '', image: '', gallery: [], demoUrl: '', githubUrl: '', technologies: '' } as any);
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Text Data */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Titre du Projet</label>
              <input
                {...register('title')}
                className={`w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border ${errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-white/5'} focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold text-sm dark:text-white text-slate-900 group`}
                placeholder="Ex: Système de Design HQ"
              />
              {errors.title && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1 ml-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border ${errors.description ? 'border-rose-500' : 'border-slate-200 dark:border-white/5'} focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-sm dark:text-white text-slate-900`}
                placeholder="Décrivez les objectifs et challenges..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Technologies</label>
              <div className="relative">
                <input
                  {...register('technologies')}
                  className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold text-sm dark:text-white text-slate-900"
                  placeholder="React, Next.js, Tailwind..."
                />
                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Demo Live</label>
                <div className="relative">
                  <input {...register('demoUrl')} className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold text-sm" placeholder="https://..." />
                  <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Source GitHub</label>
                <div className="relative">
                  <input {...register('githubUrl')} className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold text-sm" placeholder="https://github.com/..." />
                  <FiGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Media Manager */}
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-inner">
               <MediaManager
                  label="Miniature Principale"
                  initialImages={watch('image') ? [watch('image')] : []}
                  onImagesChange={(imgs) => setValue('image', imgs[0] || '')}
                  maxFiles={1}
                  allowCrop={true}
              />
            </div>

            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-inner">
               <MediaManager
                  label="Galerie de Détails"
                  initialImages={watch('gallery') || []}
                  onImagesChange={(imgs) => setValue('gallery', imgs)}
                  maxFiles={5}
                  allowCrop={false}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row-reverse gap-4">
          <button
            type="submit"
            className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-3 border border-primary-400"
          >
            <FiCheck className="w-4 h-4" /> Enregistrer le projet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-10 py-4 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
             Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}
