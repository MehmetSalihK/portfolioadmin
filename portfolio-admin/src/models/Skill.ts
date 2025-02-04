import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: [
      "Langages de programmation",
      "Frameworks & Librairies",
      "Base de données",
      "Outils & DevOps",
      "Design"
    ]
  }
});

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);

export default Skill;
