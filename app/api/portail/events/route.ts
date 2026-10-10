import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { broadcastToClubMembers } from "@/lib/email-broadcast";

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// In-memory fallback if SQL table hasn't been run in Supabase yet
let memoryEvents: any[] = [
  {
    id: "evt-default-1",
    title: "Réunion Hebdomadaire & Bilan des Pôles",
    description: "Point d'avancement sur les projets en cours, coordination entre pôles et calendrier des actions du mandat.",
    location: "Salle de réunion IHEC Carthage / Salle Club",
    event_date: "2026-10-14",
    start_time: "13:30",
    end_time: "15:00",
    event_type: "reunion",
    created_at: new Date().toISOString(),
    rsvps: []
  },
  {
    id: "evt-default-2",
    title: "Workshop : Stratégie Sponsoring & Partenariats",
    description: "Atelier pratique pour finaliser les dossiers de sponsoring et les approches des partenaires officiels 2026/2027.",
    location: "Amphi IHEC Carthage",
    event_date: "2026-10-21",
    start_time: "14:00",
    end_time: "16:30",
    event_type: "workshop",
    created_at: new Date().toISOString(),
    rsvps: []
  }
];

// GET /api/portail/events
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Try fetching from database
    const { data: events, error } = await supabaseAdmin
      .from("club_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error || !events) {
      // Return memory fallback if table not yet migrated
      return NextResponse.json({
        events: memoryEvents.map((evt) => ({
          ...evt,
          userRsvp: evt.rsvps?.find((r: any) => r.user_id === user.id)?.status || null,
          presentCount: evt.rsvps?.filter((r: any) => r.status === "present").length || 0,
          absentCount: evt.rsvps?.filter((r: any) => r.status === "absent").length || 0,
        })),
        isFallback: true
      });
    }

    // Fetch RSVPs
    const eventIds = events.map((e) => e.id);
    const { data: rsvps } = await supabaseAdmin
      .from("event_rsvps")
      .select("event_id, user_id, status, created_at")
      .in("event_id", eventIds);

    // Fetch user details for RSVP list
    const rsvpUserIds = Array.from(new Set((rsvps || []).map((r) => r.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("club_profiles")
      .select("id, full_name, avatar_url, role, poste")
      .in("id", rsvpUserIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const enrichedEvents = events.map((evt) => {
      const evtRsvps = (rsvps || [])
        .filter((r) => r.event_id === evt.id)
        .map((r) => ({
          ...r,
          profile: profileMap.get(r.user_id)
        }));

      const userRsvp = evtRsvps.find((r) => r.user_id === user.id)?.status || null;
      const presentCount = evtRsvps.filter((r) => r.status === "present").length;
      const absentCount = evtRsvps.filter((r) => r.status === "absent").length;
      const maybeCount = evtRsvps.filter((r) => r.status === "peut_etre").length;

      return {
        ...evt,
        rsvps: evtRsvps,
        userRsvp,
        presentCount,
        absentCount,
        maybeCount,
      };
    });

    return NextResponse.json({ events: enrichedEvents });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/events
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check role: bureau, responsable, or developpeur
    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowed = isOmar || profile?.role === "bureau" || profile?.role === "responsable" || profile?.role === "developpeur";
    if (!allowed) {
      return NextResponse.json({ error: "Accès réservé aux responsables et au bureau." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      location,
      event_date,
      start_time,
      end_time,
      event_type = "reunion",
      broadcastEmail = false,
    } = body;

    if (!title || !event_date) {
      return NextResponse.json({ error: "Titre et date requis." }, { status: 400 });
    }

    let createdEvent: any = null;

    // Try DB insert
    const { data, error } = await supabaseAdmin
      .from("club_events")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        event_date,
        start_time: start_time || null,
        end_time: end_time || null,
        event_type,
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !data) {
      // In-memory fallback
      createdEvent = {
        id: `evt-${Date.now()}`,
        title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        event_date,
        start_time: start_time || null,
        end_time: end_time || null,
        event_type,
        created_by: user.id,
        created_at: new Date().toISOString(),
        rsvps: []
      };
      memoryEvents.unshift(createdEvent);
    } else {
      createdEvent = data;
    }

    // If email broadcast is requested, notify all members!
    if (broadcastEmail) {
      const typeLabels: Record<string, string> = {
        reunion: "Convocation Réunion",
        ag: "Assemblée Générale",
        workshop: "Atelier / Formation",
        deadline: "Échéance / Deadline",
        teambuilding: "Teambuilding",
      };

      const emailText = `
Une nouvelle convocation vient d'être planifiée sur l'Intranet du club HEC Entrepreneurs :

• Événement : ${title}
• Type : ${typeLabels[event_type] || event_type}
• Date : ${new Date(event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
${start_time ? `• Heure : ${start_time} ${end_time ? `- ${end_time}` : ''}` : ''}
${location ? `• Lieu : ${location}` : ''}

${description ? `Détails & Ordre du jour :\n${description}\n` : ''}

Merci de vous connecter sur l'Intranet pour confirmer votre présence dès maintenant.
      `.trim();

      await broadcastToClubMembers({
        subject: `[${typeLabels[event_type] || "Agenda"}] ${title}`,
        badge: typeLabels[event_type] || "Agenda Interne",
        title: title,
        message: emailText,
        actionText: "Confirmer ma présence sur l'Intranet",
        actionUrl: "https://hec-entrepreneurs.org/portail/calendrier",
      });
    }

    return NextResponse.json({ event: createdEvent, emailSent: broadcastEmail });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/portail/events?id=...
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAuthorized = isOmar || profile?.role === "bureau" || profile?.role === "developpeur";

    // Delete from DB
    await supabaseAdmin.from("club_events").delete().eq("id", id);
    // Delete from memory if present
    memoryEvents = memoryEvents.filter((e) => e.id !== id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
