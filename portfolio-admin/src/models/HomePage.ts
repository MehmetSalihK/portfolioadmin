import mongoose from 'mongoose';

const HomePageSchema = new mongoose.Schema({
  title: { type: String, default: 'Portfolio Professionnel' },
  subtitle: { type: String, default: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes. Spécialisé dans React, Next.js, Node.js et les technologies cloud.' },
  aboutTitle: { type: String, default: 'À propos' },
  aboutText: { type: String, default: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes.' },
  
  // Social Links
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    telegram: { type: String, default: '' }
  },
  
  // Legacy fields for backward compatibility
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  
  // Legacy objects for backward compatibility (will be ignored in the UI)
  navigation: { type: Object, default: {} },
  contactInfo: { type: Object, default: {} },
  footer: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.models.HomePage || mongoose.model('HomePage', HomePageSchema);
