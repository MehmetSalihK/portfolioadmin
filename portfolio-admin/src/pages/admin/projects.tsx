import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiEye, FiGithub, FiExternalLink, FiStar, FiEdit2, FiTrash2, FiLoader, FiFolder, FiUpload, FiMove, FiCheck, FiMoreVertical } from 'react-icons/fi';
import GitHubSync from '@/components/admin/github/GitHubSync';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ProjectForm from '@/components/admin/projects/ProjectForm';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { useTheme } from '@/contexts/ThemeContext';
import LivePreview from '@/components/LivePreview';
import { usePreviewSync } from '@/hooks/usePreviewSync';
import { getPreviewUrl } from '@/utils/getBaseUrl';

interface Skill {
  _id: string;
  name: string;
  category: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  gallery?: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  showOnHomepage: boolean;
  order: number;
  category: string;
  tags: string[];
  status: string;
  difficulty: string;
  priority: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected, forceSync } = usePreviewSync({ enabled: true });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSkills = useCallback(async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        const sortedProjects = data.sort((a: Project, b: Project) => (a.order || 0) - (b.order || 0));
        setProjects(sortedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchProjects();
      fetchSkills();
    }
  }, [status, router, fetchProjects, fetchSkills]);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      setIsDeleting(projectId);
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setProjects(prev => prev.filter(p => p._id !== projectId));
          toast.success('Projet supprimé');
          notifyChange(`project_deleted_${Date.now()}`);
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex((p) => p._id === active.id);
      const newIndex = projects.findIndex((p) => p._id === over?.id);
      const newProjects = arrayMove(projects, oldIndex, newIndex);
      const updatedProjects = newProjects.map((p, index) => ({ ...p, order: index }));
      setProjects(updatedProjects);
      try {
        const response = await fetch('/api/projects/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updatedProjects.map(p => ({ id: p._id, order: p.order })) }),
        });
        if (response.ok) {
          toast.success('Ordre mis à jour');
          notifyChange(`project_reorder_${Date.now()}`);
        }
      } catch (error) {
        toast.error('Erreur de sauvegarde de l\'ordre');
        fetchProjects();
      }
    }
  };

  const handleToggleHomepage = async (projectId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHomepage: !currentStatus }),
      });
      if (response.ok) {
        await fetchProjects();
        toast.success(`Visibilité mise à jour`);
        notifyChange(`project_homepage_toggle_${Date.now()}`);
      }
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  const SortableProjectCard = ({ project }: { project: Project }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project._id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, zIndex: isDragging ? 50 : 'auto' };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative dark:bg-background-card/40 bg-white border border-slate-200 dark:border-white/5 rounded-[24px] overflow-hidden transition-all duration-500 shadow-sm hover:shadow-premium-lg ${!project.showOnHomepage ? 'opacity-70 grayscale-[0.5]' : ''}`}
      >
        {isDragMode && (
          <div {...attributes} {...listeners} className="absolute top-4 left-4 z-40 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 cursor-grab active:cursor-grabbing text-white shadow-xl">
            <FiMove className="w-4 h-4" />
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative aspect-[16/11] overflow-hidden">
          <Image src={project.imageUrl} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
          
          <div className="absolute top-4 right-4 flex gap-2 z-30 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button onClick={() => handleEditClick(project)} className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl dark:text-white text-slate-900 border dark:border-white/5 border-slate-200 hover:bg-primary-500 hover:text-white transition-all shadow-lg">
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleDeleteClick(project._id)} className="p-2.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 backdrop-blur-xl text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg">
              {isDeleting === project._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {project.featured && (
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <FiStar className="w-3 h-3 fill-slate-900" /> Vedette
              </span>
            )}
            {!project.showOnHomepage && (
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-lg">
                Masqué
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-7 space-y-5">
          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold tracking-tight dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors truncate">
              {project.title}
            </h3>
            <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>

          <div className="pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
             <div className="flex -space-x-1">
                {project.tags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold text-primary-500 bg-primary-500/5 px-2 py-0.5 rounded-full border border-primary-500/10">#{tag}</span>
                ))}
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleToggleHomepage(project._id, project.showOnHomepage)}
                  className={`text-slate-400 hover:text-primary-500 transition-colors transition-all ${project.showOnHomepage ? 'text-primary-500' : ''}`}
                >
                  <FiEye className="w-4 h-4" />
                </button>
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-500 transition-all">
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                  <FiFolder className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Réalisations</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-4">
               Projets
               <span className="text-sm font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full text-slate-500">
                  {projects.length}
               </span>
            </h1>
            <p className="text-slate-500 font-medium max-w-lg">Gérez vos réalisations, synchronisez avec GitHub et organisez la présentation de votre portfolio.</p>
          </div>

          <div className="flex flex-wrap gap-3">
             <button
                onClick={() => setIsDragMode(!isDragMode)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all ${isDragMode ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-primary-500/30 hover:text-primary-500 shadow-sm'}`}
             >
                <FiMove className="w-4 h-4" /> {isDragMode ? 'Enregistrer' : 'Réordonner'}
             </button>
             <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all ${showPreview ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-primary-500/30 hover:text-primary-500 shadow-sm'}`}
             >
                <FiEye className="w-4 h-4" /> {showPreview ? 'Masquer Aperçu' : 'Aperçu Direct'}
             </button>
             <button
                onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/25 border border-primary-400 hover:bg-primary-600 transition-all active:scale-95"
             >
                <FiPlus className="w-5 h-5" /> Ajouter un projet
             </button>
          </div>
        </div>

        {/* GitHub Integration Area */}
        <div className="p-1.5 rounded-[32px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
           <GitHubSync />
        </div>

        {/* Projects Grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map(p => p._id)} strategy={verticalListSortingStrategy}>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                   <SortableProjectCard key={project._id} project={project} />
                ))}
             </div>
          </SortableContext>
        </DndContext>

        {/* Form Modal */}
        <ProjectForm
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
          title={editingProject ? 'Modifier le projet' : 'Nouveau Projet'}
          initialData={editingProject ? {
            title: editingProject.title,
            description: editingProject.description,
            image: editingProject.imageUrl,
            gallery: editingProject.gallery || [],
            demoUrl: editingProject.demoUrl,
            githubUrl: editingProject.githubUrl || '',
            technologies: editingProject.technologies,
          } : undefined}
          onSubmit={async (data) => {
            try {
              const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
              const method = editingProject ? 'PUT' : 'POST';
              const apiData = { ...data, imageUrl: data.image };
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData),
              });
              if (response.ok) {
                await fetchProjects();
                setIsModalOpen(false);
                setEditingProject(null);
                toast.success(`Projet ${editingProject ? 'mis à jour' : 'créé'}`);
                notifyChange(`project_${editingProject ? 'updated' : 'created'}_${Date.now()}`);
              }
            } catch (error) {
              toast.error('Erreur lors de la sauvegarde');
            }
          }}
        />

        <LivePreview isVisible={showPreview} onToggle={() => setShowPreview(!showPreview)} previewUrl={getPreviewUrl()} autoRefresh={isConnected} refreshInterval={2000} />
      </div>
    </AdminLayout>
  );
}
