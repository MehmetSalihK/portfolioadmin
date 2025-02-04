import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayOrder: {
    type: Number,
    required: true,
    default: 0
  }
});

// Vérifie si le modèle existe déjà pour éviter l'erreur "Cannot overwrite model once compiled"
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category; 