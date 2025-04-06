import mongoose from 'mongoose';

const homePageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Bienvenue sur mon Portfolio'
  },
  subtitle: {
    type: String,
    default: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes'
  },
  aboutTitle: {
    type: String,
    default: 'À propos de moi'
  },
  aboutText: {
    type: String,
    default: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes. Avec une solide expérience dans le développement front-end et back-end, je m\'efforce de créer des solutions élégantes et performantes qui répondent aux besoins des utilisateurs.'
  },
  socialLinks: {
    github: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: ''
    },
    snapchat: {
      type: String,
      default: ''
    },
    telegram: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.HomePage || mongoose.model('HomePage', homePageSchema);
