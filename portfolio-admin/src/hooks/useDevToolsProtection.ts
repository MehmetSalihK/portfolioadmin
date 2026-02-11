import { useEffect } from 'react';

export const useDevToolsProtection = () => {
  useEffect(() => {
    // Ne rien faire en développement pour permettre le débuggage
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // Désactiver le clic droit
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Désactiver les raccourcis clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect, Console, Elements)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Obfuscation de la console
    const disableConsole = () => {
      const emptyFunction = () => {};
      
      // Sauvegarder les méthodes originales au cas où
      // const originalConsole = { ...console };

      // Remplacer les méthodes par des fonctions vides
      (console as any).log = emptyFunction;
      (console as any).warn = emptyFunction;
      (console as any).error = emptyFunction;
      (console as any).info = emptyFunction;
      (console as any).debug = emptyFunction;
      (console as any).trace = emptyFunction;
      (console as any).table = emptyFunction;
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Désactiver la console
    disableConsole();

    // Détection basique du débogueur
    const debugItems = setInterval(() => {
      const start = performance.now();
      // @ts-ignore
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        // Potentiellement en train de déboguer
        // On pourrait rediriger l'utilisateur ou effacer le DOM
        // document.body.innerHTML = 'Security Violation';
      }
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(debugItems);
    };
  }, []);
};
