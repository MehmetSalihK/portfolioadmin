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
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // États pour la prévisualisation en temps réel
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected, forceSync } = usePreviewSync({ enabled: true });
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Constantes pour les options
  const PROJECT_CATEGORIES = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'web', label: 'Application Web' },
    { value: 'mobile', label: 'Application Mobile' },
    { value: 'desktop', label: 'Application Desktop' },
    { value: 'api', label: 'API/Backend' },
    { value: 'library', label: 'Bibliothèque' },
    { value: 'tool', label: 'Outil' },
    { value: 'game', label: 'Jeu' },
    { value: 'other', label: 'Autre' },
  ];
  
  const PROJECT_STATUSES = [
    { value: 'all', label: 'Tous statuts' },
    { value: 'planning', label: 'En planification' },
    { value: 'development', label: 'En développement' },
    { value: 'completed', label: 'Terminé' },
    { value: 'maintenance', label: 'En maintenance' },
    { value: 'deprecated', label: 'Déprécié' },
  ];
  
  const PROJECT_DIFFICULTIES = [
    { value: 'all', label: 'Toutes difficultés' },
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' },
    { value: 'expert', label: 'Expert' },
  ];
  
  const PROJECT_PRIORITIES = [
    { value: 'all', label: 'Toutes priorités' },
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
    { value: 'critical', label: 'Critique' },
  ];

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

  // Fonction de filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => project.tags?.includes(tag));
    
    return matchesSearch && matchesCategory && matchesStatus && 
           matchesDifficulty && matchesPriority && matchesTags;
  });


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
        className={`group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden transition-all duration-300 ${
          !project.showOnHomepage ? 'opacity-50 grayscale' : ''
        } ${
          isDragging ? 'shadow-lg scale-105 z-50' : 'hover:shadow-lg'
        }`}
      >
        {/* Drag Handle */}
        {isDragMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-3 left-3 z-30 p-2 rounded-lg bg-white/10 backdrop-blur-md cursor-grab active:cursor-grabbing hover:bg-white/20 transition-all duration-200"
          >
            <FiMove className="w-4 h-4 text-gray-900 dark:text-white" />
          </div>
        )}

        {/* Image Container avec overlay */}
        <div className="relative aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
          <div className="relative w-full h-full">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {/* Boutons d'action flottants */}
          {!isDragMode && (
            <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleHomepage(project._id, project.showOnHomepage);
                }}
                disabled={isDeleting === project._id}
                className={`p-2.5 rounded-lg backdrop-blur-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  project.showOnHomepage 
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300'
                    : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 hover:text-gray-300'
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
                className="p-2.5 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="p-2.5 rounded-lg bg-red-500/10 backdrop-blur-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === project._id ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {project.featured && (
              <div className="px-2.5 py-1 rounded-full bg-yellow-500/20 backdrop-blur-md text-yellow-300 text-xs font-medium flex items-center gap-1">
                <FiStar className="w-3 h-3" />
                Featured
              </div>
            )}
            {project.showOnHomepage && (
              <div className="px-2.5 py-1 rounded-full bg-green-500/20 backdrop-blur-md text-green-300 text-xs font-medium flex items-center gap-1">
                <FiEye className="w-3 h-3" />
                Homepage
              </div>
            )}
            {project.category && (
              <div className="px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 text-xs font-medium">
                {project.category}
              </div>
            )}
            {project.status && (
              <div className={`px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-medium ${
                project.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                project.status === 'in-progress' ? 'bg-orange-500/20 text-orange-300' :
                project.status === 'planned' ? 'bg-purple-500/20 text-purple-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {project.status === 'completed' ? 'Terminé' :
                 project.status === 'in-progress' ? 'En cours' :
                 project.status === 'planned' ? 'Planifié' : 'Brouillon'}
              </div>
            )}
          </div>
          
          {/* Badges de droite */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            {project.difficulty && (
              <div className={`px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-medium ${
                project.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                project.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                project.difficulty === 'advanced' ? 'bg-red-500/20 text-red-300' :
                'bg-purple-500/20 text-purple-300'
              }`}>
                {project.difficulty === 'beginner' ? 'Débutant' :
                 project.difficulty === 'intermediate' ? 'Intermédiaire' :
                 project.difficulty === 'advanced' ? 'Avancé' : 'Expert'}
              </div>
            )}
            {project.priority && (
              <div className={`px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-medium ${
                project.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {project.priority === 'high' ? 'Haute' :
                 project.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </div>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 backdrop-blur-sm border border-indigo-300 dark:border-indigo-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Liens */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group/link"
              >
                <div className="relative">
                  <FiExternalLink className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Voir le projet
                  </span>
                </div>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group/link"
              >
                <div className="relative">
                  <FiGithub className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Voir le code
                  </span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1A1A1A;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2A2A2A;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #333333;
          }
        }
      `}</style>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FiFolder className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDragMode(!isDragMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isDragMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
              }`}
            >
              <FiMove className="w-4 h-4" />
              {isDragMode ? 'Terminer' : 'Réorganiser'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showPreview
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
              }`}
              title={showPreview ? 'Masquer la prévisualisation' : 'Afficher la prévisualisation'}
            >
              <FiEye className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Prévisualiser'}
              {isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              <FiPlus className="text-gray-900 dark:text-white" /> Add Project
            </motion.button>
          </div>
        </div>

        {/* GitHub Synchronization */}
        <div className="mb-8">
          <GitHubSync />
        </div>

        {/* Filtres */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un projet..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Difficulté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulté</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_DIFFICULTIES.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tag</label>
              <input
                type="text"
                placeholder="Filtrer par tag..."
                onChange={(e) => setSelectedTags(e.target.value ? e.target.value.split(',').map(t => t.trim()) : [])}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Compteur de résultats */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredProjects.length} projet(s) trouvé(s) sur {projects.length}
          </div>
        </div>

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
