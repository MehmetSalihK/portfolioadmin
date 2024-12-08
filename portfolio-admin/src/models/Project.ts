import mongoose from 'mongoose';

const DailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  demoClicks: {
    type: Number,
    default: 0,
  },
  githubClicks: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
});

const ClickHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['demo', 'github', 'view'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const StatsSchema = new mongoose.Schema({
  demoClicks: {
    type: Number,
    default: 0,
  },
  githubClicks: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  lastClicked: {
    type: Date,
    default: null,
  },
  clickHistory: [ClickHistorySchema],
  dailyStats: [DailyStatsSchema],
});

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this project.'],
    maxlength: [60, 'Title cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for this project.'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL for this project.'],
  },
  technologies: [{
    type: String,
    required: true,
  }],
  demoUrl: {
    type: String,
  },
  githubUrl: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  stats: {
    type: StatsSchema,
    default: () => ({
      demoClicks: 0,
      githubClicks: 0,
      views: 0,
      lastClicked: null,
      clickHistory: [],
      dailyStats: [],
    }),
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
