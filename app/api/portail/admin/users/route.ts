import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Verify that requester is developer or bureau (RH / Bureau Exécutif)
async function verifyAdminOrBureau(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return false;

  if (user.email?.toLowerCase() === "omarboudaya1@gmail.com") return true;

  const { data: profile } = await supabaseAdmin
    .from("club_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "developpeur" || profile?.role === "bureau";
}

// GET /api/portail/admin/users - List all club members
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const isAuthorized = await verifyAdminOrBureau(req);

    const { data: profiles, error } = await supabaseAdmin
      .from("club_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profiles, isDev: isAuthorized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/admin/users - Fast user creation (Bureau & Developer)
export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminOrBureau(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Accès réservé au Bureau / RH et Développeur" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, full_name, role = "membre", poste = "Membre", avatar_url, bio, career } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Veuillez fournir l'email, le mot de passe et le nom complet." },
        { status: 400 }
      );
    }

    // 1. Create auth user with pre-confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role, poste },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Erreur lors de la création du compte auth" },
        { status: 400 }
      );
    }

    // 2. Insert into club_profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("club_profiles")
      .upsert({
        id: authData.user.id,
        email,
        full_name,
        role,
        poste,
        avatar_url: avatar_url || null,
        bio: bio || null,
        career: career || null,
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user: authData.user, profile: profileData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/portail/admin/users - Update member role, poste, bio, career (Bureau & Developer)
export async function PATCH(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminOrBureau(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Accès réservé au Bureau / RH et Développeur" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, poste, password, full_name, bio, career, avatar_url } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (role) updates.role = role;
    if (poste !== undefined) updates.poste = poste;
    if (full_name) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (career !== undefined) updates.career = career;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from("club_profiles")
        .update(updates)
        .eq("id", userId);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    if (password) {
      const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });
      if (passError) {
        return NextResponse.json({ error: passError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/portail/admin/users - Expulse / Delete member (Bureau & Developer)
export async function DELETE(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminOrBureau(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Accès réservé au Bureau / RH et Développeur" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }

    // Delete from auth (cascades to profiles)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    // Explicitly delete from club_profiles in case cascade is not automatic
    await supabaseAdmin.from("club_profiles").delete().eq("id", userId);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
