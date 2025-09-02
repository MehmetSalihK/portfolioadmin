import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiEye, FiEyeOff, FiRefreshCw, FiExternalLink, FiMonitor, FiSmartphone, FiTablet } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getPreviewUrl } from '@/utils/getBaseUrl';

interface LivePreviewProps {
  isVisible: boolean;
  onToggle: () => void;
  previewUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const devices: Record<DeviceType, DeviceConfig> = {
  desktop: {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: FiMonitor,
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: FiTablet,
  },
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: FiSmartphone,
  },
};

const LivePreview: React.FC<LivePreviewProps> = ({
  isVisible,
  onToggle,
  previewUrl = getPreviewUrl(),
  autoRefresh = true,
  refreshInterval = 2000,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(autoRefresh);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour rafraîchir la prévisualisation
  const refreshPreview = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      const timestamp = Date.now();
      const separator = previewUrl.includes('?') ? '&' : '?';
      iframeRef.current.src = `${previewUrl}${separator}_refresh=${timestamp}`;
      setLastRefresh(timestamp);
    }
  }, [previewUrl]);

  // Gestion du rafraîchissement automatique
  useEffect(() => {
    if (isVisible && isAutoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        refreshPreview();
      }, refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isVisible, isAutoRefreshEnabled, refreshInterval, refreshPreview]);

  // Gestion du chargement de l'iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const currentDevice = devices[selectedDevice];
  const scale = selectedDevice === 'desktop' ? 0.8 : selectedDevice === 'tablet' ? 0.9 : 1;

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onToggle}
        className="fixed top-1/2 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-colors"
        title="Afficher la prévisualisation"
      >
        <FiEye className="text-xl" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-2xl z-40 flex flex-col"
        style={{ width: '50vw', minWidth: '600px' }}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiEye className="text-xl text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Prévisualisation en temps réel
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dernière mise à jour: {new Date(lastRefresh).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sélecteur de device */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {Object.entries(devices).map(([key, device]) => {
                const Icon = device.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDevice(key as DeviceType)}
                    className={`p-2 rounded transition-colors ${
                      selectedDevice === key
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={device.name}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>

            {/* Contrôles */}
            <button
              onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
              className={`p-2 rounded transition-colors ${
                isAutoRefreshEnabled
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
              title={isAutoRefreshEnabled ? 'Désactiver le rafraîchissement automatique' : 'Activer le rafraîchissement automatique'}
            >
              <FiRefreshCw className={`text-sm ${isAutoRefreshEnabled ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={refreshPreview}
              disabled={isLoading}
              className="p-2 rounded bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
              title="Rafraîchir manuellement"
            >
              <FiRefreshCw className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openInNewTab}
              className="p-2 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <FiExternalLink className="text-sm" />
            </button>

            <button
              onClick={onToggle}
              className="p-2 rounded bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              title="Fermer la prévisualisation"
            >
              <FiEyeOff className="text-sm" />
            </button>
          </div>
        </div>

        {/* Zone de prévisualisation */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{
                width: currentDevice.width * scale,
                height: currentDevice.height * scale,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              {/* Barre d'adresse simulée */}
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-600 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
                  {previewUrl}
                </div>
              </div>

              {/* Iframe de prévisualisation */}
              <div className="relative" style={{ height: currentDevice.height * scale - 40 }}>
                {isLoading && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FiRefreshCw className="animate-spin" />
                      <span>Chargement...</span>
                    </div>
                  </div>
                )}
                
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  title="Prévisualisation du portfolio"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations sur le device */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {currentDevice.name}: {currentDevice.width} × {currentDevice.height}px
            </span>
            <span>
              Échelle: {Math.round(scale * 100)}%
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LivePreview;