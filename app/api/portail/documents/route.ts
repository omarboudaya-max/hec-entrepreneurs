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

// GET /api/portail/documents - List documents
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: docs, error } = await supabaseAdmin
      .from("club_documents")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ documents: docs || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/documents - Update document file URL (Bureau or Dev)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowed = isOmar || profile?.role === "bureau" || profile?.role === "developpeur";
    if (!allowed) {
      return NextResponse.json({ error: "Action réservée au bureau et développeur" }, { status: 403 });
    }

    const body = await req.json();
    const { doc_key, title, file_url, description } = body;

    if (!doc_key || !file_url) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("club_documents")
      .upsert(
        {
          doc_key,
          title,
          file_url,
          description,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "doc_key" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ document: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
