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
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillCategory',
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
