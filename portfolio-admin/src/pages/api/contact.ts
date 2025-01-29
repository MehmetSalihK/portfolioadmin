import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { Resend } from 'resend';
import { ContactEmail } from '@/emails/ContactEmail';

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

    const { firstName, lastName, company, phone, email, subject, message } = req.body;

    // Validation des champs requis
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs requis' });
    }

    // Créer le message dans la base de données
    const newMessage = await Message.create({
      firstName,
      lastName,
      company,
      phone,
      email,
      subject,
      message,
    });

    // Envoyer l'email avec Resend en utilisant le template React
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: process.env.RESEND_EMAIL!,
      subject: `Nouveau message: ${subject}`,
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

    return res.status(201).json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error('Error in contact API:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
}
