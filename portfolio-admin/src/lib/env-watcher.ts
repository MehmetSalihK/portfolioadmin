import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import initializeAdmin from './init-admin';
import mongoose from 'mongoose';

let watcher: FSWatcher | null = null;

// Fonction pour recharger les variables d'environnement
async function reloadEnvFile() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(envPath)) {
            console.error('❌ Fichier .env.local non trouvé');
            return;
        }

        // Lire le contenu du fichier
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Extraire ADMIN_EMAIL et ADMIN_PASSWORD
        const emailMatch = envContent.match(/ADMIN_EMAIL=(.+)/);
        const passwordMatch = envContent.match(/ADMIN_PASSWORD=(.+)/);

        if (emailMatch && passwordMatch) {
            const oldEmail = process.env.ADMIN_EMAIL;
            const oldPassword = process.env.ADMIN_PASSWORD;

            process.env.ADMIN_EMAIL = emailMatch[1];
            process.env.ADMIN_PASSWORD = passwordMatch[1];

            // Vérifier si les valeurs ont changé
            if (oldEmail !== process.env.ADMIN_EMAIL || oldPassword !== process.env.ADMIN_PASSWORD) {
                console.log('📝 Changements détectés dans .env.local');
                
                // Si la connexion MongoDB est établie, synchroniser l'admin
                if (mongoose.connection.readyState === 1) {
                    console.log('🔑 Synchronisation des identifiants admin...');
                    await initializeAdmin();
                    console.log('✅ Synchronisation terminée avec succès');
                } else {
                    console.log('⚠️ La connexion MongoDB n\'est pas établie');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error);
    }
}

// Démarrer le watcher
export function startEnvWatcher() {
    // Arrêter le watcher précédent s'il existe
    if (watcher) {
        watcher.close();
    }

    const envPath = path.resolve(process.cwd(), '.env.local');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(envPath)) {
        console.error('❌ Fichier .env.local non trouvé');
        return;
    }

    console.log('👀 Démarrage de la surveillance du fichier .env.local...');

    watcher = chokidar.watch(envPath, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
            stabilityThreshold: 500, // Attendre 500ms de stabilité
            pollInterval: 100
        }
    });

    watcher.on('change', async (path: string) => {
        console.log('📝 Modification détectée dans .env.local');
        await reloadEnvFile();
    });

    // Synchronisation initiale
    reloadEnvFile();
}
