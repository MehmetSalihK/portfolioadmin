import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface Send2FACodeParams {
  userEmail: string;
  code: string;
}

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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
            .content { background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
            .footer { margin-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
            .label { font-weight: bold; color: #475569; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0; color: #0f172a;">Nouveau message reçu</h2>
              <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Formulaire de contact Portfolio</p>
            </div>
            <div class="content">
              <p><span class="label">De :</span> ${name} (<a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a>)</p>
              <p><span class="label">Sujet :</span> ${subject}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p><span class="label">Message :</span></p>
              <div style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 4px; border: 1px solid #f1f5f9; color: #334155;">${message}</div>
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
      from: 'Portfolio Admin <onboarding@resend.dev>',
      to: ['salihketur60@gmail.com'], // Email vérifié pour Resend en mode test
      subject: 'Code de vérification 2FA - Portfolio Admin',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de vérification</title>
          <style>
            /* Reset & Typography */
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: #020617; /* Slate 950: Ultra Dark Background */
              margin: 0; 
              padding: 0; 
              color: #f1f5f9; /* Slate 100: High Contrast Text */
              -webkit-font-smoothing: antialiased;
            }
            
            /* Layout */
            .wrapper {
              width: 100%;
              padding: 60px 0;
              background-color: #020617;
            }
            .container {
              max-width: 480px;
              margin: 0 auto;
              background: #0f172a; /* Slate 900: Dark Card */
              border-radius: 12px;
              border: 1px solid #1e293b; /* Slate 800: Subtle Border */
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* Deep Shadow */
              overflow: hidden;
            }

            /* Branding & Header */
            .header {
              text-align: center;
              padding: 40px 40px 20px;
              border-bottom: 1px solid #1e293b;
            }
            .logo {
              font-size: 16px;
              font-weight: 700;
              color: #f8fafc;
              text-transform: uppercase;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 10px;
            }
            .logo-accent {
              width: 8px;
              height: 8px;
              background-color: #6366f1; /* Indigo 500: Professional Accent */
              border-radius: 2px;
              box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); /* Subtle Glow */
            }

            /* Content Area */
            .content {
              padding: 40px;
              text-align: center;
            }
            .title {
              font-size: 20px;
              font-weight: 600;
              color: #f8fafc;
              margin: 0 0 16px;
              letter-spacing: -0.025em;
            }
            .text {
              font-size: 15px;
              line-height: 1.6;
              color: #94a3b8; /* Slate 400: Muted Text */
              margin-bottom: 32px;
            }
            .highlight {
              color: #e2e8f0; /* Slate 200 */
              font-weight: 500;
            }

            /* The Code Block - The Star Show */
            .code-container {
              margin: 32px 0;
            }
            .code {
              font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 6px;
              color: #818cf8; /* Indigo 400: Readable on Dark */
              background: rgba(99, 102, 241, 0.1); /* Low Opacity Indigo Tint */
              border: 1px solid rgba(99, 102, 241, 0.2); /* Subtle Border */
              padding: 20px 32px;
              border-radius: 8px;
              display: inline-block;
              
              /* UX: One Click Select */
              user-select: all;
              -webkit-user-select: all;
              cursor: pointer;
              transition: all 0.2s;
            }

            /* Footer & Info */
            .divider {
              height: 1px;
              background: #1e293b;
              margin: 32px 0;
              border: none;
            }
            .info {
              font-size: 13px;
              color: #64748b; /* Darker Slate for Footer Info */
            }

            .footer {
              background: #020617;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #475569; /* Slate 600 */
              border-top: 1px solid #1e293b;
            }
            .footer p { margin: 4px 0; }

            /* Utilities */
            .preheader { display: none; font-size: 1px; color: #020617; }
          </style>
        </head>
        <body>
          <span class="preheader">Code : ${code}. Valable 10 minutes.</span>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <span class="logo">
                  Portfolio Admin <span class="logo-accent"></span>
                </span>
              </div>
              
              <div class="content">
                <h1 class="title">Authentification</h1>
                
                <p class="text">
                  Une demande de connexion a été reçue pour <span class="highlight">${userEmail}</span>.
                </p>
                
                <div class="code-container">
                  <span class="code" title="Cliquez pour copier">${code}</span>
                </div>
                
                <p class="info">
                  Ce code est valide pendant 10 minutes.<br>
                  Ne le partagez avec personne.
                </p>
              </div>

              <div class="footer">
                <p>&copy; 2024 - 2026 Portfolio Admin. Tous droits réservés.</p>
                <p>Envoyé automatiquement par le système de sécurité.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
AUTHENTIFICATION
----------------

Code de vérification : ${code}

Bonjour,

Une connexion a été initiée pour : ${userEmail}

VOTRE CODE :
${code}

(Ce code expire dans 10 minutes)

Sécurité : Ne partagez jamais ce code.

----------------
© 2024 - 2026 Portfolio Admin. Tous droits réservés.
Envoyé automatiquement par le système de sécurité.
      `
    });

    if (error) {
      console.error('Erreur Resend:', error);
      throw new Error('Échec de l\'envoi de l\'email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Erreur dans send2FACode:', error);
    throw error;
  }
};

export const generate2FACode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const emailService = { send2FACode, generate2FACode, sendContactEmail };
export default emailService;