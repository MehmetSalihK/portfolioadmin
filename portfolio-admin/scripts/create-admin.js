const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('Please provide MONGODB_URI in your .env.local file');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const result = await db.collection('admins').insertOne({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Admin user created successfully:', result.insertedId);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdmin();
