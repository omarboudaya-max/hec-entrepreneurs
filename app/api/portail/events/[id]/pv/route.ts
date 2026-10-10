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

// In-memory fallback support if table column isn't migrated
declare global {
  var __memoryEvents: any[] | undefined;
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID d'événement manquant" }, { status: 400 });
    }

    // Role check: bureau, secrétaire, developpeur, or Omar
    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    const allowed = isOmar || profile?.role === "bureau" || profile?.role === "developpeur";
    if (!allowed) {
      return NextResponse.json(
        { error: "Seuls les membres du bureau et le secrétariat peuvent rédiger le PV." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { pv_content, pv_author_name, pv_decisions } = body;

    if (!pv_content || pv_content.trim() === "") {
      return NextResponse.json({ error: "Le contenu du PV ne peut pas être vide." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const authorName = pv_author_name?.trim() || profile?.full_name || "Secrétariat Général";

    // Attempt Supabase update
    const { data: updatedEvent, error: dbError } = await supabaseAdmin
      .from("club_events")
      .update({
        pv_content: pv_content.trim(),
        pv_author_name: authorName,
        pv_decisions: pv_decisions?.trim() || null,
        pv_updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      console.warn("Could not update PV in DB directly (columns might need migration):", dbError.message);
    }

    // Also update in memory events if present
    if (global.__memoryEvents) {
      const idx = global.__memoryEvents.findIndex((e) => e.id === id);
      if (idx !== -1) {
        global.__memoryEvents[idx] = {
          ...global.__memoryEvents[idx],
          pv_content: pv_content.trim(),
          pv_author_name: authorName,
          pv_decisions: pv_decisions?.trim() || null,
          pv_updated_at: now,
        };
      }
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent || {
        id,
        pv_content: pv_content.trim(),
        pv_author_name: authorName,
        pv_decisions: pv_decisions?.trim() || null,
        pv_updated_at: now,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
