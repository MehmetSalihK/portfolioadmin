const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('La variable d\'environnement MONGODB_URI n\'est pas définie');
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");
    const adminsCollection = db.collection("admins");

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const adminUser = {
      email: "admin@admin.com",
      password: hashedPassword,
      name: "Admin User",
      role: "super-admin",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the admin user
    await adminsCollection.insertOne(adminUser);
    console.log("Admin user created successfully!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await client.close();
  }
}

createAdmin();
