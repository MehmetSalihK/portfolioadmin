import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import formidable from 'formidable';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method === 'POST') {
      const form = formidable();
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ error: 'Erreur lors du téléchargement du fichier' });
        }

        const file = files.image?.[0];
        if (!file) {
          return res.status(400).json({ error: 'Aucun fichier trouvé' });
        }

        // Lire le fichier en buffer
        const fileData = await fs.readFile(file.filepath);
        
        // Créer un ID unique pour le fichier
        const fileId = new mongoose.Types.ObjectId();

        // Stocker les métadonnées du fichier
        const fileInfo = {
          filename: file.originalFilename,
          contentType: file.mimetype,
          data: fileData,
          _id: fileId
        };

        res.status(200).json({ 
          fileId: fileId.toString(),
          filename: file.originalFilename
        });
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}
