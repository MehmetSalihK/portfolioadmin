import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    isEnabled: {
      type: Boolean,
      default: false,
      required: true,
    },
    title: {
      type: String,
      default: 'Site en maintenance',
      required: true,
    },
    message: {
      type: String,
      default: 'Le site est actuellement en maintenance. Veuillez revenir plus tard.',
      required: true,
    },
    startTime: {
      type: Date,
      required: false,
    },
    endTime: {
      type: Date,
      required: false,
    },
    estimatedEndTime: {
      type: Date,
      required: false,
    },
    allowedIPs: {
      type: [String],
      default: [],
      required: false,
    },
    enabledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
    enabledAt: {
      type: Date,
      required: false,
    },
    disabledAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Il ne devrait y avoir qu'un seul document de maintenance
maintenanceSchema.index({ _id: 1 }, { unique: true });

export default mongoose.models.Maintenance ||
  mongoose.model('Maintenance', maintenanceSchema);