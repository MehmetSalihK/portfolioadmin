import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { Resend } from 'resend';
import { ContactEmail } from '@/emails/ContactEmail';
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY n\'est pas définie dans les variables d\'environnement');
}
if (!process.env.RESEND_EMAIL) {
  console.error('RESEND_EMAIL n\'est pas défini dans les variables d\'environnement');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    console.log('Connexion à la base de données réussie');

    const { firstName, lastName, company, phone, email, subject, message } = req.body;
    console.log('Données reçues:', { firstName, lastName, company, phone, email, subject, message });
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs requis' });
    }
    const newMessage = await Message.create({
      firstName,
      lastName,
      company,
      phone,
      email,
      subject,
      message,
    });
    console.log('Message enregistré dans la base de données:', newMessage);

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL) {
      console.error('Configuration Resend incomplète. Vérifiez vos variables d\'environnement.');
      return res.status(500).json({ message: 'Configuration du service d\'email incomplète' });
    }

    console.log('Tentative d\'envoi d\'email à:', process.env.RESEND_EMAIL);
    try {
      const result = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.RESEND_EMAIL,
        subject: `[Portfolio] Nouveau message de ${firstName} ${lastName}`,
        react: ContactEmail({
          firstName,
          lastName,
          email,
          phone,
          company,
          subject,
          message,
        }),
        replyTo: email,
      });
      console.log('Email envoyé avec succès:', result);
    } catch (emailError) {
      console.error('Erreur détaillée lors de l\'envoi de l\'email:', emailError);
    }

    return res.status(201).json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error('Error in contact API:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
}
