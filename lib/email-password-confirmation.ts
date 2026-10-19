import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface PasswordEmailOptions {
  email: string;
  fullName: string;
  username: string;
  newPassword: string;
  isReset?: boolean;
}

export async function sendPasswordChangeConfirmationEmail({
  email,
  fullName,
  username,
  newPassword,
  isReset = false,
}: PasswordEmailOptions) {
  const adminEmail = process.env.GMAIL_USER || "hecentrepreneurs8@gmail.com";
  const now = new Date();
  const dateFormatted = now.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Tunis",
  });

  const subject = isReset
    ? "Réinitialisation de votre mot de passe - Intranet Club HEC Entrepreneurs"
    : "Confirmation de modification de votre mot de passe - Intranet Club HEC Entrepreneurs";

  const actionTitle = isReset
    ? "Votre mot de passe a été réinitialisé"
    : "Votre mot de passe a été modifié avec succès";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #07070a;
          color: #ffffff;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #111116;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .header {
          text-align: center;
          padding: 35px 25px 25px;
          background: linear-gradient(180deg, rgba(147, 51, 234, 0.2) 0%, rgba(17, 17, 22, 0) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .badge {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 999px;
          background: rgba(147, 51, 234, 0.25);
          border: 1px solid rgba(147, 51, 234, 0.45);
          color: #c084fc;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 35px 30px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 600;
          color: #f3f4f6;
          margin-bottom: 12px;
        }
        .text {
          font-size: 14px;
          line-height: 1.6;
          color: #9ca3af;
          margin-bottom: 24px;
        }
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(147, 51, 234, 0.25);
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 28px;
        }
        .card-row {
          display: flex;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 13px;
        }
        .card-row:last-child {
          border-bottom: none;
        }
        .card-label {
          color: #9ca3af;
        }
        .card-value {
          color: #ffffff;
          font-weight: 600;
        }
        .password-box {
          background: rgba(147, 51, 234, 0.15);
          border: 1px dashed #a855f7;
          border-radius: 12px;
          padding: 14px 18px;
          margin-top: 14px;
          text-align: center;
        }
        .password-label {
          font-size: 11px;
          color: #d8b4fe;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .password-value {
          font-family: 'Courier New', Courier, monospace;
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 2px;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0 10px;
        }
        .btn {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.35);
        }
        .security-note {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 14px;
          font-size: 12px;
          color: #fca5a5;
          line-height: 1.5;
          margin-top: 24px;
        }
        .footer {
          text-align: center;
          padding: 24px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 11px;
          color: #6b7280;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">Sécurité Intranet</div>
          <h1>${actionTitle}</h1>
        </div>

        <div class="content">
          <div class="greeting">Bonjour ${fullName},</div>
          <div class="text">
            Votre mot de passe d&apos;accès au <strong>Portail Intranet du Club HEC Entrepreneurs</strong> a bien été mis à jour.
            Voici vos identifiants officiels pour vous connecter :
          </div>

          <div class="card">
            <div class="card-row">
              <span class="card-label">Nom & Prénom :</span>
              <span class="card-value">${fullName}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Nom d&apos;utilisateur (Username) :</span>
              <span class="card-value" style="color: #c084fc; font-family: monospace; font-size: 14px;">${username}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Adresse Email :</span>
              <span class="card-value">${email}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Date de mise à jour :</span>
              <span class="card-value">${dateFormatted}</span>
            </div>

            <div class="password-box">
              <div class="password-label">Votre Nouveau Mot de Passe</div>
              <div class="password-value">${newPassword}</div>
            </div>
          </div>

          <div class="btn-container">
            <a href="https://hec-entrepreneurs.vercel.app/portail/login" class="btn" target="_blank">
              Se Connecter au Portail
            </a>
          </div>

          <div class="security-note">
            <strong>Rappel de sécurité :</strong> Conservez ces identifiants confidentiels. Si vous n&apos;êtes pas à l&apos;origine de cette action, veuillez immédiatement contacter le bureau ou l&apos;équipe technique.
          </div>
        </div>

        <div class="footer">
          Club HEC Entrepreneurs — IHEC Carthage<br/>
          Ceci est un message automatique, merci de ne pas y répondre directement.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Club HEC Entrepreneurs" <${adminEmail}>`,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`Password confirmation email sent to ${email} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`Error sending password confirmation email to ${email}:`, error);
    return { success: false, error: error.message };
  }
}
