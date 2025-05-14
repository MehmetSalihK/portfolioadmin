import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import formidable from 'formidable';
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
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Erreur lors du téléchargement du fichier' });
      }

      const file = files.image?.[0];
      if (!file) {
        return res.status(400).json({ error: 'Aucun fichier trouvé' });
      }

      // Generate public URL for the file
      const fileName = file.newFilename;
      const publicUrl = `/uploads/${fileName}`;

      res.status(200).json({ url: publicUrl });
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}
