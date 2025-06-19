import { GetServerSideProps } from 'next';
import connectDB from '../lib/db';
import CV from '../models/CV';
import fs from 'fs';
import path from 'path';

export default function CVPage() {
  return null; // Cette page ne rend rien car elle redirige
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    await connectDB();
    
    // Trouver le CV actif
    const cv = await CV.findOne({ isActive: true });
    
    if (!cv) {
      return {
        notFound: true
      };
    }

    // Construire le chemin du fichier
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'cv', cv.filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return {
        notFound: true
      };
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(filePath);
    
    // Définir les en-têtes appropriés
    res.setHeader('Content-Type', cv.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cv.originalName}"`);
    res.write(fileBuffer);
    res.end();
    
    return {
      props: {}
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du CV:', error);
    return {
      notFound: true
    };
  }
}