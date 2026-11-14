import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { isPathInside, resolveSafePath } from '@/utils/pathSafety';
import { extensionOf, readFileHead, sniffFileKind } from '@/utils/uploadSafety';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
const isVercel = process.env.VERCEL === '1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const guard = await requireAdmin(req, res);
    if (!guard) return;

    if (req.method === 'POST') {
      // Ensure upload directory exists locally
      if (!isVercel && !existsSync(uploadDir)) {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const form = formidable({
        uploadDir: isVercel ? '/tmp' : uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        filter: ({ mimetype }) => {
          return !!mimetype && mimetype.includes('image');
        },
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Upload Error:', err);
          return res.status(500).json({ error: 'Error uploading file' });
        }

        const file = files.file?.[0]; // React-dropzone often sends 'file'
        if (!file) {
          return res.status(400).json({ error: 'No file found' });
        }

        // MIME déclaré par le client = non fiable. On impose une extension
        // image de la liste blanche et on vérifie la signature réelle.
        // Le SVG est refusé : il contiendrait du JavaScript servi depuis
        // l'origine (XSS stocké).
        const originalExt = extensionOf(file.originalFilename || '');
        const storedExt = extensionOf(file.filepath || '');
        const allowedImageExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
        if (!allowedImageExt.includes(originalExt || storedExt)) {
          return res.status(400).json({ error: 'Extension non autorisée (SVG refusé)' });
        }

        let head: Buffer;
        try {
          head = await readFileHead(file.filepath, 16);
        } catch {
          return res.status(400).json({ error: 'Fichier illisible' });
        }
        if (sniffFileKind(head) !== 'image') {
          return res.status(400).json({ error: 'Le contenu du fichier n’est pas une image valide' });
        }

        const fileName = path.basename(file.filepath);
        let webPath = `/uploads/projects/${fileName}`;

        // In Vercel, files in /tmp are ephemeral and can't be served statically easily without external storage (S3/Cloudinary)
        // But for this "local" focused request, we handle the local case properly.
        // If on Vercel, we can't really save permanently to public/uploads.
        
        if (!isVercel) {
          // Move from temp (if parsing used temp) to final dest if needed, 
          // but formidable with uploadDir option usually puts it there directly.
          // However, formidable often gives random names. We might want to rename it?
          // For now, keeping the random name is safe for uniqueness.
        } else {
             // WARNING: On Vercel this will not persist. 
             // Ideally we should return base64 or push to blob storage.
             // For this task, we assume local or persistent volume.
             console.warn('File uploaded to ephemeral storage on Vercel');
        }

        return res.status(200).json({ 
          success: true, 
          filepath: webPath,
          originalFilename: file.originalFilename 
        });
      });
    } else if (req.method === 'DELETE') {
        const { filePath } = req.body;
        if (typeof filePath !== 'string' || !filePath) {
          return res.status(400).json({ error: 'No file path provided' });
        }

        // Contrainte stricte : résolution du chemin puis containment dans
        // public/uploads/projects. Le simple startsWith laissait passer
        // « /uploads/projects/../../secrets » (path traversal).
        const publicDir = path.join(process.cwd(), 'public');
        const relative = filePath.replace(/^\/+/, '');
        const fullPath = resolveSafePath(publicDir, relative);
        if (!fullPath || !isPathInside(fullPath, uploadDir)) {
          return res.status(403).json({ error: 'Invalid file path' });
        }

        if (existsSync(fullPath)) {
            await fs.unlink(fullPath);
        }
        return res.status(200).json({ success: true });

    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
