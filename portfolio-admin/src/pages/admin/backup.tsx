import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiUpload, FiDatabase, FiShield, FiClock, FiCheck, FiAlertTriangle, FiRefreshCw, FiTrash2, FiHardDrive, FiServer, FiCloud, FiLock, FiActivity, FiZap, FiPlus, FiFileText, FiLoader, FiArrowRight } from 'react-icons/fi';
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

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login'); }, [status, router]);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);
    try {
      const interval = setInterval(() => { setBackupProgress(p => p >= 90 ? 90 : p + 5); }, 200);
      const res = await fetch('/api/admin/backup/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      clearInterval(interval); setBackupProgress(100);
      toast.success('Sauvegarde générée');
    } catch (e) { toast.error('Erreur export'); } finally { setTimeout(() => setIsCreatingBackup(false), 1000); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.name.endsWith('.json')) { toast.error('Format .json requis'); return; }
      setSelectedFile(f); toast.success('Fichier prêt');
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile || !window.confirm('Écraser les données ?')) return;
    setIsRestoring(true); setRestoreProgress(0);
    try {
      const formData = new FormData(); formData.append('backup', selectedFile);
      const xhr = new XMLHttpRequest(); xhr.open('POST', '/api/admin/backup/import');
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) setRestoreProgress((e.loaded / e.total) * 100); };
      xhr.onload = () => { if (xhr.status === 200) { toast.success('Restauration terminée'); setTimeout(() => window.location.reload(), 1500); } else { toast.error('Erreur'); setIsRestoring(false); } };
      xhr.send(formData);
    } catch (e) { toast.error('Erreur'); setIsRestoring(false); }
  };

  if (status === 'loading') return null;

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiDatabase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Intégrité & Sécurité</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Backup Center</h1>
             <p className="text-slate-500 font-medium max-w-lg">Exportez et restaurez l'intégralité de vos données en un clic avec une fiabilité maximale.</p>
           </div>
           
           <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              {[
                { id: 'create', label: 'Exporter', icon: FiDownload },
                { id: 'restore', label: 'Importer', icon: FiUpload },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-premium' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Protégé', value: 'Activée', icon: FiShield, color: 'primary' },
             { label: 'Intégrité', value: '100%', icon: FiHardDrive, color: 'emerald' },
             { label: 'Format', value: 'JSON Hub', icon: FiCloud, color: 'indigo' },
             { label: 'Santé', value: 'Optimale', icon: FiActivity, color: 'rose' },
           ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 hover:shadow-premium-lg transition-all duration-500 group relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-colors`} />
                 <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 mb-6 group-hover:scale-110 transition-transform`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">{stat.value}</h3>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
           {activeTab === 'create' ? (
             <motion.div key="create" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-10">
                   <div className="w-24 h-24 rounded-[32px] bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-10 shadow-premium group-hover:scale-110 transition-transform duration-500 text-primary-500">
                      <FiZap className="w-10 h-10" />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-4xl font-black dark:text-white text-slate-900 tracking-tight">Générer un Export Complet</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                         Cette action consolide l'intégralité de votre portfolio (Projets, Médias, SEO, Parcours) dans un fichier JSON unique et cryptographique.
                      </p>
                   </div>

                   {isCreatingBackup && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary-500">
                           <span className="flex items-center gap-2"><FiLoader className="animate-spin" /> Compression en cours…</span>
                           <span>{Math.round(backupProgress)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-100 dark:border-white/5">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${backupProgress}%` }} className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" />
                        </div>
                     </div>
                   )}

                   <button onClick={handleCreateBackup} disabled={isCreatingBackup} className="w-full bg-primary-500 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-4 hover:bg-primary-600 disabled:opacity-50">
                      {isCreatingBackup ? <FiLoader className="animate-spin" /> : <FiDownload className="w-5 h-5" />} Lancer le processus d'export
                   </button>
                   
                   <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><FiServer className="text-primary-500"/> Local Storage</div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><FiLock className="text-emerald-500"/> Full Encrypted</div>
                   </div>
                </div>
             </motion.div>
           ) : (
             <motion.div key="restore" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-12 lg:p-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                   <div className="space-y-10">
                      <div className="w-20 h-20 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-premium"><FiUpload className="w-8 h-8" /></div>
                      <div className="space-y-4">
                         <h2 className="text-4xl font-black dark:text-white text-slate-900 tracking-tight">Restauration</h2>
                         <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Réinjectez des données précédemment exportées. <span className="text-rose-500 font-bold">Attention :</span> l'état actuel de votre portfolio sera totalement remplacé par les données du fichier chargé.
                         </p>
                      </div>
                      
                      {selectedFile && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] p-8 space-y-6 relative group overflow-hidden">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm grow-0 shrink-0"><FiFileText className="w-7 h-7" /></div>
                              <div className="flex-1 overflow-hidden">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Fichier prêt</p>
                                 <h4 className="text-base font-black dark:text-white text-slate-900 truncate">{selectedFile.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB · Hub JSON v2</p>
                              </div>
                              <button onClick={() => setSelectedFile(null)} className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><FiTrash2 /></button>
                           </div>

                           <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                              <FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Cette opération est irréversible. Toutes les données actuelles seront perdues.</p>
                           </div>

                           <button onClick={handleRestoreBackup} disabled={isRestoring} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3">
                              {isRestoring ? <FiLoader className="animate-spin" /> : <FiCheck className="w-5 h-5" />} Exécuter la restauration
                           </button>
                        </motion.div>
                      )}
                   </div>

                   <div onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f && f.name.endsWith('.json')) setSelectedFile(f); }} className={`border-3 border-dashed rounded-[40px] p-20 flex flex-col items-center justify-center text-center transition-all duration-500 gap-8 ${isDragOver ? 'border-primary-500 bg-primary-500/5 scale-105' : 'border-slate-200 dark:border-white/10 hover:border-primary-500/30'}`}>
                      <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="restore-input" />
                      <label htmlFor="restore-input" className="cursor-pointer space-y-6">
                         <div className="w-20 h-20 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform"><FiPlus className="w-10 h-10 text-slate-400" /></div>
                         <div>
                            <p className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-widest">Load hub data</p>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-2 italic">Drag and drop or browse files</p>
                         </div>
                      </label>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default BackupPage;