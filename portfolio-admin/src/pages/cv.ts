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

    const cv = await CV.findOne({ isActive: true });

    if (!cv) {
      // Instead of 404, redirect to home or show error
      return {
        notFound: true // Keep standard 404 for now, but logged
      };
    }

    // Always serving from DB (Base64)
    let fileBuffer: Buffer;

    if (cv.data) {
      fileBuffer = Buffer.from(cv.data, 'base64');
    } else {
      // Legacy fallback: if data is missing but file exists (migration case)
      // For now, we return 404 if data is missing to enforce re-upload
      console.error('CV found but no data field (legacy?). Re-upload required.');
      return {
        notFound: true
      };
    }

    try {
      res.setHeader('Content-Type', cv.mimeType || 'application/pdf');

      // Encodage sécurisé du nom de fichier pour éviter les erreurs 500 avec les caractères spéciaux
      const encodedFilename = encodeURIComponent(cv.originalName);
      // Fallback simple (ASCII only) pour compatibilité
      const safeFilename = cv.originalName.replace(/[^\x20-\x7E]/g, '_');

      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`);
      res.write(fileBuffer);
      res.end();
    } catch (headerError) {
      console.error('Erreur lors de l\'envoi du fichier (Headers):', headerError);
      // Fallback en cas d'erreur critique de header
      res.statusCode = 500;
      res.end();
    }

    return {
      props: {}
    };
  } catch (error) {
    console.error('Erreur critique dans cv.ts:', error);
    return {
      notFound: true
    };
  }
}