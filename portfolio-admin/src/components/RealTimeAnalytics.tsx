import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiUsers, FiGlobe, FiMonitor, FiClock } from 'react-icons/fi';

interface RealTimeData {
  activeVisitors: number;
  newVisitsLastMinute: number;
  topPages: Array<{
    page: string;
    activeVisitors: number;
  }>;
  recentActivity: Array<{
    id: string;
    page: string;
    location: string;
    device: string;
    timestamp: string;
    timeAgo: string;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  countryStats: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  minutelyVisits: Array<{
    minute: number;
    visits: number;
  }>;
}

const RealTimeAnalytics: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données temps réel');
      }
      const data = await response.json();
      setRealTimeData(data);
      setError(null);
    } catch (err) {
      console.error('Erreur temps réel:', err);
      setError('Impossible de charger les données temps réel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-500">Chargement des données temps réel...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!realTimeData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Indicateurs temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Visiteurs actifs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {realTimeData.activeVisitors}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  En ligne maintenant
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <FiActivity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Nouvelles visites
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {realTimeData.newVisitsLastMinute}
              </p>
              <div className="flex items-center mt-2">
                <FiClock className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Dernière minute
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Pages populaires
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {realTimeData.topPages.length}
              </p>
              <div className="flex items-center mt-2">
                <FiGlobe className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Pages actives
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <FiGlobe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Appareils connectés
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {realTimeData.deviceStats.reduce((sum, device) => sum + device.count, 0)}
              </p>
              <div className="flex items-center mt-2">
                <FiMonitor className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Tous types
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <FiMonitor className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activité récente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Activité en temps réel
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mise à jour automatique
            </span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {realTimeData.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucune activité récente
            </div>
          ) : (
            realTimeData.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {activity.page}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.location} • {activity.device}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.timeAgo}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Pages populaires en temps réel */}
      {realTimeData.topPages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Pages populaires maintenant
          </h3>
          
          <div className="space-y-3">
            {realTimeData.topPages.map((page, index) => (
              <div
                key={page.page}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {page.page}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {page.activeVisitors}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    visiteurs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeAnalytics;