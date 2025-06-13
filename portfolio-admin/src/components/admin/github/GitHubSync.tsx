import React, { useState } from 'react';
import { FiGithub, FiRefreshCw, FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi';
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archiveRemoved
        })
      });

      const data: SyncResponse = await response.json();

      if (data.success) {
        toast.success(data.message);
        setSyncStats(data.stats);
        setLastSync(data.lastSync);
        
        if (data.errors && data.errors.length > 0) {
          console.warn('Sync completed with errors:', data.errors);
          toast.error(`Synchronisation terminée avec ${data.errors.length} erreur(s)`);
        }
      } else {
        toast.error(data.message || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erreur de connexion lors de la synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FiGithub className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Synchronisation GitHub
          </h2>
        </div>
        
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synchronisation...' : 'Synchroniser'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">À propos de la synchronisation GitHub</p>
              <p>
                Cette fonctionnalité récupère automatiquement vos repositories publics depuis GitHub 
                et les ajoute à votre portfolio. Les projets existants seront mis à jour avec les 
                dernières informations.
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={archiveRemoved}
              onChange={(e) => setArchiveRemoved(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Archiver les projets GitHub supprimés ou rendus privés
            </span>
          </label>
        </div>

        {/* Dernière synchronisation */}
        {lastSync && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium">Dernière synchronisation réussie</p>
                <p>{formatDate(lastSync)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        {syncStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {syncStats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total trouvés
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {syncStats.created}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Créés
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {syncStats.updated}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Mis à jour
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {syncStats.errors}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Erreurs
              </div>
            </div>
          </div>
        )}

        {/* Avertissement */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Important</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Seuls les repositories publics avec une description seront importés</li>
                <li>Les repositories de configuration (.github, README) sont exclus</li>
                <li>Les images personnalisées des projets existants seront préservées</li>
                <li>La synchronisation peut prendre quelques secondes selon le nombre de repositories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubSync;