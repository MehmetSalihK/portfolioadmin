import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    default: 'Portfolio'
  },
  siteDescription: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: 'contact@mehmetsalihk.fr'
  },
  phone: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: 'https://github.com/mehmetsalihk'
  },
  linkedin: {
    type: String,
    default: 'https://www.linkedin.com/in/mehmetsalihk/'
  },
  twitter: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  telegram: {
    type: String,
    default: ''
  }
});

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

export default Setting; 