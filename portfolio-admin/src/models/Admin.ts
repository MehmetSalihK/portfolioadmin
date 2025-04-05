import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

import { formatDate, formatDateShort } from '@/utils/date';

interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super-admin';
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  formattedCreatedAt: string;
  formattedUpdatedAt: string;
  formattedLastLogin: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  role: {
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin',
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals pour les dates formatées
AdminSchema.virtual('formattedCreatedAt').get(function(this: IAdmin) {
  return formatDate(this.createdAt);
});

AdminSchema.virtual('formattedUpdatedAt').get(function(this: IAdmin) {
  return formatDate(this.updatedAt);
});

AdminSchema.virtual('formattedLastLogin').get(function(this: IAdmin) {
  return this.lastLogin ? formatDate(this.lastLogin) : 'Jamais';
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
