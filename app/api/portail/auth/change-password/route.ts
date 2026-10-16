import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeUsername } from "@/lib/auth-helpers";
import { sendPasswordChangeConfirmationEmail } from "@/lib/email-password-confirmation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Session non autorisée" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    // 1. Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 2. Fetch member profile for full_name
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const fullName = profile?.full_name || user.user_metadata?.full_name || "Membre";
    const username = normalizeUsername(fullName);

    // 3. Send confirmation email with new password
    await sendPasswordChangeConfirmationEmail({
      email: user.email,
      fullName,
      username,
      newPassword,
      isReset: false,
    });

    return NextResponse.json({
      success: true,
      message: "Votre mot de passe a été mis à jour avec succès. Un email de confirmation vous a été envoyé.",
    });
  } catch (err: any) {
    console.error("Error in change-password route:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
