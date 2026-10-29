import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

// Configuration du transporteur d'e-mails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      status,
      statusCustom,
      educationLevel,
      educationLevelCustom,
      specialty,
      specialtyCustom,
      hasLaptopAndCharger,
      canAttendFullSession,
      preferredLanguage,
      confirmedPrerequisites,
    } = body;

    // Validation des champs obligatoires
    if (!fullName || !email || !status || !educationLevel || !specialty || !hasLaptopAndCharger || !canAttendFullSession || !preferredLanguage) {
      return NextResponse.json(
        { success: false, message: "Tous les champs obligatoires doivent être renseignés." },
        { status: 400 }
      );
    }

    // Génération d'un identifiant unique de pass
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const registrationId = `DOC-IA-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    const submissionRecord = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      status: status === "Autre" && statusCustom ? `Autre: ${statusCustom.trim()}` : status,
      status_custom: statusCustom || null,
      education_level: educationLevel === "Autre" && educationLevelCustom ? `Autre: ${educationLevelCustom.trim()}` : educationLevel,
      education_level_custom: educationLevelCustom || null,
      specialty: specialty === "Autre" && specialtyCustom ? `Autre: ${specialtyCustom.trim()}` : specialty,
      specialty_custom: specialtyCustom || null,
      has_laptop_and_charger: hasLaptopAndCharger,
      can_attend_full_session: canAttendFullSession,
      preferred_language: preferredLanguage,
      confirmed_prerequisites: Boolean(confirmedPrerequisites),
      qr_code_id: registrationId,
    };

    // 1. Sauvegarde dans Supabase
    let supabaseSuccess = false;
    try {
      const { error: dbError } = await supabaseAdmin
        .from("doctoriales_registrations")
        .insert([submissionRecord]);

      if (dbError) {
        console.warn("Supabase insertion notice (check if table exists):", dbError.message);
      } else {
        supabaseSuccess = true;
      }
    } catch (dbErr) {
      console.warn("Supabase connection exception:", dbErr);
    }

    // 2. Synchronisation optionnelle avec Google Sheets Webhook si configuré
    const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL;
    if (sheetsUrl) {
      try {
        await fetch(sheetsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "HEC Doctoriales - Atelier IA et Prise de Décisions",
            registrationId,
            ...submissionRecord,
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch (sheetsErr) {
        console.warn("Sheets webhook sync failed:", sheetsErr);
      }
    }

    // 3. Envoi de l'e-mail de confirmation officiel au participant
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        const mailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b14; color: #ffffff; margin: 0; padding: 20px; }
              .card { max-width: 620px; margin: 0 auto; background: #131322; border: 1px solid #7c3aed40; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
              .header { background: linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #8b5cf640; }
              .badge { display: inline-block; background: #8b5cf625; color: #c4b5fd; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #8b5cf650; margin-bottom: 12px; }
              h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
              .subtitle { color: #a78bfa; font-size: 14px; margin-top: 6px; }
              .body-content { padding: 30px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
              .ticket-box { background: #1b1933; border: 1px dashed #8b5cf680; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center; }
              .ticket-id { font-family: monospace; font-size: 18px; font-weight: bold; color: #38bdf8; letter-spacing: 2px; }
              .info-grid { margin: 20px 0; background: #0f0f1b; border-radius: 10px; padding: 16px; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; font-size: 13px; }
              .info-row:last-child { border-bottom: none; }
              .info-label { color: #94a3b8; }
              .info-val { color: #f8fafc; font-weight: 600; }
              .prereq-alert { background: #3b076440; border-left: 4px solid #a855f7; border-radius: 8px; padding: 16px; margin: 24px 0; }
              .prereq-title { color: #f43f5e; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
              .btn-group { display: flex; gap: 10px; margin-top: 12px; }
              .btn { display: inline-block; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; text-align: center; }
              .btn-chrome { background: #2563eb; color: #ffffff; }
              .btn-zip { background: #059669; color: #ffffff; }
              .footer { background: #0a0a10; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="badge">Pass Officiel Confirmé</div>
                <h1>HEC DOCTORIALES</h1>
                <div class="subtitle">Atelier IA & Prise de Décisions • IHEC Carthage</div>
              </div>
              <div class="body-content">
                <p>Bonjour <strong>${fullName}</strong>,</p>
                <p>Votre inscription à l'atelier exclusif <strong>IA et Prise de Décisions</strong> a été validée avec succès.</p>
                
                <div class="ticket-box">
                  <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1.5px; margin-bottom: 4px;">Numéro d'enregistrement</div>
                  <div class="ticket-id">${registrationId}</div>
                </div>

                <div class="info-grid">
                  <div class="info-row">
                    <span class="info-label">Participant :</span>
                    <span class="info-val">${fullName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Statut :</span>
                    <span class="info-val">${submissionRecord.status}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Niveau d’études :</span>
                    <span class="info-val">${submissionRecord.education_level}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Spécialité :</span>
                    <span class="info-val">${submissionRecord.specialty}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Durée :</span>
                    <span class="info-val">3 heures complètes</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Lieu :</span>
                    <span class="info-val">IHEC Carthage</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Langue préférée :</span>
                    <span class="info-val">${preferredLanguage}</span>
                  </div>
                </div>

                <div class="prereq-alert">
                  <div class="prereq-title">⚠️ RAPPEL INDISPENSABLE POUR L'ATELIER :</div>
                  <p style="margin: 4px 0 10px 0; font-size: 13px;">
                    Chaque participant doit impérativement disposer d'un <strong>ordinateur portable avec son chargeur</strong> et installer au préalable :
                  </p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                    <li><strong>Google Chrome</strong> (navigateur requis pour la manipulation des modèles et interfaces)</li>
                    <li><strong>Un utilitaire d'archive Zip</strong> (7-Zip ou WinRAR) pour extraire les datasets et scripts de travail</li>
                  </ul>
                  <div class="btn-group" style="margin-top: 14px;">
                    <a href="https://www.google.com/chrome/" class="btn btn-chrome">📥 Télécharger Google Chrome</a>
                    <a href="https://www.7-zip.org/" class="btn btn-zip">📦 Télécharger 7-Zip</a>
                  </div>
                </div>

                <p style="font-size: 13px; color: #94a3b8;">
                  Présentez ce mail ou votre pass QR à l'accueil lors de l'émargement.
                </p>
              </div>
              <div class="footer">
                HEC Entrepreneurs • IHEC Carthage<br/>
                Former les leaders et décideurs à l'ère de l'Intelligence Artificielle.
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"HEC Doctoriales | IHEC" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: "Confirmation d'inscription : Atelier IA & Prise de Décisions (HEC Doctoriales)",
          html: mailHtml,
        });
      } catch (mailErr) {
        console.warn("Confirmation email sending skipped or failed:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      registrationId,
      supabaseSaved: supabaseSuccess,
      message: "Inscription confirmée avec succès.",
      data: {
        fullName,
        email,
        registrationId,
        status: submissionRecord.status,
        specialty: submissionRecord.specialty,
        preferredLanguage,
      },
    });
  } catch (error: any) {
    console.error("Doctoriales API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
