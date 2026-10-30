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
      institution,
      institutionCustom,
      educationLevel,
      educationLevelCustom,
      specialty,
      specialtyCustom,
      sessionChoice,
      selectedSessions,
      isManagementWorkshop,
      hasLaptopAndCharger,
      canAttendFullSession,
      preferredLanguage,
      confirmedPrerequisites,
    } = body;

    // Validation des champs obligatoires
    if (!fullName || !email || !status || !institution || !educationLevel || !specialty || !sessionChoice) {
      return NextResponse.json(
        { success: false, message: "Tous les champs obligatoires doivent être renseignés." },
        { status: 400 }
      );
    }

    // Génération d'un identifiant unique de pass
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const registrationId = `DOC-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    const resolvedInstitution =
      institution === "Autre" && institutionCustom
        ? `Autre: ${institutionCustom.trim()}`
        : institution;

    const baseRecord = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      status: status === "Autre" && statusCustom ? `Autre: ${statusCustom.trim()}` : status,
      status_custom: statusCustom || null,
      education_level: educationLevel === "Autre" && educationLevelCustom ? `Autre: ${educationLevelCustom.trim()}` : educationLevel,
      education_level_custom: educationLevelCustom || null,
      specialty: specialty === "Autre" && specialtyCustom ? `Autre: ${specialtyCustom.trim()}` : specialty,
      specialty_custom: specialtyCustom || null,
      has_laptop_and_charger: hasLaptopAndCharger || (isManagementWorkshop ? "Oui (Atelier Management)" : "Non applicable"),
      can_attend_full_session: canAttendFullSession || "Oui",
      preferred_language: preferredLanguage || "Français",
      confirmed_prerequisites: Boolean(confirmedPrerequisites),
      qr_code_id: registrationId,
    };

    const submissionRecord = {
      ...baseRecord,
      institution: resolvedInstitution,
      institution_custom: institutionCustom || null,
      session_choice: sessionChoice,
    };

    // 1. Sauvegarde dans Supabase (avec fallback si la migration SQL des nouvelles colonnes n'a pas encore été jouée)
    let supabaseSuccess = false;
    try {
      const { error: dbError } = await supabaseAdmin
        .from("doctoriales_registrations")
        .insert([submissionRecord]);

      if (dbError) {
        console.warn("Supabase full insertion notice, retrying with base columns:", dbError.message);
        const { error: fallbackError } = await supabaseAdmin
          .from("doctoriales_registrations")
          .insert([baseRecord]);
        if (!fallbackError) {
          supabaseSuccess = true;
        }
      } else {
        supabaseSuccess = true;
      }
    } catch (dbErr) {
      console.warn("Supabase connection exception:", dbErr);
    }

    const sessionsListHtml = Array.isArray(selectedSessions) && selectedSessions.length > 0
      ? `<ul style="margin: 6px 0 0 0; padding-left: 18px; color: #38bdf8; font-weight: 600;">${selectedSessions.map((s: string) => `<li style="margin-bottom: 4px;">${s}</li>`).join("")}</ul>`
      : `<span class="info-val" style="color: #38bdf8;">${sessionChoice}</span>`;

    const qrPayload = `HEC-DOCTORIALES|ID:${registrationId}|NAME:${fullName.trim()}|INST:${resolvedInstitution}|STATUS:${submissionRecord.status}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(qrPayload)}`;

    const passQueryParams = new URLSearchParams({
      id: registrationId,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      status: submissionRecord.status,
      institution: resolvedInstitution,
      session: sessionChoice,
      specialty: submissionRecord.specialty,
      lang: preferredLanguage || "Français",
      mgmt: isManagementWorkshop ? "1" : "0",
    });
    const passPageUrl = `https://hec-entrepreneurs.vercel.app/evenements/doctoriales/success?${passQueryParams.toString()}`;

    // 2. Envoi de l'e-mail de confirmation officiel au participant
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
              .subtitle { color: #a78bfa; font-size: 14px; margin-top: 6px; font-style: italic; }
              .body-content { padding: 30px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
              .ticket-box { background: #1b1933; border: 1px dashed #8b5cf680; border-radius: 12px; padding: 24px 18px; margin: 20px 0; text-align: center; }
              .ticket-id { font-family: monospace; font-size: 18px; font-weight: bold; color: #38bdf8; letter-spacing: 2px; }
              .info-grid { margin: 20px 0; background: #0f0f1b; border-radius: 10px; padding: 16px; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; font-size: 13px; }
              .info-row:last-child { border-bottom: none; }
              .info-label { color: #94a3b8; }
              .info-val { color: #f8fafc; font-weight: 600; }
              .prereq-alert { background: #3b076440; border-left: 4px solid #a855f7; border-radius: 8px; padding: 16px; margin: 24px 0; }
              .prereq-title { color: #fbbf24; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
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
                <div class="badge">Pass Officiel Confirmé • 14e Édition</div>
                <h1>HEC DOCTORIALES SERIES</h1>
                <div class="subtitle">« Faire de la recherche doctorale un levier d'excellence »</div>
              </div>
              <div class="body-content">
                <p>Bonjour <strong>${fullName}</strong>,</p>
                <p>Votre inscription aux <strong>HEC Doctoriales Series</strong> a été validée avec succès.</p>
                
                <div class="ticket-box">
                  <div style="font-size: 11px; text-transform: uppercase; color: #c4b5fd; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 14px;">Pass d'Accès Officiel (QR Code)</div>
                  <img src="${qrImageUrl}" alt="QR Code Pass HEC Doctoriales" width="240" height="240" style="display: block; margin: 0 auto 16px auto; border-radius: 12px; background: #ffffff; padding: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.4);" />
                  <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1.5px; margin-bottom: 4px;">Numéro d'enregistrement</div>
                  <div class="ticket-id">${registrationId}</div>
                  <div style="margin-top: 16px;">
                    <a href="${passPageUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">🎟️ Ouvrir / Télécharger mon Pass PDF</a>
                  </div>
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
                    <span class="info-label">Établissement :</span>
                    <span class="info-val">${resolvedInstitution}</span>
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
                    <span class="info-label">Dates :</span>
                    <span class="info-val">5 & 6 Novembre 2026 (09h00 – 17h30)</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Lieu :</span>
                    <span class="info-val">IHEC Carthage</span>
                  </div>
                  <div style="padding-top: 10px; font-size: 13px;">
                    <div class="info-label" style="margin-bottom: 4px;">Sessions sélectionnées :</div>
                    ${sessionsListHtml}
                  </div>
                </div>

                ${
                  isManagementWorkshop
                    ? `
                <div class="prereq-alert">
                  <div class="prereq-title">💻 Informations pratiques & Prérequis</div>
                  <p style="margin: 4px 0 8px 0; font-size: 13px;">L’atelier se déroule sur l’ensemble de la matinée, de <strong>09h00 à 12h30</strong>.</p>
                  <p style="margin: 4px 0 10px 0; font-size: 13px;">
                    Pour participer aux activités pratiques, il est recommandé de prévoir un <strong>ordinateur portable avec chargeur</strong> et d'installer au préalable <strong>Google Chrome</strong>.
                  </p>
                  <p style="margin: 6px 0; font-size: 13px;">
                    📌 À la fin de l'activité, vous devrez télécharger <strong>deux fichiers</strong> et les regrouper dans un seul dossier compressé au format <strong>.zip</strong>. Si vous rencontrez des difficultés pour créer un dossier .zip sur votre ordinateur, utilisez directement notre outil en ligne :
                  </p>
                  <div class="btn-group" style="margin-top: 12px; flex-wrap: wrap;">
                    <a href="https://www.google.com/chrome/" class="btn btn-chrome">📥 Google Chrome</a>
                    <a href="https://hec-entrepreneurs.vercel.app/evenements/doctoriales/zip" class="btn" style="background: #7c3aed; color: #ffffff;">🗜️ Outil .ZIP en ligne</a>
                  </div>
                </div>`
                    : ""
                }

                <p style="font-size: 13px; color: #94a3b8;">
                  Présentez ce mail ou votre pass QR à l'accueil lors de l'émargement.
                </p>
              </div>
              <div class="footer">
                HEC Doctoriales • École Doctorale IHEC Carthage<br/>
                Faire de la recherche doctorale un levier d'excellence.
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"HEC Doctoriales | IHEC" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `Confirmation d'inscription : HEC Doctoriales Series`,
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
        institution: resolvedInstitution,
        specialty: submissionRecord.specialty,
        sessionChoice,
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
