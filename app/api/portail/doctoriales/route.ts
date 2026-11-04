import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export interface DoctorialesSessionDef {
  id: string;
  day: string;
  slot: string;
  title: string;
  shortLabel: string;
  keywords: string[];
}

export const DOCTORIALES_SESSIONS: DoctorialesSessionDef[] = [
  {
    id: "jeudi_matin_rtm",
    day: "Jeudi 5 Nov",
    slot: "Matin",
    title: "RESEARCH THAT MATTERS — Quelle recherche face aux transformations de demain ?",
    shortLabel: "Jeudi Matin • RESEARCH THAT MATTERS",
    keywords: ["research that matters", "transformations de demain"],
  },
  {
    id: "jeudi_matin_dev",
    day: "Jeudi 5 Nov",
    slot: "Matin",
    title: "DEVELOPMENT WORKSHOP — Construire une contribution doctorale forte",
    shortLabel: "Jeudi Matin • DEVELOPMENT WORKSHOP",
    keywords: ["development workshop", "contribution doctorale forte"],
  },
  {
    id: "jeudi_matin_sem",
    day: "Jeudi 5 Nov",
    slot: "Matin",
    title: "RESEARCH SEMINAR — Les grandes contributions dans l'histoire de la pensée économique",
    shortLabel: "Jeudi Matin • RESEARCH SEMINAR (Pensée éco.)",
    keywords: ["research seminar", "histoire de la pensee economique"],
  },
  {
    id: "jeudi_aprem_pub",
    day: "Jeudi 5 Nov",
    slot: "Après-midi",
    title: "Publication, intégrité scientifique et IA responsable",
    shortLabel: "Jeudi Après-midi • Publication & Intégrité IA",
    keywords: ["integrite scientifique"],
  },
  {
    id: "vendredi_09h_gouv",
    day: "Vendredi 6 Nov",
    slot: "09h00 – 10h30",
    title: "La Gouvernance 4.0",
    shortLabel: "Vendredi 09h00 • La Gouvernance 4.0",
    keywords: ["gouvernance 4.0"],
  },
  {
    id: "vendredi_09h_fin",
    day: "Vendredi 6 Nov",
    slot: "09h00 – 10h30",
    title: "Approches IA appliquées à la finance",
    shortLabel: "Vendredi 09h00 • Approches IA & Finance",
    keywords: ["approches ia appliquees a la finance"],
  },
  {
    id: "vendredi_09h_mkt",
    day: "Vendredi 6 Nov",
    slot: "09h00 – 10h30",
    title: "IA générative et consommateur augmenté",
    shortLabel: "Vendredi 09h00 • IA générative & Consommateur",
    keywords: ["consommateur augmente"],
  },
  {
    id: "vendredi_09h_mgmt",
    day: "Vendredi 6 Nov",
    slot: "09h00 – 12h30",
    title: "IA & Prise de décision (Atelier 09h00–12h30)",
    shortLabel: "Vendredi 09h00–12h30 • IA & Prise de décision",
    keywords: ["prise de decision"],
  },
  {
    id: "vendredi_11h_pub",
    day: "Vendredi 6 Nov",
    slot: "11h00 – 12h30",
    title: "Publier dans les revues de premier rang : ce qui fait la différence",
    shortLabel: "Vendredi 11h00 • Publier revues 1er rang",
    keywords: ["revues de premier rang"],
  },
  {
    id: "vendredi_11h_pbi",
    day: "Vendredi 6 Nov",
    slot: "11h00 – 12h30",
    title: "Introduction à Power BI pour les économistes et les financiers",
    shortLabel: "Vendredi 11h00 • Introduction à Power BI",
    keywords: ["power bi"],
  },
  {
    id: "vendredi_11h_bib",
    day: "Vendredi 6 Nov",
    slot: "11h00 – 12h30",
    title: "Agentic AI Workflows for Scalable Bibliometric Analysis",
    shortLabel: "Vendredi 11h00 • Agentic AI Bibliometric",
    keywords: ["bibliometric analysis"],
  },
];

function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolveParticipantSessions(sessionChoice: string): string[] {
  const norm = normalizeText(sessionChoice);
  const matched: string[] = [];

  for (const s of DOCTORIALES_SESSIONS) {
    if (s.keywords.some((kw) => norm.includes(kw))) {
      matched.push(s.id);
    }
  }

  return matched;
}

export function parseCheckIns(rawField?: string | null): Record<string, { at: string; by: string }> {
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

export function extractDocCode(rawInput: string): string {
  const text = (rawInput || "").trim();
  // Match DOC-XXXX-XXXX pattern anywhere inside QR payload or URL
  const docMatch = text.match(/DOC-[A-Z0-9]+-[A-Z0-9]+/i);
  if (docMatch) {
    return docMatch[0].toUpperCase();
  }
  // Check if ID:... exists
  const idMatch = text.match(/ID:([^|&\s]+)/i);
  if (idMatch) {
    return idMatch[1].trim().toUpperCase();
  }
  return text;
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
        (emailLower === "guest@hecentrepreneurs.tn" ? "Guest Doctoriales" : "Omar Boudaya"),
    };
  }

  const { data: profile } = await supabaseAdmin
    .from("club_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "developpeur") {
    return {
      authorized: true,
      actorName: profile.full_name || "Développeur",
    };
  }

  return { authorized: false };
}

