import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sortClubProfiles } from "@/lib/member-sorting";
import { MemberTreasuryItem, PaymentStatus } from "@/types/portail";

export const dynamic = "force-dynamic";

function isNewMemberProfile(profile: { role?: string; poste?: string }) {
  const role = (profile.role || "").toLowerCase();
  const poste = (profile.poste || "").toLowerCase();
  return (
    role === "nouveau_membre" ||
    poste === "nouveau membre" ||
    poste.includes("nouveau membre")
  );
}

function getMemberTariff(profile: { role?: string; poste?: string }) {
  const isNew = isNewMemberProfile(profile);
  if (isNew) {
    return {
      is_new_member: true,
      total_due: 70,
      first_tranche_amount: 40,
      second_tranche_amount: 30,
    };
  }
  return {
    is_new_member: false,
    total_due: 50,
    first_tranche_amount: 30,
    second_tranche_amount: 20,
  };
}

// GET /api/portail/tresorerie/n8n?key=bestevent2026&status=partiel
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyParam = searchParams.get("key") || req.headers.get("x-api-key");
    const statusFilter = searchParams.get("status"); // 'partiel' | 'paye' | 'non_paye'

    const expectedKey =
      process.env.N8N_API_KEY || process.env.ADMIN_PASSWORD || "bestevent2026";

    if (keyParam !== expectedKey) {
      return NextResponse.json(
        { error: "Clé API n8n invalide." },
        { status: 401 }
      );
    }

    const { data: profiles, error } = await supabaseAdmin
      .from("club_profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const sortedProfiles = sortClubProfiles(profiles || []);
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });
    const metadataById = new Map<string, any>();
    for (const u of authUsersData?.users || []) {
      if (u.user_metadata?.treasury) {
        metadataById.set(u.id, u.user_metadata.treasury);
      }
    }

    const tableById = new Map<string, any>();
    try {
      const { data: rows, error: tblErr } = await supabaseAdmin
        .from("club_treasury")
        .select("*");
      if (!tblErr && Array.isArray(rows)) {
        for (const r of rows) {
          tableById.set(r.user_id, r);
        }
      }
    } catch {
      // Optional table
    }

    const allMembers: MemberTreasuryItem[] = sortedProfiles.map((p) => {
      const tariff = getMemberTariff(p);
      const saved = tableById.get(p.id) || metadataById.get(p.id) || {};
      const paymentStatus: PaymentStatus =
        saved.payment_status === "paye" || saved.payment_status === "partiel"
          ? saved.payment_status
          : "non_paye";

      let amountPaid = 0;
      if (paymentStatus === "paye") {
        amountPaid = tariff.total_due;
      } else if (paymentStatus === "partiel") {
        amountPaid =
          typeof saved.amount_paid === "number" && saved.amount_paid > 0
            ? saved.amount_paid
            : tariff.first_tranche_amount;
      }

      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: p.role,
        poste: p.poste || "Membre",
        avatar_url: p.avatar_url || null,
        phone: p.phone || null,
        is_new_member: tariff.is_new_member,
        total_due: tariff.total_due,
        first_tranche_amount: tariff.first_tranche_amount,
        second_tranche_amount: tariff.second_tranche_amount,
        payment_status: paymentStatus,
        amount_paid: amountPaid,
        remaining_amount: Math.max(0, tariff.total_due - amountPaid),
        last_payment_at: saved.last_payment_at || null,
        last_reminder_at: saved.last_reminder_at || null,
        updated_by: saved.updated_by || null,
        notes: saved.notes || null,
      };
    });

    const filtered = statusFilter
      ? allMembers.filter((m) => m.payment_status === statusFilter)
      : allMembers;

    return NextResponse.json({
      count: filtered.length,
      members: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
