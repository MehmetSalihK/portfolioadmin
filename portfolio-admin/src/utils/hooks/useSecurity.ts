import { useEffect } from 'react';

export const useSecurity = () => {
  useEffect(() => {
    // Fonction pour nettoyer TOUTES les données de stockage
    const clearAllStorage = () => {
      try {
        if (localStorage.length > 0) localStorage.clear();
        if (sessionStorage.length > 0) sessionStorage.clear();
      } catch (e) {
        // Ignorer
      }
    };

    // Silence total de la console
    const silenceConsole = () => {
      const noop = () => { };
      console.log = noop;
      console.warn = noop;
      console.error = noop;
      console.info = noop;
      console.debug = noop;
      console.clear();
    };

    // Maintenance Check
    const checkMaintenance = async () => {
      // Ignorer si on est sur la page de maintenance ou dans l'admin
      if (window.location.pathname === '/maintenance' || window.location.pathname.startsWith('/admin')) {
        return;
      }

      try {
        const res = await fetch('/api/maintenance');
        if (res.ok) {
          const data = await res.json();
          // Si maintenance active (manuelle ou planifiée)
          if (data.isActive) {
            window.location.href = '/maintenance';
          }
        }
      } catch (error) {
        // Silently fail
      }
    };

    checkMaintenance();

    // Exécuter immédiatement au montage
    clearAllStorage();
    silenceConsole();

    // Aussi écouter les erreurs globales pour les étouffer
    window.onerror = () => true;
    window.onunhandledrejection = () => true;

    window.addEventListener('storage', clearAllStorage);

    return () => {
      // Nettoyage des écouteurs uniquement
      window.removeEventListener('storage', clearAllStorage);
    };
  }, []);
};

export default useSecurity;
