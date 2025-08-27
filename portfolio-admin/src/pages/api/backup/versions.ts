import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/db';
import { EntityVersion } from '../../../models/Backup';
import Project from '../../../models/Project';
import Skill from '../../../models/Skill';
import Experience from '../../../models/Experience';
import Education from '../../../models/Education';
import Contact from '../../../models/Contact';
import HomePage from '../../../models/HomePage';
import { Media } from '../../../models/Media';
import Category from '../../../models/Category';
import Setting from '../../../models/Setting';

// Modèles disponibles
const MODELS = {
  project: Project,
  skill: Skill,
  experience: Experience,
  education: Education,
  contact: Contact,
  homepage: HomePage,
  media: Media,
  category: Category,
  setting: Setting,
};

// Fonction pour créer une version d'entité
async function createEntityVersion(
  entityType: string,
  entityId: string,
  data: any,
  changes: any[],
  createdBy: string,
  description?: string,
  isAutoSave: boolean = false
) {
  try {
    // Obtenir la dernière version
    const lastVersion = await EntityVersion.findOne({
      entityType,
      entityId,
    }).sort({ version: -1 });
    
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;
    
    const version = new EntityVersion({
      entityType,
      entityId,
      version: nextVersion,
      data,
      changes,
      createdBy,
      description,
      isAutoSave,
    });
    
    await version.save();
    return version;
  } catch (error) {
    console.error('Error creating entity version:', error);
    throw error;
  }
}

// Fonction pour restaurer une version d'entité
async function restoreEntityVersion(versionId: string) {
  try {
    const version = await EntityVersion.findById(versionId);
    if (!version) {
      throw new Error('Version non trouvée');
    }
    
    const Model = MODELS[version.entityType as keyof typeof MODELS];
    if (!Model) {
      throw new Error('Type d\'entité non supporté');
    }
    
    // Restaurer les données
    const restored = await Model.findByIdAndUpdate(
      version.entityId,
      version.data,
      { new: true, runValidators: true }
    );
    
    if (!restored) {
      throw new Error('Entité non trouvée pour la restauration');
    }
    
    return restored;
  } catch (error) {
    console.error('Error restoring entity version:', error);
    throw error;
  }
}

// Fonction pour comparer deux versions
function compareVersions(version1: any, version2: any) {
  const changes = [];
  const data1 = version1.data;
  const data2 = version2.data;
  
  // Comparer les champs
  const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);
  
  for (const key of allKeys) {
    if (JSON.stringify(data1[key]) !== JSON.stringify(data2[key])) {
      changes.push({
        field: key,
        oldValue: data1[key],
        newValue: data2[key],
        changeType: !data1[key] ? 'create' : !data2[key] ? 'delete' : 'update',
      });
    }
  }
  
  return changes;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST', 'DELETE'].includes(req.method!)) {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (req.method === 'GET') {
      const { entityType, entityId, versionId, action } = req.query;
      
      if (action === 'compare' && versionId) {
        // Comparer deux versions
        const { compareWith } = req.query;
        
        const version1 = await EntityVersion.findById(versionId);
        const version2 = await EntityVersion.findById(compareWith);
        
        if (!version1 || !version2) {
          return res.status(404).json({ message: 'Version(s) non trouvée(s)' });
        }
        
        const changes = compareVersions(version1, version2);
        
        return res.status(200).json({
          version1: {
            _id: version1._id,
            version: version1.version,
            createdAt: version1.createdAt,
            createdBy: version1.createdBy,
          },
          version2: {
            _id: version2._id,
            version: version2.version,
            createdAt: version2.createdAt,
            createdBy: version2.createdBy,
          },
          changes,
        });
      }
      
      if (versionId) {
        // Récupérer une version spécifique
        const version = await EntityVersion.findById(versionId);
        if (!version) {
          return res.status(404).json({ message: 'Version non trouvée' });
        }
        
        return res.status(200).json({ version });
      }
      
      if (entityType && entityId) {
        // Récupérer l'historique des versions pour une entité
        const { page = 1, limit = 10 } = req.query;
        
        const versions = await EntityVersion.find({
          entityType,
          entityId,
        })
        .select('-data') // Exclure les données pour la liste
        .sort({ version: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
        
        const total = await EntityVersion.countDocuments({
          entityType,
          entityId,
        });
        
        return res.status(200).json({
          versions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        });
      }
      
      // Récupérer toutes les versions récentes
      const { page = 1, limit = 20, type } = req.query;
      
      const filter: any = {};
      if (type) filter.entityType = type;
      
      const versions = await EntityVersion.find(filter)
        .select('-data')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      
      const total = await EntityVersion.countDocuments(filter);
      
      return res.status(200).json({
        versions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    }

    if (req.method === 'POST') {
      const { action, entityType, entityId, data, changes, description, versionId } = req.body;
      
      if (action === 'create') {
        // Créer une nouvelle version
        if (!entityType || !entityId || !data) {
          return res.status(400).json({ 
            message: 'Type d\'entité, ID et données requis' 
          });
        }
        
        const version = await createEntityVersion(
          entityType,
          entityId,
          data,
          changes || [],
          session.user.email,
          description,
          false
        );
        
        return res.status(201).json({
          message: 'Version créée avec succès',
          version: {
            _id: version._id,
            version: version.version,
            createdAt: version.createdAt,
            description: version.description,
          },
        });
      }
      
      if (action === 'restore') {
        // Restaurer une version
        if (!versionId) {
          return res.status(400).json({ message: 'ID de version requis' });
        }
        
        const restored = await restoreEntityVersion(versionId);
        
        // Créer une nouvelle version pour marquer la restauration
        const version = await EntityVersion.findById(versionId);
        if (version) {
          await createEntityVersion(
            version.entityType,
            version.entityId.toString(),
            restored.toObject(),
            [{
              field: 'restored_from',
              oldValue: null,
              newValue: versionId,
              changeType: 'restore',
            }],
            session.user.email,
            `Restauré depuis la version ${version.version}`,
            false
          );
        }
        
        return res.status(200).json({
          message: 'Version restaurée avec succès',
          restored,
        });
      }
      
      return res.status(400).json({ message: 'Action non reconnue' });
    }

    if (req.method === 'DELETE') {
      const { versionId } = req.query;
      
      if (!versionId) {
        return res.status(400).json({ message: 'ID de version requis' });
      }
      
      const version = await EntityVersion.findById(versionId);
      if (!version) {
        return res.status(404).json({ message: 'Version non trouvée' });
      }
      
      // Empêcher la suppression de la dernière version
      const totalVersions = await EntityVersion.countDocuments({
        entityType: version.entityType,
        entityId: version.entityId,
      });
      
      if (totalVersions <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer la dernière version' 
        });
      }
      
      await EntityVersion.findByIdAndDelete(versionId);
      
      return res.status(200).json({
        message: 'Version supprimée avec succès',
      });
    }
  } catch (error) {
    console.error('Erreur API versions:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
}