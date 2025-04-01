const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function initializeAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.warn('Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
            return;
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Mise à jour ou création de l'admin
        await mongoose.connection.collection('admins').updateOne(
            { email: adminEmail },
            {
                $set: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Admin',
                    role: 'admin',
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log('✅ Admin account synchronized successfully');

    } catch (error) {
        console.error('Error syncing admin:', error);
    }
}

module.exports = initializeAdmin;
