import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiX, FiEye, FiEdit2, FiTrash2, FiLoader, FiUpload, 
  FiImage, FiVideo, FiMusic, FiFile, FiDownload, FiCrop,
  FiFilter, FiSearch, FiGrid, FiList, FiArchive, FiRefreshCw, FiSettings,
  FiCheck, FiMoreVertical, FiChevronLeft, FiChevronRight
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
  { value: 'all', label: 'Tous', icon: FiFile },
  { value: 'image', label: 'Images', icon: FiImage },
  { value: 'video', label: 'Vidéos', icon: FiVideo },
  { value: 'audio', label: 'Audio', icon: FiMusic },
  { value: 'document', label: 'Doc', icon: FiFile },
];

export default function MediaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1, limit: 20, total: 0, pages: 0,
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
  
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected } = usePreviewSync({ enabled: true });
  
  const [filters, setFilters] = useState({ type: 'all', category: 'all', search: '' });
  const [formData, setFormData] = useState({ title: '', description: '', altText: '', tags: '', category: 'other', isPublic: true });

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
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Erreur de chargement');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedFiles(e.target.files);

  const handleUpload = async () => {
    if (!selectedFiles?.length) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'gallery');
        fd.append('title', file.name);
        await fetch('/api/media', { method: 'POST', body: fd });
      }
      toast.success('Upload terminé');
      setSelectedFiles(null);
      setIsModalOpen(false);
      fetchMedia();
      notifyChange('media-upload');
    } catch (error) {
      toast.error('Erreur d\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      altText: item.altText || '',
      tags: item.tags.join(', '),
      category: item.category,
      isPublic: item.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;
    setIsUploading(true);
    try {
      const response = await fetch(`/api/media/${editingMedia._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) }),
      });
      if (response.ok) {
        toast.success('Média mis à jour');
        setIsModalOpen(false);
        setEditingMedia(null);
        fetchMedia();
        notifyChange('media-update');
      }
    } catch (error) {
      toast.error('Erreur de mise à jour');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce média ?')) return;
    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Supprimé');
        fetchMedia();
        notifyChange('media-delete');
      }
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const handleOptimizeAll = async () => {
    const targets = media.filter(m => m.type === 'image' && !m.isOptimized);
    if (!targets.length) {
       toast.success('Tout est optimisé');
       return;
    }
    if (!window.confirm(`Optimiser ${targets.length} images ?`)) return;
    try {
      const response = await fetch('/api/media/optimize/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: targets.map(m => m._id), quality: 85, formats: ['webp', 'avif'], batchSize: 5 }),
      });
      if (response.ok) {
        toast.success('Optimisation lancée');
        setShowOptimizationStatus(true);
        fetchMedia();
      }
    } catch (error) {
      toast.error('Erreur d\'optimisation');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingMedia(null);
    setSelectedFiles(null);
    setFormData({ title: '', description: '', altText: '', tags: '', category: 'other', isPublic: true });
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiImage className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Médiathèque</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-4">
                Assets
                <span className="text-sm font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full text-slate-500">
                   {pagination.total}
                </span>
             </h1>
             <p className="text-slate-500 font-medium max-w-lg">Gérez, recadrez et optimisez vos visuels pour une performance web maximale.</p>
           </div>

           <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowOptimizationStatus(true)} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary-500 rounded-2xl transition-all shadow-sm">
                <FiRefreshCw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleOptimizeAll} 
                className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                <FiSettings className="w-4 h-4" /> Optimiser
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 border border-primary-400 hover:bg-primary-600 transition-all flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" /> Importer
              </button>
           </div>
        </div>

        {/* Filters & Navigation */}
        <div className="p-4 rounded-[32px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center gap-6">
           <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un asset..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 pl-12 pr-6 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-medium dark:text-white text-slate-900 transition-all"
              />
           </div>

           <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
              {MEDIA_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setFilters(prev => ({ ...prev, type: t.value }))}
                  className={`p-2.5 rounded-xl transition-all ${filters.type === t.value ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  <t.icon className="w-4 h-4" />
                </button>
              ))}
           </div>

           <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-white/10 dark:text-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-white/10 dark:text-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Media Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calcul du catalogue…</p>
          </div>
        ) : media.length === 0 ? (
          <div className="bg-slate-50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[40px] p-24 text-center space-y-6">
             <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                <FiFile className="w-10 h-10" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-bold dark:text-white text-slate-900">Aucun asset trouvé</h3>
                <p className="text-slate-500 font-medium">Glissez vos premiers fichiers pour alimenter votre bibliothèque.</p>
             </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8' : 'space-y-4'}>
             {media.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative rounded-[28px] overflow-hidden transition-all duration-500 ${viewMode === 'grid' ? 'bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 hover:shadow-premium-lg' : 'bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 p-4 flex items-center gap-6'}`}
                >
                  {/* Grid View specific part */}
                  {viewMode === 'grid' && (
                    <>
                      <div className="relative aspect-square">
                        {item.type === 'image' ? (
                          <Image src={item.thumbnailUrl || item.url} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950/50">
                             {item.type === 'video' ? <FiVideo className="w-10 h-10 text-slate-400" /> : <FiFile className="w-10 h-10 text-slate-400" />}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-3">
                           <button onClick={() => window.open(item.url, '_blank')} className="p-2.5 rounded-xl bg-white text-slate-900 shadow-xl hover:scale-110 transition-transform"><FiEye className="w-4 h-4"/></button>
                           <button onClick={() => handleEdit(item)} className="p-2.5 rounded-xl bg-primary-500 text-white shadow-xl hover:scale-110 transition-transform"><FiEdit2 className="w-4 h-4"/></button>
                           {item.type === 'image' && <button onClick={() => setCroppingMedia(item)} className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-xl hover:scale-110 transition-transform"><FiCrop className="w-4 h-4"/></button>}
                        </div>
                        {item.isOptimized && (
                          <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">Optimisé</div>
                        )}
                      </div>
                      <div className="p-5 space-y-1">
                        <p className="text-sm font-bold truncate dark:text-white text-slate-900">{item.title || item.originalName}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <span>{formatFileSize(item.fileSize)}</span>
                           <span className="w-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full" />
                           <span>{item.mimeType.split('/')[1]}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* List View specific part */}
                  {viewMode === 'list' && (
                    <>
                       <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950/50 flex-shrink-0 relative">
                          {item.type === 'image' ? <Image src={item.thumbnailUrl || item.url} alt="" fill className="object-cover" /> : <FiFile className="m-auto w-6 h-6 text-slate-400" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold dark:text-white text-slate-900 truncate">{item.title || item.originalName}</p>
                          <p className="text-xs font-medium text-slate-400">{item.mimeType} • {formatFileSize(item.fileSize)} • {item.category}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(item)} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-primary-500 transition-all"><FiEdit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(item._id)} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"><FiTrash2 className="w-4 h-4"/></button>
                       </div>
                    </>
                  )}
                </motion.div>
             ))}
          </div>
        )}

        {/* Improved Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-10">
             <button disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 hover:text-primary-500 disabled:opacity-30 transition-all"><FiChevronLeft /></button>
             <div className="flex items-center gap-2">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button key={i} onClick={() => setPagination(p => ({ ...p, page: i + 1 }))} className={`w-10 h-10 rounded-2xl font-bold text-xs transition-all ${pagination.page === i + 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-primary-500'}`}>{i + 1}</button>
                ))}
             </div>
             <button disabled={pagination.page === pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 hover:text-primary-500 disabled:opacity-30 transition-all"><FiChevronRight /></button>
          </div>
        )}
      </div>

      {/* Optimization & Preview */}
      <OptimizationStatus isVisible={showOptimizationStatus} onClose={() => setShowOptimizationStatus(false)} />
      <LivePreview isVisible={showPreview} onToggle={() => setShowPreview(!showPreview)} previewUrl={getPreviewUrl()} autoRefresh={isConnected} refreshInterval={2000} />

      {/* Redesigned Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={resetModal}>
             <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Gestion des Médias</span>
                      <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">{editingMedia ? 'Éditer l\'Asset' : 'Nouveau Média'}</h2>
                   </div>
                   <button onClick={resetModal} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
                </div>

                {editingMedia ? (
                  <div className="space-y-6">
                     {[ { label: 'Titre', key: 'title' }, { label: 'Description', key: 'description' }, { label: 'Texte Alternatif SEO', key: 'altText' } ].map(f => (
                       <div key={f.key} className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{f.label}</label>
                          <input 
                            value={formData[f.key as keyof typeof formData] as string} 
                            onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 transition-all text-sm"
                          />
                       </div>
                     ))}
                     <div className="flex gap-4 pt-6">
                        <button onClick={handleSaveEdit} className="flex-1 bg-primary-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 active:scale-95 transition-all">{isUploading ? <FiLoader className="m-auto animate-spin" /> : 'Enregistrer changes'}</button>
                        <button onClick={resetModal} className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Annuler</button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                     <label className="group flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[40px] cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all">
                        <div className="w-20 h-20 rounded-[30px] bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                           <FiUpload className="w-8 h-8" />
                        </div>
                        <div className="mt-6 text-center">
                           <p className="text-xl font-bold dark:text-white text-slate-900">Importer des assets</p>
                           <p className="text-slate-500 font-medium">Glissez-déposez vos fichiers ici</p>
                        </div>
                        <input type="file" multiple onChange={handleFileSelect} className="hidden" />
                     </label>

                     {selectedFiles && (
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase px-2">{selectedFiles.length} fichiers en attente</p>
                          <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                             {Array.from(selectedFiles).map((f, i) => (
                               <div key={i} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                                  <FiFile className="text-slate-400" />
                                  <p className="text-xs font-bold dark:text-white text-slate-900 truncate flex-1">{f.name}</p>
                                  <FiCheck className="text-emerald-500 shadow-sm" />
                               </div>
                             ))}
                          </div>
                      </div>
                     )}

                     <button onClick={handleUpload} disabled={!selectedFiles} className="w-full bg-primary-500 py-5 rounded-[24px] text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/25 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98]">
                        {isUploading ? <FiLoader className="m-auto animate-spin" /> : 'Lancer l\'importation'}
                     </button>
                  </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {croppingMedia && (
          <ImageCropper imageUrl={croppingMedia.url} imageId={croppingMedia._id} onClose={() => setCroppingMedia(null)} onSave={() => { toast.success('Recadré !'); setCroppingMedia(null); fetchMedia(); }} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}