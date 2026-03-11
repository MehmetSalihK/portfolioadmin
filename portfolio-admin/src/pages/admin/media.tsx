import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiX, FiEye, FiEdit2, FiTrash2, FiLoader, FiUpload, 
  FiImage, FiVideo, FiMusic, FiFile, FiDownload, FiCrop,
  FiFilter, FiSearch, FiGrid, FiList, FiArchive, FiRefreshCw, FiSettings,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageCropper from '@/components/ImageCropper';
import OptimizationStatus from '@/components/OptimizationStatus';
import LivePreview from '@/components/LivePreview';
import { usePreviewSync } from '@/hooks/usePreviewSync';
import { getPreviewUrl } from '@/utils/getBaseUrl';

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  title?: string;
  description?: string;
  altText?: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  fileSize: number;
  dimensions?: {
    width?: number;
    height?: number;
  };
  url: string;
  thumbnailUrl?: string;
  variants: Array<{
    size: string;
    width: number;
    height: number;
    url: string;
    fileSize: number;
    format: string;
  }>;
  tags: string[];
  category: string;
  isPublic: boolean;
  isOptimized: boolean;
  optimizedAt?: string;
  stats: {
    views: number;
    downloads: number;
    lastAccessed?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const MEDIA_CATEGORIES = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'blog', label: 'Blog' },
  { value: 'profile', label: 'Profil' },
  { value: 'gallery', label: 'Galerie' },
  { value: 'other', label: 'Autre' },
];

const MEDIA_TYPES = [
  { value: 'all', label: 'Tous les types', icon: FiFile },
  { value: 'image', label: 'Images', icon: FiImage },
  { value: 'video', label: 'Vidéos', icon: FiVideo },
  { value: 'audio', label: 'Audio', icon: FiMusic },
  { value: 'document', label: 'Documents', icon: FiFile },
];

