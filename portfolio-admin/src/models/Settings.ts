import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteTitle: String,
  siteDescription: String,
  email: String,
  phone: String,
  github: String,
  linkedin: String,
  twitter: String,
  whatsapp: String,
  telegram: String,
  position: String
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);