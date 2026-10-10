import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabase-admin';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface BroadcastOptions {
  subject: string;
  badge?: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  recipients?: string[]; // If omitted, broadcasts to all club members
}

export async function broadcastToClubMembers({
  subject,
  badge = "Communication Interne",
  title,
  message,
  actionText = "Accéder à l'Intranet",
  actionUrl = "https://hec-entrepreneurs.org/portail",
  recipients,
}: BroadcastOptions) {
  try {
    let emailList: string[] = [];

    if (recipients && recipients.length > 0) {
      emailList = recipients;
    } else {
      // Fetch all member emails from club_profiles
      const { data: profiles, error } = await supabaseAdmin
        .from('club_profiles')
        .select('email');

      if (error || !profiles) {
        console.error("Error fetching member emails for broadcast:", error);
        return { success: false, error: error?.message };
      }

      emailList = profiles
        .map((p) => p.email?.trim().toLowerCase())
        .filter((e) => e && e.includes('@'));
    }

    if (emailList.length === 0) {
      return { success: false, error: "Aucun destinataire trouvé." };
    }

    const adminEmail = process.env.GMAIL_USER || "hecentrepreneurs8@gmail.com";

    const formattedMessage = message.replace(/\n/g, '<br/>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #07070a; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background-color: #111116; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
          .header { text-align: center; padding: 35px 25px 25px; background: linear-gradient(180deg, rgba(147, 51, 234, 0.15) 0%, rgba(17, 17, 22, 0) 100%); border-bottom: 1px solid rgba(255,255,255,0.06); }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(147, 51, 234, 0.2); border: 1px solid rgba(147, 51, 234, 0.4); color: #c084fc; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0; color: #a1a1aa; font-size: 13px; }
          .content { padding: 30px; }
          .message-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 22px; line-height: 1.7; font-size: 14px; color: #d4d4d8; }
          .cta-container { text-align: center; margin-top: 30px; }
          .cta-btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #9333ea, #6366f1); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 12px; box-shadow: 0 8px 20px rgba(147, 51, 234, 0.3); }
          .footer { text-align: center; padding: 25px 20px; color: #71717a; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">${badge}</div>
            <h1>${title}</h1>
            <p>Club HEC Entrepreneurs • IHEC Carthage</p>
          </div>
          <div class="content">
            <div class="message-box">
              ${formattedMessage}
            </div>
            ${
              actionUrl
                ? `
              <div class="cta-container">
                <a href="${actionUrl}" class="cta-btn" target="_blank">${actionText} &rarr;</a>
              </div>
            `
                : ''
            }
          </div>
          <div class="footer">
            Cet email est envoyé automatiquement aux membres inscrits sur l'Intranet officiel de HEC Entrepreneurs.<br/>
            &copy; 2026 HEC Entrepreneurs IHEC Carthage. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `;

    // Send using BCC to respect member privacy and dispatch simultaneously
    const mailOptions = {
      from: `"HEC Entrepreneurs (Intranet)" <${adminEmail}>`,
      to: adminEmail,
      bcc: emailList,
      subject: `[HEC Entrepreneurs] ${subject}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Broadcast email sent to ${emailList.length} members. MessageId: ${info.messageId}`);
    return { success: true, count: emailList.length, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to broadcast email to club members:", err);
    return { success: false, error: err.message };
  }
}
