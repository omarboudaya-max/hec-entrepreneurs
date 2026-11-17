import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
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

function parseCheckIns(rawField?: string | null): Record<string, { at: string; by: string }> {
  if (!rawField || typeof rawField !== "string") return {};
  const trimmed = rawField.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // ignore malformed json
  }
  return {};
}

function extractSmeCode(rawInput: string): string {
  const text = (rawInput || "").trim();
  const smeMatch = text.match(/SME-[A-Z0-9]+-[A-Z0-9]+/i);
  if (smeMatch) {
    return smeMatch[0].toUpperCase();
  }
  const idMatch = text.match(/ID:([^|&\s]+)/i);
  if (idMatch) {
    return idMatch[1].trim().toUpperCase();
  }
  return text.toUpperCase();
}

const SME_CHECKIN_TEAM_EMAILS = new Set([
  "romdhani2005@gmail.com",
  "hammemimohamed597@gmail.com",
  "amounaamiri1210@gmail.com",
  "darinebouzid515@gmail.com",
]);

function isCheckInTeamName(rawName?: string | null): boolean {
  const n = (rawName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    (n.includes("imen") && n.includes("romdhani")) ||
    (n.includes("mohamed") &&
      (n.includes("hamemi") || n.includes("hammemi") || n.includes("hammami"))) ||
    (n.includes("ameni") && n.includes("amiri")) ||
    (n.includes("darine") && n.includes("bouzid"))
  );
}

async function verifyDevOrGuest(req: NextRequest): Promise<{
  authorized: boolean;
  actorName?: string;
}> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return { authorized: false };

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { authorized: false };

  const emailLower = (user.email || "").toLowerCase();
  if (
    emailLower === "omarboudaya1@gmail.com" ||
    emailLower === "guest@hecentrepreneurs.tn" ||
    SME_CHECKIN_TEAM_EMAILS.has(emailLower) ||
    user.user_metadata?.role === "guest" ||
    user.user_metadata?.role === "developpeur" ||
    isCheckInTeamName(user.user_metadata?.full_name)
  ) {
    return {
      authorized: true,
      actorName:
        user.user_metadata?.full_name ||
        (emailLower === "guest@hecentrepreneurs.tn" ? "Guest Scanner" : emailLower),
    };
  }

  const { data: profile } = await supabaseAdmin
    .from("club_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile?.role === "developpeur" ||
    profile?.role === "bureau" ||
    isCheckInTeamName(profile?.full_name)
  ) {
    return {
      authorized: true,
      actorName: profile?.full_name || "Équipe Check-in",
    };
  }

  return { authorized: false };
}

