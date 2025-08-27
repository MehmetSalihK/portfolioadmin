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
          <FiLoader className="animate-spin text-4xl text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Galerie de médias
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos images, vidéos et documents
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOptimizationStatus(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiRefreshCw className="text-lg" />
              Statut
            </button>
            <button
              onClick={handleOptimizeAll}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiSettings className="text-lg" />
              Optimiser tout
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showPreview
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <FiEye className="text-lg" />
              {isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
              Prévisualisation
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="text-lg" />
              Ajouter des médias
            </button>
          </div>
        </div>

        {/* Filtres et contrôles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Recherche */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type de média */}
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {MEDIA_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Catégorie */}
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {MEDIA_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contrôles de vue */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>

          {/* Actions en lot */}
          {selectedMedia.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMedia.length} média(s) sélectionné(s)
                </span>
                <button
                  onClick={() => handleBulkAction('optimize')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  <FiSettings className="text-sm" />
                  Optimiser
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                >
                  <FiArchive className="text-sm" />
                  Archiver
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <FiTrash2 className="text-sm" />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grille/Liste des médias */}
        {media.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <FiImage className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun média trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez par uploader vos premiers médias
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <FiPlus className="text-lg" />
              Ajouter des médias
            </button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {media.map((item) => {
              const IconComponent = getMediaIcon(item.type);
              const isSelected = selectedMedia.includes(item._id);
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Vue grille
                    <div className="p-4">
                      {/* Checkbox de sélection */}
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMedia(prev => [...prev, item._id]);
                            } else {
                              setSelectedMedia(prev => prev.filter(id => id !== item._id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1">
                          <IconComponent className="text-gray-400" />
                          <span className="text-xs text-gray-500 uppercase">
                            {item.type}
                          </span>
                        </div>
                      </div>

                      {/* Aperçu */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                        {item.type === 'image' ? (
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.altText || item.title || item.originalName}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IconComponent className="text-4xl text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Informations */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.title || item.originalName}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatFileSize(item.fileSize)}</span>
                          <span>{item.stats.views} vues</span>
                        </div>
                        {item.dimensions && (
                          <div className="text-xs text-gray-400">
                            {item.dimensions.width} × {item.dimensions.height}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(item.url, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Voir"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="Éditer"
                          >
                            <FiEdit2 />
                          </button>
                          {item.type === 'image' && (
                            <button
                              onClick={() => setCroppingMedia(item)}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Recadrer"
                            >
                              <FiCrop />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Vue liste
                    <div className="p-4 flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMedia(prev => [...prev, item._id]);
                          } else {
                            setSelectedMedia(prev => prev.filter(id => id !== item._id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Miniature */}
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.type === 'image' ? (
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.altText || item.title || item.originalName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IconComponent className="text-xl text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Informations */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.title || item.originalName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <IconComponent className="text-xs" />
                            {item.type}
                          </span>
                          <span>{formatFileSize(item.fileSize)}</span>
                          {item.dimensions && (
                            <span>{item.dimensions.width} × {item.dimensions.height}</span>
                          )}
                          <span>{item.stats.views} vues</span>
                        </div>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(item.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 p-2"
                          title="Voir"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-gray-600 hover:text-gray-700 p-2"
                          title="Éditer"
                        >
                          <FiEdit2 />
                        </button>
                        {item.type === 'image' && (
                          <button
                            onClick={() => setCroppingMedia(item)}
                            className="text-green-600 hover:text-green-700 p-2"
                            title="Recadrer"
                          >
                            <FiCrop />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
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
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} sur {pagination.pages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
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

      {/* Modal d'upload/édition */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingMedia ? 'Éditer le média' : 'Ajouter des médias'}
                </h2>
                <button
                  onClick={resetModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {editingMedia ? (
                // Formulaire d'édition
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Texte alternatif
                    </label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {MEDIA_CATEGORIES.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Média public
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUploading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {isUploading ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        'Sauvegarder'
                      )}
                    </button>
                    <button
                      onClick={resetModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                // Formulaire d'upload
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sélectionner des fichiers
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.txt"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formats supportés: Images (JPG, PNG, WebP), Vidéos (MP4, WebM), Audio (MP3, WAV), Documents (PDF, TXT)
                    </p>
                  </div>

                  {selectedFiles && selectedFiles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fichiers sélectionnés ({selectedFiles.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="text-gray-400">
                              {file.type.startsWith('image/') ? <FiImage /> :
                               file.type.startsWith('video/') ? <FiVideo /> :
                               file.type.startsWith('audio/') ? <FiMusic /> : <FiFile />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <FiLoader className="animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <FiUpload />
                          Uploader
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
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
        previewUrl="http://localhost:3000"
        autoRefresh={isConnected}
        refreshInterval={2000}
      />
    </AdminLayout>
  );
}