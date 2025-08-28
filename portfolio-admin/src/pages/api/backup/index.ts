import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/db';
import { Backup, EntityVersion } from '../../../models/Backup';
import Project from '../../../models/Project';
import Skill from '../../../models/Skill';
import Experience from '../../../models/Experience';
import Education from '../../../models/Education';
import Contact from '../../../models/Contact';
import HomePage from '../../../models/HomePage';
import Media from '../../../models/Media';
import Category from '../../../models/Category';
import Setting from '../../../models/Setting';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Modèles disponibles pour la sauvegarde
const MODELS = {
  projects: Project,
  skills: Skill,
  experiences: Experience,
  education: Education,
  contacts: Contact,
  homepage: HomePage,
  media: Media,
  categories: Category,
  settings: Setting,
};

// Fonction pour créer une sauvegarde complète
async function createFullBackup(name: string, description: string, createdBy: string) {
  const backupData: any = {};
  
  try {
    // Récupérer toutes les données de chaque modèle
    for (const [key, Model] of Object.entries(MODELS)) {
      if (key === 'homepage' || key === 'settings') {
        // Pour les modèles singleton
        const data = await Model.findOne();
        backupData[key] = data ? data.toObject() : null;
      } else {
        // Pour les modèles de collection
        const data = await Model.find({}).lean();
        backupData[key] = data;
      }
    }
    
    // Créer le checksum pour vérifier l'intégrité
    const dataString = JSON.stringify(backupData);
    const checksum = crypto.createHash('md5').update(dataString).digest('hex');
    
    // Compresser les données si nécessaire
    let finalData = backupData;
    let compressionRatio = 0;
    
    try {
      const compressed = await gzip(Buffer.from(dataString));
      const originalSize = Buffer.byteLength(dataString);
      const compressedSize = compressed.length;
      compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
      
      // Utiliser la compression si elle réduit significativement la taille
      if (compressionRatio > 10) {
        finalData = {
          compressed: true,
          data: compressed.toString('base64')
        };
      }
    } catch (compressionError) {
      console.warn('Compression failed, using uncompressed data:', compressionError);
    }
    
    // Créer la sauvegarde
    const backup = new Backup({
      name,
      description,
      type: 'full',
      status: 'completed',
      data: finalData,
      metadata: {
        checksum,
        compression: {
          enabled: compressionRatio > 10,
          algorithm: 'gzip',
          ratio: compressionRatio,
        },
      },
      createdBy,
      completedAt: new Date(),
    });
    
    await backup.save();
    return backup;
    
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

// Fonction pour créer une sauvegarde incrémentale
async function createIncrementalBackup(name: string, description: string, createdBy: string, lastBackupDate: Date) {
  const backupData: any = {};
  
  try {
    // Récupérer seulement les données modifiées depuis la dernière sauvegarde
    for (const [key, Model] of Object.entries(MODELS)) {
      if (key === 'homepage' || key === 'settings') {
        const data = await Model.findOne({ updatedAt: { $gte: lastBackupDate } });
        backupData[key] = data ? data.toObject() : null;
      } else {
        const data = await Model.find({ 
          $or: [
            { updatedAt: { $gte: lastBackupDate } },
            { createdAt: { $gte: lastBackupDate } }
          ]
        }).lean();
        backupData[key] = data;
      }
    }
    
    const dataString = JSON.stringify(backupData);
    const checksum = crypto.createHash('md5').update(dataString).digest('hex');
    
    const backup = new Backup({
      name,
      description,
      type: 'incremental',
      status: 'completed',
      data: backupData,
      metadata: {
        checksum,
        lastBackupDate,
      },
      createdBy,
      completedAt: new Date(),
    });
    
    await backup.save();
    return backup;
    
  } catch (error) {
    console.error('Error creating incremental backup:', error);
    throw error;
  }
}

// Fonction pour restaurer une sauvegarde
async function restoreBackup(backupId: string, options: any = {}) {
  try {
    const backup = await Backup.findById(backupId);
    if (!backup) {
      throw new Error('Sauvegarde non trouvée');
    }
    
    let backupData = backup.data;
    
    // Décompresser si nécessaire
    if (backupData.compressed) {
      const compressedBuffer = Buffer.from(backupData.data, 'base64');
      const decompressed = await gunzip(compressedBuffer);
      backupData = JSON.parse(decompressed.toString());
    }
    
    const restoredEntities = {
      success: 0,
      failed: 0,
      conflicts: [] as Array<{
        entityType: string;
        entityId: any;
        reason: string;
      }>,
    };
    
    // Restaurer chaque type d'entité
    for (const [key, Model] of Object.entries(MODELS)) {
      if (!backupData[key]) continue;
      
      try {
        if (key === 'homepage' || key === 'settings') {
          // Pour les modèles singleton
          if (backupData[key]) {
            const existing = await Model.findOne();
            if (existing && options.conflictResolution === 'skip') {
              continue;
            }
            
            if (existing) {
              await Model.findByIdAndUpdate(existing._id, backupData[key]);
            } else {
              await new Model(backupData[key]).save();
            }
            restoredEntities.success++;
          }
        } else {
          // Pour les modèles de collection
          for (const item of backupData[key]) {
            try {
              const existing = await Model.findById(item._id);
              
              if (existing && options.conflictResolution === 'skip') {
                restoredEntities.conflicts.push({
                  entityType: key,
                  entityId: item._id,
                  reason: 'Entity already exists',
                });
                continue;
              }
              
              if (existing) {
                await Model.findByIdAndUpdate(item._id, item);
              } else {
                await new Model(item).save();
              }
              
              restoredEntities.success++;
            } catch (itemError) {
              restoredEntities.failed++;
              restoredEntities.conflicts.push({
                entityType: key,
                entityId: item._id,
                reason: itemError instanceof Error ? itemError.message : String(itemError),
              });
            }
          }
        }
      } catch (modelError) {
        console.error(`Error restoring ${key}:`, modelError);
        restoredEntities.failed++;
      }
    }
    
    return restoredEntities;
    
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (req.method === 'GET') {
      // Récupérer la liste des sauvegardes
      const { page = 1, limit = 10, type, status } = req.query;
      
      const filter: any = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      
      const backups = await Backup.find(filter)
        .select('-data') // Exclure les données pour la liste
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      
      const total = await Backup.countDocuments(filter);
      
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

    if (req.method === 'POST') {
      const { action, name, description, type = 'full', backupId, options } = req.body;
      
      if (action === 'create') {
        // Créer une nouvelle sauvegarde
        let backup;
        
        if (type === 'full') {
          backup = await createFullBackup(name, description, session.user.email);
        } else if (type === 'incremental') {
          // Trouver la dernière sauvegarde
          const lastBackup = await Backup.findOne({ type: 'full' })
            .sort({ createdAt: -1 });
          
          if (!lastBackup) {
            return res.status(400).json({ 
              message: 'Aucune sauvegarde complète trouvée pour la sauvegarde incrémentale' 
            });
          }
          
          backup = await createIncrementalBackup(
            name, 
            description, 
            session.user.email, 
            lastBackup.createdAt
          );
        }
        
        return res.status(201).json({
          message: 'Sauvegarde créée avec succès',
          backup: {
            _id: backup._id,
            name: backup.name,
            type: backup.type,
            status: backup.status,
            createdAt: backup.createdAt,
            metadata: backup.metadata,
          },
        });
      }
      
      if (action === 'restore') {
        // Restaurer une sauvegarde
        if (!backupId) {
          return res.status(400).json({ message: 'ID de sauvegarde requis' });
        }
        
        const result = await restoreBackup(backupId, options);
        
        return res.status(200).json({
          message: 'Restauration terminée',
          result,
        });
      }
      
      return res.status(400).json({ message: 'Action non reconnue' });
    }
  } catch (error) {
    console.error('Erreur API backup:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Export des fonctions pour utilisation dans d'autres modules
export { createFullBackup, createIncrementalBackup, restoreBackup };