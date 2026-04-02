import React, { useState, useEffect, useCallback } from 'react';
import { FiSettings, FiCheck, FiX, FiLoader, FiClock, FiActivity, FiZap, FiDownload, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizationJob {
  id: string;
  mediaId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  originalSize: number;
  optimizedSize?: number;
  compressionRatio?: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface OptimizationStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface OptimizationStatusProps {
  isVisible: boolean;
  onClose: () => void;
}

const OptimizationStatus: React.FC<OptimizationStatusProps> = ({ isVisible, onClose }) => {
  const [jobs, setJobs] = useState<OptimizationJob[]>([]);
  const [stats, setStats] = useState<OptimizationStats>({
    total: 0, pending: 0, processing: 0, completed: 0, failed: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/media/optimize/status');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    if (isVisible) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible, fetchStatus]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0f1118] border border-slate-200 dark:border-white/10 rounded-[32px] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-primary-500/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                 <FiZap className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight">Statut d'Optimisation</h2>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculs en temps réel</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><FiX className="w-5 h-5"/></button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             {/* Stats Grid */}
             <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[ 
                  { label: 'Total', value: stats.total, color: 'text-slate-400' },
                  { label: 'Attente', value: stats.pending, color: 'text-amber-500' },
                  { label: 'En cours', value: stats.processing, color: 'text-primary-500' },
                  { label: 'Succès', value: stats.completed, color: 'text-emerald-500' },
                  { label: 'Erreur', value: stats.failed, color: 'text-rose-500' }
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-center space-y-1">
                     <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                  </div>
                ))}
             </div>

             {/* Jobs List */}
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">File d'attente active</h3>
                   <FiActivity className="text-primary-500" />
                </div>

                {jobs.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                     <FiCheck className="mx-auto text-emerald-500 w-8 h-8" />
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aucune tâche en cours</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {jobs.map(job => (
                        <div key={job.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 transition-all hover:border-primary-500/30">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                 {job.status === 'processing' ? <FiLoader className="w-5 h-5 text-primary-500 animate-spin" /> : 
                                  job.status === 'completed' ? <FiCheck className="text-emerald-500" /> : <FiClock className="text-amber-500" />}
                                 <div className="min-w-0">
                                    <p className="text-sm font-bold dark:text-white text-slate-900 truncate max-w-[200px]">{job.filename}</p>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                                       {formatFileSize(job.originalSize)} {job.optimizedSize && `→ ${formatFileSize(job.optimizedSize)}`}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 {job.compressionRatio && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">-{job.compressionRatio.toFixed(1)}%</span>}
                                 <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                    job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    job.status === 'processing' ? 'bg-primary-500/10 text-primary-500' : 'bg-amber-500/10 text-amber-500'
                                 }`}>{job.status}</span>
                              </div>
                           </div>

                           {job.status === 'processing' && (
                             <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${job.progress}%` }} 
                                  className="h-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                                />
                             </div>
                           )}
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-end gap-3">
             <button onClick={fetchStatus} className="px-6 py-3 rounded-2xl text-[10px] font-black text-primary-500 uppercase tracking-widest hover:bg-primary-500/5 transition-all">Actualiser stats</button>
             <button onClick={onClose} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">Terminer</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OptimizationStatus;