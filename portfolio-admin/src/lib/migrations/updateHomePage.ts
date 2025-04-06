import connectDB from '../dbConnect';
import HomePage from '@/models/HomePage';

export async function updateHomePageDocuments() {
  try {
    await connectDB();

    // Trouver tous les documents HomePage
    const homePages = await HomePage.find({});

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
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    throw error;
  }
} 