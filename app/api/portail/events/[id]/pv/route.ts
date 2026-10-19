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
    const {
      pv_file_url,
      pv_file_name,
      pv_author_name,
      pv_content,
      pv_decisions,
      custom_present_count,
      custom_absent_count,
    } = body;

    if (!pv_file_url && (!pv_content || pv_content.trim() === "")) {
      return NextResponse.json({ error: "Veuillez joindre le document officiel du PV (PDF, Word, etc.)." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const authorName = pv_author_name?.trim() || profile?.full_name || "Secrétariat Général";

    // Format presence tag if custom counts are provided
    let presenceTag = "";
    if (custom_present_count !== undefined && custom_present_count !== null && custom_present_count !== "") {
      const pres = Number(custom_present_count);
      const abs = custom_absent_count !== undefined && custom_absent_count !== null && custom_absent_count !== "" ? Number(custom_absent_count) : 0;
      presenceTag = `[PRESENCES:present=${pres},absent=${abs}]`;
    }

    let combinedContent = pv_content ? pv_content.trim() : (pv_file_name ? `Fichier officiel joint : ${pv_file_name}` : "");
    if (presenceTag && !combinedContent.includes("[PRESENCES:")) {
      combinedContent = `${presenceTag}\n\n${combinedContent}`.trim();
    }

    const fullPayload: any = {
      pv_file_url: pv_file_url || null,
      pv_file_name: pv_file_name || null,
      pv_content: combinedContent || null,
      pv_author_name: authorName,
      pv_decisions: pv_decisions?.trim() || null,
      pv_updated_at: now,
    };

    if (custom_present_count !== undefined && custom_present_count !== null && custom_present_count !== "") {
      fullPayload.custom_present_count = Number(custom_present_count);
    }
    if (custom_absent_count !== undefined && custom_absent_count !== null && custom_absent_count !== "") {
      fullPayload.custom_absent_count = Number(custom_absent_count);
    }

    // Attempt Supabase update with full payload
    let { data: updatedEvent, error: dbError } = await supabaseAdmin
      .from("club_events")
      .update(fullPayload)
      .eq("id", id)
      .select()
      .single();

    // If error because custom_present_count or custom_absent_count columns do not exist yet in SQL:
    if (dbError && (dbError.message?.includes("custom_present_count") || dbError.message?.includes("custom_absent_count") || dbError.message?.includes("column"))) {
      const standardPayload: any = {
        pv_file_url: pv_file_url || null,
        pv_file_name: pv_file_name || null,
        pv_content: combinedContent || null,
        pv_author_name: authorName,
        pv_decisions: pv_decisions?.trim() || null,
        pv_updated_at: now,
      };

      const retryStandard = await supabaseAdmin
        .from("club_events")
        .update(standardPayload)
        .eq("id", id)
        .select()
        .single();

      if (!retryStandard.error) {
        updatedEvent = retryStandard.data;
        dbError = null;
      } else if (retryStandard.error.message?.includes("pv_file_url")) {
        // Fallback only if pv_file_url column itself doesn't exist
        const legacyPayload = {
          pv_content: pv_file_url ? `[FICHIER_PV:${pv_file_name || 'document'}](${pv_file_url})\n\n${combinedContent || ''}`.trim() : combinedContent || null,
          pv_author_name: authorName,
          pv_decisions: pv_decisions?.trim() || null,
          pv_updated_at: now,
        };
        const retryLegacy = await supabaseAdmin
          .from("club_events")
          .update(legacyPayload)
          .eq("id", id)
          .select()
          .single();
        if (!retryLegacy.error) {
          updatedEvent = { ...retryLegacy.data, pv_file_url, pv_file_name };
          dbError = null;
        }
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
          ...fullPayload,
        };
      }
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent || {
        id,
        ...fullPayload,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
