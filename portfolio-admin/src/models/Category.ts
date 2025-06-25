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

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category; 