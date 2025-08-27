import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PhotoIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

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
  totalFiles: number;
  optimizedFiles: number;
  totalSavings: number;
  averageCompression: number;
  processingTime: number;
}

const ImageOptimizer: React.FC = () => {
  const [jobs, setJobs] = useState<OptimizationJob[]>([]);
  const [stats, setStats] = useState<OptimizationStats>({
    totalFiles: 0,
    optimizedFiles: 0,
    totalSavings: 0,
    averageCompression: 0,
    processingTime: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(85);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['webp']);
  const [batchSize, setBatchSize] = useState(5);

  const formatOptions = [
    { value: 'webp', label: 'WebP', description: 'Meilleure compression' },
    { value: 'avif', label: 'AVIF', description: 'Compression supérieure (nouveau)' },
    { value: 'jpeg', label: 'JPEG optimisé', description: 'Compatible universel' },
  ];

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await fetch('/api/media/optimize/stats');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Charger les tâches d'optimisation
  const loadJobs = async () => {
    try {
      const response = await fetch('/api/media/optimize/jobs');
      const data = await response.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Erreur chargement jobs:', error);
    }
  };

  // Démarrer l'optimisation en lot
  const startBatchOptimization = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/media/optimize/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality: selectedQuality,
          formats: selectedFormats,
          batchSize,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        loadJobs();
        // Polling pour suivre le progrès
        const interval = setInterval(() => {
          loadJobs();
          loadStats();
        }, 2000);
        
        // Arrêter le polling quand terminé
        setTimeout(() => {
          clearInterval(interval);
          setIsRunning(false);
        }, 60000); // Max 1 minute
      }
    } catch (error) {
      console.error('Erreur optimisation:', error);
      setIsRunning(false);
    }
  };

  // Optimiser un fichier spécifique
  const optimizeFile = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/optimize/${mediaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality: selectedQuality,
          formats: selectedFormats,
        }),
      });
      
      if (response.ok) {
        loadJobs();
        loadStats();
      }
    } catch (error) {
      console.error('Erreur optimisation fichier:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadJobs();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <CogIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Optimiseur d'images
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Optimisez automatiquement vos images pour de meilleures performances
            </p>
          </div>
          <PhotoIcon className="h-12 w-12 text-blue-500" />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total fichiers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalFiles}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimisés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.optimizedFiles}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <ArrowPathIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Économies totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatFileSize(stats.totalSavings)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compression moy.</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageCompression.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuration d'optimisation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Qualité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualité ({selectedQuality}%)
              </label>
              <input
                type="range"
                min="60"
                max="100"
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Plus petit</span>
                <span>Meilleure qualité</span>
              </div>
            </div>
            
            {/* Formats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formats de sortie
              </label>
              <div className="space-y-2">
                {formatOptions.map((format) => (
                  <label key={format.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFormats.includes(format.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFormats([...selectedFormats, format.value]);
                        } else {
                          setSelectedFormats(selectedFormats.filter(f => f !== format.value));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {format.label}
                      </span>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Taille de lot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Taille de lot
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={1}>1 fichier</option>
                <option value={5}>5 fichiers</option>
                <option value={10}>10 fichiers</option>
                <option value={20}>20 fichiers</option>
              </select>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={startBatchOptimization}
              disabled={isRunning || selectedFormats.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isRunning ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <CogIcon className="h-5 w-5" />
              )}
              {isRunning ? 'Optimisation en cours...' : 'Démarrer l\'optimisation'}
            </button>
            
            <button
              onClick={() => {
                loadJobs();
                loadStats();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tâches d'optimisation
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.filename}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Taille originale: {formatFileSize(job.originalSize)}</span>
                        {job.optimizedSize && (
                          <span>Optimisée: {formatFileSize(job.optimizedSize)}</span>
                        )}
                        {job.compressionRatio && (
                          <span className="text-green-600 dark:text-green-400">
                            -{job.compressionRatio.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status === 'pending' && 'En attente'}
                      {job.status === 'processing' && 'En cours'}
                      {job.status === 'completed' && 'Terminé'}
                      {job.status === 'failed' && 'Échec'}
                    </span>
                    
                    {job.status === 'processing' && (
                      <div className="w-32">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {job.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {job.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400">
                    {job.error}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {jobs.length === 0 && (
            <div className="p-12 text-center">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune tâche d'optimisation en cours
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageOptimizer;