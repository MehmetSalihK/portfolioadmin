import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

interface AnalyticsData {
  page: string;
  sessionId: string;
  timeSpent: number;
  action: 'visit' | 'update' | 'exit';
}

interface UseAnalyticsOptions {
  enabled?: boolean;
  updateInterval?: number; // en millisecondes
  trackTimeSpent?: boolean;
}

const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    enabled = true,
    updateInterval = 30000, // 30 secondes par défaut
    trackTimeSpent = true
  } = options;

  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Générer ou récupérer l'ID de session
  useEffect(() => {
    if (!enabled) return;

    let storedSessionId = sessionStorage.getItem('analytics_session_id');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, [enabled]);

  // Fonction pour envoyer les données d'analytics
  const sendAnalytics = useCallback(async (data: Partial<AnalyticsData>) => {
    if (!enabled || !sessionId) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: router.asPath,
          sessionId,
          ...data
        }),
      });
    } catch (error) {
      console.error('Error sending analytics:', error);
    }
  }, [enabled, sessionId, router.asPath]);

  // Calculer le temps passé
  const getTimeSpent = useCallback((): number => {
    if (!trackTimeSpent || startTimeRef.current === 0) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, [trackTimeSpent]);

  // Démarrer le tracking
  const startTracking = useCallback(async () => {
    if (!enabled || !sessionId || isTracking) return;

    setIsTracking(true);
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();

    // Envoyer la visite initiale
    await sendAnalytics({ action: 'visit' });

    // Configurer l'intervalle de mise à jour
    if (trackTimeSpent && updateInterval > 0) {
      intervalRef.current = setInterval(async () => {
        const timeSpent = getTimeSpent();
        await sendAnalytics({
          action: 'update',
          timeSpent
        });
        lastUpdateRef.current = Date.now();
      }, updateInterval);
    }
  }, [enabled, sessionId, isTracking, trackTimeSpent, updateInterval, sendAnalytics, getTimeSpent]);

  // Arrêter le tracking
  const stopTracking = useCallback(async () => {
    if (!enabled || !sessionId || !isTracking) return;

    setIsTracking(false);

    // Nettoyer l'intervalle
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Envoyer les données de sortie
    const timeSpent = getTimeSpent();
    await sendAnalytics({
      action: 'exit',
      timeSpent
    });

    startTimeRef.current = 0;
  }, [enabled, sessionId, isTracking, getTimeSpent, sendAnalytics]);

  // Tracking des changements de page
  useEffect(() => {
    if (!enabled) return;

    const handleRouteChangeStart = () => {
      stopTracking();
    };

    const handleRouteChangeComplete = () => {
      // Petit délai pour s'assurer que la page est chargée
      setTimeout(() => {
        startTracking();
      }, 100);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    // Démarrer le tracking pour la page actuelle
    if (sessionId && router.isReady) {
      startTracking();
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      stopTracking();
    };
  }, [enabled, sessionId, router.isReady, router.events, startTracking, stopTracking]);

  // Tracking de la visibilité de la page
  useEffect(() => {
    if (!enabled || !trackTimeSpent) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée - arrêter temporairement le tracking
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page visible - reprendre le tracking
        if (isTracking && trackTimeSpent && updateInterval > 0) {
          intervalRef.current = setInterval(async () => {
            const timeSpent = getTimeSpent();
            await sendAnalytics({
              action: 'update',
              timeSpent
            });
            lastUpdateRef.current = Date.now();
          }, updateInterval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isTracking, trackTimeSpent, updateInterval, getTimeSpent, sendAnalytics]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Tracking des événements de fermeture de page
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (isTracking) {
        const timeSpent = getTimeSpent();
        // Utiliser sendBeacon pour un envoi fiable lors de la fermeture
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/track', JSON.stringify({
            page: router.asPath,
            sessionId,
            action: 'exit',
            timeSpent
          }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, isTracking, sessionId, router.asPath, getTimeSpent]);

  return {
    sessionId,
    isTracking,
    timeSpent: getTimeSpent(),
    startTracking,
    stopTracking,
    sendAnalytics
  };
};

export default useAnalytics;