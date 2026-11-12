import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CHAPELLE_SEATS_BY_ID } from "@/lib/sme-seating";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

const OUVERTURE_SME_SESSION_KEY = "OUVERTURE_SME_2026";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// GET /api/events/ouverture-sme - Return list of already booked seat IDs
export async function GET() {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select("education_level")
      .eq("session_choice", OUVERTURE_SME_SESSION_KEY);

    if (error) {
      return NextResponse.json({ bookedSeatIds: [] });
    }

    const bookedSeatIds = Array.from(
      new Set(
        (rows || [])
          .map((r) => r.education_level)
          .filter((v): v is string => Boolean(v))
      )
    );

    return NextResponse.json({
      bookedSeatIds,
      totalRegistered: bookedSeatIds.length,
    });
  } catch (err: any) {
    return NextResponse.json({ bookedSeatIds: [], error: err.message });
  }
}

// POST /api/events/ouverture-sme - Register participant + reserve chair + send email with QR code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      status,
      institution,
      institutionCustom,
      oneWord,
      seatId,
    } = body;

    if (!fullName || !email || !status || !institution || !oneWord || !seatId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veuillez remplir tous les champs obligatoires et sélectionner votre place sur le plan.",
        },
        { status: 400 }
      );
    }

    if (institution === "Autre" && (!institutionCustom || !institutionCustom.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez préciser votre établissement ou organisme.",
        },
        { status: 400 }
      );
    }

    const cleanWord = String(oneWord).trim();
    if (!cleanWord) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez décrire l'entrepreneuriat en un mot.",
        },
        { status: 400 }
      );
    }

    const seat = CHAPELLE_SEATS_BY_ID[String(seatId)];
    if (!seat || seat.preReserved) {
      return NextResponse.json(
        {
          success: false,
          message: "Cette place est réservée. Veuillez sélectionner une place disponible.",
        },
        { status: 400 }
      );
    }

    const isPro = String(status).toLowerCase().includes("professionnel");
    if ((isPro && seat.category !== "professional") || (!isPro && seat.category !== "student")) {
      return NextResponse.json(
        {
          success: false,
          message: "Cette place n'est pas disponible. Veuillez sélectionner une place libre sur le plan.",
        },
        { status: 400 }
      );
    }

    // Check if seat is already booked in database
    const { data: existingSeats } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select("id")
      .eq("session_choice", OUVERTURE_SME_SESSION_KEY)
      .eq("education_level", seat.id);

    if (existingSeats && existingSeats.length > 0) {
      return NextResponse.json(
        {
          success: false,
          seatTaken: true,
          message: `La place ${seat.code} vient tout juste d'être réservée. Merci d'en choisir une autre sur le plan.`,
        },
        { status: 409 }
      );
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const registrationId = `SME-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    const resolvedInstitution =
      institution === "Autre" && institutionCustom
        ? `Autre: ${institutionCustom.trim()}`
        : institution;

    const record = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      status: status.trim(),
      status_custom: null,
      institution: resolvedInstitution,
      institution_custom: institutionCustom ? institutionCustom.trim() : null,
      education_level: seat.id,            // Stores internal seatId (e.g. "MG-R3-C2")
      education_level_custom: seat.code,   // Stores chair name (Word + Line number, e.g. "IMPACT 3")
      specialty: cleanWord,                // Stores the 1-word entrepreneurship answer for admin tracking
      specialty_custom: seat.code,         // Stores chair name (Word + Line number, e.g. "IMPACT 3")
      session_choice: OUVERTURE_SME_SESSION_KEY,
      has_laptop_and_charger: seat.code,
      can_attend_full_session: "{}",       // Stores check-in JSON for QR scanner
      preferred_language: "Français",
      confirmed_prerequisites: true,
      qr_code_id: registrationId,
    };

    const { error: insertError } = await supabaseAdmin
      .from("doctoriales_registrations")
      .insert([record]);

    if (insertError) {
      console.error("Supabase SME insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors de l'enregistrement de votre réservation. Veuillez réessayer.",
        },
        { status: 500 }
      );
    }

    const qrPayload = `HEC-SME-2026|ID:${registrationId}|SEAT:${seat.code}|NAME:${fullName.trim()}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(qrPayload)}`;

    const passQueryParams = new URLSearchParams({
      id: registrationId,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      status: status.trim(),
      institution: resolvedInstitution,
      seatId: seat.id,
      seatCode: seat.code,
    });

    const passPageUrl = `https://hec-entrepreneurs.vercel.app/evenements/ouverture-sme/success?${passQueryParams.toString()}`;

    // Send Thank You + Name + Chair Name (Word + Number) + QR Code email
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        const mailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090612; color: #ffffff; margin: 0; padding: 20px; }
              .card { max-width: 600px; margin: 0 auto; background: #130d24; border: 1px solid #a855f745; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.7); }
              .header { background: linear-gradient(135deg, #701a75 0%, #3b0764 55%, #1e1b4b 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #d946ef50; }
              .badge { display: inline-block; background: #f0abfc20; color: #f5d0fe; padding: 5px 15px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #e879f950; margin-bottom: 12px; }
              h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
              .subtitle { color: #e9d5ff; font-size: 14px; margin-top: 8px; font-style: italic; }
              .body-content { padding: 30px 24px; line-height: 1.65; font-size: 14px; color: #e2e8f0; }
              .seat-banner { background: #1d1436; border: 1px solid #d946ef60; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: center; }
              .seat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f0abfc; font-weight: 700; margin-bottom: 6px; }
              .seat-code { font-size: 28px; font-weight: 900; color: #ffffff; font-family: monospace; letter-spacing: 2px; }
              .ticket-box { background: #191130; border: 1px dashed #d946ef80; border-radius: 16px; padding: 24px 18px; margin: 22px 0; text-align: center; }
              .ticket-id { font-family: monospace; font-size: 17px; font-weight: bold; color: #38bdf8; letter-spacing: 2px; }
              .info-grid { margin: 20px 0; background: #0d0818; border-radius: 12px; padding: 16px; border: 1px solid #ffffff12; }
              .info-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #ffffff10; font-size: 13px; }
              .info-row:last-child { border-bottom: none; }
              .info-label { color: #94a3b8; }
              .info-val { color: #f8fafc; font-weight: 600; text-align: right; }
              .footer { background: #07040d; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #ffffff10; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="badge">Confirmation d'Inscription • SME 2026</div>
                <h1>OUVERTURE DE LA SME 2026</h1>
                <div class="subtitle">Club HEC Entrepreneurs — IHEC Carthage</div>
              </div>
              <div class="body-content">
                <p>Bonjour <strong>${fullName.trim()}</strong>,</p>
                <p>Merci pour votre inscription ! Nous avons le plaisir de vous confirmer la réservation de votre place pour la <strong>Cérémonie d'Ouverture de la Semaine Mondiale de l'Entrepreneuriat (SME 2026)</strong>.</p>

                <div class="seat-banner">
                  <div class="seat-label">🪑 Votre Place Réservée</div>
                  <div class="seat-code">${seat.code}</div>
                </div>

                <div class="ticket-box">
                  <div style="font-size: 11px; text-transform: uppercase; color: #f0abfc; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 14px;">Pass d'Accès Officiel (QR Code)</div>
                  <img src="${qrImageUrl}" alt="QR Code Pass Ouverture SME" width="230" height="230" style="display: block; margin: 0 auto 16px auto; border-radius: 12px; background: #ffffff; padding: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.45);" />
                  <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1.5px; margin-bottom: 4px;">Référence du Pass</div>
                  <div class="ticket-id">${registrationId}</div>
                  <div style="margin-top: 16px;">
                    <a href="${passPageUrl}" style="display: inline-block; background: linear-gradient(90deg, #c026d3, #7c3aed); color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">🎟️ Ouvrir / Télécharger mon Billet</a>
                  </div>
                </div>

                <div class="info-grid">
                  <div class="info-row">
                    <span class="info-label">Participant :</span>
                    <span class="info-val">${fullName.trim()}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Place réservée :</span>
                    <span class="info-val" style="color: #e879f9; font-family: monospace; font-size: 14px;">${seat.code}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Date :</span>
                    <span class="info-val">Mercredi 18 Novembre 2026 • 09h30</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Lieu :</span>
                    <span class="info-val">La Chapelle — IHEC Carthage</span>
                  </div>
                </div>

                <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 18px;">
                  Veuillez présenter ce QR Code à l'entrée de La Chapelle pour accéder à votre place <strong>${seat.code}</strong>.
                </p>
              </div>
              <div class="footer">
                © 2026 Club HEC Entrepreneurs — IHEC Carthage • Semaine Mondiale de l'Entrepreneuriat
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"HEC Entrepreneurs — SME 2026" <${process.env.GMAIL_USER}>`,
          to: email.trim(),
          subject: `🎟️ Confirmation & Place ${seat.code} — Ouverture de la SME 2026`,
          html: mailHtml,
        });
      } catch (mailErr) {
        console.warn("SME email warning:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      registrationId,
      seatCode: seat.code,
    });
  } catch (err: any) {
    console.error("SME registration error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Erreur serveur lors de l'inscription.",
      },
      { status: 500 }
    );
  }
}
