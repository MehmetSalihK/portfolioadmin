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
              background-color: #020617; /* Slate 950 - Darker background */
            }
            .wrapper {
              width: 100%;
              background-color: #020617;
              padding: 40px 0;
            }
            .container {
              max-width: 480px;
              margin: 0 auto;
              background: #0f172a; /* Slate 900 */
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
              border: 1px solid #1e293b; /* Slate 800 */
            }
            .header {
              text-align: center;
              padding: 30px;
              background: linear-gradient(to bottom, #1e293b, #0f172a);
              border-bottom: 1px solid #1e293b;
            }
            .logo {
              font-size: 22px;
              font-weight: 800;
              color: #f8fafc;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              background: linear-gradient(to right, #60a5fa, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              display: inline-block;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .icon-shield {
              font-size: 40px;
              margin-bottom: 20px;
              display: block;
            }
            .title {
              font-size: 20px;
              font-weight: 600;
              color: #f8fafc;
              margin: 0 0 24px 0;
            }
            .text {
              color: #94a3b8; /* Slate 400 */
              margin-bottom: 30px;
              font-size: 15px;
              line-height: 1.7;
            }
            .highlight {
              color: #e2e8f0;
              font-weight: 600;
            }
            .code-box {
              background: rgba(15, 23, 42, 0.5);
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              border: 1px solid #334155; /* Slate 700 */
              position: relative;
              overflow: hidden;
            }
            .code {
              font-family: 'Courier New', monospace;
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #38bdf8; /* Sky 400 */
              text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
              display: inline-block;
              position: relative;
              z-index: 10;
            }
            .warning-box {
              background: rgba(234, 179, 8, 0.1); /* Yellow 500 with opacity */
              border: 1px solid rgba(234, 179, 8, 0.2);
              border-radius: 8px;
              padding: 16px;
              text-align: left;
              margin-top: 32px;
            }
            .warning-title {
              color: #fde047; /* Yellow 300 */
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              display: block;
            }
            .warning-list {
              margin: 0;
              padding-left: 20px;
              color: #cbd5e1; /* Slate 300 */
              font-size: 13px;
              text-align: left;
            }
            .warning-list li {
              margin-bottom: 4px;
            }
            .footer {
              text-align: center;
              padding: 24px;
              color: #475569; /* Slate 600 */
              font-size: 12px;
              border-top: 1px solid #1e293b;
              background: #020617;
            }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <!-- Fallback text logo with gradient -->
                <span class="logo">Portfolio Admin</span>
              </div>
              
              <div class="content">
                <span class="icon-shield">🛡️</span>
                <h1 class="title">Code de vérification</h1>
                
                <p class="text">
                  Une tentative de connexion a été détectée sur votre compte pour <span class="highlight">${userEmail}</span>.
                </p>
                
                <div class="code-box">
                  <span class="code">${code}</span>
                </div>

                <div class="warning-box">
                  <span class="warning-title">Informations de sécurité</span>
                  <ul class="warning-list">
                    <li>Ce code expire dans 10 minutes.</li>
                    <li>Ne le partagez avec personne.</li>
                    <li>Si vous n'êtes pas à l'origine de ceci, ignorez cet email.</li>
                  </ul>
                </div>
              </div>

              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Portfolio Admin. Tous droits réservés.</p>
                <p>Envoyé automatiquement par le système de sécurité.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
--------------------------------------------------
PORTFOLIO ADMIN - CODE DE VÉRIFICATION
--------------------------------------------------

Bonjour,

Une tentative de connexion a été détectée pour : ${userEmail}

VOTRE CODE UNIQUE :
${code}

SÉCURITÉ :
- Expire dans 10 minutes.
- Ne partagez jamais ce code.

Si vous n'avez pas demandé ce code, ignorez simplement ce message.

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