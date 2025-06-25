import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import CV from '@/models/CV';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  await connectDB();

  if (req.method === 'POST') {
    try {
      const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
      const uploadDir = isVercel 
        ? '/tmp' 
        : path.join(process.cwd(), 'public', 'uploads', 'cv');
      if (!isVercel && !fs.existsSync(uploadDir)) {
        try {
          fs.mkdirSync(uploadDir, { recursive: true });
        } catch (error) {
          console.error('Erreur création dossier:', error);
          return res.status(500).json({ error: 'Impossible de créer le dossier d\'upload' });
        }
      }
      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        filter: ({ mimetype }) => {
          return mimetype === 'application/pdf' || 
                 mimetype === 'image/png' || 
                 mimetype === 'image/jpeg';
        }
      });

      const [fields, files] = await form.parse(req);
      const file = Array.isArray(files.cv) ? files.cv[0] : files.cv;

      if (!file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const oldCV = await CV.findOne({ isActive: true });
      if (oldCV) {
        if (!isVercel) {
          const oldFilePath = path.join(uploadDir, oldCV.filename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        await CV.findByIdAndDelete(oldCV._id);
      }

      const timestamp = Date.now();
      const extension = path.extname(file.originalFilename || '');
      const newFilename = `cv_${timestamp}${extension}`;
      
      let cvData = {};
      
      if (isVercel) {
        const fileBuffer = fs.readFileSync(file.filepath);
        const base64Data = fileBuffer.toString('base64');
        
        cvData = {
          filename: newFilename,
          originalName: file.originalFilename,
          mimeType: file.mimetype,
          size: file.size,
          data: base64Data, // Stocker en base64
          isActive: true
        };
      } else {
        const newPath = path.join(uploadDir, newFilename);
        fs.renameSync(file.filepath, newPath);
        
        cvData = {
          filename: newFilename,
          originalName: file.originalFilename,
          mimeType: file.mimetype,
          size: file.size,
          isActive: true
        };
      }

      const cvRecord = new CV(cvData);

      await cvRecord.save();

      return res.status(200).json({ 
        message: 'CV uploadé avec succès',
        cv: cvRecord 
      });
    } catch (error) {
      console.error('Erreur upload CV:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  }

  if (req.method === 'GET') {
    try {
      const activeCV = await CV.findOne({ isActive: true });
      return res.status(200).json(activeCV);
    } catch (error) {
      console.error('Erreur récupération CV:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const activeCV = await CV.findOne({ isActive: true });
      if (activeCV) {
        const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
        if (!isVercel) {
          const filePath = path.join(process.cwd(), 'public', 'uploads', 'cv', activeCV.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        
        await CV.findByIdAndDelete(activeCV._id);
      }
      
      return res.status(200).json({ message: 'CV supprimé avec succès' });
    } catch (error) {
      console.error('Erreur suppression CV:', error);
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}