// GET /api/portail/ouverture-sme - List all SME registrations + seats + check-in status
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyDevOrGuest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès réservé au Développeur et au compte Guest." },
        { status: 403 }
      );
    }

    const { data: rows, error } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select("*")
      .eq("session_choice", OUVERTURE_SME_SESSION_KEY)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const registrations = (rows || []).map((r) => {
      const checkIns = parseCheckIns(r.can_attend_full_session);
      const entry = checkIns["ouverture_sme"];
      return {
        id: r.id,
        qr_code_id: r.qr_code_id || "",
        full_name: r.full_name,
        email: r.email,
        phone: r.status_custom || "",
        status: r.status,
        status_detail: r.preferred_language && r.preferred_language !== "Français" ? r.preferred_language : "",
        institution: r.institution,
        seat_id: (r.education_level || "").replace(/^MG-R(\d+)-C5$/, "MG-R$1-C4"),
        seat_label: r.education_level_custom || "",
        seat_code: r.specialty_custom || "",
        one_word: r.specialty || "",
        created_at: r.created_at,
        checkedIn: Boolean(entry),
        checkedInAt: entry?.at || null,
        checkedInBy: entry?.by || null,
      };
    });

    return NextResponse.json({
      registrations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/ouverture-sme - Scan QR Code (single-entry enforcement)
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyDevOrGuest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès réservé au Développeur et au compte Guest." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      qrInput,
      forceUndo = false,
    }: {
      qrInput: string;
      forceUndo?: boolean;
    } = body;

    if (!qrInput) {
      return NextResponse.json(
        { error: "Veuillez fournir le code QR ou l'identifiant du participant." },
        { status: 400 }
      );
    }

    const extractedCode = extractSmeCode(qrInput);
    const cleanInputLower = qrInput.trim().toLowerCase();

    const { data: rows, error } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select("*")
      .eq("session_choice", OUVERTURE_SME_SESSION_KEY);

    if (error || !rows) {
      return NextResponse.json(
        { error: "Erreur de lecture de la base Ouverture SME." },
        { status: 500 }
      );
    }

    const matchedRow = rows.find(
      (r) =>
        (r.qr_code_id && r.qr_code_id.toUpperCase() === extractedCode) ||
        r.id === qrInput.trim() ||
        (r.email && r.email.toLowerCase() === cleanInputLower) ||
        (r.specialty_custom && r.specialty_custom.toLowerCase() === cleanInputLower)
    );

    if (!matchedRow) {
      return NextResponse.json({
        scanResult: "invalid",
        message: `Aucun participant inscrit à l'Ouverture de la SME trouvé pour « ${extractedCode} ».`,
        extractedCode,
      });
    }

    const checkIns = parseCheckIns(matchedRow.can_attend_full_session);
    const participantPayload = {
      id: matchedRow.id,
      qr_code_id: matchedRow.qr_code_id,
      full_name: matchedRow.full_name,
      email: matchedRow.email,
      phone: matchedRow.status_custom || "",
      status: matchedRow.status,
      status_detail:
        matchedRow.preferred_language && matchedRow.preferred_language !== "Français"
          ? matchedRow.preferred_language
          : "",
      institution: matchedRow.institution,
      seat_id: (matchedRow.education_level || "").replace(/^MG-R(\d+)-C5$/, "MG-R$1-C4"),
      seat_label: matchedRow.education_level_custom || "",
      seat_code: matchedRow.specialty_custom || "",
      one_word: matchedRow.specialty || "",
    };

    if (forceUndo) {
      delete checkIns["ouverture_sme"];
      await supabaseAdmin
        .from("doctoriales_registrations")
        .update({ can_attend_full_session: JSON.stringify(checkIns) })
        .eq("id", matchedRow.id);

      return NextResponse.json({
        scanResult: "undone",
        message: `Pointage annulé pour ${matchedRow.full_name} (Chaise ${matchedRow.specialty_custom}).`,
        participant: {
          ...participantPayload,
          checkedIn: false,
          checkedInAt: null,
          checkedInBy: null,
        },
      });
    }

    const existingCheckIn = checkIns["ouverture_sme"];
    if (existingCheckIn) {
      return NextResponse.json({
        scanResult: "already_used",
        message: `ACCÈS REFUSÉ (DOUBLON) : ${matchedRow.full_name} (Chaise ${matchedRow.specialty_custom}) a déjà validé son entrée à ${new Date(
          existingCheckIn.at
        ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`,
        alreadyCheckedInAt: existingCheckIn.at,
        alreadyCheckedInBy: existingCheckIn.by,
        participant: {
          ...participantPayload,
          checkedIn: true,
          checkedInAt: existingCheckIn.at,
          checkedInBy: existingCheckIn.by,
        },
      });
    }

    const nowIso = new Date().toISOString();
    checkIns["ouverture_sme"] = {
      at: nowIso,
      by: auth.actorName || "Scanner",
    };

    const { error: updateErr } = await supabaseAdmin
      .from("doctoriales_registrations")
      .update({ can_attend_full_session: JSON.stringify(checkIns) })
      .eq("id", matchedRow.id);

    if (updateErr) {
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du pointage : " + updateErr.message },
        { status: 500 }
      );
    }

    // Send instant Espace Live link by email upon QR check-in
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && matchedRow.email) {
      try {
        const liveUrl = `https://hec-entrepreneurs.vercel.app/evenements/ouverture-sme/live?code=${encodeURIComponent(
          matchedRow.qr_code_id || matchedRow.id
        )}`;
        const seatCode = matchedRow.specialty_custom || "PASS OFFICIEL";
        const hasChair = seatCode !== "PASS OFFICIEL";

        const liveMailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090612; color: #ffffff; margin: 0; padding: 20px; }
              .card { max-width: 600px; margin: 0 auto; background: #130d24; border: 1px solid #d946ef50; border-radius: 22px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.75); }
              .header { background: linear-gradient(135deg, #86198f 0%, #4c1d95 55%, #1e1b4b 100%); padding: 34px 24px; text-align: center; border-bottom: 2px solid #e879f960; }
              .badge { display: inline-block; background: #10b98125; color: #6ee7b7; padding: 5px 15px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #10b98160; margin-bottom: 12px; }
              h1 { margin: 0; color: #ffffff; font-size: 23px; font-weight: 900; letter-spacing: 0.5px; }
              .body-content { padding: 28px 24px; line-height: 1.65; font-size: 14px; color: #e2e8f0; }
              .cta-box { background: #1d1238; border: 1px dashed #e879f980; border-radius: 18px; padding: 24px 18px; margin: 22px 0; text-align: center; }
              .feature-list { background: #0d0818; border-radius: 14px; padding: 18px; border: 1px solid #ffffff12; margin: 18px 0; }
              .feature-item { margin-bottom: 10px; font-size: 13px; color: #f1f5f9; }
              .feature-item:last-child { margin-bottom: 0; }
              .footer { background: #07040d; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #ffffff10; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="badge">✓ Check-in Validé • Bienvenue à La Chapelle</div>
                <h1>ESPACE LIVE — OUVERTURE SME 2026</h1>
              </div>
              <div class="body-content">
                <p>Bonjour <strong>${matchedRow.full_name}</strong>,</p>
                <p>Votre entrée à <strong>La Chapelle</strong> vient d'être validée${
                  hasChair ? ` (Place <strong>${seatCode}</strong>)` : ""
                } ! Votre accès personnel à l'<strong>Espace Commun Live SME 2026</strong> est maintenant débloqué sur votre téléphone :</p>

                <div class="cta-box">
                  <div style="font-size: 11px; text-transform: uppercase; color: #f0abfc; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 12px;">✨ Rejoignez l'expérience interactive en direct</div>
                  <a href="${liveUrl}" style="display: inline-block; background: linear-gradient(90deg, #d946ef, #7c3aed); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 10px 25px rgba(217,70,239,0.4);">🚀 Ouvrir l'Espace Live sur mon téléphone</a>
                </div>

                <div class="feature-list">
                  <div class="feature-item">📸 <strong>Instantanés Live (Stories) :</strong> Prenez des photos en direct et découvrez celles des participants.</div>
                  <div class="feature-item">💬 <strong>Chat en Direct :</strong> Échangez et réagissez en temps réel avec toute la salle.</div>
                  <div class="feature-item">🎤 <strong>Questions aux Intervenants (Q&A) :</strong> Posez vos questions au panel et votez (👍) pour les meilleures.</div>
                  <div class="feature-item">🤝 <strong>Mur Networking :</strong> Partagez votre LinkedIn / Instagram pour connecter avec les étudiants et professionnels.</div>
                  <div class="feature-item">⭐ <strong>Votre Avis (1 à 5 ★) :</strong> Donnez votre note et votre retour sur l'événement.</div>
                </div>
              </div>
              <div class="footer">
                © 2026 Club HEC Entrepreneurs — IHEC Carthage • Semaine Mondiale de l'Entrepreneuriat
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"HEC Entrepreneurs — Live SME 2026" <${process.env.GMAIL_USER}>`,
          to: matchedRow.email.trim(),
          subject: `🚀 Votre accès à l'Espace Live — Ouverture de la SME 2026`,
          html: liveMailHtml,
        });
      } catch (mailErr) {
        console.warn("SME Live welcome email warning:", mailErr);
      }
    }

    return NextResponse.json({
      scanResult: "granted",
      message: `ACCÈS AUTORISÉ : Bienvenue ${matchedRow.full_name} ! (${matchedRow.specialty_custom}) — Lien Espace Live envoyé par e-mail.`,
      participant: {
        ...participantPayload,
        checkedIn: true,
        checkedInAt: nowIso,
        checkedInBy: auth.actorName || "Scanner",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

