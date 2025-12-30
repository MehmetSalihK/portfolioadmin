import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
const isVercel = process.env.VERCEL === '1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Strict Admin Role Check
    if ((session.user as any).role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

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
        if (!filePath) return res.status(400).json({ error: 'No file path provided' });
        
        // Security check: ensure we only delete files in our uploads dir
        if (!filePath.startsWith('/uploads/projects/')) {
             return res.status(403).json({ error: 'Invalid file path' });
        }

        const fullPath = path.join(process.cwd(), 'public', filePath);
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
