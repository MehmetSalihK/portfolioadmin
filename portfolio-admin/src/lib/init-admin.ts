import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Admin from '@/models/Admin';

export default async function initializeAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error('ADMIN_EMAIL ou ADMIN_PASSWORD non défini dans .env.local');
    }

    if (mongoose.connection.readyState !== 1) {
        throw new Error('La connexion MongoDB n\'est pas établie');
    }

    console.log('🔑 Synchronisation des identifiants admin...');
    console.log('📧 Email:', adminEmail);

    try {
        const admin = await Admin.findOne({ email: adminEmail }).select('+password');

        const now = new Date();
        const franceDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));

        if (!admin) {
            const newAdmin = new Admin({
                email: adminEmail,
                password: adminPassword, // Le hook pre-save va le hasher
                name: 'Admin',
                role: 'admin',
                createdAt: franceDate,
                updatedAt: franceDate
            });
            await newAdmin.save();
            console.log('✅ Nouvel admin créé avec succès');
        } else {
            admin.password = adminPassword; // Le hook pre-save va le hasher
            admin.updatedAt = franceDate;
            await admin.save();
            console.log('✅ Admin mis à jour avec succès');
        }
    } catch (error: any) {
        console.error('❌ Erreur lors de la synchronisation:', error?.message || error);
        throw new Error(`Erreur lors de la synchronisation: ${error?.message || error}`);
    }
}
