import mongoose from 'mongoose';
import Experience from './src/models/Experience';
import dbConnect from './src/lib/dbConnect';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    console.log('Connecting to DB...');
    await dbConnect();
    console.log('Connected.');
    
    const count = await Experience.countDocuments();
    console.log(`Experience count: ${count}`);
    
    const experiences = await Experience.find({}).lean();
    console.log('Experiences:', JSON.stringify(experiences, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
