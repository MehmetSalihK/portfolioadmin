const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');
    
    const admin = mongoose.connection.useDb('admin');
    const dbs = await admin.db.admin().listDatabases();
    console.log('Databases:', JSON.stringify(dbs.databases.map(d => d.name), null, 2));
    
    for (const dbInfo of dbs.databases) {
      const db = mongoose.connection.useDb(dbInfo.name);
      const collections = await db.db.listCollections().toArray();
      const projects = collections.find(c => c.name === 'projects');
      if (projects) {
        const count = await db.collection('projects').countDocuments();
        console.log(`Database "${dbInfo.name}" has ${count} projects.`);
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
