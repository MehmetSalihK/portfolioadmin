import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiEye, FiGithub, FiExternalLink, FiStar, FiEdit2, FiTrash2, FiLoader, FiFolder, FiUpload, FiMove } from 'react-icons/fi';
import GitHubSync from '@/components/admin/github/GitHubSync';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    demoUrl: '',
    githubUrl: '',
    featured: false,
    showOnHomepage: true,
    category: 'web',
    tags: [] as string[],
    status: 'completed',
    difficulty: 'intermediate',
    priority: 'medium'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillName)) {
        return prev.filter(s => s !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
      featured: project.featured,
      showOnHomepage: project.showOnHomepage ?? true,
      category: project.category || 'web',
      tags: project.tags || [],
      status: project.status || 'completed',
      difficulty: project.difficulty || 'intermediate',
      priority: project.priority || 'medium'
    });
    setSelectedSkills(project.technologies);
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
      const updatedProjects = newProjects.map((project, index) => ({
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
            projectIds: updatedProjects.map(p => p._id)
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      demoUrl: '',
      githubUrl: '',
      featured: false,
      showOnHomepage: true,
      category: 'web',
      tags: [] as string[],
      status: 'completed',
      difficulty: 'intermediate',
      priority: 'medium'
    });
    setSelectedSkills([]);
    setEditingProject(null);
    setImagePreview(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingProject 
        ? `/api/projects/${editingProject._id}`
        : '/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          technologies: selectedSkills,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingProject ? 'update' : 'create'} project`);
      }

      await fetchProjects();
      setIsModalOpen(false);
      resetForm();
      toast.success(`Project ${editingProject ? 'updated' : 'created'} successfully`);
      
      // Notifier la prévisualisation du changement
      notifyChange(`project_${editingProject ? 'updated' : 'created'}_${Date.now()}`);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error(`Failed to ${editingProject ? 'update' : 'create'} project`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

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
        className={`group relative bg-gradient-to-br from-[#1E1E1E] to-[#252525] rounded-xl overflow-hidden transition-all duration-300 ${
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
            <FiMove className="w-4 h-4 text-white" />
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
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-[#2A2A2A]/50 text-gray-300 backdrop-blur-sm"
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
                  className="px-2 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300 backdrop-blur-sm border border-indigo-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Liens */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#2A2A2A]/50 hover:bg-[#333333] text-gray-300 hover:text-white transition-all duration-200 group/link"
              >
                <div className="relative">
                  <FiExternalLink className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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
                className="p-2 rounded-lg bg-[#2A2A2A]/50 hover:bg-[#333333] text-gray-300 hover:text-white transition-all duration-200 group/link"
              >
                <div className="relative">
                  <FiGithub className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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
          background: #1A1A1A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A2A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FiFolder className="w-8 h-8 text-gray-300" />
            <h1 className="text-2xl font-bold text-white">Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDragMode(!isDragMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isDragMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-[#2A2A2A] hover:bg-[#333333] text-white'
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
                  : 'bg-[#2A2A2A] hover:bg-[#333333] text-white'
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
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              <FiPlus className="text-white" /> Add Project
            </motion.button>
          </div>
        </div>

        {/* GitHub Synchronization */}
        <div className="mb-8">
          <GitHubSync />
        </div>

        {/* Filtres */}
        <div className="mb-8 bg-[#1E1E1E] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Recherche</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un projet..."
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Difficulté */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulté</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_DIFFICULTIES.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priorité</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compteur de résultats */}
          <div className="mt-4 text-sm text-gray-400">
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
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nouveaux champs de catégorisation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catégorie
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                        required
                      >
                        {PROJECT_CATEGORIES.slice(1).map(category => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Statut
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                        required
                      >
                        {PROJECT_STATUSES.slice(1).map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulté
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                        required
                      >
                        {PROJECT_DIFFICULTIES.slice(1).map(difficulty => (
                          <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priorité
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                        required
                      >
                        {PROJECT_PRIORITIES.slice(1).map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setFormData(prev => ({ ...prev, tags }));
                      }}
                      placeholder="react, typescript, nextjs"
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Entrez les tags séparés par des virgules
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Technologies
                    </label>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(groupedSkills).map(([category, skills]) => {
                        const selectedCount = skills.filter(skill => 
                          selectedSkills.includes(skill.name)
                        ).length;
                        
                        return (
                          <details key={category} className="group bg-[#1A1A1A] rounded-lg">
                            <summary className="flex items-center justify-between cursor-pointer p-3 hover:bg-[#252525] rounded-lg transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-300">{category}</span>
                                {selectedCount > 0 && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                                    {selectedCount} selected
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{skills.length} technologies</span>
                                <svg 
                                  className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </summary>
                            <div className="p-3 pt-2">
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                  <button
                                    key={skill._id}
                                    type="button"
                                    onClick={() => handleSkillToggle(skill.name)}
                                    className={`
                                      px-3 py-1.5 rounded-full text-sm font-medium 
                                      transition-all duration-200 
                                      ${selectedSkills.includes(skill.name)
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                                        : 'bg-[#252525] text-gray-300 hover:bg-[#2A2A2A] hover:scale-105'
                                      }
                                    `}
                                  >
                                    {skill.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </details>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      {selectedSkills.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">
                            {selectedSkills.length} technologie{selectedSkills.length > 1 ? 's' : ''} sélectionnée{selectedSkills.length > 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedSkills([])}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            Tout effacer
                          </button>
                        </div>
                      ) : (
                        <p className="text-red-400 text-sm">Veuillez sélectionner au moins une technologie</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image du projet
                    </label>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setUploadType('url')}
                          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            uploadType === 'url'
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]'
                          }`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadType('file')}
                          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            uploadType === 'file'
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]'
                          }`}
                        >
                          Upload
                        </button>
                      </div>

                      {uploadType === 'url' ? (
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                          required
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload"
                              disabled={isUploading}
                            />
                            <label
                              htmlFor="image-upload"
                              className={`
                                flex items-center justify-center w-full px-4 py-6 border-2 border-dashed
                                rounded-lg cursor-pointer transition-colors duration-200
                                ${isUploading
                                  ? 'border-gray-600 bg-[#1A1A1A] cursor-not-allowed'
                                  : 'border-[#2A2A2A] hover:border-[#404040] bg-[#252525]'
                                }
                              `}
                            >
                              {isUploading ? (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <FiLoader className="w-5 h-5 animate-spin" />
                                  <span>Upload en cours...</span>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <FiUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-300">
                                    Cliquez ou glissez une image ici
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF jusqu'à 5MB
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>

                          {(imagePreview || formData.imageUrl) && (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                              <Image
                                src={imagePreview || formData.imageUrl}
                                alt="Prévisualisation"
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData(prev => ({ ...prev, imageUrl: '' }));
                                }}
                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors duration-200"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Demo URL (optional)
                    </label>
                    <input
                      type="url"
                      name="demoUrl"
                      value={formData.demoUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub URL (optional)
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Featured Project
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="showOnHomepage"
                        checked={formData.showOnHomepage}
                        onChange={handleChange}
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Afficher sur la page d'accueil
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedSkills.length === 0}
                      className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Composant de prévisualisation en temps réel */}
      <LivePreview
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
        previewUrl="http://localhost:3000"
        autoRefresh={isConnected}
        refreshInterval={2000}
      />
    </AdminLayout>
  );
}
