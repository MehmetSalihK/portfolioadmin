import mongoose from 'mongoose';

const SkillCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this category.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.SkillCategory || mongoose.model('SkillCategory', SkillCategorySchema); 