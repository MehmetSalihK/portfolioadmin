import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this skill.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  level: {
    type: Number,
    required: [true, 'Please provide a level for this skill.'],
    min: [0, 'Level cannot be less than 0'],
    max: [100, 'Level cannot be more than 100'],
    default: 50,
  },
  isVisible: {
    type: Boolean,
    default: true, 
  },
  category: {
    type: String,
    required: [true, 'Please provide a category for this skill.'],
    default: 'Autres',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
