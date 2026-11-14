import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const guard = await requireAdmin(req, res);
    if (!guard) return;

    await connectDB();

    const { items } = req.body; // Expecting Array<{ id: string, order: number }>

    if (!Array.isArray(items) || items.length > 500) {
      return res.status(400).json({ error: 'Invalid data format. Expected array of items.' });
    }

    // Validation élément par élément : sans cela, `item.id` pourrait être
    // un objet d'opérateur Mongo ({ $gt: … }) injecté dans le filtre, et
    // `item.order` n'importe quelle valeur.
    const validItems: Array<{ id: string; order: number }> = [];
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: 'Invalid item format' });
      }
      const { id, order } = item as { id?: unknown; order?: unknown };
      if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid project id' });
      }
      if (typeof order !== 'number' || !Number.isFinite(order)) {
        return res.status(400).json({ error: 'Invalid order value' });
      }
      validItems.push({ id, order });
    }

    // Bulk update operations
    const operations = validItems.map((item) => ({
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