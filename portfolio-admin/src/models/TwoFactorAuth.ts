import mongoose, { Document, Schema } from 'mongoose';

interface ITwoFactorAuth extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const TwoFactorAuthSchema = new Schema<ITwoFactorAuth>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    length: [6, 'Code must be exactly 6 characters'],
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, 'Maximum 3 attempts allowed'],
  },
}, {
  timestamps: true,
});

// Index pour nettoyer automatiquement les codes expirés
TwoFactorAuthSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index pour optimiser les recherches par email
TwoFactorAuthSchema.index({ email: 1 });

// Méthode pour vérifier si le code est encore valide
TwoFactorAuthSchema.methods.isValid = function(): boolean {
  return !this.verified && this.attempts < 3 && this.expiresAt > new Date();
};

// Méthode pour incrémenter les tentatives
TwoFactorAuthSchema.methods.incrementAttempts = function(): Promise<ITwoFactorAuth> {
  this.attempts += 1;
  return this.save();
};

// Méthode pour marquer comme vérifié
TwoFactorAuthSchema.methods.markAsVerified = function(): Promise<ITwoFactorAuth> {
  this.verified = true;
  return this.save();
};

const TwoFactorAuth = mongoose.models.TwoFactorAuth || mongoose.model<ITwoFactorAuth>('TwoFactorAuth', TwoFactorAuthSchema);

export default TwoFactorAuth;
export type { ITwoFactorAuth };