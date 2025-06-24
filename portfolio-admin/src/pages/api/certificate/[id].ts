import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import path from 'path';
import fs from 'fs';

// Détecter si on est sur Vercel
const isVercel = process.env.VERCEL === '1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID d\'éducation requis' });
    }

    // Trouver l'éducation avec le certificat
    const education = await Education.findById(id);
    
    if (!education) {
      return res.status(404).json({ error: 'Éducation non trouvée' });
    }

    if (isVercel) {
      // Sur Vercel, utiliser les données base64 stockées en base
      if (!education.diplomaData) {
        return res.status(404).json({ error: 'Certificat non trouvé' });
      }

      // Convertir base64 en buffer
      const fileBuffer = Buffer.from(education.diplomaData, 'base64');
      
      // Déterminer le type MIME basé sur l'extension du fichier
      const fileExtension = path.extname(education.diplomaFileName || '').toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (fileExtension) {
        case '.pdf':
          mimeType = 'application/pdf';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
      }

      // Définir les en-têtes de réponse
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${education.diplomaFileName || 'certificate'}"`); 
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      return res.send(fileBuffer);
    } else {
      // En local, lire le fichier depuis le système de fichiers
      if (!education.diplomaFilePath && !education.diplomaFile) {
        return res.status(404).json({ error: 'Certificat non trouvé' });
      }

      const filePath = education.diplomaFilePath || education.diplomaFile;
      let fullPath: string;
      
      if (filePath.startsWith('/uploads/')) {
        fullPath = path.join(process.cwd(), 'public', filePath);
      } else {
        // Ancien format, construire le chemin
        const filename = education.diplomaFileName || filePath.split('/').pop();
        fullPath = path.join(process.cwd(), 'public', 'uploads', 'certificates', filename);
      }

      // Vérifier si le fichier existe
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'Fichier certificat non trouvé' });
      }

      // Lire le fichier
      const fileBuffer = fs.readFileSync(fullPath);
      
      // Déterminer le type MIME
      const fileExtension = path.extname(fullPath).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (fileExtension) {
        case '.pdf':
          mimeType = 'application/pdf';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
      }

      // Définir les en-têtes de réponse
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${education.diplomaFileName || 'certificate'}"`); 
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      return res.send(fileBuffer);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du certificat:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
}