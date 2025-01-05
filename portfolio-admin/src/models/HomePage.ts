import mongoose from 'mongoose';

const HomePageSchema = new mongoose.Schema({
  title: { type: String, default: 'Bienvenue sur mon Portfolio' },
  subtitle: { type: String, default: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes' },
  aboutTitle: { type: String, default: 'À propos de moi' },
  aboutText: { type: String, default: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes.' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    telegram: { type: String, default: '' }
  },
  email: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.HomePage || mongoose.model('HomePage', HomePageSchema);
