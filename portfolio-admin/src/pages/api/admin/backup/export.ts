import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/db';

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        await connectDB();

        const timestamp = new Date().toISOString();

        // Fetch all data in parallel
        const [
            projects,
            skills,
            experiences,
            education,
            media,
            cvs,
            settings,
            skillCategories,
            messages
        ] = await Promise.all([
            Project.find({}).lean(),
            Skill.find({}).lean(),
            Experience.find({}).lean(),
            Education.find({}).lean(),
            Media.find({}).lean(),
            CV.find({}).lean(),
            Setting.find({}).lean(),
            SkillCategory.find({}).lean(),
            Message.find({}).lean()
        ]);

        const backupData = {
            version: '1.0',
            timestamp,
            exportedBy: session.user?.email,
            counts: {
                projects: projects.length,
                skills: skills.length,
                experiences: experiences.length,
                education: education.length,
                media: media.length,
                cvs: cvs.length,
                settings: settings.length,
                skillCategories: skillCategories.length,
                messages: messages.length
            },
            data: {
                projects,
                skills,
                experiences,
                education,
                media,
                cvs,
                settings,
                skillCategories,
                messages
            }
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=portfolio-backup-${new Date().toISOString().split('T')[0]}.json`);

        return res.status(200).json(backupData);

    } catch (error) {
        console.error('Backup export error:', error);
        return res.status(500).json({ error: 'Erreur lors de la création de la sauvegarde' });
    }
}
