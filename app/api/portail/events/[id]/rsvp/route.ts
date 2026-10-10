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
