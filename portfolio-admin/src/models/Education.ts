import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation extends Document {
  school: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  location: string;
  isVisible: boolean;
  isCurrentlyStudying: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
  location: { type: String },
  isVisible: { type: Boolean, default: true },
  isCurrentlyStudying: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.models.Education || mongoose.model<IEducation>('Education', EducationSchema);