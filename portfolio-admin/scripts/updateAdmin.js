const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const adminsCollection = db.collection('admins');

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('EdaMirray.1302&', salt);

    // Update or insert admin
    const result = await adminsCollection.updateOne(
      { email: { $exists: true } }, // Find any existing admin
      {
        $set: {
          email: 'sketur60@admin.msk',
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );

    console.log('Admin credentials updated successfully');
  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await client.close();
  }
}

updateAdmin();
