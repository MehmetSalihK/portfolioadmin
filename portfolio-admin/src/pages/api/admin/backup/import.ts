import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs';

// Models
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import Education from '@/models/Education';
import Media from '@/models/Media';
import CV from '@/models/CV';
import Setting from '@/models/Setting';
import SkillCategory from '@/models/SkillCategory';
import Message from '@/models/Message';

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
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        await connectDB();

        const form = formidable({
            keepExtensions: true,
            maxFileSize: 50 * 1024 * 1024, // 50MB max
        });

        const [fields, files] = await form.parse(req);
        const file = Array.isArray(files.backup) ? files.backup[0] : files.backup;

        if (!file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        // Read and parse JSON
        const fileContent = fs.readFileSync(file.filepath, 'utf-8');
        const backup = JSON.parse(fileContent);

        if (!backup.data || !backup.version) {
            return res.status(400).json({ error: 'Format de sauvegarde invalide' });
        }

        const { data } = backup;

        // TODO: Add Transaction support if Replica Set is available. For now, sequential.

        // 1. Projects
        if (data.projects) {
            await Project.deleteMany({});
            if (data.projects.length > 0) await Project.insertMany(data.projects);
        }

        // 2. Skills
        if (data.skills) {
            await Skill.deleteMany({});
            if (data.skills.length > 0) await Skill.insertMany(data.skills);
        }

        // 3. Experiences
        if (data.experiences) {
            await Experience.deleteMany({});
            if (data.experiences.length > 0) await Experience.insertMany(data.experiences);
        }

        // 4. Education
        if (data.education) {
            await Education.deleteMany({});
            if (data.education.length > 0) await Education.insertMany(data.education);
        }

        // 5. Media
        if (data.media) {
            await Media.deleteMany({});
            if (data.media.length > 0) await Media.insertMany(data.media);
        }

        // 6. CVs
        if (data.cvs) {
            await CV.deleteMany({});
            if (data.cvs.length > 0) await CV.insertMany(data.cvs);
        }

        // 7. Settings
        if (data.settings) {
            await Setting.deleteMany({});
            if (data.settings.length > 0) await Setting.insertMany(data.settings);
        }

        // 8. Skill Categories
        if (data.skillCategories) {
            await SkillCategory.deleteMany({});
            if (data.skillCategories.length > 0) await SkillCategory.insertMany(data.skillCategories);
        }

        // 9. Messages (Optional restore?) - Let's restore them too
        if (data.messages) {
            await Message.deleteMany({});
            if (data.messages.length > 0) await Message.insertMany(data.messages);
        }

        // Cleanup temp file
        try {
            if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
        } catch (e) {
            console.error('Error cleaning temp file', e);
        }

        return res.status(200).json({
            message: 'Restauration réussie',
            details: {
                projects: data.projects?.length || 0,
                skills: data.skills?.length || 0,
                settings: data.settings?.length || 0
            }
        });

    } catch (error) {
        console.error('Backup import error:', error);
        return res.status(500).json({ error: 'Erreur lors de la restauration' });
    }
}
