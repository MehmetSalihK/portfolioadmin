import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface Send2FACodeParams {
  userEmail: string;
  code: string;
}

// ... existing imports ...

interface ContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async ({ name, email, subject, message }: ContactEmailParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <contact@resend.dev>',
      to: ['salihketur60@gmail.com'],
      replyTo: email, // Permet de répondre directement à l'expéditeur
      subject: `[Portfolio] Nouveau message : ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nouveau message de contact</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
            .footer { margin-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
            .label { font-weight: bold; color: #475569; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nouveau message reçu</h2>
              <p>Vous avez reçu un nouveau message depuis le formulaire de contact de votre portfolio.</p>
            </div>
            <div class="content">
              <p><span class="label">De :</span> ${name} (${email})</p>
              <p><span class="label">Sujet :</span> ${subject}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p><span class="label">Message :</span></p>
              <div style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 4px;">${message}</div>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par votre portfolio.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nouveau message de contact

De : ${name} (${email})
Sujet : ${subject}

Message :
${message}

-------------------
Envoyé depuis votre portfolio
      `
    });

    if (error) {
      console.error('Erreur Resend:', error);
      throw new Error('Échec de l\'envoi de l\'email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Erreur sendContactEmail:', error);
    throw error;
  }
};

export const send2FACode = async ({ userEmail, code }: Send2FACodeParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['salihketur60@gmail.com'], // Email vérifié pour Resend en mode test
      subject: 'Code de vérification 2FA - Portfolio Admin',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de vérification 2FA</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #e2e8f0;
              margin: 0;
              padding: 0;
              background-color: #0f172a;
            }
            .wrapper {
              width: 100%;
              background-color: #0f172a;
              padding: 40px 0;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: #1e293b;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
              border: 1px solid #334155;
            }
            .header {
              text-align: center;
              padding: 30px 40px;
              background: #0f172a;
              border-bottom: 1px solid #334155;
            }
            .logo {
              font-size: 20px;
              font-weight: 700;
              color: #f8fafc;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px;
              text-align: center;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #f8fafc;
              margin-bottom: 24px;
            }
            .text {
              color: #cbd5e1;
              margin-bottom: 30px;
              font-size: 16px;
            }
            .highlight {
              color: #38bdf8;
              font-weight: 500;
            }
            .code-container {
              background: #0f172a;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
              border: 1px solid #334155;
            }
            .code {
              font-family: 'Courier New', monospace;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 12px;
              color: #38bdf8;
              display: inline-block;
            }
            .details {
              text-align: left;
              background: #334155;
              padding: 20px;
              border-radius: 8px;
              font-size: 14px;
              color: #cbd5e1;
              margin-top: 30px;
            }
            .details li {
              margin-bottom: 8px;
            }
            .details li:last-child {
              margin-bottom: 0;
            }
            .footer {
              text-align: center;
              padding: 30px;
              color: #64748b;
              font-size: 12px;
              border-top: 1px solid #334155;
              background: #0f172a;
            }
            @media only screen and (max-width: 600px) {
              .content, .header { padding: 20px; }
              .code { font-size: 28px; letter-spacing: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">Portfolio Admin</div>
              </div>
              
              <div class="content">
                <h1 class="title">Authentification Sécurisée</h1>
                
                <p class="text">Une tentative de connexion a été détectée avec l'email <span class="highlight">${userEmail}</span>.</p>
                
                <p class="text">Utilisez le code suivant pour valider votre identité :</p>
                
                <div class="code-container">
                  <span class="code">${code}</span>
                </div>
                
                <div class="details">
                  <strong style="color: #f8fafc; display: block; margin-bottom: 10px;">Informations de sécurité :</strong>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Ce code expire dans <strong>10 minutes</strong>.</li>
                    <li>Ne partagez jamais ce code.</li>
                    <li>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</li>
                  </ul>
                </div>
              </div>

              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Portfolio Admin. Tous droits réservés.</p>
                <p>Système de vérification sécurisé par Resend</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
--------------------------------------------------
PORTFOLIO ADMIN - AUTHENTIFICATION SÉCURISÉE
--------------------------------------------------

Bonjour,

Une tentative de connexion a été détectée pour le compte : ${userEmail}

VOTRE CODE DE VÉRIFICATION :
${code}

Ce code est valide pour 10 minutes.
Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.

--------------------------------------------------
© ${new Date().getFullYear()} Portfolio Admin
--------------------------------------------------
      `
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email 2FA:', error);
      throw new Error('Échec de l\'envoi de l\'email de vérification');
    }

    console.log('Email 2FA envoyé avec succès:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Erreur dans send2FACode:', error);
    throw error;
  }
};

// Fonction utilitaire pour générer un code à 6 chiffres
export const generate2FACode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const emailService = { send2FACode, generate2FACode, sendContactEmail };
export default emailService;