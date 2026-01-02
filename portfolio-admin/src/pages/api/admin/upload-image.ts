import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    try {
        const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
        // Dossier 'public/uploads/about' pour stocker les photos de profil
        const uploadDir = isVercel
            ? '/tmp'
            : path.join(process.cwd(), 'public', 'uploads', 'about');

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
            maxFileSize: 5 * 1024 * 1024, // 5MB max pour une photo
            filter: ({ mimetype }) => {
                return mimetype === 'image/png' ||
                    mimetype === 'image/jpeg' ||
                    mimetype === 'image/webp';
            }
        });

        const [fields, files] = await form.parse(req);
        const file = Array.isArray(files.image) ? files.image[0] : files.image;

        if (!file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const timestamp = Date.now();
        const extension = path.extname(file.originalFilename || '');
        const newFilename = `profile_${timestamp}${extension}`;

        // Chemin public accessible
        let publicUrl = '';

        if (isVercel) {
            // Note: Sur Vercel, le système de fichiers est éphémère.
            // Idéalement, il faudrait uploader sur un cloud storage (S3, Cloudinary).
            // Pour l'instant, on stocke en base64 temporairement si besoin ou on garde le comportement local
            // Mais ici on va se contenter de renvoyer une erreur si on est sur Vercel sans cloud storage
            // OU pour simplifier le dev local de l'utilisateur :
            return res.status(500).json({ error: "Le stockage de fichiers sur Vercel nécessite un service externe (S3, Cloudinary)." });
        } else {
            const newPath = path.join(uploadDir, newFilename);
            fs.renameSync(file.filepath, newPath);
            publicUrl = `/uploads/about/${newFilename}`;
        }

        return res.status(200).json({
            message: 'Image uploadée avec succès',
            url: publicUrl
        });

    } catch (error) {
        console.error('Erreur upload image:', error);
        return res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
}
