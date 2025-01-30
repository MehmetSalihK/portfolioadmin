import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this experience.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  company: {
    type: String,
    required: [true, 'Please provide a company name.'],
    maxlength: [100, 'Company name cannot be more than 100 characters'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location.'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date.'],
  },
  endDate: {
    type: Date,
    default: null,
  },
  current: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  achievements: [{
    type: String,
  }],
  technologies: [{
    type: String,
  }],
  companyLogo: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
