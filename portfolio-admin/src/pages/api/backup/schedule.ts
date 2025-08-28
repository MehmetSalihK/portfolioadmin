import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/db';
import { Backup } from '../../../models/Backup';
import { createFullBackup, createIncrementalBackup } from './index';
import cron, { ScheduledTask as CronScheduledTask } from 'node-cron';

// Interface pour les tâches de sauvegarde programmées
interface ScheduledTask {
  id: string;
  schedule: string;
  type: 'full' | 'incremental';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  task?: CronScheduledTask;
}

// Stockage des tâches programmées en mémoire
const scheduledTasks = new Map<string, ScheduledTask>();

// Fonction pour exécuter une sauvegarde programmée
async function executeScheduledBackup(taskId: string, type: 'full' | 'incremental') {
  try {
    console.log(`Exécution de la sauvegarde programmée: ${taskId} (${type})`);
    
    await dbConnect();
    
    // Créer la sauvegarde
    let backup;
    if (type === 'full') {
      backup = await createFullBackup(
        `Sauvegarde automatique ${taskId}`,
        `Sauvegarde automatique ${type}`,
        'system'
      );
    } else {
      // Pour les sauvegardes incrémentales, récupérer la date de la dernière sauvegarde
      const lastBackup = await Backup.findOne({ type: 'full' }).sort({ createdAt: -1 });
      const lastBackupDate = lastBackup ? lastBackup.createdAt : new Date(0);
      backup = await createIncrementalBackup(
        `Sauvegarde automatique ${taskId}`,
        `Sauvegarde automatique ${type}`,
        'system',
        lastBackupDate
      );
    }
    
    console.log(`Sauvegarde programmée terminée: ${backup._id}`);
    
    // Mettre à jour la dernière exécution
    const task = scheduledTasks.get(taskId);
    if (task) {
      task.lastRun = new Date();
      scheduledTasks.set(taskId, task);
    }
    
    return backup;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde programmée ${taskId}:`, error);
    throw error;
  }
}

// Fonction pour créer une tâche programmée
function createScheduledTask(
  id: string,
  schedule: string,
  type: 'full' | 'incremental',
  enabled: boolean = true
): ScheduledTask {
  const task: ScheduledTask = {
    id,
    schedule,
    type,
    enabled,
  };
  
  if (enabled && cron.validate(schedule)) {
    task.task = cron.schedule(schedule, () => {
      executeScheduledBackup(id, type).catch(console.error);
    });
    
    // Calculer la prochaine exécution
    try {
      const cronParser = require('cron-parser');
      const interval = cronParser.parseExpression(schedule);
      task.nextRun = interval.next().toDate();
    } catch (error) {
      console.error('Erreur lors du calcul de la prochaine exécution:', error);
    }
  }
  
  return task;
}

// Fonction pour démarrer une tâche
function startTask(taskId: string) {
  const task = scheduledTasks.get(taskId);
  if (task?.task && task.enabled) {
    task.task.start();
    console.log(`Tâche programmée démarrée: ${taskId}`);
  }
}

// Fonction pour arrêter une tâche
function stopTask(taskId: string) {
  const task = scheduledTasks.get(taskId);
  if (task?.task) {
    task.task.stop();
    console.log(`Tâche programmée arrêtée: ${taskId}`);
  }
}

// Fonction pour supprimer une tâche
function removeTask(taskId: string) {
  const task = scheduledTasks.get(taskId);
  if (task?.task) {
    task.task.destroy();
  }
  scheduledTasks.delete(taskId);
  console.log(`Tâche programmée supprimée: ${taskId}`);
}

// Initialiser les tâches par défaut
function initializeDefaultTasks() {
  // Sauvegarde complète quotidienne à 2h du matin
  const dailyFullBackup = createScheduledTask(
    'daily-full',
    '0 2 * * *',
    'full',
    true
  );
  scheduledTasks.set('daily-full', dailyFullBackup);
  
  // Sauvegarde incrémentale toutes les 6 heures
  const incrementalBackup = createScheduledTask(
    'incremental-6h',
    '0 */6 * * *',
    'incremental',
    true
  );
  scheduledTasks.set('incremental-6h', incrementalBackup);
  
  // Démarrer les tâches
  startTask('daily-full');
  startTask('incremental-6h');
}

// Fonction pour nettoyer les anciennes sauvegardes
async function cleanupOldBackups() {
  try {
    await dbConnect();
    
    // Supprimer les sauvegardes de plus de 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Backup.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isScheduled: true,
    });
    
    console.log(`${result.deletedCount} anciennes sauvegardes supprimées`);
    return result.deletedCount;
  } catch (error) {
    console.error('Erreur lors du nettoyage des sauvegardes:', error);
    throw error;
  }
}

// Tâche de nettoyage hebdomadaire
const cleanupTask = cron.schedule('0 3 * * 0', cleanupOldBackups);

// Initialiser au démarrage du serveur
if (process.env.NODE_ENV === 'production') {
  initializeDefaultTasks();
  cleanupTask.start();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method!)) {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (req.method === 'GET') {
      const { action } = req.query;
      
      if (action === 'status') {
        // Retourner le statut de toutes les tâches
        const tasks = Array.from(scheduledTasks.values()).map(task => ({
          id: task.id,
          schedule: task.schedule,
          type: task.type,
          enabled: task.enabled,
          lastRun: task.lastRun,
          nextRun: task.nextRun,
          isRunning: task.enabled && !!task.task,
        }));
        
        return res.status(200).json({ tasks });
      }
      
      if (action === 'history') {
        // Retourner l'historique des sauvegardes programmées
        const { page = 1, limit = 10 } = req.query;
        
        const backups = await Backup.find({ isScheduled: true })
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .select('-data');
        
        const total = await Backup.countDocuments({ isScheduled: true });
        
        return res.status(200).json({
          backups,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        });
      }
      
      return res.status(400).json({ message: 'Action non reconnue' });
    }

    if (req.method === 'POST') {
      const { action, id, schedule, type, enabled } = req.body;
      
      if (action === 'create') {
        // Créer une nouvelle tâche programmée
        if (!id || !schedule || !type) {
          return res.status(400).json({ 
            message: 'ID, planning et type requis' 
          });
        }
        
        if (!cron.validate(schedule)) {
          return res.status(400).json({ 
            message: 'Format de planning cron invalide' 
          });
        }
        
        if (scheduledTasks.has(id)) {
          return res.status(400).json({ 
            message: 'Une tâche avec cet ID existe déjà' 
          });
        }
        
        const task = createScheduledTask(id, schedule, type, enabled !== false);
        scheduledTasks.set(id, task);
        
        if (task.enabled) {
          startTask(id);
        }
        
        return res.status(201).json({
          message: 'Tâche programmée créée avec succès',
          task: {
            id: task.id,
            schedule: task.schedule,
            type: task.type,
            enabled: task.enabled,
            nextRun: task.nextRun,
          },
        });
      }
      
      if (action === 'execute') {
        // Exécuter une sauvegarde immédiatement
        const { type = 'incremental' } = req.body;
        
        const backup = await executeScheduledBackup(
          `manual-${Date.now()}`,
          type
        );
        
        return res.status(200).json({
          message: 'Sauvegarde exécutée avec succès',
          backup: {
            _id: backup._id,
            type: backup.type,
            createdAt: backup.createdAt,
            size: backup.size,
          },
        });
      }
      
      if (action === 'cleanup') {
        // Nettoyer les anciennes sauvegardes
        const deletedCount = await cleanupOldBackups();
        
        return res.status(200).json({
          message: 'Nettoyage terminé',
          deletedCount,
        });
      }
      
      return res.status(400).json({ message: 'Action non reconnue' });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { action, schedule, type, enabled } = req.body;
      
      if (!id || !scheduledTasks.has(id as string)) {
        return res.status(404).json({ message: 'Tâche non trouvée' });
      }
      
      if (action === 'toggle') {
        // Activer/désactiver une tâche
        const task = scheduledTasks.get(id as string)!;
        task.enabled = enabled !== undefined ? enabled : !task.enabled;
        
        if (task.enabled) {
          startTask(id as string);
        } else {
          stopTask(id as string);
        }
        
        return res.status(200).json({
          message: `Tâche ${task.enabled ? 'activée' : 'désactivée'}`,
          enabled: task.enabled,
        });
      }
      
      if (action === 'update') {
        // Mettre à jour une tâche
        const task = scheduledTasks.get(id as string)!;
        
        if (schedule && !cron.validate(schedule)) {
          return res.status(400).json({ 
            message: 'Format de planning cron invalide' 
          });
        }
        
        // Arrêter l'ancienne tâche
        stopTask(id as string);
        
        // Mettre à jour les propriétés
        if (schedule) task.schedule = schedule;
        if (type) task.type = type;
        if (enabled !== undefined) task.enabled = enabled;
        
        // Recréer la tâche cron
        if (task.task) {
          task.task.destroy();
        }
        
        if (task.enabled && cron.validate(task.schedule)) {
          task.task = cron.schedule(task.schedule, () => {
            executeScheduledBackup(id as string, task.type).catch(console.error);
          });
          
          startTask(id as string);
        }
        
        return res.status(200).json({
          message: 'Tâche mise à jour avec succès',
          task: {
            id: task.id,
            schedule: task.schedule,
            type: task.type,
            enabled: task.enabled,
          },
        });
      }
      
      return res.status(400).json({ message: 'Action non reconnue' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || !scheduledTasks.has(id as string)) {
        return res.status(404).json({ message: 'Tâche non trouvée' });
      }
      
      removeTask(id as string);
      
      return res.status(200).json({
        message: 'Tâche supprimée avec succès',
      });
    }
  } catch (error) {
    console.error('Erreur API schedule:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Exporter les fonctions utilitaires
export {
  initializeDefaultTasks,
  cleanupOldBackups,
  scheduledTasks,
};