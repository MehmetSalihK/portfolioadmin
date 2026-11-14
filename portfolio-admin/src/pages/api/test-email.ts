import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/auth-guard';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Envoi d'email (poste de relais) → réservé admin.
  // (Avant : n'importe qui pouvait déclencher des envois en boucle et
  // surconsommer le quota Resend / nuire à la réputation de l'expéditeur.)
  const guard = await requireAdmin(req, res);
  if (!guard) return;

  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL) {
      return res.status(500).json({ error: 'Configuration incomplète' });
    }

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.RESEND_EMAIL,
      subject: 'Test d\'envoi d\'email',
      html: '<p>Ceci est un test d\'envoi d\'email depuis votre application portfolio.</p>',
    });

    return res.status(200).json({ success: true, result });
  } catch (error) {
    // Jamais d'objet d'erreur complet en réponse (fuite d'informations
    // internes : clés, endpoints, détails de configuration).
    console.error('Erreur lors du test d\'envoi d\'email:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
} 