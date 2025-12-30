import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    const { items } = req.body; // Expecting Array<{ id: string, order: number }>

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format. Expected array of items.' });
    }

    // Bulk update operations
    const operations = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    if (operations.length > 0) {
      await Project.bulkWrite(operations);
    }

    return res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error reordering projects:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}