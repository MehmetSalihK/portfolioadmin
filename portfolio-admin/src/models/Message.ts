import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
  },
  company: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  subject: {
    type: String,
    required: [true, 'Le sujet est requis'],
  },
  message: {
    type: String,
    required: [true, 'Le message est requis'],
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema); 