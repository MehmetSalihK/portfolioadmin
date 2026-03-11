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
  FiCalendar,
  FiFileText,
  FiPlus
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
  const [backups, setBackups] = useState<BackupData[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleCreateBackup = async (type: 'full' | 'partial') => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/admin/backup/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      clearInterval(progressInterval);
      setBackupProgress(100);
      toast.success('Sauvegarde téléchargée avec succès');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la création de la sauvegarde');
    } finally {
      setTimeout(() => {
        setIsCreatingBackup(false);
        setBackupProgress(0);
      }, 1000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast.error('Format de fichier non supporté. Utilisez .json');
        return;
      }
      setSelectedFile(file);
      toast.success(`Fichier "${file.name}" sélectionné`);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    if (!window.confirm('Attention: Cette action va écraser toutes les données actuelles. Continuer ?')) {
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      const formData = new FormData();
      formData.append('backup', selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/backup/import');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setRestoreProgress((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast.success('Restauration terminée avec succès');
          setSelectedFile(null);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error('Erreur lors de la restauration');
        }
        setIsRestoring(false);
      };

      xhr.onerror = () => {
        toast.error('Erreur réseau');
        setIsRestoring(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur inattendue');
      setIsRestoring(false);
    }
  };

  if (status === 'loading') {
    return (
      <AdminLayout>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Initialisation...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FiDatabase className="w-5 h-5 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Sauvegardes</h1>
          </div>
          <p className="text-zinc-500 font-medium">Sécurisez et restaurez vos données portfolio en un clic.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <FiShield className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Protection</p>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Activer</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <FiHardDrive className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Intégrité</p>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">100% OK</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <FiCloud className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Stockage</p>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">JSON Export</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <FiActivity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Santé</p>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Optimale</h3>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-2xl border border-white/5 w-full mb-10">
          {[
            { id: 'create', label: 'Exporter', icon: FiDownload, color: 'indigo' },
            { id: 'restore', label: 'Importer', icon: FiUpload, color: 'emerald' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id
                ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-600/20`
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
              <div className="relative z-10 max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center mx-auto mb-8">
                  <FiDownload className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Prêt pour l'export ?</h2>
                <p className="text-zinc-500 font-medium mb-10 leading-relaxed">
                  Cette action générera un fichier JSON contenant l'intégralité de votre base de données (Compétences, Projets, Expériences, Formations, Messages).
                </p>

                {isCreatingBackup && (
                  <div className="mb-10 space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      <span>Génération en cours...</span>
                      <span>{Math.round(backupProgress)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${backupProgress}%` }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleCreateBackup('full')}
                  disabled={isCreatingBackup}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isCreatingBackup ? (
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiZap className="w-5 h-5" />
                  )}
                  Générer le fichier JSON
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="restore"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-center max-w-lg mx-auto mb-12">
                  <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
                    <FiUpload className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Restauration</h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    Importez votre fichier de sauvegarde JSON pour restaurer votre portfolio à un état précédent.
                  </p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); /* handle drop */ }}
                  className={`max-w-xl mx-auto border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ${isDragOver 
                    ? 'border-emerald-500 bg-emerald-500/5 scale-[1.02]' 
                    : selectedFile 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="restore-input"
                  />
                  <label htmlFor="restore-input" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
                          <FiFileText className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-white font-black text-sm uppercase tracking-tight">{selectedFile.name}</p>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                          className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <FiPlus className="w-8 h-8 text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 font-black text-[10px] uppercase tracking-widest">Cliquez ou déposez votre fichier .json</p>
                      </div>
                    )}
                  </label>
                </div>

                {selectedFile && (
                  <div className="max-w-xl mx-auto mt-10">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <FiAlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Attention</h4>
                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                          La restauration écrasera toutes vos données actuelles. Assurez-vous d'avoir une sauvegarde de l'état actuel si nécessaire.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleRestoreBackup}
                      disabled={isRestoring}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-600/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isRestoring ? (
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <FiCheck className="w-5 h-5" />
                      )}
                      Lancer la restauration
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default BackupPage;