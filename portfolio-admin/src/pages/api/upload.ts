import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import formidable from 'formidable';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp non disponible, le floutage sera désactivé');
  sharp = null;
}
import connectDB from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const certificatesDir = path.join(uploadDir, 'certificates');
const isVercel = process.env.VERCEL === '1';
interface BlurZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}
async function processImageWithBlur(inputPath: string, outputPath: string, customZones?: BlurZone[]) {
  try {
    if (!sharp) {
      console.warn('Sharp non disponible, copie du fichier original sans floutage');
      await fs.rename(inputPath, outputPath);
      return;
    }

    const image = sharp(inputPath);
    const { width, height } = await image.metadata();
    
    if (!width || !height) {
      throw new Error('Impossible de lire les dimensions de l\'image');
    }

    const zonesToBlur = customZones || [
      { id: 'student-id', x: width * 0.65, y: height * 0.05, width: width * 0.3, height: height * 0.1, label: 'Numéro étudiant' },
      { id: 'signature-left', x: width * 0.05, y: height * 0.75, width: width * 0.4, height: height * 0.2, label: 'Signature gauche' },
      { id: 'signature-right', x: width * 0.55, y: height * 0.75, width: width * 0.4, height: height * 0.2, label: 'Signature droite' },
      { id: 'diploma-number', x: width * 0.35, y: height * 0.85, width: width * 0.3, height: height * 0.08, label: 'Numéro diplôme' },
      { id: 'last-name', x: width * 0.45, y: height * 0.35, width: width * 0.25, height: height * 0.08, label: 'Nom de famille' }
    ];

    const blurOverlays = [];
    
    for (const zone of zonesToBlur) {
      if (zone.width > 0 && zone.height > 0) {
        const blurOverlay = await sharp({
          create: {
            width: Math.floor(zone.width),
            height: Math.floor(zone.height),
            channels: 4,
            background: { r: 64, g: 64, b: 64, alpha: 1.0 }
          }
        })
        .blur(100)
        .png()
        .toBuffer();
        
        blurOverlays.push({
          input: blurOverlay,
          top: Math.floor(zone.y),
          left: Math.floor(zone.x)
        });
      }
    }

    await image
      .composite(blurOverlays)
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log('Image traitée avec floutage des données sensibles');
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    await fs.rename(inputPath, outputPath);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Strict Admin Role Check
    if ((session.user as any).role !== 'admin') {
      return res.status(403).json({ error: 'Interdit : Droits administrateur requis' });
    }

    if (req.method === 'POST') {
      if (!isVercel) {
        if (!existsSync(uploadDir)) {
          await fs.mkdir(uploadDir, { recursive: true });
        }
        if (!existsSync(certificatesDir)) {
          await fs.mkdir(certificatesDir, { recursive: true });
        }
      }

      const form = formidable({
        uploadDir: isVercel ? '/tmp' : certificatesDir,
        keepExtensions: true,
        maxFileSize: isVercel ? 4 * 1024 * 1024 : 50 * 1024 * 1024, // 4MB sur Vercel, 50MB en local
        filter: ({ mimetype }) => {
          return mimetype === 'application/pdf' || 
                 mimetype === 'image/png' || 
                 mimetype === 'image/jpeg';
        }
      });
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ error: 'Erreur lors du téléchargement du fichier' });
        }

        const file = files.image?.[0];
        if (!file) {
          return res.status(400).json({ error: 'Aucun fichier trouvé' });
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype || '')) {
          return res.status(400).json({ error: 'Type de fichier non autorisé. Seuls PDF, JPEG et PNG sont acceptés.' });
        }

        const fileId = new mongoose.Types.ObjectId();
        const fileExtension = path.extname(file.originalFilename || '');
        const uniqueFilename = `${fileId}${fileExtension}`;
        
        let fileData = null;
        let webPath = null;

        if (isVercel) {
          let processedFilePath = file.filepath;
          
          if (file.mimetype?.startsWith('image/')) {
            const tempProcessedPath = path.join('/tmp', `processed_${uniqueFilename}`);
            const blurZones = fields.blurZones ? JSON.parse(fields.blurZones[0] as string) : undefined;
            await processImageWithBlur(file.filepath, tempProcessedPath, blurZones);
            processedFilePath = tempProcessedPath;
          }
          
          const fileBuffer = await fs.readFile(processedFilePath);
          fileData = fileBuffer.toString('base64');
          
          try {
            await fs.unlink(file.filepath);
            if (processedFilePath !== file.filepath) {
              await fs.unlink(processedFilePath);
            }
          } catch (error) {
            console.warn('Erreur lors du nettoyage des fichiers temporaires:', error);
          }
        } else {
          const finalPath = path.join(certificatesDir, uniqueFilename);
          
          if (file.mimetype?.startsWith('image/')) {
            const blurZones = fields.blurZones ? JSON.parse(fields.blurZones[0] as string) : undefined;
            await processImageWithBlur(file.filepath, finalPath, blurZones);
          } else {
            await fs.rename(file.filepath, finalPath);
          }
          
          webPath = `/uploads/certificates/${uniqueFilename}`;
        }

        res.status(200).json({ 
          success: true,
          message: 'Certificat uploadé avec succès',
          fileId: fileId.toString(),
          filename: file.originalFilename,
          filePath: webPath,
          fileData: fileData
        });
      });
    } else if (req.method === 'DELETE') {
      const { filePath } = req.body;
      if (filePath) {
        try {
          if (!isVercel) {
            const fullPath = path.join(process.cwd(), 'public', filePath);
            if (existsSync(fullPath)) {
              await fs.unlink(fullPath);
            }
          }
          res.status(200).json({ message: 'Fichier supprimé avec succès' });
        } catch (error) {
          res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
        }
      } else {
        res.status(400).json({ error: 'Chemin de fichier manquant' });
      }
    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
}