// GET /api/portail/doctoriales - List all registrations + check-in statuses
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyDevOrGuest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès réservé au Développeur et au compte Guest Doctoriales." },
        { status: 403 }
      );
    }

    const { data: rows, error } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const registrations = (rows || []).map((r) => {
      const sessionIds = resolveParticipantSessions(r.session_choice || "");
      const checkIns = parseCheckIns(r.can_attend_full_session);
      return {
        id: r.id,
        qr_code_id: r.qr_code_id || "",
        full_name: r.full_name,
        email: r.email,
        status: r.status,
        institution: r.institution,
        education_level: r.education_level,
        specialty: r.specialty,
        session_choice: r.session_choice,
        has_laptop_and_charger: r.has_laptop_and_charger,
        confirmed_prerequisites: r.confirmed_prerequisites,
        created_at: r.created_at,
        sessionIds,
        checkIns,
      };
    });

    return NextResponse.json({
      sessions: DOCTORIALES_SESSIONS,
      registrations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/doctoriales - Scan QR Code for a specific session (single-entry enforcement)
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyDevOrGuest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès réservé au Développeur et au compte Guest Doctoriales." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      qrInput,
      sessionId,
      forceUndo = false,
    }: {
      qrInput: string;
      sessionId: string;
      forceUndo?: boolean;
    } = body;

    if (!qrInput || !sessionId) {
      return NextResponse.json(
        { error: "Veuillez fournir le code QR et la session active." },
        { status: 400 }
      );
    }

    const activeSession = DOCTORIALES_SESSIONS.find((s) => s.id === sessionId);
    if (!activeSession) {
      return NextResponse.json(
        { error: "Session sélectionnée invalide." },
        { status: 400 }
      );
    }

    const extractedCode = extractDocCode(qrInput);

    const { data: rows, error } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select("*");

    if (error || !rows) {
      return NextResponse.json(
        { error: "Erreur de lecture de la base Doctoriales." },
        { status: 500 }
      );
    }

    // Match by qr_code_id, UUID id, or exact email
    const cleanInputLower = qrInput.trim().toLowerCase();
    const matchedRow = rows.find(
      (r) =>
        (r.qr_code_id && r.qr_code_id.toUpperCase() === extractedCode) ||
        r.id === qrInput.trim() ||
        (r.email && r.email.toLowerCase() === cleanInputLower)
    );

    if (!matchedRow) {
      return NextResponse.json({
        scanResult: "invalid",
        message: `Aucun participant inscrit trouvé pour le code « ${extractedCode} ».`,
        extractedCode,
      });
    }

    const sessionIds = resolveParticipantSessions(matchedRow.session_choice || "");
    const checkIns = parseCheckIns(matchedRow.can_attend_full_session);

    const participantInfo = {
      id: matchedRow.id,
      qr_code_id: matchedRow.qr_code_id,
      full_name: matchedRow.full_name,
      email: matchedRow.email,
      status: matchedRow.status,
      institution: matchedRow.institution,
      education_level: matchedRow.education_level,
      specialty: matchedRow.specialty,
      session_choice: matchedRow.session_choice,
      sessionIds,
      registeredSessionLabels: DOCTORIALES_SESSIONS.filter((s) =>
        sessionIds.includes(s.id)
      ).map((s) => s.shortLabel),
    };

    // Allow manual undo of a check-in if needed by admin
    if (forceUndo) {
      delete checkIns[sessionId];
      await supabaseAdmin
        .from("doctoriales_registrations")
        .update({ can_attend_full_session: JSON.stringify(checkIns) })
        .eq("id", matchedRow.id);

      return NextResponse.json({
        scanResult: "undone",
        message: `Pointage annulé pour ${matchedRow.full_name} sur cette session.`,
        participant: participantInfo,
        checkIns,
      });
    }

    // 1. Check if participant is registered for this specific session
    const isRegisteredForSession = sessionIds.includes(sessionId);
    if (!isRegisteredForSession) {
      return NextResponse.json({
        scanResult: "wrong_session",
        message: `${matchedRow.full_name} n'est PAS inscrit(e) à la session « ${activeSession.shortLabel} ».`,
        sessionTitle: activeSession.title,
        participant: participantInfo,
        checkIns,
      });
    }

    // 2. Check if participant has ALREADY been scanned for this session (Anti-double scan)
    if (checkIns[sessionId]) {
      const previousScan = checkIns[sessionId];
      const prevTime = new Date(previousScan.at).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return NextResponse.json({
        scanResult: "already_scanned",
        message: `DOUBLE SCAN DÉTECTÉ : ${matchedRow.full_name} a DÉJÀ accédé à cette session à ${prevTime} !`,
        previousScan,
        sessionTitle: activeSession.title,
        participant: participantInfo,
        checkIns,
      });
    }

    // 3. Valid first entry -> Record check-in
    const nowIso = new Date().toISOString();
    checkIns[sessionId] = {
      at: nowIso,
      by: auth.actorName || "Scanner QR",
    };

    const { error: updateErr } = await supabaseAdmin
      .from("doctoriales_registrations")
      .update({ can_attend_full_session: JSON.stringify(checkIns) })
      .eq("id", matchedRow.id);

    if (updateErr) {
      return NextResponse.json(
        { error: "Impossible d'enregistrer le pointage : " + updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scanResult: "authorized",
      message: `ACCÈS AUTORISÉ : Bienvenue ${matchedRow.full_name} ! Entrée validée pour « ${activeSession.shortLabel} ».`,
      sessionTitle: activeSession.title,
      participant: participantInfo,
      checkIns,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

