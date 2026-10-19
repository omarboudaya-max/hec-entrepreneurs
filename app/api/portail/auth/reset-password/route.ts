import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeUsername, generateMemberPassword } from "@/lib/auth-helpers";
import { sendPasswordChangeConfirmationEmail } from "@/lib/email-password-confirmation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json({ error: "Veuillez renseigner votre nom d'utilisateur ou email." }, { status: 400 });
    }

    const cleanInput = identifier.trim();

    // 1. Find profile
    let targetProfile: { id: string; email: string; full_name: string } | null = null;

    if (cleanInput.includes("@")) {
      const emailLower = cleanInput.toLowerCase();
      const resolvedEmail = emailLower === "asma.hamda0@gmail.com" ? "asma.hamda.2025@ihec.ucar.tn" : emailLower;
      const { data } = await supabaseAdmin
        .from("club_profiles")
        .select("id, email, full_name")
        .ilike("email", resolvedEmail)
        .maybeSingle();
      targetProfile = data;
    } else {
      const targetUser = normalizeUsername(cleanInput);
      const { data: allProfiles } = await supabaseAdmin
        .from("club_profiles")
        .select("id, email, full_name");

      if (allProfiles) {
        targetProfile = allProfiles.find((p) => normalizeUsername(p.full_name) === targetUser) || null;
      }
    }

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Compte introuvable. Veuillez vérifier votre nom d'utilisateur ou email officiel." },
        { status: 404 }
      );
    }

    // 2. Generate a new password: full name without space or MAJ + random 4 digits
    const { username, password: newGeneratedPassword } = generateMemberPassword(targetProfile.full_name);

    // 3. Update in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetProfile.id, {
      password: newGeneratedPassword,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 4. Send confirmation email with new password
    await sendPasswordChangeConfirmationEmail({
      email: targetProfile.email,
      fullName: targetProfile.full_name,
      username,
      newPassword: newGeneratedPassword,
      isReset: true,
    });

    return NextResponse.json({
      success: true,
      message: `Un nouveau mot de passe a été généré et envoyé à l'adresse email enregistrée (${targetProfile.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}).`,
    });
  } catch (err: any) {
    console.error("Error in reset-password route:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
