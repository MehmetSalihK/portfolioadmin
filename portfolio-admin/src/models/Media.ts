import mongoose from 'mongoose';

const MediaStatsSchema = new mongoose.Schema({
  views: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  lastAccessed: {
    type: Date,
    default: null,
  },
});

const ImageVariantSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['thumbnail', 'small', 'medium', 'large', 'original'],
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    enum: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
    required: true,
  },
});

const MediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Please provide a filename for this media.'],
    unique: true,
  },
  originalName: {
    type: String,
    required: [true, 'Please provide the original filename.'],
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  altText: {
    type: String,
    maxlength: [200, 'Alt text cannot be more than 200 characters'],
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    required: true,
    default: 'image',
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  dimensions: {
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
  },
  url: {
    type: String,
    required: [true, 'Please provide a URL for this media.'],
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  variants: [ImageVariantSchema],
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters'],
  }],
  category: {
    type: String,
    enum: ['portfolio', 'blog', 'profile', 'gallery', 'other'],
    default: 'other',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isOptimized: {
    type: Boolean,
    default: false,
  },
  optimizedAt: {
    type: Date,
    default: null,
  },
  optimization: {
    originalSize: {
      type: Number,
      default: null,
    },
    optimizedSize: {
      type: Number,
      default: null,
    },
    compressionRatio: {
      type: Number,
      default: null,
    },
    quality: {
      type: Number,
      default: 85,
    },
  },
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    error: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  uploadedBy: {
    type: String,
    default: 'admin',
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  stats: {
    type: MediaStatsSchema,
    default: () => ({
      views: 0,
      downloads: 0,
      lastAccessed: null,
    }),
  },
  metadata: {
    exif: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    colorPalette: [{
      color: String,
      percentage: Number,
    }],
    averageColor: {
      type: String,
      default: null,
    },
  },
  archived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index pour améliorer les performances de recherche
MediaSchema.index({ type: 1, category: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ isPublic: 1, archived: 1 });
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ 'processing.status': 1 });

// Méthodes virtuelles
MediaSchema.virtual('sizeInMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

MediaSchema.virtual('dimensionsString').get(function() {
  if (this.dimensions && this.dimensions.width && this.dimensions.height) {
    return `${this.dimensions.width}x${this.dimensions.height}`;
  }
  return 'Unknown';
});

// Méthodes d'instance
MediaSchema.methods.getVariant = function(size: string) {
  return this.variants.find((variant: any) => variant.size === size);
};

MediaSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

MediaSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

MediaSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag);
  return this.save();
};

// Méthodes statiques
MediaSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isPublic: true, archived: false }).sort({ createdAt: -1 });
};

MediaSchema.statics.findByTags = function(tags: string[]) {
  return this.find({ tags: { $in: tags }, isPublic: true, archived: false }).sort({ createdAt: -1 });
};

MediaSchema.statics.getStorageStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        totalSize: { $sum: '$fileSize' },
        count: { $sum: 1 },
        avgSize: { $avg: '$fileSize' },
      },
    },
  ]);
};

MediaSchema.statics.getPendingProcessing = function() {
  return this.find({ 'processing.status': { $in: ['pending', 'processing'] } });
};

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);