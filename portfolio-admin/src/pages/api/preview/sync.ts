import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

interface PreviewSyncMessage {
  type: 'content_changed' | 'force_refresh' | 'ping';
  changes?: string[];
  timestamp: number;
  source?: string;
}

interface ConnectedClient {
  id: string;
  type: 'admin' | 'preview';
  lastActivity: number;
  metadata?: Record<string, any>;
}

class PreviewSyncManager {
  private static instance: PreviewSyncManager;
  private clients: Map<string, ConnectedClient> = new Map();
  private io: SocketIOServer | null = null;
  private changeQueue: PreviewSyncMessage[] = [];
  private maxQueueSize = 100;

  static getInstance(): PreviewSyncManager {
    if (!PreviewSyncManager.instance) {
      PreviewSyncManager.instance = new PreviewSyncManager();
    }
    return PreviewSyncManager.instance;
  }

  setIO(io: SocketIOServer) {
    this.io = io;
  }

  addClient(clientId: string, type: 'admin' | 'preview', metadata?: Record<string, any>) {
    this.clients.set(clientId, {
      id: clientId,
      type,
      lastActivity: Date.now(),
      metadata,
    });
    
    console.log(`Client ${type} connecté: ${clientId}`);
    this.broadcastClientUpdate();
  }

  removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`Client ${client.type} déconnecté: ${clientId}`);
      this.broadcastClientUpdate();
    }
  }

  updateClientActivity(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastActivity = Date.now();
    }
  }

  broadcastChange(message: PreviewSyncMessage, fromClientId?: string) {
    if (!this.io) return;

    // Ajouter à la queue
    this.changeQueue.push({
      ...message,
      timestamp: Date.now(),
    });

    // Limiter la taille de la queue
    if (this.changeQueue.length > this.maxQueueSize) {
      this.changeQueue = this.changeQueue.slice(-this.maxQueueSize);
    }

    // Diffuser aux clients de prévisualisation
    this.clients.forEach((client, clientId) => {
      if (client.type === 'preview' && clientId !== fromClientId) {
        this.io?.to(clientId).emit('preview_update', message);
      }
    });

    // Notifier les clients admin des changements
    this.clients.forEach((client, clientId) => {
      if (client.type === 'admin' && clientId !== fromClientId) {
        this.io?.to(clientId).emit('sync_status', {
          type: 'change_broadcasted',
          timestamp: Date.now(),
          previewClients: Array.from(this.clients.values()).filter(c => c.type === 'preview').length,
        });
      }
    });
  }

  private broadcastClientUpdate() {
    if (!this.io) return;

    const stats = {
      total: this.clients.size,
      admin: Array.from(this.clients.values()).filter(c => c.type === 'admin').length,
      preview: Array.from(this.clients.values()).filter(c => c.type === 'preview').length,
      lastUpdate: Date.now(),
    };

    this.io.emit('client_stats', stats);
  }

  getRecentChanges(limit = 10): PreviewSyncMessage[] {
    return this.changeQueue.slice(-limit);
  }

  getConnectedClients(): ConnectedClient[] {
    return Array.from(this.clients.values());
  }

  // Nettoyer les clients inactifs
  cleanupInactiveClients(maxInactiveMs = 5 * 60 * 1000) { // 5 minutes
    const now = Date.now();
    const toRemove: string[] = [];

    this.clients.forEach((client, clientId) => {
      if (now - client.lastActivity > maxInactiveMs) {
        toRemove.push(clientId);
      }
    });

    toRemove.forEach(clientId => {
      this.removeClient(clientId);
    });

    if (toRemove.length > 0) {
      console.log(`Nettoyage: ${toRemove.length} clients inactifs supprimés`);
    }
  }
}

const syncManager = PreviewSyncManager.getInstance();

// Nettoyer les clients inactifs toutes les minutes
setInterval(() => {
  syncManager.cleanupInactiveClients();
}, 60 * 1000);

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier si Socket.IO est déjà initialisé
  if (!res.socket.server.io) {
    console.log('Initialisation du serveur Socket.IO pour la prévisualisation...');
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/preview/sync',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'development' ? '*' : false,
        methods: ['GET', 'POST'],
      },
    });

    res.socket.server.io = io;
    syncManager.setIO(io);

    io.on('connection', (socket: Socket) => {
      const clientId = socket.id;
      const clientType = socket.handshake.query.type as 'admin' | 'preview' || 'preview';
      const userAgent = socket.handshake.headers['user-agent'];
      
      syncManager.addClient(clientId, clientType, {
        userAgent,
        connectedAt: Date.now(),
      });

      // Envoyer l'état initial
      socket.emit('connection_established', {
        clientId,
        type: clientType,
        recentChanges: syncManager.getRecentChanges(),
        connectedClients: syncManager.getConnectedClients().length,
      });

      // Gestion des messages de changement
      socket.on('content_changed', (data: PreviewSyncMessage) => {
        syncManager.updateClientActivity(clientId);
        syncManager.broadcastChange(data, clientId);
      });

      // Ping pour maintenir la connexion
      socket.on('ping', () => {
        syncManager.updateClientActivity(clientId);
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Demande de rafraîchissement forcé
      socket.on('force_refresh', () => {
        syncManager.updateClientActivity(clientId);
        syncManager.broadcastChange({
          type: 'force_refresh',
          timestamp: Date.now(),
        }, clientId);
      });

      // Demande de statistiques
      socket.on('get_stats', () => {
        syncManager.updateClientActivity(clientId);
        socket.emit('stats_update', {
          connectedClients: syncManager.getConnectedClients(),
          recentChanges: syncManager.getRecentChanges(),
          timestamp: Date.now(),
        });
      });

      // Déconnexion
      socket.on('disconnect', (reason: string) => {
        console.log(`Client déconnecté: ${clientId}, raison: ${reason}`);
        syncManager.removeClient(clientId);
      });

      // Gestion des erreurs
      socket.on('error', (error: Error) => {
        console.error(`Erreur Socket.IO pour ${clientId}:`, error);
      });
    });

    console.log('Serveur Socket.IO initialisé pour la prévisualisation');
  }

  res.status(200).json({
    success: true,
    message: 'Serveur de synchronisation de prévisualisation actif',
    connectedClients: syncManager.getConnectedClients().length,
    recentChanges: syncManager.getRecentChanges(5).length,
  });
}

// Export du manager pour utilisation dans d'autres APIs
export { syncManager as previewSyncManager };