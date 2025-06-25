import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, salt);

    await Admin.findOneAndUpdate(
      { email: { $exists: true } },
      {
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    res.status(200).json({ message: 'Admin credentials updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Error updating admin credentials' });
  }
}
