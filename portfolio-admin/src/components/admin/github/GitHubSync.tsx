import React, { useState } from 'react';
import { FiGithub, FiRefreshCw, FiCheck, FiAlertTriangle, FiInfo, FiLayers, FiActivity, FiBriefcase, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface SyncStats {
  total: number;
  synced: number;
  created: number;
  updated: number;
  errors: number;
}

interface SyncResponse {
  success: boolean;
  message: string;
  stats: SyncStats;
  errors?: string[];
  lastSync: string;
}

const GitHubSync: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [archiveRemoved, setArchiveRemoved] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archiveRemoved })
      });
      const data: SyncResponse = await response.json();
      if (data.success) {
        toast.success(data.message);
        setSyncStats(data.stats);
        setLastSync(data.lastSync);
        if (data.errors && data.errors.length > 0) {
          toast.error(`Synchronisation terminée avec des erreurs.`);
        }
      } else {
        toast.error(data.message || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
            <FiGithub className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight">Synchronisation GitHub</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Automatisation du pipeline</p>
          </div>
        </div>
        
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="flex items-center gap-3 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 transition-all active:scale-95 border border-primary-400"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synchronisation...' : 'Lancer la synchro'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info & Options */}
        <div className="space-y-6">
          <div className="p-6 rounded-[24px] bg-primary-500/[0.03] border border-primary-500/10 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                <FiInfo className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-extrabold dark:text-white text-slate-900">À propos de l'automatisation</p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Récupérez vos repositories publics. Les projets existants seront mis à jour, les nouveaux seront créés automatiquement.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-4 p-5 rounded-[24px] border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] cursor-pointer hover:border-primary-500/30 transition-all group">
            <div className="relative flex items-center">
               <input
                type="checkbox"
                checked={archiveRemoved}
                onChange={(e) => setArchiveRemoved(e.target.checked)}
                className="w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-700 rounded-lg checked:bg-primary-500 checked:border-primary-500 transition-all cursor-pointer"
              />
              <FiCheck className={`absolute left-1 w-3 h-3 text-white pointer-events-none transition-opacity ${archiveRemoved ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <span className="text-xs font-bold dark:text-slate-300 text-slate-600 uppercase tracking-wide group-hover:text-primary-500 transition-colors">
              Archiver les projets GitHub supprimés ou privés
            </span>
          </label>
        </div>

        {/* Status & Stats */}
        <div className="space-y-6">
          {lastSync ? (
            <div className="p-6 rounded-[24px] bg-emerald-500/[0.03] border border-emerald-500/10 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FiCheck className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Dernière réussite</p>
                   <p className="text-sm font-extrabold dark:text-white text-slate-900">{formatDate(lastSync)}</p>
                </div>
              </div>
              <div className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest rotate-90 origin-right">Status OK</div>
            </div>
          ) : (
             <div className="p-6 rounded-[24px] bg-slate-100 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aucune synchronisation récente</p>
             </div>
          )}

          {syncStats && (
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Total', value: syncStats.total, icon: FiLayers, color: 'text-slate-400' },
                 { label: 'Créés', value: syncStats.created, icon: FiPlus, color: 'text-primary-500' },
                 { label: 'Mis à jour', value: syncStats.updated, icon: FiActivity, color: 'text-emerald-500' },
                 { label: 'Erreurs', value: syncStats.errors, icon: FiAlertTriangle, color: 'text-rose-500' },
               ].map((stat, i) => (
                 <div key={i} className="p-5 rounded-[24px] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col justify-between h-32 hover:border-primary-500/20 transition-all">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <div>
                       <p className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">{stat.value}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Warning Footer */}
      <div className="p-6 rounded-[24px] border border-amber-500/10 bg-amber-500/[0.02] flex items-start gap-4">
        <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Avertissement de sécurité</p>
          <p className="text-[11px] font-medium text-amber-700/70 dark:text-amber-500/60 leading-relaxed">
            Seuls les repositories publics avec une description sont importés. Les repositories de configuration (.github, README) sont exclus par défaut.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubSync;