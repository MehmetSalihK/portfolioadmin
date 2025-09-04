import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload,
  FiUpload,
  FiDatabase,
  FiShield,
  FiClock,
  FiCheck,
  FiAlertTriangle,
  FiRefreshCw,
  FiTrash2,
  FiHardDrive,
  FiServer,
  FiCloud,
  FiLock,
  FiActivity,
  FiZap,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiInfo,
  FiSettings,
  FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface BackupData {
  _id: string;
  name: string;
  size: string;
  date: string;
  type: 'full' | 'partial';
  status: 'completed' | 'in_progress' | 'failed';
}

const BackupPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'create' | 'restore' | 'manage'>('create');
  const [backups, setBackups] = useState<BackupData[]>([
    {
      _id: '1',
      name: 'Sauvegarde complète - Portfolio',
      size: '2.4 MB',
      date: '2024-01-15 14:30',
      type: 'full',
      status: 'completed'
    },
    {
      _id: '2',
      name: 'Sauvegarde projets uniquement',
      size: '1.2 MB',
      date: '2024-01-10 09:15',
      type: 'partial',
      status: 'completed'
    }
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/admin/login');
    return null;
  }

  const handleCreateBackup = async (type: 'full' | 'partial') => {
    setIsCreatingBackup(true);
    setBackupProgress(0);
    
    try {
      // Simulation de progression avec animation
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup: BackupData = {
        _id: Date.now().toString(),
        name: type === 'full' ? 'Sauvegarde complète - Portfolio' : 'Sauvegarde partielle',
        size: type === 'full' ? '2.6 MB' : '1.1 MB',
        date: new Date().toLocaleString('fr-FR'),
        type,
        status: 'completed'
      };
      
      setBackups(prev => [newBackup, ...prev]);
      toast.success('🎉 Sauvegarde créée avec succès!', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } catch (error) {
      toast.error('❌ Erreur lors de la création de la sauvegarde');
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const handleDownloadBackup = (backup: BackupData) => {
    // Simulation de téléchargement
    const element = document.createElement('a');
    const file = new Blob(['Données de sauvegarde simulées'], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${backup.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Téléchargement démarré!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validation du fichier
      const validTypes = ['application/json', 'application/zip', 'application/x-zip-compressed'];
      const maxSize = 100 * 1024 * 1024; // 100 MB
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
        toast.error('Format de fichier non supporté. Utilisez .json ou .zip', {
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('Fichier trop volumineux. Taille maximale: 100 MB', {
          icon: '⚠️',
          style: {
            borderRadius: '12px',
            background: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fde68a'
          }
        });
        return;
      }
      
      setSelectedFile(file);
      toast.success(`Fichier "${file.name}" sélectionné avec succès`, {
        icon: '📁',
        style: {
          borderRadius: '12px',
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0'
        }
      });
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      toast.error('⚠️ Veuillez sélectionner un fichier de sauvegarde');
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);
    
    try {
      // Simulation de progression avec animation
      const progressInterval = setInterval(() => {
        setRestoreProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 12;
        });
      }, 250);
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      toast.success('✅ Restauration terminée avec succès!', {
        duration: 4000,
        style: {
          background: '#3B82F6',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
      setSelectedFile(null);
    } catch (error) {
      toast.error('❌ Erreur lors de la restauration');
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
    }
  };

  // Gestion du drag & drop avancée
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Vérifier si on quitte vraiment la zone de drop
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validation du fichier
      const validTypes = ['application/json', 'application/zip', 'application/x-zip-compressed'];
      const maxSize = 100 * 1024 * 1024; // 100 MB
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
        toast.error('Format de fichier non supporté. Utilisez .json ou .zip');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('Fichier trop volumineux. Taille maximale: 100 MB');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`Fichier "${file.name}" sélectionné avec succès`);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(backup => backup._id !== backupId));
    toast.success('Sauvegarde supprimée');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* En-tête de la page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Sauvegardes</h1>
          <p className="text-gray-600 dark:text-gray-400">Protégez et restaurez vos données portfolio en toute sécurité</p>
        </motion.div>
        {/* Cartes de statistiques améliorées */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Espace utilisé avec graphique circulaire */}
          <motion.div
            variants={itemVariants}
            whileHover={cardHoverVariants.hover}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiHardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">2.4</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">GB</span>
                </div>
              </div>
              
              {/* Barre de progression circulaire */}
              <div className="relative w-16 h-16 mx-auto mb-4">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-gray-700" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" 
                    className="text-blue-600 dark:text-blue-400" strokeDasharray="175.93" strokeDashoffset="44" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">76%</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Espace utilisé</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sur 10 GB disponibles</p>
              <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                <FiTrendingUp className="w-3 h-3 mr-1" />
                <span>+0.2 GB cette semaine</span>
              </div>
            </div>
          </motion.div>

          {/* Sauvegardes disponibles */}
          <motion.div
            variants={itemVariants}
            whileHover={cardHoverVariants.hover}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiShield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{backups.length}</span>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Actives</span>
                  </div>
                </div>
              </div>
              
              {/* Mini graphique */}
              <div className="flex items-end space-x-1 mb-4 h-8">
                {[3, 5, 2, 7, 4, 6, 8].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height * 4}px` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-green-400 dark:bg-green-500 rounded-sm flex-1"
                  />
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sauvegardes</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Disponibles et vérifiées</p>
            </div>
          </motion.div>

          {/* Dernière sauvegarde */}
          <motion.div
            variants={itemVariants}
            whileHover={cardHoverVariants.hover}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">2</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">jours</span>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Dernière: 15 Jan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Prochaine: 17 Jan</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Dernière sauvegarde</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Programmation automatique</p>
            </div>
          </motion.div>

          {/* Intégrité avec indicateur de santé */}
          <motion.div
            variants={itemVariants}
            whileHover={cardHoverVariants.hover}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">100</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">%</span>
                </div>
              </div>
              
              {/* Indicateur de santé */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                  />
                </div>
                <FiActivity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Intégrité</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toutes les sauvegardes</p>
              <div className="mt-3 flex items-center text-xs text-purple-600 dark:text-purple-400">
                <FiZap className="w-3 h-3 mr-1" />
                <span>Vérification automatique</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation par onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex space-x-2">
              {[
                { id: 'create', label: 'Créer', icon: FiDownload, color: 'blue' },
                { id: 'restore', label: 'Restaurer', icon: FiUpload, color: 'green' },
                { id: 'manage', label: 'Gérer', icon: FiDatabase, color: 'purple' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? `bg-${tab.color}-600 text-white shadow-lg`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                  <FiDownload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Créer une sauvegarde</h2>
                <p className="text-gray-600 dark:text-gray-400">Protégez vos données avec une sauvegarde sécurisée</p>
              </div>
              
              {isCreatingBackup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FiRefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    <span className="text-blue-800 dark:text-blue-200 font-medium">Création en cours...</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${backupProgress}%` }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-blue-600 dark:text-blue-300 text-sm mt-2">{Math.round(backupProgress)}% terminé</p>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreateBackup('full')}
                  disabled={isCreatingBackup}
                  className="group bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <FiDatabase className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-bold mb-2">Sauvegarde complète</h3>
                    <p className="text-blue-100 text-sm mb-4">Inclut tous les projets, médias et configurations</p>
                    <div className="flex items-center text-blue-200 text-sm">
                      <FiServer className="w-4 h-4 mr-2" />
                      <span>~2.5 GB estimé</span>
                    </div>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreateBackup('partial')}
                  disabled={isCreatingBackup}
                  className="group bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <FiShield className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-bold mb-2">Sauvegarde partielle</h3>
                    <p className="text-green-100 text-sm mb-4">Projets et données essentielles uniquement</p>
                    <div className="flex items-center text-green-200 text-sm">
                      <FiCloud className="w-4 h-4 mr-2" />
                      <span>~1.2 GB estimé</span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'restore' && (
            <motion.div
              key="restore"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                  <FiUpload className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Restaurer une sauvegarde</h2>
                <p className="text-gray-600 dark:text-gray-400">Importez et restaurez vos données depuis un fichier de sauvegarde</p>
              </div>
              
              {isRestoring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <FiRefreshCw className="w-5 h-5 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-green-800 dark:text-green-200 font-medium">Restauration en cours...</span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${restoreProgress}%` }}
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-green-600 dark:text-green-300 text-sm mt-2">{Math.round(restoreProgress)}% terminé</p>
                </motion.div>
              )}
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20 scale-105'
                    : selectedFile
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                }`}
              >
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="backup-file"
                />
                <label htmlFor="backup-file" className="cursor-pointer block">
                  <motion.div
                    animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                    className="mb-4"
                  >
                    <FiUpload className={`w-16 h-16 mx-auto mb-4 ${
                      isDragOver || selectedFile ? 'text-green-500' : 'text-gray-400'
                    }`} />
                  </motion.div>
                  <p className={`text-lg font-medium mb-2 ${
                    isDragOver || selectedFile ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {isDragOver ? 'Déposez le fichier ici' : selectedFile ? 'Fichier sélectionné' : 'Glissez-déposez ou cliquez pour sélectionner'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    Formats supportés: .json, .zip (max 100 MB)
                  </p>
                </label>
              </div>
              
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <FiLock className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-green-800 dark:text-green-200 font-medium text-lg">
                        {selectedFile.name}
                      </p>
                      <p className="text-green-600 dark:text-green-300 text-sm">
                        Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Modifié: {new Date(selectedFile.lastModified).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFile(null)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRestoreBackup}
                disabled={!selectedFile || isRestoring}
                className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 font-medium text-lg"
              >
                {isRestoring ? (
                  <FiRefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <FiUpload className="w-6 h-6" />
                )}
                <span>
                  {isRestoring ? 'Restauration en cours...' : 'Restaurer la sauvegarde'}
                </span>
              </motion.button>
            </motion.div>
           )}

           {activeTab === 'manage' && (
             <motion.div
               key="manage"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               transition={{ duration: 0.3 }}
               className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8"
             >
               <div className="text-center mb-8">
                 <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
                   <FiDatabase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                 </div>
                 <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gérer les sauvegardes</h2>
                 <p className="text-gray-600 dark:text-gray-400">Organisez, téléchargez et supprimez vos sauvegardes existantes</p>
               </div>

               {/* Filtres et recherche */}
               <div className="flex flex-col sm:flex-row gap-4 mb-6">
                 <div className="flex-1 relative">
                   <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                   <input
                     type="text"
                     placeholder="Rechercher une sauvegarde..."
                     className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                   />
                 </div>
                 <div className="flex gap-2">
                   <select className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                     <option>Tous les types</option>
                     <option>Complète</option>
                     <option>Partielle</option>
                   </select>
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                   >
                     <FiFilter className="w-5 h-5" />
                   </motion.button>
                 </div>
               </div>

               {/* Liste des sauvegardes */}
               <div className="space-y-4">
                 {[
                   {
                     id: 1,
                     name: 'Sauvegarde_Complete_2024-01-15.zip',
                     type: 'Complète',
                     size: '2.4 GB',
                     date: '15 Jan 2024, 14:30',
                     status: 'Valide',
                     encrypted: true
                   },
                   {
                     id: 2,
                     name: 'Sauvegarde_Partielle_2024-01-10.json',
                     type: 'Partielle',
                     size: '1.2 GB',
                     date: '10 Jan 2024, 09:15',
                     status: 'Valide',
                     encrypted: false
                   },
                   {
                     id: 3,
                     name: 'Sauvegarde_Complete_2024-01-05.zip',
                     type: 'Complète',
                     size: '2.3 GB',
                     date: '05 Jan 2024, 16:45',
                     status: 'Corrompue',
                     encrypted: true
                   }
                 ].map((backup, index) => (
                   <motion.div
                     key={backup.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                         <div className={`p-3 rounded-xl ${
                           backup.type === 'Complète' 
                             ? 'bg-blue-100 dark:bg-blue-900/30' 
                             : 'bg-green-100 dark:bg-green-900/30'
                         }`}>
                           {backup.type === 'Complète' ? (
                             <FiDatabase className={`w-6 h-6 ${
                               backup.type === 'Complète' 
                                 ? 'text-blue-600 dark:text-blue-400' 
                                 : 'text-green-600 dark:text-green-400'
                             }`} />
                           ) : (
                             <FiShield className="w-6 h-6 text-green-600 dark:text-green-400" />
                           )}
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center space-x-2 mb-1">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                               {backup.name}
                             </h3>
                             {backup.encrypted && (
                               <FiLock className="w-4 h-4 text-yellow-500" />
                             )}
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               backup.status === 'Valide'
                                 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                 : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                             }`}>
                               {backup.status}
                             </span>
                           </div>
                           <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                             <span className="flex items-center">
                               <FiCalendar className="w-4 h-4 mr-1" />
                               {backup.date}
                             </span>
                             <span className="flex items-center">
                               <FiHardDrive className="w-4 h-4 mr-1" />
                               {backup.size}
                             </span>
                             <span className={`px-2 py-1 rounded-full text-xs ${
                               backup.type === 'Complète'
                                 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                 : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                             }`}>
                               {backup.type}
                             </span>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                           title="Télécharger"
                         >
                           <FiDownload className="w-5 h-5" />
                         </motion.button>
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                           title="Restaurer"
                         >
                           <FiUpload className="w-5 h-5" />
                         </motion.button>
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                           title="Informations"
                         >
                           <FiInfo className="w-5 h-5" />
                         </motion.button>
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                           title="Supprimer"
                         >
                           <FiTrash2 className="w-5 h-5" />
                         </motion.button>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </div>

               {/* Actions en lot */}
               <div className="mt-8 flex flex-col sm:flex-row gap-4">
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2"
                 >
                   <FiTrash2 className="w-5 h-5" />
                   <span>Supprimer les sélectionnées</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                 >
                   <FiDownload className="w-5 h-5" />
                   <span>Télécharger tout</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center space-x-2"
                 >
                   <FiSettings className="w-5 h-5" />
                   <span>Configuration</span>
                 </motion.button>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Liste des sauvegardes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sauvegardes disponibles</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {backups.map((backup) => (
              <motion.div
                key={backup._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {backup.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.type === 'full' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {backup.type === 'full' ? 'Complète' : 'Partielle'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : backup.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {backup.status === 'completed' ? 'Terminée' : 
                         backup.status === 'in_progress' ? 'En cours' : 'Échouée'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        {backup.date}
                      </span>
                      <span className="flex items-center">
                        <FiHardDrive className="w-4 h-4 mr-1" />
                        {backup.size}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownloadBackup(backup)}
                      className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      title="Télécharger"
                    >
                      <FiDownload className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteBackup(backup._id)}
                      className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Avertissement de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Conseils de sécurité
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
                <li>• Effectuez des sauvegardes régulières de vos données importantes</li>
                <li>• Stockez vos sauvegardes dans un endroit sûr et accessible</li>
                <li>• Testez régulièrement vos sauvegardes pour vous assurer qu'elles fonctionnent</li>
                <li>• Gardez plusieurs versions de sauvegardes pour plus de sécurité</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default BackupPage;