import mongoose from 'mongoose';

interface ICV {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  isActive: boolean;
  data?: string; // Pour stocker le fichier en base64 sur Vercel
}

const CVSchema = new mongoose.Schema<ICV>({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['application/pdf', 'image/png', 'image/jpeg']
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  data: {
    type: String,
    required: false // Optionnel, utilisé seulement sur Vercel
  }
}, {
  timestamps: true
});

export default mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema);
export type { ICV };