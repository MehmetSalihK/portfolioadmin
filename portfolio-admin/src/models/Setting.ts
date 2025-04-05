import mongoose, { Document } from 'mongoose';

export interface ISetting extends Document {
  siteTitle: string;
  siteDescription: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
  telegram: string;
}

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

const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', settingSchema);

export default Setting; 