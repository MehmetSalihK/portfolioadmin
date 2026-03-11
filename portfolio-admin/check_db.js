const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String
}, { collection: 'experiences' });

async function check() {
  try {
    console.log('Connecting to:', MONGODB_URI?.substring(0, 30) + '...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');
    
    const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
    const count = await Experience.countDocuments();
    console.log(`Experience count: ${count}`);
    
    const experiences = await Experience.find({}).limit(5).lean();
    console.log('Experiences snippet:', JSON.stringify(experiences, null, 2));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
