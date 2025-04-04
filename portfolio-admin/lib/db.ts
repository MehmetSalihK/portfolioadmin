import mongoose from 'mongoose';
import initializeAdmin from './init-admin';
import { startEnvWatcher } from '../src/lib/env-watcher';

interface GlobalWithMongoose extends Global {
    mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}

declare const global: GlobalWithMongoose;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Assurer que MONGODB_URI est une chaîne
const MONGODB_URI_STRING: string = MONGODB_URI;

const cached = global.mongoose ?? (global.mongoose = { conn: null, promise: null });

async function dbConnect() {
    try {
        if (!cached.conn) {
            const opts = {
                bufferCommands: false,
            };

            if (!cached.promise) {
                cached.promise = mongoose.connect(MONGODB_URI_STRING);
            }

            cached.conn = await cached.promise;
        }

        // Vérifier si la connexion est établie
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ La connexion MongoDB n\'est pas établie');
            return cached.conn;
        }

        console.log('🔑 Initialisation de la base de données...');

        // Synchroniser l'admin au démarrage
        await initializeAdmin();

        // Démarrer le watcher en mode développement
        if (process.env.NODE_ENV !== 'production') {
            console.log('👀 Démarrage de la surveillance des changements...');
            startEnvWatcher();
        }

        return cached.conn;
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error);
        cached.promise = null;
        throw error;
    }
}

export default dbConnect;
