import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeUsername } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }

    const cleanInput = identifier.trim();

    // 1. If it's an email format
    if (cleanInput.includes("@")) {
      const emailLower = cleanInput.toLowerCase();
      const { data: profile } = await supabaseAdmin
        .from("club_profiles")
        .select("id, email, full_name, role, poste")
        .ilike("email", emailLower)
        .maybeSingle();

      if (profile) {
        return NextResponse.json({
          found: true,
          email: profile.email,
          fullName: profile.full_name,
          username: normalizeUsername(profile.full_name),
          role: profile.role,
          poste: profile.poste,
        });
      }

      // If not in club_profiles, check auth.users directly
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = usersData?.users.find((u) => u.email?.toLowerCase() === emailLower);
      if (authUser) {
        return NextResponse.json({
          found: true,
          email: authUser.email,
          fullName: authUser.user_metadata?.full_name || "Membre",
          username: normalizeUsername(authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || ""),
          role: authUser.user_metadata?.role || "membre",
          poste: authUser.user_metadata?.poste || "Membre",
        });
      }

      return NextResponse.json({ error: "Aucun compte associé à cette adresse email." }, { status: 404 });
    }

    // 2. It's a username (full name without space or MAJ)
    const normalizedTarget = normalizeUsername(cleanInput);

    // Fetch all profiles to find match by normalized full_name
    const { data: profiles, error } = await supabaseAdmin
      .from("club_profiles")
      .select("id, email, full_name, role, poste");

    if (error || !profiles) {
      return NextResponse.json({ error: "Erreur lors de la recherche du profil" }, { status: 500 });
    }

    const match = profiles.find((p) => {
      const pUsername = normalizeUsername(p.full_name);
      return pUsername === normalizedTarget;
    });

    if (match) {
      return NextResponse.json({
        found: true,
        email: match.email,
        fullName: match.full_name,
        username: normalizeUsername(match.full_name),
        role: match.role,
        poste: match.poste,
      });
    }

    // Also check auth.users metadata if needed
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const matchedAuthUser = usersData?.users.find((u) => {
      const uName = u.user_metadata?.full_name || "";
      const uMetaUsername = u.user_metadata?.username || "";
      return normalizeUsername(uName) === normalizedTarget || normalizeUsername(uMetaUsername) === normalizedTarget;
    });

    if (matchedAuthUser && matchedAuthUser.email) {
      return NextResponse.json({
        found: true,
        email: matchedAuthUser.email,
        fullName: matchedAuthUser.user_metadata?.full_name || cleanInput,
        username: normalizedTarget,
        role: matchedAuthUser.user_metadata?.role || "membre",
        poste: matchedAuthUser.user_metadata?.poste || "Membre",
      });
    }

    return NextResponse.json(
      { error: `Nom d'utilisateur introuvable (${normalizedTarget}). Assurez-vous d'entrer votre nom complet sans espace ni majuscule.` },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("Error in resolve-identifier:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
