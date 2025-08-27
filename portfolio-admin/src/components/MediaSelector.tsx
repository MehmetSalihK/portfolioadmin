import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiSearch, FiGrid, FiList, FiImage, FiVideo, FiMusic, FiFile,
  FiCheck, FiLoader, FiFilter, FiUpload, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

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
  createdAt: string;
}

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  maxSelection?: number;
  selectedMedia?: MediaItem[];
  title?: string;
  description?: string;
}

const MEDIA_TYPES = [
  { value: 'all', label: 'Tous les types', icon: FiFile },
  { value: 'image', label: 'Images', icon: FiImage },
  { value: 'video', label: 'Vidéos', icon: FiVideo },
  { value: 'audio', label: 'Audio', icon: FiMusic },
  { value: 'document', label: 'Documents', icon: FiFile },
];

const MEDIA_CATEGORIES = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'blog', label: 'Blog' },
  { value: 'profile', label: 'Profil' },
  { value: 'gallery', label: 'Galerie' },
  { value: 'other', label: 'Autre' },
];

export default function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  maxSelection = 10,
  selectedMedia = [],
  title = 'Sélectionner des médias',
  description = 'Choisissez les médias que vous souhaitez utiliser'
}: MediaSelectorProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>(selectedMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: '',
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
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
        isPublic: 'true', // Seulement les médias publics
      });

      const response = await fetch(`/api/media?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      
      // Filtrer par types autorisés
      const filteredMedia = data.media.filter((item: MediaItem) => 
        allowedTypes.includes(item.type)
      );
      
      setMedia(filteredMedia);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, allowedTypes]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  useEffect(() => {
    setSelectedItems(selectedMedia);
  }, [selectedMedia]);

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      const isSelected = selectedItems.some(selected => selected._id === item._id);
      
      if (isSelected) {
        setSelectedItems(prev => prev.filter(selected => selected._id !== item._id));
      } else {
        if (selectedItems.length >= maxSelection) {
          toast.error(`Vous ne pouvez sélectionner que ${maxSelection} média(s) maximum`);
          return;
        }
        setSelectedItems(prev => [...prev, item]);
      }
    } else {
      setSelectedItems([item]);
    }
  };

  const handleConfirm = () => {
    if (selectedItems.length === 0) {
      toast.error('Veuillez sélectionner au moins un média');
      return;
    }
    
    onSelect(multiple ? selectedItems : selectedItems[0]);
    onClose();
  };

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'gallery');
        formData.append('title', file.name);
        formData.append('isPublic', 'true');

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        return response.json();
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} fichier(s) uploadé(s) avec succès`);
      setShowUpload(false);
      fetchMedia();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="text-lg" />
              Upload
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Zone d'upload */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept={allowedTypes.map(type => {
                      switch (type) {
                        case 'image': return 'image/*';
                        case 'video': return 'video/*';
                        case 'audio': return 'audio/*';
                        case 'document': return '.pdf,.txt,.doc,.docx';
                        default: return '*/*';
                      }
                    }).join(',')}
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    disabled={isUploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin text-2xl text-blue-500" />
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                          Upload en cours...
                        </span>
                      </div>
                    ) : (
                      <>
                        <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                          Cliquez pour sélectionner des fichiers
                        </p>
                        <p className="text-sm text-gray-500">
                          Types autorisés: {allowedTypes.join(', ')}
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
                {MEDIA_TYPES.filter(type => 
                  type.value === 'all' || allowedTypes.includes(type.value as any)
                ).map(type => (
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
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <FiLoader className="animate-spin text-4xl text-blue-500" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <FiImage className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucun média trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos filtres ou uploadez de nouveaux médias
              </p>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }`}>
              {media.map((item) => {
                const IconComponent = getMediaIcon(item.type);
                const isSelected = selectedItems.some(selected => selected._id === item._id);
                
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-gray-700 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {viewMode === 'grid' ? (
                      <div className="p-4">
                        {/* Checkbox de sélection */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}>
                            {isSelected && <FiCheck className="text-xs" />}
                          </div>
                          <div className="flex items-center gap-1">
                            <IconComponent className="text-gray-400" />
                            <span className="text-xs text-gray-500 uppercase">
                              {item.type}
                            </span>
                          </div>
                        </div>

                        {/* Aperçu */}
                        <div className="aspect-square bg-gray-100 dark:bg-gray-600 rounded-lg mb-3 overflow-hidden">
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
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {item.title || item.originalName}
                          </h3>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(item.fileSize)}
                          </div>
                          {item.dimensions && (
                            <div className="text-xs text-gray-400">
                              {item.dimensions.width} × {item.dimensions.height}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center gap-3">
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {isSelected && <FiCheck className="text-xs" />}
                        </div>
                        
                        {/* Miniature */}
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                          {item.type === 'image' ? (
                            <Image
                              src={item.thumbnailUrl || item.url}
                              alt={item.altText || item.title || item.originalName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconComponent className="text-lg text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {item.title || item.originalName}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <IconComponent className="text-xs" />
                              {item.type}
                            </span>
                            <span>{formatFileSize(item.fileSize)}</span>
                            {item.dimensions && (
                              <span>{item.dimensions.width} × {item.dimensions.height}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedItems.length > 0 && (
                <span>
                  {selectedItems.length} média(s) sélectionné(s)
                  {multiple && maxSelection > 1 && ` (max: ${maxSelection})`}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedItems.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}