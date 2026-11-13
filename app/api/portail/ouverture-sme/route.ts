import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const OUVERTURE_SME_SESSION_KEY = "OUVERTURE_SME_2026";

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
    user.user_metadata?.role === "guest" ||
    user.user_metadata?.role === "developpeur"
  ) {
    return {
      authorized: true,
      actorName:
        user.user_metadata?.full_name ||
        (emailLower === "guest@hecentrepreneurs.tn" ? "Guest Scanner" : "Omar Boudaya"),
    };
  }

  const { data: profile } = await supabaseAdmin
    .from("club_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "developpeur" || profile?.role === "bureau") {
    return {
      authorized: true,
      actorName: profile.full_name || "Développeur",
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

    return NextResponse.json({
      scanResult: "granted",
      message: `ACCÈS AUTORISÉ : Bienvenue ${matchedRow.full_name} ! Dirigez-vous vers la Chaise ${matchedRow.specialty_custom}.`,
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

