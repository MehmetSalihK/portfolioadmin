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
  isHidden: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
});

// Vérifie si le modèle existe déjà pour éviter l'erreur "Cannot overwrite model once compiled"
const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);

export default Skill;
