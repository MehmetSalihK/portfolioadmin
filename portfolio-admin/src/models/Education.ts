import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation extends Document {
  school: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  location: string;
  isCurrentlyStudying: boolean;
  isDiplomaPassed: boolean;
  isDiplomaNotObtained: boolean;
  diplomaFile?: string;
  diplomaFileName?: string;
  diplomaFilePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema({
  school: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  field: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  isCurrentlyStudying: {
    type: Boolean,
    default: false,
  },
  isDiplomaPassed: {
    type: Boolean,
    default: false,
  },
  isDiplomaNotObtained: {
    type: Boolean,
    default: false,
  },
  diplomaFile: {
    type: String
  },
  diplomaFileName: {
    type: String
  },
  diplomaFilePath: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Education || mongoose.model<IEducation>('Education', EducationSchema);