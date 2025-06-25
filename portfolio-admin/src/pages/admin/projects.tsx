import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiEye, FiGithub, FiExternalLink, FiStar, FiEdit2, FiTrash2, FiLoader, FiFolder, FiUpload } from 'react-icons/fi';
import GitHubSync from '@/components/admin/github/GitHubSync';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

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
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    showOnHomepage: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');

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
      setProjects(data);
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
      showOnHomepage: project.showOnHomepage ?? true
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
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      } finally {
        setIsDeleting(null);
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
      showOnHomepage: true
    });
    setSelectedSkills([]);
    setEditingProject(null);
    setImagePreview(null);
  };

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

        {/* GitHub Synchronization */}
        <div className="mb-8">
          <GitHubSync />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative bg-gradient-to-br from-[#1E1E1E] to-[#252525] rounded-xl overflow-hidden transition-all duration-300 ${
                !project.showOnHomepage ? 'opacity-50 grayscale' : ''
              }`}
            >
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
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-[#2A2A2A]/50 text-gray-300 backdrop-blur-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

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
            </motion.div>
          ))}
        </div>

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
    </AdminLayout>
  );
}
