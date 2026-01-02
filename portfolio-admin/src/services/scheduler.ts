import cron from 'node-cron';
import connectDB from '../lib/db';
import Backup from '../models/Backup';
import Project from '../models/Project';
import Skill from '../models/Skill';
import Media from '../models/Media';
import Experience from '../models/Experience';
import Education from '../models/Education';
import Category from '../models/Category';

import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Interface pour les tâches planifiées
interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  type: 'full' | 'incremental' | 'differential';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  task?: any;
}

// Gestionnaire de tâches planifiées
class BackupScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private isInitialized = false;

  // Initialiser le planificateur avec les tâches par défaut
  async initialize() {
    if (this.isInitialized) return;

    try {
      await connectDB();

      // Tâches par défaut
      const defaultTasks: Omit<ScheduledTask, 'id' | 'task'>[] = [
        {
          name: 'Sauvegarde complète quotidienne',
          schedule: '0 2 * * *', // Tous les jours à 2h du matin
          type: 'full',
          enabled: true,
        },
        {
          name: 'Sauvegarde incrémentale toutes les 6h',
          schedule: '0 */6 * * *', // Toutes les 6 heures
          type: 'incremental',
          enabled: true,
        },
        {
          name: 'Sauvegarde différentielle hebdomadaire',
          schedule: '0 3 * * 0', // Tous les dimanches à 3h du matin
          type: 'differential',
          enabled: false, // Désactivée par défaut
        },
      ];

      // Créer les tâches par défaut
      for (const taskConfig of defaultTasks) {
        const taskId = this.generateTaskId(taskConfig.name);
        await this.createTask(taskId, taskConfig);
      }

      // Démarrer le nettoyage automatique des anciennes sauvegardes
      this.scheduleCleanup();

      // Démarrer la synchronisation GitHub automatique
      this.scheduleGitHubSync();

      this.isInitialized = true;
      console.log('✅ Planificateur de sauvegardes initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du planificateur:', error);
    }
  }

  // Créer une nouvelle tâche planifiée
  async createTask(id: string, config: Omit<ScheduledTask, 'id' | 'task'>) {
    try {
      // Valider le cron
      if (!cron.validate(config.schedule)) {
        throw new Error(`Format cron invalide: ${config.schedule}`);
      }

      // Arrêter la tâche existante si elle existe
      if (this.tasks.has(id)) {
        await this.stopTask(id);
      }

      const task: ScheduledTask = {
        id,
        ...config,
        nextRun: this.getNextRunDate(config.schedule),
      };

      // Créer la tâche cron
      if (config.enabled) {
        task.task = cron.schedule(config.schedule, async () => {
          await this.executeBackup(id, config.type);
        }, {
          timezone: 'Europe/Paris',
        });
      }

      this.tasks.set(id, task);

      if (config.enabled && task.task) {
        task.task.start();
        console.log(`📅 Tâche planifiée créée: ${config.name} (${config.schedule})`);
      }

      return task;
    } catch (error) {
      console.error(`❌ Erreur lors de la création de la tâche ${id}:`, error);
      throw error;
    }
  }

  // Démarrer une tâche
  async startTask(id: string) {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Tâche non trouvée: ${id}`);
    }

    if (!task.task) {
      task.task = cron.schedule(task.schedule, async () => {
        await this.executeBackup(id, task.type);
      }, {
        timezone: 'Europe/Paris',
      });
    }

    task.task.start();
    task.enabled = true;
    task.nextRun = this.getNextRunDate(task.schedule);

    console.log(`▶️ Tâche démarrée: ${task.name}`);
  }

  // Arrêter une tâche
  async stopTask(id: string) {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Tâche non trouvée: ${id}`);
    }

    if (task.task) {
      task.task.stop();
      task.task.destroy();
      task.task = undefined;
    }

    task.enabled = false;
    task.nextRun = undefined;

    console.log(`⏹️ Tâche arrêtée: ${task.name}`);
  }

  // Supprimer une tâche
  async removeTask(id: string) {
    await this.stopTask(id);
    this.tasks.delete(id);
    console.log(`🗑️ Tâche supprimée: ${id}`);
  }

  // Exécuter une sauvegarde
  async executeBackup(taskId: string, type: 'full' | 'incremental' | 'differential') {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      console.log(`🔄 Début de la sauvegarde ${type} (${task.name})`);

      const startTime = Date.now();
      task.lastRun = new Date();
      task.nextRun = this.getNextRunDate(task.schedule);

      // Connecter à la base de données
      await connectDB();

      // Collecter les données selon le type de sauvegarde
      let data: any = {};
      let metadata: any = {
        totalEntities: 0,
        entitiesByType: {},
      };

      if (type === 'full') {
        data = await this.collectFullData();
      } else if (type === 'incremental') {
        data = await this.collectIncrementalData();
      } else if (type === 'differential') {
        data = await this.collectDifferentialData();
      }

      // Calculer les métadonnées
      for (const [entityType, entities] of Object.entries(data)) {
        if (Array.isArray(entities)) {
          metadata.entitiesByType[entityType] = entities.length;
          metadata.totalEntities += entities.length;
        }
      }

      // Compresser les données
      const compressedData = await gzip(JSON.stringify(data));

      // Calculer le checksum
      const checksum = crypto.createHash('sha256')
        .update(compressedData)
        .digest('hex');

      // Créer l'entrée de sauvegarde
      const backup = new Backup({
        type,
        description: `Sauvegarde automatique ${type} - ${task.name}`,
        data: compressedData,
        size: compressedData.length,
        checksum,
        isScheduled: true,
        createdBy: 'system',
        metadata,
      });

      await backup.save();

      const duration = Date.now() - startTime;
      console.log(`✅ Sauvegarde ${type} terminée en ${duration}ms (${this.formatSize(compressedData.length)})`);

      // Nettoyer les anciennes sauvegardes si nécessaire
      await this.cleanupOldBackups(type);

    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde ${type}:`, error);

      // Optionnel: envoyer une notification d'erreur
      // await this.sendErrorNotification(taskId, error);
    }
  }

  // Collecter toutes les données (sauvegarde complète)
  private async collectFullData() {
    const [projects, skills, media, experiences, education, categories] = await Promise.all([
      Project.find({}).lean(),
      Skill.find({}).lean(),
      Media.find({}).lean(),
      Experience.find({}).lean(),
      Education.find({}).lean(),
      Category.find({}).lean(),
    ]);

    return {
      projects,
      skills,
      media,
      experiences,
      education,
      categories,
      timestamp: new Date().toISOString(),
    };
  }

  // Collecter les données modifiées depuis la dernière sauvegarde incrémentale
  private async collectIncrementalData() {
    const lastIncrementalBackup = await Backup.findOne({
      type: 'incremental',
      isScheduled: true,
    }).sort({ createdAt: -1 });

    const since = lastIncrementalBackup ? lastIncrementalBackup.createdAt : new Date(Date.now() - 6 * 60 * 60 * 1000); // 6h par défaut

    const [projects, skills, media, experiences, education, categories] = await Promise.all([
      Project.find({ updatedAt: { $gte: since } }).lean(),
      Skill.find({ updatedAt: { $gte: since } }).lean(),
      Media.find({ updatedAt: { $gte: since } }).lean(),
      Experience.find({ updatedAt: { $gte: since } }).lean(),
      Education.find({ updatedAt: { $gte: since } }).lean(),
      Category.find({ updatedAt: { $gte: since } }).lean(),
    ]);

    return {
      projects,
      skills,
      media,
      experiences,
      education,
      categories,
      since: since.toISOString(),
      timestamp: new Date().toISOString(),
    };
  }

  // Collecter les données modifiées depuis la dernière sauvegarde complète
  private async collectDifferentialData() {
    const lastFullBackup = await Backup.findOne({
      type: 'full',
      isScheduled: true,
    }).sort({ createdAt: -1 });

    const since = lastFullBackup ? lastFullBackup.createdAt : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours par défaut

    const [projects, skills, media, experiences, education, categories] = await Promise.all([
      Project.find({ updatedAt: { $gte: since } }).lean(),
      Skill.find({ updatedAt: { $gte: since } }).lean(),
      Media.find({ updatedAt: { $gte: since } }).lean(),
      Experience.find({ updatedAt: { $gte: since } }).lean(),
      Education.find({ updatedAt: { $gte: since } }).lean(),
      Category.find({ updatedAt: { $gte: since } }).lean(),
    ]);

    return {
      projects,
      skills,
      media,
      experiences,
      education,
      categories,
      since: since.toISOString(),
      timestamp: new Date().toISOString(),
    };
  }

  // Nettoyer les anciennes sauvegardes
  private async cleanupOldBackups(type: 'full' | 'incremental' | 'differential') {
    try {
      let retentionDays: number;
      let maxCount: number;

      // Politiques de rétention par type
      switch (type) {
        case 'full':
          retentionDays = 30; // Garder 30 jours
          maxCount = 10; // Maximum 10 sauvegardes
          break;
        case 'incremental':
          retentionDays = 7; // Garder 7 jours
          maxCount = 28; // Maximum 28 sauvegardes (4 par jour)
          break;
        case 'differential':
          retentionDays = 14; // Garder 14 jours
          maxCount = 4; // Maximum 4 sauvegardes
          break;
      }

      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      // Supprimer par date
      const deletedByDate = await Backup.deleteMany({
        type,
        isScheduled: true,
        createdAt: { $lt: cutoffDate },
      });

      // Supprimer l'excédent par nombre
      const excessBackups = await Backup.find({
        type,
        isScheduled: true,
      })
        .sort({ createdAt: -1 })
        .skip(maxCount);

      if (excessBackups.length > 0) {
        const excessIds = excessBackups.map(b => b._id);
        await Backup.deleteMany({ _id: { $in: excessIds } });
      }

      if (deletedByDate.deletedCount > 0 || excessBackups.length > 0) {
        console.log(`🧹 Nettoyage ${type}: ${deletedByDate.deletedCount + excessBackups.length} anciennes sauvegardes supprimées`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage des sauvegardes ${type}:`, error);
    }
  }

  // Planifier le nettoyage automatique
  private scheduleCleanup() {
    // Nettoyage quotidien à 4h du matin
    cron.schedule('0 4 * * *', async () => {
      console.log('🧹 Début du nettoyage automatique des sauvegardes');

      try {
        await this.cleanupOldBackups('full');
        await this.cleanupOldBackups('incremental');
        await this.cleanupOldBackups('differential');

        console.log('✅ Nettoyage automatique terminé');
      } catch (error) {
        console.error('❌ Erreur lors du nettoyage automatique:', error);
      }
    }, {
      timezone: 'Europe/Paris',
    });
  }

  // Planifier la synchronisation GitHub
  private scheduleGitHubSync() {
    // Synchronisation quotidienne à 3h du matin
    cron.schedule('0 3 * * *', async () => {
      console.log('🔄 Début de la synchronisation GitHub automatique');
      import('../services/github').then(async ({ githubService }) => {
        try {
          await connectDB();
          const result = await githubService.syncRepositories(true);
          console.log(`✅ Synchronisation GitHub terminée: ${result.stats.synced} synchronisés, ${result.stats.created} créés`);
        } catch (error) {
          console.error('❌ Erreur lors de la synchronisation GitHub automatique:', error);
        }
      });
    }, {
      timezone: 'Europe/Paris',
    });
  }

  // Obtenir la prochaine date d'exécution
  private getNextRunDate(schedule: string): Date | undefined {
    try {
      const task = cron.schedule(schedule, () => { });
      // Note: node-cron ne fournit pas directement la prochaine exécution
      // On peut utiliser une bibliothèque comme 'cron-parser' pour cela
      task.destroy();
      return undefined; // Temporaire
    } catch {
      return undefined;
    }
  }

  // Générer un ID de tâche
  private generateTaskId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Formater la taille
  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Obtenir toutes les tâches
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  // Obtenir une tâche par ID
  getTask(id: string): ScheduledTask | undefined {
    return this.tasks.get(id);
  }

  // Obtenir le statut du planificateur
  getStatus() {
    const tasks = this.getTasks();
    return {
      isInitialized: this.isInitialized,
      totalTasks: tasks.length,
      enabledTasks: tasks.filter(t => t.enabled).length,
      disabledTasks: tasks.filter(t => !t.enabled).length,
      tasks: tasks.map(t => ({
        id: t.id,
        name: t.name,
        schedule: t.schedule,
        type: t.type,
        enabled: t.enabled,
        lastRun: t.lastRun,
        nextRun: t.nextRun,
      })),
    };
  }

  // Arrêter toutes les tâches
  async shutdown() {
    console.log('🛑 Arrêt du planificateur de sauvegardes...');

    for (const [id] of Array.from(this.tasks)) {
      await this.stopTask(id);
    }

    this.tasks.clear();
    this.isInitialized = false;

    console.log('✅ Planificateur arrêté');
  }
}

// Instance singleton
const backupScheduler = new BackupScheduler();

// Initialiser automatiquement au démarrage
if (typeof window === 'undefined') {
  // Côté serveur uniquement
  backupScheduler.initialize().catch(console.error);

  // Gérer l'arrêt propre
  process.on('SIGINT', async () => {
    await backupScheduler.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await backupScheduler.shutdown();
    process.exit(0);
  });
}

export default backupScheduler;
export { BackupScheduler, type ScheduledTask };