import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import initializeAdmin from './init-admin';
import mongoose from 'mongoose';

let watcher: FSWatcher | null = null;

async function reloadEnvFile() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        
        if (!fs.existsSync(envPath)) {
            console.error('❌ Fichier .env.local non trouvé');
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        
        const emailMatch = envContent.match(/ADMIN_EMAIL=(.+)/);
        const passwordMatch = envContent.match(/ADMIN_PASSWORD=(.+)/);

        if (emailMatch && passwordMatch) {
            const oldEmail = process.env.ADMIN_EMAIL;
            const oldPassword = process.env.ADMIN_PASSWORD;

            process.env.ADMIN_EMAIL = emailMatch[1];
            process.env.ADMIN_PASSWORD = passwordMatch[1];

            if (oldEmail !== process.env.ADMIN_EMAIL || oldPassword !== process.env.ADMIN_PASSWORD) {
                console.log('📝 Changements détectés dans .env.local');
                
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

export function startEnvWatcher() {
    if (watcher) {
        watcher.close();
    }

    const envPath = path.resolve(process.cwd(), '.env.local');
    
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

    reloadEnvFile();
}
