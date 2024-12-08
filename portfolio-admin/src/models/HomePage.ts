import mongoose from 'mongoose';

const HomePageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    default: 'Bienvenue sur mon Portfolio'
  },
  subtitle: {
    type: String,
    required: [true, 'Le sous-titre est requis'],
    default: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes'
  },
  aboutTitle: {
    type: String,
    required: [true, 'Le titre "À propos" est requis'],
    default: 'À propos de moi'
  },
  aboutText: {
    type: String,
    required: [true, 'Le texte "À propos" est requis'],
    default: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes. Avec une solide expérience dans le développement front-end et back-end, je m\'efforce de créer des solutions élégantes et performantes qui répondent aux besoins des utilisateurs.'
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String
  }
}, {
  timestamps: true
});

export default mongoose.models.HomePage || mongoose.model('HomePage', HomePageSchema);
