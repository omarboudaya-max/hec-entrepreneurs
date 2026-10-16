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
    const { pv_file_url, pv_file_name, pv_author_name, pv_content, pv_decisions } = body;

    if (!pv_file_url && (!pv_content || pv_content.trim() === "")) {
      return NextResponse.json({ error: "Veuillez joindre le document officiel du PV (PDF, Word, etc.)." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const authorName = pv_author_name?.trim() || profile?.full_name || "Secrétariat Général";

    const updatePayload: any = {
      pv_file_url: pv_file_url || null,
      pv_file_name: pv_file_name || null,
      pv_content: pv_content ? pv_content.trim() : (pv_file_name ? `Fichier officiel joint : ${pv_file_name}` : null),
      pv_author_name: authorName,
      pv_decisions: pv_decisions?.trim() || null,
      pv_updated_at: now,
    };

    // Attempt Supabase update
    let { data: updatedEvent, error: dbError } = await supabaseAdmin
      .from("club_events")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    // If error because pv_file_url column doesn't exist yet, retry with legacy columns
    if (dbError && (dbError.message?.includes("pv_file_url") || dbError.message?.includes("column"))) {
      const fallbackPayload = {
        pv_content: pv_file_url ? `[FICHIER_PV:${pv_file_name || 'document'}](${pv_file_url})\n\n${pv_content || ''}`.trim() : pv_content?.trim(),
        pv_author_name: authorName,
        pv_decisions: pv_decisions?.trim() || null,
        pv_updated_at: now,
      };
      const retry = await supabaseAdmin
        .from("club_events")
        .update(fallbackPayload)
        .eq("id", id)
        .select()
        .single();
      if (!retry.error) {
        updatedEvent = { ...retry.data, pv_file_url, pv_file_name };
        dbError = null;
      }
    }

    if (dbError) {
      console.warn("Could not update PV in DB directly:", dbError.message);
    }

    // Also update in memory events if present
    if (global.__memoryEvents) {
      const idx = global.__memoryEvents.findIndex((e) => e.id === id);
      if (idx !== -1) {
        global.__memoryEvents[idx] = {
          ...global.__memoryEvents[idx],
          ...updatePayload,
        };
      }
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent || {
        id,
        ...updatePayload,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
