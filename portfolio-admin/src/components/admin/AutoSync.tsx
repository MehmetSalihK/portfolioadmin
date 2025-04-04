import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function AutoSync() {
    const router = useRouter();

    const lastSyncRef = useRef<string>('');
    const initializedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        async function syncAdmin() {
            if (!isMounted) return;

            try {
                const response = await fetch('/api/admin/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok || !isMounted) return;

                const data = await response.json();
                
                // Vérifier si les données ont changé
                const currentSync = JSON.stringify(data);
                if (currentSync !== lastSyncRef.current && isMounted) {
                    console.log('✅ Synchronisation automatique réussie');
                    lastSyncRef.current = currentSync;
                }
            } catch (error) {
                if (isMounted) {
                    console.error('❌ Erreur lors de la synchronisation:', error);
                }
            }
        }

        // Éviter la double initialisation en strict mode
        if (initializedRef.current) return;
        initializedRef.current = true;

        // Synchroniser au démarrage et configurer l'intervalle
        const TROIS_HEURES = 3 * 60 * 60 * 1000; // 3 heures en millisecondes
        
        const initialSync = async () => {
            await syncAdmin();
            if (isMounted) {
                console.log('🕑 Prochaine synchronisation dans 3 heures');
            }
        };

        initialSync();
        const interval = setInterval(initialSync, TROIS_HEURES);

        // Synchroniser à chaque changement de route (sans message)
        router.events.on('routeChangeComplete', syncAdmin);

        return () => {
            isMounted = false;
            router.events.off('routeChangeComplete', syncAdmin);
            clearInterval(interval);
        };
    }, [router]);

    return null; // Ce composant ne rend rien visuellement
}
