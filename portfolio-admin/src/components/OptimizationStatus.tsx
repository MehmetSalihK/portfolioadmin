import React, { useState, useEffect, useCallback } from 'react';
import { FiSettings, FiCheck, FiX, FiLoader, FiClock } from 'react-icons/fi';

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
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
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
      console.error('Erreur lors de la récupération du statut:', error);
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    if (isVisible) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 2000); // Actualiser toutes les 2 secondes
      return () => clearInterval(interval);
    }
  }, [isVisible, fetchStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-500" />;
      case 'processing':
        return <FiLoader className="text-blue-500 animate-spin" />;
      case 'completed':
        return <FiCheck className="text-green-500" />;
      case 'failed':
        return <FiX className="text-red-500" />;
      default:
        return <FiSettings className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FiSettings className="text-2xl text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Statut des optimisations
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suivi en temps réel des optimisations d'images
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Statistiques */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Échouées</div>
            </div>
          </div>
        </div>

        {/* Liste des jobs */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="animate-spin text-2xl text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <FiCheck className="text-4xl text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Aucune optimisation en cours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {job.filename}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(job.originalSize)}
                          {job.optimizedSize && (
                            <>
                              {' → '}
                              {formatFileSize(job.optimizedSize)}
                              {job.compressionRatio && (
                                <span className="text-green-600 dark:text-green-400 ml-1">
                                  (-{job.compressionRatio.toFixed(1)}%)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status === 'pending' && 'En attente'}
                      {job.status === 'processing' && 'En cours'}
                      {job.status === 'completed' && 'Terminé'}
                      {job.status === 'failed' && 'Échoué'}
                    </span>
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {job.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Erreur: {job.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Actualisation...' : 'Actualiser'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationStatus;