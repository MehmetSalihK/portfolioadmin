import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';
import { 
  FiClock, FiUser, FiRotateCcw, FiTrash2, FiEye, FiGitBranch, FiDownload, FiUpload, FiRefreshCw, FiFilter, FiSearch, FiChevronDown, FiChevronRight, FiAlertTriangle, FiCheck, FiX, FiActivity, FiZap, FiDatabase, FiServer, FiLayers, FiLoader, FiHistory
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface EntityVersion {
  _id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: any;
  changes: { field: string; oldValue: any; newValue: any; changeType: 'create' | 'update' | 'delete' | 'restore'; }[];
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
  metadata: { totalEntities: number; entitiesByType: Record<string, number>; };
}

const VersionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [filters, setFilters] = useState({ entityType: '', search: '', dateFrom: '', dateTo: '', createdBy: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login'); }, [status, router]);

  const loadVersions = useCallback(async () => {
    const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString(), ...(filters.entityType && { type: filters.entityType }) });
    const res = await fetch(`/api/backup/versions?${params}`);
    if (res.ok) { const d = await res.json(); setVersions(d.versions); setPagination(p => ({ ...p, ...d.pagination })); }
  }, [pagination.page, pagination.limit, filters.entityType]);

  const loadBackups = useCallback(async () => {
    const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
    const res = await fetch(`/api/backup?${params}`);
    if (res.ok) { const d = await res.json(); setBackups(d.backups); setPagination(p => ({ ...p, ...d.pagination })); }
  }, [pagination.page, pagination.limit]);

  const loadData = useCallback(async () => {
    try { setLoading(true); if (activeTab === 'versions') await loadVersions(); else await loadBackups(); }
    catch (e) { toast.error('Erreur chargement'); } finally { setLoading(false); }
  }, [activeTab, loadVersions, loadBackups]);

  useEffect(() => { if (session) loadData(); }, [session, activeTab, filters, pagination.page, loadData]);

  const handleRestoreVersion = async (vId: string) => {
    try { const res = await fetch('/api/backup/versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'restore', versionId: vId }) });
    if (res.ok) { toast.success('Restauré avec succès'); setShowRestoreModal(false); setSelectedVersion(null); loadData(); } } catch (e) { toast.error('Erreur'); }
  };

  const handleRestoreBackup = async (bId: string) => {
    try { const res = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'restore', backupId: bId }) });
    if (res.ok) { toast.success('Restauré avec succès'); setShowRestoreModal(false); setSelectedBackup(null); loadData(); } } catch (e) { toast.error('Erreur'); }
  };

  const handleDeleteVersion = async (vId: string) => {
    if (!confirm('Supprimer cette version ?')) return;
    try { const res = await fetch(`/api/backup/versions?versionId=${vId}`, { method: 'DELETE' }); if (res.ok) { toast.success('Supprimé'); loadData(); } } catch (e) { toast.error('Erreur'); }
  };

  const formatSize = (b: number) => { const s = ['B', 'KB', 'MB', 'GB']; if (b === 0) return '0 B'; const i = Math.floor(Math.log(b) / Math.log(1024)); return Math.round(b / Math.pow(1024, i) * 100) / 100 + ' ' + s[i]; };

  if (status === 'loading' || loading) return (<AdminLayout><div className="flex flex-col items-center justify-center min-h-[400px]"><FiLoader className="w-10 h-10 text-primary-500 animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4">Exploration de l'historique…</p></div></AdminLayout>);

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 shadow-sm">
                   <FiHistory className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Versioning & Snapshots</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Archives Hub</h1>
             <p className="text-slate-500 font-medium max-w-lg">Parcourez l'historique complet de vos modifications et restaurez n'importe quel état passé.</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => setShowBackupModal(true)} className="px-6 py-3 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 border border-primary-400 flex items-center gap-3 hover:bg-primary-600 transition-all"><FiUpload /> Backup Point</button>
              <button onClick={() => setShowCompareModal(true)} className="px-6 py-3 bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-sm flex items-center gap-3 hover:border-primary-500/30 transition-all"><FiGitBranch /> Comparer</button>
           </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 dark:border-white/5 pb-6">
           <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
              {[ { id: 'versions', label: 'Historique Versions', icon: FiLayers }, { id: 'backups', label: 'Archives Système', icon: FiDatabase } ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-premium' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <select value={filters.entityType} onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary-500/10 text-slate-500 dark:text-slate-400 shadow-sm">
                 <option value="">Tous les types</option>
                 <option value="project">Projets</option><option value="skill">Skills</option><option value="experience">Expériences</option><option value="education">Formations</option>
              </select>
              <div className="relative flex-1 md:w-64">
                 <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="REQUÊTE…" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 pl-11 pr-4 py-2.5 rounded-xl text-[10px] items-center outline-none focus:ring-4 focus:ring-primary-500/10 dark:text-white text-slate-900 font-bold placeholder:text-slate-300" />
              </div>
           </div>
        </div>

        {/* Content Table / List */}
        <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden shadow-premium">
           {activeTab === 'versions' ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                 <div className="px-10 py-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-inherit flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Snapshot Timeline</span>
                    <FiRefreshCw className="text-slate-300 hover:text-primary-500 cursor-pointer transition-colors" />
                 </div>
                 {versions.map((version, i) => (
                    <motion.div key={version._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="p-10 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative">
                          <div className="space-y-4">
                             <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${version.isAutoSave ? 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5' : 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20'}`}>
                                   {version.entityType}
                                </span>
                                <span className="text-sm font-black dark:text-white text-slate-900 tracking-tight">Version #{version.version}</span>
                             </div>
                             <div className="flex flex-wrap gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2"><FiUser className="text-slate-300" /> {version.createdBy}</div>
                                <div className="flex items-center gap-2"><FiClock className="text-slate-300" /> {new Date(version.createdAt).toLocaleString('fr-FR')}</div>
                                {version.changes.length > 0 && <div className="flex items-center gap-2"><FiGitBranch className="text-primary-500" /> {version.changes.length} diffs</div>}
                             </div>
                             {version.description && <p className="text-xs font-medium text-slate-500 italic">"{version.description}"</p>}
                          </div>

                          <div className="flex items-center gap-3">
                             <button onClick={() => setSelectedVersion(version)} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm"><FiEye size={16}/></button>
                             <button onClick={() => { setSelectedVersion(version); setShowRestoreModal(true); }} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"><FiRotateCcw /> Restaurer</button>
                             <button onClick={() => handleDeleteVersion(version._id)} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><FiTrash2 size={16}/></button>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                 <div className="px-10 py-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-inherit flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Archiving</span><FiDatabase className="text-slate-300" /></div>
                 {backups.map((backup, i) => (
                    <motion.div key={backup._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="p-10 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all group overflow-hidden">
                       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                          <div className="space-y-4">
                             <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${backup.type === 'full' ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5'}`}>{backup.type} snapshot</span>
                                {backup.isScheduled && <span className="bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20">Cron Task</span>}
                             </div>
                             <div className="flex flex-wrap gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2 text-slate-500"><FiServer size={14}/> {formatSize(backup.size)}</div>
                                <div className="flex items-center gap-2"><FiClock size={14}/> {new Date(backup.createdAt).toLocaleString('fr-FR')}</div>
                                <div className="flex items-center gap-2"><FiLayers size={14}/> {backup.metadata.totalEntities} entities</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <button onClick={() => setSelectedBackup(backup)} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm"><FiEye size={16}/></button>
                             <button onClick={() => { setSelectedBackup(backup); setShowRestoreModal(true); }} className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"><FiDownload /> Rollback Hub</button>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           )}
        </div>

        {/* Modals are kept with standard structure but redesigned context */}
        <AnimatePresence>
           {showRestoreModal && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowRestoreModal(false)}>
                <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }} className="bg-white dark:bg-[#0d0d12] border border-white/10 rounded-[48px] p-12 max-w-lg w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16" />
                   <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-center justify-center text-amber-500 mx-auto mb-10 shadow-premium group-hover:rotate-12 transition-transform"><FiAlertTriangle size={36} /></div>
                   <div className="text-center space-y-4 mb-12">
                      <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Confirmation</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                         "La restauration de cet état écrasera les données actuelles de façon définitive. Confirmez-vous le retour arrière ?"
                      </p>
                   </div>
                   <div className="space-y-4">
                      <button onClick={() => selectedVersion ? handleRestoreVersion(selectedVersion._id) : selectedBackup && handleRestoreBackup(selectedBackup._id)} className="w-full bg-rose-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-rose-500/25 transition-all hover:bg-rose-600 active:scale-95">Restauration immédiate</button>
                      <button onClick={() => setShowRestoreModal(false)} className="w-full bg-slate-50 dark:bg-white/5 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs text-slate-500 transition-all">Annuler l'opération</button>
                   </div>
                </motion.div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default VersionsPage;