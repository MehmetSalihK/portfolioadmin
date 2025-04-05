import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Test d\'envoi d\'email');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Définie' : 'Non définie');
    console.log('RESEND_EMAIL:', process.env.RESEND_EMAIL);

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL) {
      return res.status(500).json({ 
        error: 'Configuration incomplète', 
        details: {
          apiKey: process.env.RESEND_API_KEY ? 'Définie' : 'Non définie',
          email: process.env.RESEND_EMAIL ? 'Définie' : 'Non définie'
        }
      });
    }

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.RESEND_EMAIL,
      subject: 'Test d\'envoi d\'email',
      html: '<p>Ceci est un test d\'envoi d\'email depuis votre application portfolio.</p>',
    });

    console.log('Résultat de l\'envoi:', result);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Erreur lors du test d\'envoi d\'email:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email', details: error });
  }
} 