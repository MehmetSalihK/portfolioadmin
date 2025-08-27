import mongoose from 'mongoose';

// Schéma pour les métadonnées de changement
const ChangeMetadataSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  changeType: {
    type: String,
    enum: ['create', 'update', 'delete', 'restore'],
    required: true,
  },
});

// Schéma pour les versions d'entités
const EntityVersionSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
    enum: ['project', 'skill', 'experience', 'education', 'contact', 'homepage', 'media', 'category'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  changes: [ChangeMetadataSchema],
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  isAutoSave: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number, // Taille en bytes
  },
});

// Schéma pour les sauvegardes complètes
const BackupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: ['full', 'incremental', 'differential'],
    default: 'full',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'corrupted'],
    default: 'pending',
  },
  data: {
    projects: [mongoose.Schema.Types.Mixed],
    skills: [mongoose.Schema.Types.Mixed],
    experiences: [mongoose.Schema.Types.Mixed],
    education: [mongoose.Schema.Types.Mixed],
    contacts: [mongoose.Schema.Types.Mixed],
    homepage: mongoose.Schema.Types.Mixed,
    media: [mongoose.Schema.Types.Mixed],
    categories: [mongoose.Schema.Types.Mixed],
    settings: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    totalEntities: {
      type: Number,
      default: 0,
    },
    totalSize: {
      type: Number, // Taille en bytes
      default: 0,
    },
    compression: {
      enabled: {
        type: Boolean,
        default: true,
      },
      algorithm: {
        type: String,
        default: 'gzip',
      },
      ratio: {
        type: Number, // Ratio de compression
      },
    },
    checksum: {
      type: String, // Hash MD5 pour vérifier l'intégrité
    },
    version: {
      type: String,
      default: '1.0.0',
    },
  },
  schedule: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    time: {
      type: String, // Format HH:MM
      default: '02:00',
    },
    dayOfWeek: {
      type: Number, // 0-6 (Dimanche-Samedi)
      default: 0,
    },
    dayOfMonth: {
      type: Number, // 1-31
      default: 1,
    },
    nextRun: {
      type: Date,
    },
    lastRun: {
      type: Date,
    },
  },
  retention: {
    keepDays: {
      type: Number,
      default: 30, // Garder 30 jours par défaut
    },
    maxBackups: {
      type: Number,
      default: 10, // Maximum 10 sauvegardes
    },
    autoCleanup: {
      type: Boolean,
      default: true,
    },
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number, // Durée en millisecondes
  },
  error: {
    message: String,
    stack: String,
    code: String,
  },
  isAutomatic: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
});

// Schéma pour l'historique des restaurations
const RestoreHistorySchema = new mongoose.Schema({
  backupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Backup',
    required: true,
  },
  entityType: {
    type: String,
    enum: ['project', 'skill', 'experience', 'education', 'contact', 'homepage', 'media', 'category', 'full'],
  },
  entityIds: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'partial'],
    default: 'pending',
  },
  restoredEntities: {
    type: Number,
    default: 0,
  },
  failedEntities: {
    type: Number,
    default: 0,
  },
  conflicts: [{
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    field: String,
    currentValue: mongoose.Schema.Types.Mixed,
    backupValue: mongoose.Schema.Types.Mixed,
    resolution: {
      type: String,
      enum: ['keep_current', 'use_backup', 'merge', 'skip'],
    },
  }],
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  error: {
    message: String,
    stack: String,
    code: String,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
});

// Index pour optimiser les performances
EntityVersionSchema.index({ entityType: 1, entityId: 1, version: -1 });
EntityVersionSchema.index({ createdAt: -1 });
EntityVersionSchema.index({ createdBy: 1 });
EntityVersionSchema.index({ isAutoSave: 1 });

BackupSchema.index({ createdAt: -1 });
BackupSchema.index({ status: 1 });
BackupSchema.index({ type: 1 });
BackupSchema.index({ 'schedule.enabled': 1, 'schedule.nextRun': 1 });
BackupSchema.index({ createdBy: 1 });
BackupSchema.index({ isAutomatic: 1 });

RestoreHistorySchema.index({ backupId: 1 });
RestoreHistorySchema.index({ createdAt: -1 });
RestoreHistorySchema.index({ status: 1 });
RestoreHistorySchema.index({ createdBy: 1 });

// Middleware pour calculer la taille automatiquement
EntityVersionSchema.pre('save', function(next) {
  if (this.data) {
    this.size = JSON.stringify(this.data).length;
  }
  next();
});

BackupSchema.pre('save', function(next) {
  if (this.data) {
    this.metadata.totalSize = JSON.stringify(this.data).length;
    
    // Calculer le nombre total d'entités
    let totalEntities = 0;
    Object.values(this.data).forEach((value: any) => {
      if (Array.isArray(value)) {
        totalEntities += value.length;
      } else if (value && typeof value === 'object') {
        totalEntities += 1;
      }
    });
    this.metadata.totalEntities = totalEntities;
  }
  next();
});

// Méthodes statiques
BackupSchema.statics.getScheduledBackups = function() {
  return this.find({
    'schedule.enabled': true,
    'schedule.nextRun': { $lte: new Date() },
    status: { $ne: 'in_progress' }
  });
};

BackupSchema.statics.cleanupOldBackups = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    'retention.autoCleanup': true,
    isAutomatic: true
  });
};

EntityVersionSchema.statics.getLatestVersion = function(entityType: string, entityId: string) {
  return this.findOne({
    entityType,
    entityId: new mongoose.Types.ObjectId(entityId)
  }).sort({ version: -1 });
};

EntityVersionSchema.statics.getVersionHistory = function(entityType: string, entityId: string, limit = 10) {
  return this.find({
    entityType,
    entityId: new mongoose.Types.ObjectId(entityId)
  })
  .sort({ version: -1 })
  .limit(limit)
  .select('-data'); // Exclure les données pour la liste
};

// Créer les modèles
const EntityVersion = mongoose.models.EntityVersion || mongoose.model('EntityVersion', EntityVersionSchema);
const Backup = mongoose.models.Backup || mongoose.model('Backup', BackupSchema);
const RestoreHistory = mongoose.models.RestoreHistory || mongoose.model('RestoreHistory', RestoreHistorySchema);

export { EntityVersion, Backup, RestoreHistory };
export default Backup;