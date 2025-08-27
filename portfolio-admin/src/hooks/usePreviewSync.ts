import { useState, useEffect, useRef, useCallback } from 'react';

interface PreviewSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface PreviewSyncState {
  isConnected: boolean;
  lastSync: number;
  syncCount: number;
  errors: string[];
}

/**
 * Hook personnalisé pour synchroniser les modifications avec la prévisualisation en temps réel
 */
export const usePreviewSync = (options: PreviewSyncOptions = {}) => {
  const {
    enabled = true,
    debounceMs = 500,
    maxRetries = 3,
    retryDelayMs = 1000,
  } = options;

  const [state, setState] = useState<PreviewSyncState>({
    isConnected: false,
    lastSync: 0,
    syncCount: 0,
    errors: [],
  });

  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);

  // Fonction pour établir la connexion WebSocket
  const connectWebSocket = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/preview/sync`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          errors: [],
        }));
        retryCountRef.current = 0;
      };

      wsRef.current.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Tentative de reconnexion automatique
        if (enabled && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          retryTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, retryDelayMs * retryCountRef.current);
        }
      };

      wsRef.current.onerror = (error) => {
        setState(prev => ({
          ...prev,
          errors: [...prev.errors.slice(-4), `Erreur WebSocket: ${error}`],
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sync_complete') {
            setState(prev => ({
              ...prev,
              lastSync: Date.now(),
              syncCount: prev.syncCount + 1,
            }));
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-4), `Erreur de connexion: ${error}`],
      }));
    }
  }, [enabled, maxRetries, retryDelayMs]);

  // Fonction pour envoyer les changements
  const sendChanges = useCallback(async (changes: Set<string>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = {
        type: 'content_changed',
        changes: Array.from(changes),
        timestamp: Date.now(),
      };

      wsRef.current.send(JSON.stringify(message));
      setPendingChanges(new Set());
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-4), `Erreur d'envoi: ${error}`],
      }));
    }
  }, []);

  // Fonction pour notifier un changement
  const notifyChange = useCallback((changeId: string) => {
    if (!enabled) return;

    setPendingChanges(prev => new Set([...Array.from(prev), changeId]));

    // Debounce les changements
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setPendingChanges(current => {
        if (current.size > 0) {
          sendChanges(current);
        }
        return new Set();
      });
    }, debounceMs);
  }, [enabled, debounceMs, sendChanges]);

  // Fonction pour forcer la synchronisation
  const forceSync = useCallback(() => {
    if (pendingChanges.size > 0) {
      sendChanges(pendingChanges);
    } else {
      // Envoyer un ping pour forcer le rafraîchissement
      notifyChange('force_refresh');
    }
  }, [pendingChanges, sendChanges, notifyChange]);

  // Fonction pour nettoyer les erreurs
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }));
  }, []);

  // Établir la connexion au montage
  useEffect(() => {
    if (enabled) {
      connectWebSocket();
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled, connectWebSocket]);

  // Fonction pour reconnecter manuellement
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    retryCountRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  return {
    // État
    isConnected: state.isConnected,
    lastSync: state.lastSync,
    syncCount: state.syncCount,
    errors: state.errors,
    hasPendingChanges: pendingChanges.size > 0,
    
    // Actions
    notifyChange,
    forceSync,
    reconnect,
    clearErrors,
  };
};

// Hook pour surveiller les changements de contenu
export const useContentChangeDetector = () => {
  const [lastChange, setLastChange] = useState<number>(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const { notifyChange } = usePreviewSync();

  const startWatching = useCallback((targetElement?: Element) => {
    const target = targetElement || document.body;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new MutationObserver((mutations) => {
      let hasContentChange = false;
      
      mutations.forEach((mutation) => {
        // Ignorer les changements de style et d'attributs non-critiques
        if (mutation.type === 'childList' || 
            (mutation.type === 'attributes' && 
             ['src', 'href', 'alt', 'title'].includes(mutation.attributeName || ''))) {
          hasContentChange = true;
        }
      });

      if (hasContentChange) {
        const now = Date.now();
        setLastChange(now);
        notifyChange(`content_${now}`);
      }
    });

    observerRef.current.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'href', 'alt', 'title', 'class'],
    });
  }, [notifyChange]);

  const stopWatching = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    lastChange,
    startWatching,
    stopWatching,
  };
};