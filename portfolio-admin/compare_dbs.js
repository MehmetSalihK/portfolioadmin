const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');
    
    for (const dbName of ['test', 'portfolio']) {
      console.log(`\n--- Database: ${dbName} ---`);
      const db = mongoose.connection.useDb(dbName);
      const collections = await db.db.listCollections().toArray();
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`- ${coll.name}: ${count}`);
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
