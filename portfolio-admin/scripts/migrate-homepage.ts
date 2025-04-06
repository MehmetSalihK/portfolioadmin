import mongoose from 'mongoose';
import HomePage from '../src/models/HomePage';

const MONGODB_URI = 'mongodb+srv://portfolio:port123@portfolio.64jmn.mongodb.net/test';

async function runMigration() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Trouver tous les documents HomePage
    const homePages = await HomePage.find({});
    console.log(`Trouvé ${homePages.length} documents HomePage`);

    // Mettre à jour chaque document
    for (const homePage of homePages) {
      // S'assurer que socialLinks existe
      if (!homePage.socialLinks) {
        homePage.socialLinks = {};
      }

      // Ajouter les champs manquants avec des valeurs par défaut
      const defaultFields = [
        'github',
        'linkedin',
        'twitter',
        'instagram',
        'whatsapp',
        'snapchat',
        'telegram',
        'phone',
        'email'
      ];

      defaultFields.forEach(field => {
        if (!homePage.socialLinks[field]) {
          homePage.socialLinks[field] = '';
        }
      });

      // Sauvegarder les modifications
      await homePage.save();
      console.log(`Document HomePage mis à jour: ${homePage._id}`);
    }

    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigration(); 