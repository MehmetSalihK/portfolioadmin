import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Assurer que le dossier uploads existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      fs.unlinkSync(file.filepath); // Supprimer le fichier non valide
      return res.status(400).json({ error: 'Type de fichier non autorisé' });
    }

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(uploadDir, fileName);

    // Renommer le fichier
    fs.renameSync(file.filepath, newPath);

    // Retourner l'URL relative du fichier
    const fileUrl = `/uploads/${fileName}`;
    return res.status(200).json({ url: fileUrl });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
}
