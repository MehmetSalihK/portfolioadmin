import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: String,
  companyUrl: String,
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: false,
  },
  isCurrentPosition: {
    type: Boolean,
    default: false,
  },
  description: String,
  technologies: {
    type: [String],
    default: [],
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);

export default Experience;
