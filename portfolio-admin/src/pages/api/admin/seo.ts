import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import connectDB from '@/lib/db';
import SEO from '@/models/SEO';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
        try {
            const { page } = req.query;

            if (page) {
                const seoData = await SEO.findOne({ page });
                return res.status(200).json(seoData || {});
            }

            const allSeoData = await SEO.find({});
            return res.status(200).json(allSeoData);
        } catch (error) {
            console.error('Error fetching SEO data:', error);
            return res.status(500).json({ message: 'Error fetching SEO data' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { page, title, description, keywords, ogImage } = req.body;

            if (!page || !title || !description) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const updatedSeo = await SEO.findOneAndUpdate(
                { page },
                {
                    title,
                    description,
                    keywords,
                    ogImage,
                    updatedAt: new Date()
                },
                { new: true, upsert: true }
            );

            return res.status(200).json(updatedSeo);
        } catch (error) {
            console.error('Error updating SEO data:', error);
            return res.status(500).json({ message: 'Error updating SEO data' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
