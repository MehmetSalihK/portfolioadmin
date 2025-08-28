import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, 
  FiUser, 
  FiRotateCcw, 
  FiTrash2, 
  FiEye, 
  FiGitBranch,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiAlertTriangle,
  FiCheck,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Types
interface EntityVersion {
  _id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: any;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'create' | 'update' | 'delete' | 'restore';
  }[];
  createdBy: string;
  createdAt: string;
  description?: string;
  isAutoSave: boolean;
}

interface Backup {
  _id: string;
  type: 'full' | 'incremental' | 'differential';
  description?: string;
  createdBy: string;
  createdAt: string;
  size: number;
  checksum: string;
  isScheduled: boolean;
  metadata: {
    totalEntities: number;
    entitiesByType: Record<string, number>;
  };
}

const VersionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // États
  const [versions, setVersions] = useState<EntityVersion[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'versions' | 'backups'>('versions');
  const [selectedVersion, setSelectedVersion] = useState<EntityVersion | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{ v1: string; v2: string }>({ v1: '', v2: '' });
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  
  // Filtres
  const [filters, setFilters] = useState({
    entityType: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    createdBy: '',
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const loadVersions = useCallback(async () => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      ...(filters.entityType && { type: filters.entityType }),
    });
    
    const response = await fetch(`/api/backup/versions?${params}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des versions');
    
    const data = await response.json();
    setVersions(data.versions);
    setPagination(prev => ({ ...prev, ...data.pagination }));
  }, [pagination.page, pagination.limit, filters.entityType]);

  const loadBackups = useCallback(async () => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });
    
    const response = await fetch(`/api/backup?${params}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des sauvegardes');
    
    const data = await response.json();
    setBackups(data.backups);
    setPagination(prev => ({ ...prev, ...data.pagination }));
  }, [pagination.page, pagination.limit]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'versions') {
        await loadVersions();
      } else {
        await loadBackups();
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadVersions, loadBackups]);

  // Charger les données
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, activeTab, filters, pagination.page, loadData]);

  // Restaurer une version
  const handleRestoreVersion = async (versionId: string) => {
    try {
      const response = await fetch('/api/backup/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          versionId,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la restauration');
      
      toast.success('Version restaurée avec succès');
      setShowRestoreModal(false);
      setSelectedVersion(null);
      loadData();
    } catch (error) {
      console.error('Erreur restauration:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  // Restaurer une sauvegarde
  const handleRestoreBackup = async (backupId: string) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          backupId,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la restauration');
      
      toast.success('Sauvegarde restaurée avec succès');
      setShowRestoreModal(false);
      setSelectedBackup(null);
      loadData();
    } catch (error) {
      console.error('Erreur restauration:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  // Créer une sauvegarde
  const handleCreateBackup = async (type: 'full' | 'incremental', description: string) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type,
          description,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création de la sauvegarde');
      
      toast.success('Sauvegarde créée avec succès');
      setShowBackupModal(false);
      loadData();
    } catch (error) {
      console.error('Erreur création sauvegarde:', error);
      toast.error('Erreur lors de la création de la sauvegarde');
    }
  };

  // Comparer deux versions
  const handleCompareVersions = async () => {
    try {
      const response = await fetch(
        `/api/backup/versions?action=compare&versionId=${compareVersions.v1}&compareWith=${compareVersions.v2}`
      );
      
      if (!response.ok) throw new Error('Erreur lors de la comparaison');
      
      const data = await response.json();
      setComparisonResult(data);
    } catch (error) {
      console.error('Erreur comparaison:', error);
      toast.error('Erreur lors de la comparaison');
    }
  };

  // Supprimer une version
  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette version ?')) return;
    
    try {
      const response = await fetch(`/api/backup/versions?versionId=${versionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      toast.success('Version supprimée avec succès');
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };



  // Formater la taille
  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Versions</h1>
              <p className="mt-2 text-gray-600">
                Gérez les versions et sauvegardes de votre portfolio
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowBackupModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiUpload className="w-4 h-4" />
                <span>Nouvelle Sauvegarde</span>
              </button>
              
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FiGitBranch className="w-4 h-4" />
                <span>Comparer</span>
              </button>
            </div>
          </div>
          
          {/* Onglets */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('versions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'versions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Versions
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sauvegardes
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'entité
              </label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="project">Projets</option>
                <option value="skill">Compétences</option>
                <option value="experience">Expériences</option>
                <option value="education">Formations</option>
                <option value="media">Médias</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Liste des versions/sauvegardes */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'versions' ? (
            <VersionsList 
              versions={versions}
              onRestore={(version) => {
                setSelectedVersion(version);
                setShowRestoreModal(true);
              }}
              onDelete={handleDeleteVersion}
              onView={(version) => setSelectedVersion(version)}
            />
          ) : (
            <BackupsList 
              backups={backups}
              onRestore={(backup) => {
                setSelectedBackup(backup);
                setShowRestoreModal(true);
              }}
              onView={(backup) => setSelectedBackup(backup)}
            />
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-3 py-2 rounded-lg ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <RestoreModal 
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedVersion(null);
          setSelectedBackup(null);
        }}
        version={selectedVersion}
        backup={selectedBackup}
        onConfirm={(id) => {
          if (selectedVersion) {
            handleRestoreVersion(id);
          } else if (selectedBackup) {
            handleRestoreBackup(id);
          }
        }}
      />
      
      <BackupModal 
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onConfirm={handleCreateBackup}
      />
      
      <CompareModal 
        isOpen={showCompareModal}
        onClose={() => {
          setShowCompareModal(false);
          setComparisonResult(null);
        }}
        versions={versions}
        compareVersions={compareVersions}
        setCompareVersions={setCompareVersions}
        onCompare={handleCompareVersions}
        comparisonResult={comparisonResult}
      />
    </div>
  );
};

// Composant liste des versions
const VersionsList: React.FC<{
  versions: EntityVersion[];
  onRestore: (version: EntityVersion) => void;
  onDelete: (versionId: string) => void;
  onView: (version: EntityVersion) => void;
}> = ({ versions, onRestore, onDelete, onView }) => {
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  // Formater la taille
  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Historique des Versions</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {versions.map((version) => (
          <motion.div
            key={version._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {version.entityType}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Version {version.version}
                  </span>
                  {version.isAutoSave && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Auto
                    </span>
                  )}
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>{version.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDate(version.createdAt)}</span>
                  </div>
                  {version.changes.length > 0 && (
                    <span>{version.changes.length} modification(s)</span>
                  )}
                </div>
                
                {version.description && (
                  <p className="mt-2 text-sm text-gray-600">{version.description}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onView(version)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Voir les détails"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRestore(version)}
                  className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                  title="Restaurer cette version"
                >
                  <FiRotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(version._id)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Supprimer cette version"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Composant liste des sauvegardes
const BackupsList: React.FC<{
  backups: Backup[];
  onRestore: (backup: Backup) => void;
  onView: (backup: Backup) => void;
}> = ({ backups, onRestore, onView }) => {
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  // Formater la taille
  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sauvegardes</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {backups.map((backup) => (
          <motion.div
            key={backup._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    backup.type === 'full' ? 'bg-green-100 text-green-800' :
                    backup.type === 'incremental' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {backup.type}
                  </span>
                  {backup.isScheduled && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Programmée
                    </span>
                  )}
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>{backup.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDate(backup.createdAt)}</span>
                  </div>
                  <span>{formatSize(backup.size)}</span>
                  <span>{backup.metadata.totalEntities} entité(s)</span>
                </div>
                
                {backup.description && (
                  <p className="mt-2 text-sm text-gray-600">{backup.description}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onView(backup)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Voir les détails"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRestore(backup)}
                  className="p-2 text-green-400 hover:text-green-600 transition-colors"
                  title="Restaurer cette sauvegarde"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Modale de restauration
const RestoreModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  version?: EntityVersion | null;
  backup?: Backup | null;
  onConfirm: (id: string) => void;
}> = ({ isOpen, onClose, version, backup, onConfirm }) => {
  if (!isOpen) return null;
  
  const item = version || backup;
  if (!item) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3 mb-4">
            <FiAlertTriangle className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-900">
              Confirmer la restauration
            </h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            {version ? (
              `Êtes-vous sûr de vouloir restaurer la version ${version.version} de ${version.entityType} ?`
            ) : (
              `Êtes-vous sûr de vouloir restaurer la sauvegarde ${backup?.type} ?`
            )}
            <br />
            <strong>Cette action est irréversible.</strong>
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(item._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Restaurer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Modale de création de sauvegarde
const BackupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'full' | 'incremental', description: string) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [type, setType] = useState<'full' | 'incremental'>('incremental');
  const [description, setDescription] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(type, description);
    setDescription('');
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Créer une nouvelle sauvegarde
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de sauvegarde
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="incremental"
                    checked={type === 'incremental'}
                    onChange={(e) => setType(e.target.value as 'incremental')}
                    className="mr-2"
                  />
                  <span>Incrémentale (rapide)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="full"
                    checked={type === 'full'}
                    onChange={(e) => setType(e.target.value as 'full')}
                    className="mr-2"
                  />
                  <span>Complète (recommandée)</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez cette sauvegarde..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Modale de comparaison
const CompareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  versions: EntityVersion[];
  compareVersions: { v1: string; v2: string };
  setCompareVersions: (versions: { v1: string; v2: string }) => void;
  onCompare: () => void;
  comparisonResult: any;
}> = ({ isOpen, onClose, versions, compareVersions, setCompareVersions, onCompare, comparisonResult }) => {
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Comparer les versions
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version 1
              </label>
              <select
                value={compareVersions.v1}
                onChange={(e) => setCompareVersions({ ...compareVersions, v1: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une version</option>
                {versions.map((version) => (
                  <option key={version._id} value={version._id}>
                    {version.entityType} - Version {version.version} ({formatDate(version.createdAt)})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version 2
              </label>
              <select
                value={compareVersions.v2}
                onChange={(e) => setCompareVersions({ ...compareVersions, v2: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une version</option>
                {versions.map((version) => (
                  <option key={version._id} value={version._id}>
                    {version.entityType} - Version {version.version} ({formatDate(version.createdAt)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onCompare}
              disabled={!compareVersions.v1 || !compareVersions.v2}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comparer
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
          
          {comparisonResult && (
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Résultats de la comparaison</h4>
              
              <div className="space-y-4">
                {comparisonResult.changes.map((change: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        change.changeType === 'create' ? 'bg-green-100 text-green-800' :
                        change.changeType === 'update' ? 'bg-blue-100 text-blue-800' :
                        change.changeType === 'delete' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {change.changeType}
                      </span>
                      <span className="font-medium">{change.field}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Ancienne valeur:</span>
                        <pre className="mt-1 p-2 bg-red-50 rounded text-red-800 overflow-x-auto">
                          {JSON.stringify(change.oldValue, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-gray-500">Nouvelle valeur:</span>
                        <pre className="mt-1 p-2 bg-green-50 rounded text-green-800 overflow-x-auto">
                          {JSON.stringify(change.newValue, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VersionsPage;