export default function MediaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [croppingMedia, setCroppingMedia] = useState<MediaItem | null>(null);
  const [showOptimizationStatus, setShowOptimizationStatus] = useState(false);
  
  // États pour la prévisualisation en temps réel
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected } = usePreviewSync({ enabled: true });
  
  // Filtres
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: '',
  });
  
  // Formulaire d'édition
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    altText: '',
    tags: '',
    category: 'other',
    isPublic: true,
  });

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/media?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      setMedia(data.media);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchMedia();
    }
  }, [status, router, fetchMedia]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    setIsUploading(true);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'gallery');
        formData.append('title', file.name);

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      toast.success(`${selectedFiles.length} fichier(s) uploadé(s) avec succès`);
      setSelectedFiles(null);
      setIsModalOpen(false);
      fetchMedia();
      notifyChange('media-upload');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (mediaItem: MediaItem) => {
    setEditingMedia(mediaItem);
    setFormData({
      title: mediaItem.title || '',
      description: mediaItem.description || '',
      altText: mediaItem.altText || '',
      tags: mediaItem.tags.join(', '),
      category: mediaItem.category,
      isPublic: mediaItem.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    setIsUploading(true);
    try {
      const response = await fetch(`/api/media/${editingMedia._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update media');
      }

      toast.success('Média mis à jour avec succès');
      setIsModalOpen(false);
      setEditingMedia(null);
      fetchMedia();
      notifyChange('media-update');
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      toast.success('Média supprimé avec succès');
      fetchMedia();
      notifyChange('media-delete');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'optimize') => {
    if (selectedMedia.length === 0) {
      toast.error('Aucun média sélectionné');
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Supprimer ${selectedMedia.length} média(s) ?`
      : action === 'archive'
      ? `Archiver ${selectedMedia.length} média(s) ?`
      : `Optimiser ${selectedMedia.length} média(s) ? Cette opération peut prendre du temps.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (action === 'optimize') {
        // Optimisation en lot
        const response = await fetch('/api/media/optimize/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaIds: selectedMedia,
            quality: 85,
            formats: ['webp', 'avif'],
            batchSize: 5,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du lancement de l\'optimisation');
        }
        
        toast.success(`Optimisation de ${selectedMedia.length} média(s) lancée en arrière-plan`);
      } else {
        for (const mediaId of selectedMedia) {
          if (action === 'delete') {
            await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
          } else {
            await fetch(`/api/media/${mediaId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'archive' }),
            });
          }
        }
        
        toast.success(`${selectedMedia.length} média(s) ${action === 'delete' ? 'supprimé(s)' : 'archivé(s)'} avec succès`);
      }
      
      setSelectedMedia([]);
      fetchMedia();
    } catch (error) {
      console.error(`Error ${action}ing media:`, error);
      toast.error(`Erreur lors de l'${action === 'delete' ? 'suppression' : action === 'archive' ? 'archivage' : 'optimisation'}`);
    }
  };

  const handleOptimizeAll = async () => {
    const unoptimizedMedia = media.filter(m => m.type === 'image' && !m.isOptimized);
    
    if (unoptimizedMedia.length === 0) {
      toast.success('Toutes les images sont déjà optimisées');
      return;
    }
    
    if (!window.confirm(`Optimiser ${unoptimizedMedia.length} image(s) non optimisée(s) ? Cette opération peut prendre du temps.`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/media/optimize/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds: unoptimizedMedia.map(m => m._id),
          quality: 85,
          formats: ['webp', 'avif'],
          batchSize: 5,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du lancement de l\'optimisation');
      }
      
      toast.success(`Optimisation de ${unoptimizedMedia.length} image(s) lancée en arrière-plan`);
      setShowOptimizationStatus(true);
      fetchMedia();
    } catch (error) {
      console.error('Error optimizing all media:', error);
      toast.error('Erreur lors de l\'optimisation');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return FiImage;
      case 'video': return FiVideo;
      case 'audio': return FiMusic;
      default: return FiFile;
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingMedia(null);
    setSelectedFiles(null);
    setFormData({
      title: '',
      description: '',
      altText: '',
      tags: '',
      category: 'other',
      isPublic: true,
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Chargement des médias…</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
              <span className="w-8 h-[1px] bg-indigo-500"></span>
              Assets
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
              Médiathèque
              <span className="text-zinc-700 text-lg font-medium tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {pagination.total}
              </span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">
              Gérez et optimisez vos images, vidéos et documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowOptimizationStatus(true)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
              title="Statut de l'optimisation"
            >
              <FiRefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              onClick={handleOptimizeAll}
              className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <FiSettings className="w-4 h-4" />
              Optimiser Tout
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border ${
                showPreview
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <FiEye className="w-4 h-4" />
              Preview {isConnected && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 border border-indigo-500"
            >
              <FiPlus className="w-4 h-4" />
              Uploader
            </button>
          </div>
        </motion.div>

        {/* Filters & Batch Actions */}
        <div className="relative">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              {/* Search */}
              <div className="relative group w-full sm:w-64">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un fichier..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-black/40 text-white pl-11 pr-4 py-2.5 rounded-xl border border-white/5 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-medium text-sm"
                />
              </div>

              {/* Type Select */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                {MEDIA_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                      filters.type === type.value
                        ? 'bg-white/10 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <type.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Category Select */}
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-black/40 text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2.5 rounded-xl border border-white/5 focus:border-indigo-500/50 transition-all outline-none"
              >
                {MEDIA_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-t-0 border-white/5 pt-4 xl:pt-0">
              {selectedMedia.length > 0 && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mr-2">
                    {selectedMedia.length} Sélectionnés
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('optimize')}
                      className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                      title="Optimiser la sélection"
                    >
                      <FiSettings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                      title="Archiver la sélection"
                    >
                      <FiArchive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                      title="Supprimer la sélection"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 ml-auto xl:ml-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {media.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
              <FiImage className="w-10 h-10 text-indigo-500/50" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-2">Aucun média trouvé</h3>
            <p className="text-zinc-500 font-medium mb-8 text-center max-w-sm">
              Votre bibliothèque est vide. Commencez par uploader vos premiers assets pour les utiliser dans votre portfolio.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <FiPlus className="w-4 h-4" />
              Ajouter des fichiers
            </button>
          </motion.div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
              : 'space-y-3'
          }`}>
            {media.map((item, index) => {
              const IconComponent = getMediaIcon(item.type);
              const isSelected = selectedMedia.includes(item._id);
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`group relative bg-zinc-900/50 backdrop-blur-sm rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 ring-4 ring-indigo-500/10'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <div className="flex flex-col h-full">
                      {/* Media Preview Container */}
                      <div className="relative aspect-square overflow-hidden bg-black/40">
                        {item.type === 'image' ? (
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.altText || item.title || item.originalName}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <IconComponent className="w-12 h-12 text-zinc-700 group-hover:text-indigo-500/50 transition-colors duration-500" />
                          </div>
                        )}
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                          <div className="flex justify-between items-start">
                             <div 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (isSelected) {
                                   setSelectedMedia(prev => prev.filter(id => id !== item._id));
                                 } else {
                                   setSelectedMedia(prev => [...prev, item._id]);
                                 }
                               }}
                               className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                                 isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/40 hover:border-white'
                               }`}
                             >
                               {isSelected && <FiCheck className="w-4 h-4 text-white" />}
                             </div>
                             <div className="flex gap-2">
                               <button
                                 onClick={() => window.open(item.url, '_blank')}
                                 className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-md transition-all"
                                 title="Voir grand"
                               >
                                 <FiEye className="w-4 h-4" />
                               </button>
                               <button
                                 onClick={() => handleEdit(item)}
                                 className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-md transition-all"
                                 title="Editer"
                               >
                                 <FiEdit2 className="w-4 h-4" />
                               </button>
                             </div>
                          </div>
                          
                          <div className="flex justify-center">
                            {item.type === 'image' && (
                              <button
                                onClick={() => setCroppingMedia(item)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                              >
                                <FiCrop className="w-3 h-3 inline mr-2" />
                                Recadrer
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          {item.isOptimized && (
                             <div className="px-2 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                               Optimisé
                             </div>
                          )}
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-black text-white truncate tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">
                            {item.title || item.originalName}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-zinc-600 tabular-nums">
                              {formatFileSize(item.fileSize)}
                            </span>
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">
                              {item.mimeType.split('/')[1]}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex -space-x-1">
                              {item.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[8px] font-bold text-zinc-500 lowercase">
                                  #{tag}
                                </span>
                              ))}
                           </div>
                           <button
                             onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                             className="text-zinc-600 hover:text-rose-500 transition-colors p-1"
                           >
                             <FiTrash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div className="p-3 flex items-center gap-4">
                      <div 
                         onClick={() => {
                           if (isSelected) {
                             setSelectedMedia(prev => prev.filter(id => id !== item._id));
                           } else {
                             setSelectedMedia(prev => [...prev, item._id]);
                           }
                         }}
                         className={`w-5 h-5 rounded-lg border-2 flex flex-shrink-0 items-center justify-center cursor-pointer transition-all ${
                           isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 hover:border-white/20'
                         }`}
                       >
                         {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                       </div>

                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 relative border border-white/5">
                        {item.type === 'image' ? (
                          <Image src={item.thumbnailUrl || item.url} alt="" fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                        <div className="col-span-1 md:col-span-2">
                           <h3 className="text-sm font-black text-white truncate tracking-tight">{item.title || item.originalName}</h3>
                           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{item.mimeType}</p>
                        </div>
                        <div className="hidden md:block">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dimensions</p>
                           <p className="text-xs font-bold text-white tabular-nums">{item.dimensions ? `${item.dimensions.width}×${item.dimensions.height}` : '--'}</p>
                        </div>
                        <div className="hidden md:block">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Taille</p>
                           <p className="text-xs font-bold text-white tabular-nums">{formatFileSize(item.fileSize)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => window.open(item.url, '_blank')} className="p-2 text-zinc-500 hover:text-white transition-colors"><FiEye className="w-4 h-4"/></button>
                        <button onClick={() => handleEdit(item)} className="p-2 text-zinc-500 hover:text-white transition-colors"><FiEdit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"><FiTrash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-5 py-2 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all"
            >
              ← Précédent
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4));
                if (pageNum > pagination.pages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                      pageNum === pagination.page
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-5 py-2 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* Modal de recadrage */}
      <AnimatePresence>
        {croppingMedia && (
          <ImageCropper
            imageUrl={croppingMedia.url}
            imageId={croppingMedia._id}
            onClose={() => setCroppingMedia(null)}
            onSave={(croppedImageUrl) => {
              toast.success('Image recadrée avec succès');
              setCroppingMedia(null);
              fetchMedia();
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-[#0d0d12] border border-white/10 rounded-3xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                    {editingMedia ? 'Modifier' : 'Importer'}
                  </p>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {editingMedia ? 'Éditer le fichier' : 'Ajouter des médias'}
                  </h2>
                </div>
                <button
                  onClick={resetModal}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {editingMedia ? (
                <div className="space-y-5">
                  {[{ label: 'Titre', key: 'title', type: 'text', placeholder: 'Nom du fichier…' },
                    { label: 'Texte alternatif (SEO)', key: 'altText', type: 'text', placeholder: 'Description de l\'image pour les moteurs de recherche…' }].map(field => (
                    <div key={field.key}>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        value={formData[field.key as keyof typeof formData] as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-medium"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Description optionnelle…"
                      className="w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tags <span className="text-zinc-700 normal-case font-medium">(séparés par des virgules)</span></label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="portfolio, hero, profil…"
                      className="w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white/5 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 transition-all outline-none font-medium"
                    >
                      {MEDIA_CATEGORIES.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                      className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${formData.isPublic ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPublic ? 'translate-x-5' : ''}`} />
                    </div>
                    <label className="text-sm font-bold text-zinc-400 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}>
                      Rendre ce fichier public
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUploading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                      {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sauvegarder'}
                    </button>
                    <button onClick={resetModal} className="px-6 py-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Drop Zone */}
                  <label className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <FiUpload className="w-7 h-7 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black tracking-tight">Glissez vos fichiers ou cliquez</p>
                      <p className="text-zinc-600 text-sm font-medium mt-1">Images, Vidéos, Audio, Documents</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{selectedFiles.length} fichier(s) sélectionné(s)</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="text-zinc-500">
                              {file.type.startsWith('image/') ? <FiImage className="w-4 h-4" /> :
                               file.type.startsWith('video/') ? <FiVideo className="w-4 h-4" /> :
                               file.type.startsWith('audio/') ? <FiMusic className="w-4 h-4" /> : <FiFile className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-white truncate">{file.name}</p>
                              <p className="text-[10px] font-bold text-zinc-600">{formatFileSize(file.size)}</p>
                            </div>
                            <FiCheck className="w-4 h-4 text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                      {isUploading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Upload…</>
                      ) : (
                        <><FiUpload className="w-4 h-4" /> Uploader</>  
                      )}
                    </button>
                    <button onClick={resetModal} className="px-6 py-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Composant de statut d'optimisation */}
      <OptimizationStatus
        isVisible={showOptimizationStatus}
        onClose={() => setShowOptimizationStatus(false)}
      />

      {/* Prévisualisation en temps réel */}
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