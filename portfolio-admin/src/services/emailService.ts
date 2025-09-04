import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface Send2FACodeParams {
  userEmail: string;
  code: string;
}

export const send2FACode = async ({ userEmail, code }: Send2FACodeParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['contact@mehmetsalihk.fr'], // Toujours envoyer à cette adresse
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
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .code-container {
              background: #f3f4f6;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #1f2937;
              font-family: 'Courier New', monospace;
            }
            .info {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Portfolio Admin</div>
              <h1>Code de vérification 2FA</h1>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Une tentative de connexion a été effectuée avec l'adresse email <strong>${userEmail}</strong> sur le panneau d'administration du portfolio.</p>
            
            <div class="info">
              <strong>Information :</strong> Pour des raisons de sécurité, tous les codes de vérification sont envoyés uniquement à cette adresse (contact@mehmetsalihk.fr), peu importe l'email utilisé pour la connexion.
            </div>
            
            <p>Voici votre code de vérification à 6 chiffres :</p>
            
            <div class="code-container">
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>Important :</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Ce code expire dans <strong>10 minutes</strong></li>
                <li>Vous avez <strong>3 tentatives maximum</strong> pour saisir le bon code</li>
                <li>Ne partagez jamais ce code avec qui que ce soit</li>
              </ul>
            </div>
            
            <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par le système Portfolio Admin.</p>
              <p>© ${new Date().getFullYear()} Portfolio Admin - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Code de vérification 2FA - Portfolio Admin

Bonjour,

Une tentative de connexion a été effectuée avec l'adresse email ${userEmail} sur le panneau d'administration du portfolio.

Pour des raisons de sécurité, tous les codes de vérification sont envoyés uniquement à cette adresse (contact@mehmetsalihk.fr), peu importe l'email utilisé pour la connexion.

Voici votre code de vérification à 6 chiffres :

${code}

IMPORTANT :
- Ce code expire dans 10 minutes
- Vous avez 3 tentatives maximum pour saisir le bon code
- Ne partagez jamais ce code avec qui que ce soit

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.

Cet email a été envoyé automatiquement par le système Portfolio Admin.
© ${new Date().getFullYear()} Portfolio Admin - Tous droits réservés
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

export default { send2FACode, generate2FACode };