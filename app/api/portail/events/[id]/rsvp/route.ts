import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const { status } = await req.json();

    if (!["present", "absent", "peut_etre"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Check if event is already done
    const { data: event } = await supabaseAdmin
      .from("club_events")
      .select("event_date, end_time, start_time")
      .eq("id", eventId)
      .single();

    let eventDate = event?.event_date;
    let endTime = event?.end_time;

    if (!eventDate && global.__memoryEvents) {
      const memEvt = global.__memoryEvents.find((e: any) => e.id === eventId);
      if (memEvt) {
        eventDate = memEvt.event_date;
        endTime = memEvt.end_time;
      }
    }

    if (eventDate) {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      let isDone = eventDate < todayStr;
      if (eventDate === todayStr && endTime) {
        const [endH, endM] = endTime.split(":").map(Number);
        if (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM)) {
          isDone = true;
        }
      }

      if (isDone) {
        return NextResponse.json(
          { error: "Cet événement est déjà terminé. Les présences sont clôturées et ne peuvent plus être modifiées." },
          { status: 403 }
        );
      }
    }

    // Update memory events fallback if active
    if (global.__memoryEvents) {
      const memEvt = global.__memoryEvents.find((e: any) => e.id === eventId);
      if (memEvt) {
        if (!memEvt.rsvps) memEvt.rsvps = [];
        const existingRsvp = memEvt.rsvps.find((r: any) => r.user_id === user.id);
        if (existingRsvp) {
          existingRsvp.status = status;
        } else {
          memEvt.rsvps.push({ user_id: user.id, status, created_at: new Date().toISOString() });
        }
      }
    }

    // Try upserting in event_rsvps table
    const { data, error } = await supabaseAdmin
      .from("event_rsvps")
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status,
        },
        { onConflict: "event_id,user_id" }
      )
      .select()
      .single();

    if (error) {
      // In case table not yet created in Supabase
      return NextResponse.json({ success: true, status, isFallback: true });
    }

    return NextResponse.json({ success: true, rsvp: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
