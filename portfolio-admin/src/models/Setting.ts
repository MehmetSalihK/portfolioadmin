import mongoose, { Document } from 'mongoose';

export interface ISetting extends Document {
  siteTitle: string;
  siteDescription: string;
  siteDescription_en: string;
  siteDescription_tr: string;
  email: string;
  phone: string;
  position: string;
  position_en: string;
  position_tr: string;
  github: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
  telegram: string;
  aboutTitle: string;
  aboutTitle_en: string;
  aboutTitle_tr: string;
  aboutBio: string;
  aboutBio_en: string;
  aboutBio_tr: string;
  aboutImage: string;
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
  siteDescription_en: {
    type: String,
    default: ''
  },
  siteDescription_tr: {
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
  position: {
    type: String,
    default: ''
  },
  position_en: {
    type: String,
    default: ''
  },
  position_tr: {
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
  },
  // About Page Fields
  aboutTitle: {
    type: String,
    default: 'Un Profil Polyvalent : Tech & Créatif'
  },
  aboutTitle_en: {
    type: String,
    default: ''
  },
  aboutTitle_tr: {
    type: String,
    default: ''
  },
  aboutBio: {
    type: String,
    default: "Bien plus qu'un simple développeur, je suis un artisan du numérique passionné par la technologie sous toutes ses formes.\n\n💻 **Développement Web** : Mon cœur de métier. Spécialisé dans la stack MERN (MongoDB, Express, React, Node.js) et Next.js, je conçois des applications performantes, intuitives et scalables.\n\n🎨 **Créativité & Multimédia** : Ma passion ne s'arrête pas au code. Je manie également les outils de création visuelle. Montage vidéo dynamique sur Premiere Pro et After Effects, ou conception graphique de supports publicitaires (flyers, affiches), j'aime donner vie aux idées.\n\n🔧 **Hardware & Tech** : Geek dans l'âme, je maîtrise aussi l'aspect matériel. Du montage PC sur-mesure au diagnostic et à la réparation de smartphones, je comprends la technologie de l'intérieur.\n\nMon objectif ? Allier technique rigoureuse et créativité sans limite pour apporter des solutions globales et pertinentes."
  },
  aboutBio_en: {
    type: String,
    default: ''
  },
  aboutBio_tr: {
    type: String,
    default: ''
  },

  aboutImage: {
    type: String,
    default: ''
  }
});

const Setting = mongoose.models?.Setting || mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;