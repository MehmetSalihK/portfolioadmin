import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiEye, FiGithub, FiExternalLink, FiStar, FiEdit2, FiTrash2, FiLoader, FiFolder, FiUpload, FiMove } from 'react-icons/fi';
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
  
  // États pour la prévisualisation en temps réel
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected, forceSync } = usePreviewSync({ enabled: true });

  // Utiliser directement les projets (plus de filtre)
  const filteredProjects = projects;


  /* Restored missing functions */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSkills = useCallback(async () => {
    try {
      const response = await fetch('/api/skills');
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      // Trier les projets par ordre
      const sortedProjects = data.sort((a: Project, b: Project) => (a.order || 0) - (b.order || 0));
      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchProjects();
      fetchSkills();
    }
  }, [status, router, fetchProjects, fetchSkills]);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsDeleting(projectId);
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        setProjects(prev => prev.filter(p => p._id !== projectId));
        toast.success('Project deleted successfully');
        
        // Notifier la prévisualisation du changement
        notifyChange(`project_deleted_${Date.now()}`);
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex((project) => project._id === active.id);
      const newIndex = projects.findIndex((project) => project._id === over?.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      
      // Mettre à jour l'ordre local immédiatement
      const updatedProjects = newProjects.map((project: Project, index: number) => ({
        ...project,
        order: index
      }));
      
      setProjects(updatedProjects);

      // Sauvegarder l'ordre sur le serveur
      try {
        const response = await fetch('/api/projects/reorder', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: updatedProjects.map((p: Project) => ({ id: p._id, order: p.order }))
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update project order');
        }

        toast.success('Ordre des projets mis à jour');
        
        // Notifier la prévisualisation du changement
        notifyChange(`project_reorder_${Date.now()}`);
      } catch (error) {
        console.error('Error updating project order:', error);
        toast.error('Erreur lors de la mise à jour de l\'ordre');
        // Restaurer l'ordre précédent en cas d'erreur
        fetchProjects();
      }
    }
  };

  const handleToggleHomepage = async (projectId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showOnHomepage: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      await fetchProjects();
      toast.success(`Projet ${!currentStatus ? 'affiché sur' : 'retiré de'} la page d'accueil`);
      
      // Notifier la prévisualisation du changement
      notifyChange(`project_homepage_toggle_${Date.now()}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Erreur lors de la mise à jour du projet');
    }
  };

  // Composant pour les cartes de projet triables
  const SortableProjectCard = ({ project }: { project: Project }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: project._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-background-card border border-border-subtle rounded-2xl overflow-hidden transition-all duration-500 ${
          !project.showOnHomepage ? 'opacity-50 grayscale' : ''
        } ${
          isDragging ? 'shadow-2xl shadow-indigo-500/20 scale-[1.02] border-indigo-500/50 z-50' : 'hover:border-indigo-500/30 hover:shadow-xl hover:shadow-black/40'
        }`}
      >
        {/* Drag Handle */}
        {isDragMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-4 left-4 z-30 p-2.5 rounded-xl bg-black/60 backdrop-blur-md cursor-grab active:cursor-grabbing hover:bg-indigo-600 text-white border border-white/10 transition-all duration-300 shadow-lg"
          >
            <FiMove className="w-4 h-4" />
          </div>
        )}

        {/* Image Container avec overlay */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative w-full h-full">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {/* Boutons d'action flottants */}
          {!isDragMode && (
            <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleHomepage(project._id, project.showOnHomepage);
                }}
                disabled={isDeleting === project._id}
                className={`p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 disabled:opacity-50 ${
                  project.showOnHomepage 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/40'
                    : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:bg-zinc-800'
                }`}
                title={project.showOnHomepage ? 'Retirer de la page d\'accueil' : 'Afficher sur la page d\'accueil'}
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditClick(project);
                }}
                disabled={isDeleting === project._id}
                className="p-2.5 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-white/10 text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all duration-300 disabled:opacity-50"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteClick(project._id);
                }}
                disabled={isDeleting === project._id}
                className="p-2.5 rounded-xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-400 hover:bg-rose-500/40 transition-all duration-300 disabled:opacity-50"
              >
                {isDeleting === project._id ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Featured Badge */}
          <div className="absolute bottom-4 left-4 z-20 flex gap-2">
            {project.featured && (
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <FiStar className="w-3 h-3 fill-amber-300" />
                Featured
              </div>
            )}
            {!project.showOnHomepage && (
              <div className="px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 backdrop-blur-md text-zinc-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                Masqué
              </div>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <h3 className="text-lg font-black text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-300 tracking-tight">
            {project.title}
          </h3>
          <p className="text-zinc-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/5 border border-white/10 text-zinc-400"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/5 border border-white/10 text-zinc-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>

          {/* Liens & Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-border-subtle">
            <div className="flex gap-1.5">
               {project.tags && project.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-[10px] font-bold text-indigo-500/70">
                    #{tag}
                  </span>
               ))}
            </div>
            
            <div className="flex gap-2">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  title="Voir le site"
                >
                  <FiExternalLink className="w-4 h-4" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  title="Voir le code"
                >
                  <FiGithub className="w-4 h-4" />
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
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
              <span className="w-8 h-[1px] bg-primary"></span>
              Management
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
              Projets
              <span className="text-zinc-700 text-lg font-medium tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {projects.length}
              </span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">
              Gérez vos réalisations, synchronisez avec GitHub et organisez votre portfolio.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsDragMode(!isDragMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider border ${
                isDragMode
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FiMove className="w-4 h-4" />
              {isDragMode ? 'Terminer' : 'Réorganiser'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider border ${
                showPreview
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FiEye className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Prévisualiser'}
              {isConnected && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95 border border-indigo-500"
            >
              <FiPlus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </motion.div>

        {/* GitHub Synchronization */}
        <div className="mb-8">
          <GitHubSync />
        </div>

        {/* Filters Removed */}

        {isDragMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredProjects.map(p => p._id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <SortableProjectCard key={project._id} project={project} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <SortableProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}

        {/* Modal d'ajout/modification de projet */}
        <ProjectForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
          title={editingProject ? 'Edit Project' : 'Add New Project'}
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
              const url = editingProject 
                ? `/api/projects/${editingProject._id}`
                : '/api/projects';
              
              const method = editingProject ? 'PUT' : 'POST';

              // Map 'image' back to 'imageUrl' for the API
              const apiData = {
                ...data,
                imageUrl: data.image, 
                // remove 'image' if API doesn't want it, though extra fields usually ignored
              };

              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
              });

              if (!response.ok) {
                throw new Error(`Failed to ${editingProject ? 'update' : 'create'} project`);
              }

              await fetchProjects();
              setIsModalOpen(false);
              setEditingProject(null);
              toast.success(`Project ${editingProject ? 'updated' : 'created'} successfully`);
              
              // Notifier la prévisualisation du changement
              notifyChange(`project_${editingProject ? 'updated' : 'created'}_${Date.now()}`);
            } catch (error) {
              console.error('Error submitting project:', error);
              toast.error(`Failed to ${editingProject ? 'update' : 'create'} project`);
            }
          }}
        />
      </div>
      
      {/* Composant de prévisualisation en temps réel */}
      <LivePreview
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
        previewUrl={getPreviewUrl()}
        autoRefresh={isConnected}
        refreshInterval={2000}
      />
    </AdminLayout>
  );
}
