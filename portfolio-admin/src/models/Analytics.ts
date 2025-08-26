import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: false,
    },
    ip: {
      type: String,
      required: false,
    },
    referrer: {
      type: String,
      required: false,
    },
    sessionId: {
      type: String,
      required: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
      required: false,
    },
    entryTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    exitTime: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
analyticsSchema.index({ page: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ createdAt: -1 });

export default mongoose.models.Analytics ||
  mongoose.model('Analytics', analyticsSchema);