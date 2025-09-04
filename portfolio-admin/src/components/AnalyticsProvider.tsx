'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsContextType {
  trackEvent: (eventName: string, eventData?: any) => void;
  trackPageView: (page: string) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  enabled = true 
}) => {
  const router = useRouter();
  const sessionIdRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const currentPageRef = useRef<string>('');
  const isTrackingRef = useRef<boolean>(false);

  // Initialiser ou récupérer le sessionId
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      sessionIdRef.current = sessionId;
    }
  }, []);

  // Fonction pour envoyer les données analytics
  const sendAnalytics = async (data: any, action: string = 'visit') => {
    if (!enabled) return;
    
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          action,
          sessionId: sessionIdRef.current
        }),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi des analytics:', error);
    }
  };

  // Fonction pour tracker une page
  const trackPageView = async (page: string) => {
    if (!enabled || !sessionIdRef.current) return;

    // Si on track déjà une page, on termine d'abord le tracking précédent
    if (isTrackingRef.current && currentPageRef.current) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      await sendAnalytics({
        page: currentPageRef.current,
        timeSpent
      }, 'update');
    }

    // Commencer le tracking de la nouvelle page
    currentPageRef.current = page;
    startTimeRef.current = Date.now();
    isTrackingRef.current = true;

    await sendAnalytics({ page }, 'visit');
  };

  // Fonction pour tracker un événement personnalisé
  const trackEvent = async (eventName: string, eventData?: any) => {
    if (!enabled) return;
    
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          data: eventData,
          page: currentPageRef.current,
          sessionId: sessionIdRef.current,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Erreur lors du tracking d\'événement:', error);
    }
  };

  // Tracker les changements de route
  useEffect(() => {
    if (!enabled) return;

    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    // Tracker la page initiale
    if (router.asPath) {
      trackPageView(router.asPath);
    }

    // Écouter les changements de route
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, enabled]);

  // Tracker la sortie de la page
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = async () => {
      if (isTrackingRef.current && currentPageRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        // Utiliser sendBeacon pour un envoi fiable lors de la fermeture
        if (navigator.sendBeacon) {
          const data = JSON.stringify({
            page: currentPageRef.current,
            timeSpent,
            action: 'exit',
            sessionId: sessionIdRef.current
          });
          
          navigator.sendBeacon('/api/analytics/track', data);
        } else {
          await sendAnalytics({
            page: currentPageRef.current,
            timeSpent
          }, 'exit');
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBeforeUnload();
      } else if (currentPageRef.current) {
        // Reprendre le tracking quand la page redevient visible
        startTimeRef.current = Date.now();
        trackPageView(currentPageRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    sessionId: sessionIdRef.current
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;