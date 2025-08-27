import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  title: string;
  description: string;
  altText: string;
  type: string;
  mimeType: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
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
  stats: {
    views: number;
    downloads: number;
    lastAccessed: Date;
  };
  createdAt: string;
  updatedAt: string;
}

interface MediaGalleryProps {
  onSelect?: (media: MediaItem | MediaItem[]) => void;
  multiSelect?: boolean;
  category?: string;
  maxSelection?: number;
  showUpload?: boolean;
  showFilters?: boolean;
  viewMode?: 'grid' | 'list';
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  onSelect,
  multiSelect = false,
  category,
  maxSelection,
  showUpload = true,
  showFilters = true,
  viewMode: initialViewMode = 'grid',
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [uploading, setUploading] = useState(false);

  const categories = ['all', 'portfolio', 'blog', 'profile', 'gallery', 'other'];
  const types = ['all', 'image', 'video', 'audio', 'document'];

  const fetchMedia = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '20',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/media?${params}`);
      const data = await response.json();

      if (data.media) {
        setMedia(reset ? data.media : [...media, ...data.media]);
        setHasMore(data.pagination.page < data.pagination.pages);
        if (reset) setPage(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedType, searchTerm, media]);

  useEffect(() => {
    fetchMedia(true);
  }, [selectedCategory, selectedType, searchTerm]);

  const handleSelect = (item: MediaItem) => {
    if (multiSelect) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item._id)) {
        newSelected.delete(item._id);
      } else if (!maxSelection || newSelected.size < maxSelection) {
        newSelected.add(item._id);
      }
      setSelectedItems(newSelected);
      
      const selectedMedia = media.filter(m => newSelected.has(m._id));
      onSelect?.(selectedMedia);
    } else {
      setSelectedItems(new Set([item._id]));
      onSelect?.(item);
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory !== 'all' ? selectedCategory : 'other');
        formData.append('title', file.name);
        formData.append('isPublic', 'true');

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          fetchMedia(true);
        }
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageUrl = (item: MediaItem, size: 'thumbnail' | 'small' | 'medium' = 'thumbnail') => {
    const variant = item.variants?.find(v => v.size === size);
    return variant?.url || item.url;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header avec recherche et filtres */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des médias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Toggle vue */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Upload */}
            {showUpload && (
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                <PhotoIcon className="h-5 w-5 inline mr-2" />
                Upload
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes catégories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tous types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.size} sélectionné{selectedItems.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Désélectionner
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Galerie */}
      <div className="flex-1 overflow-auto p-4">
        {loading && media.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {media.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedItems.has(item._id)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {/* Image */}
                    <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                      {item.type === 'image' ? (
                        <Image
                          src={getImageUrl(item)}
                          alt={item.altText || item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Overlay sélection */}
                      {selectedItems.has(item._id) && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-1">
                            <CheckIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Actions hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(item);
                            }}
                            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
                          >
                            <EyeIcon className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {item.title || item.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.fileSize)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {media.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedItems.has(item._id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {item.type === 'image' ? (
                        <Image
                          src={getImageUrl(item)}
                          alt={item.altText || item.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {item.title || item.originalName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{item.type}</span>
                        <span>{formatFileSize(item.fileSize)}</span>
                        {item.dimensions.width && (
                          <span>{item.dimensions.width}×{item.dimensions.height}</span>
                        )}
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Sélection */}
                    {selectedItems.has(item._id) && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => {
                    setPage(p => p + 1);
                    fetchMedia();
                  }}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Chargement...' : 'Charger plus'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de prévisualisation */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl max-h-full overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewItem.title || previewItem.originalName}
                </h3>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-4">
                {previewItem.type === 'image' && (
                  <div className="mb-4">
                    <Image
                      src={getImageUrl(previewItem, 'large')}
                      alt={previewItem.altText || previewItem.title}
                      width={800}
                      height={600}
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Nom original</p>
                    <p className="text-gray-600 dark:text-gray-400">{previewItem.originalName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Taille</p>
                    <p className="text-gray-600 dark:text-gray-400">{formatFileSize(previewItem.fileSize)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dimensions</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {previewItem.dimensions.width}×{previewItem.dimensions.height}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Type</p>
                    <p className="text-gray-600 dark:text-gray-400">{previewItem.mimeType}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Catégorie</p>
                    <p className="text-gray-600 dark:text-gray-400">{previewItem.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Vues</p>
                    <p className="text-gray-600 dark:text-gray-400">{previewItem.stats.views}</p>
                  </div>
                </div>
                
                {previewItem.description && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-900 dark:text-white">Description</p>
                    <p className="text-gray-600 dark:text-gray-400">{previewItem.description}</p>
                  </div>
                )}
                
                {previewItem.tags.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;