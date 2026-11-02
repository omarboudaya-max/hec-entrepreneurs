import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sortClubProfiles } from "@/lib/member-sorting";
import { MemberTreasuryItem, PaymentStatus } from "@/types/portail";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function isNewMemberProfile(profile: { role?: string; poste?: string }) {
  const role = (profile.role || "").toLowerCase();
  const poste = (profile.poste || "").toLowerCase();
  return role === "nouveau_membre" || poste === "nouveau membre" || poste.includes("nouveau membre");
}

export function getMemberTariff(profile: { role?: string; poste?: string }) {
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

// Verify that requester is STRICTLY Trésorier or Développeur
export async function verifyTreasurerOrDev(req: NextRequest): Promise<{
  authorized: boolean;
  actorName?: string;
  actorEmail?: string;
}> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return { authorized: false };

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { authorized: false };

  const emailLower = (user.email || "").toLowerCase();

  const { data: profile } = await supabaseAdmin
    .from("club_profiles")
    .select("full_name, role, poste, email")
    .eq("id", user.id)
    .single();

  const posteNormalized = (profile?.poste || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const isDev =
    emailLower === "omarboudaya1@gmail.com" || profile?.role === "developpeur";
  const isTreas =
    posteNormalized.includes("tresorier") ||
    emailLower === "kamounmelek40@gmail.com" ||
    emailLower === "hammemimohamed597@gmail.com";

  if (!isDev && !isTreas) {
    return { authorized: false };
  }

  return {
    authorized: true,
    actorName: profile?.full_name || user.email || "Trésorier",
    actorEmail: emailLower,
  };
}

function buildPaymentEmailHtml(params: {
  fullName: string;
  isNewMember: boolean;
  status: PaymentStatus;
  amountPaid: number;
  totalDue: number;
  remainingAmount: number;
  isReminderOnly?: boolean;
}) {
  const { fullName, isNewMember, status, amountPaid, totalDue, remainingAmount, isReminderOnly } = params;
  const categoryLabel = isNewMember
    ? "Nouveau Membre (Cotisation : 70 DT)"
    : "Ancien Membre / Responsable / Bureau (Cotisation : 50 DT)";
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isFull = status === "paye";

  const badgeText = isReminderOnly
    ? "Rappel Cotisation • 2e Tranche"
    : isFull
    ? "Cotisation 100% Réglée • Reçu Officiel"
    : "1re Tranche Reçue • Paiement Partiel";

  const badgeColor = isFull ? "#10b981" : "#f59e0b";

  const mainTitle = isReminderOnly
    ? "RAPPEL : RÈGLEMENT DE LA 2e TRANCHE"
    : isFull
    ? "CONFIRMATION DE PAIEMENT REÇU"
    : "CONFIRMATION 1re TRANCHE & RAPPEL";

  const introMessage = isReminderOnly
    ? `Nous vous remercions d'avoir déjà réglé votre <strong>1re tranche (${amountPaid} DT)</strong> de cotisation annuelle au sein de <strong>HEC Entrepreneurs</strong>. Ce message est un rappel amical concernant le règlement de votre <strong>2e tranche restante (${remainingAmount} DT)</strong>.`
    : isFull
    ? `Nous vous confirmons la bonne réception de l'intégralité de votre cotisation annuelle (<strong>${amountPaid} DT / ${totalDue} DT</strong>) au sein du club <strong>HEC Entrepreneurs</strong>. Merci pour votre engagement !`
    : `Nous vous confirmons la bonne réception de votre <strong>1re tranche de cotisation (${amountPaid} DT sur ${totalDue} DT)</strong> au sein du club <strong>HEC Entrepreneurs</strong>.`;

  const reminderBlock =
    !isFull && remainingAmount > 0
      ? `
        <div style="background: #3b2307; border-left: 4px solid #f59e0b; border-radius: 10px; padding: 16px; margin: 22px 0;">
          <div style="color: #fbbf24; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            ⏳ Rappel — 2e Tranche à compléter (${remainingAmount} DT)
          </div>
          <p style="margin: 0; font-size: 13px; color: #fde68a; line-height: 1.6;">
            Il vous reste un solde de <strong>${remainingAmount} DT</strong> à régler pour finaliser votre cotisation annuelle (${totalDue} DT au total). Merci de vous rapprocher de la Trésorerie du club dès que possible pour compléter la 2e tranche.
          </p>
        </div>
      `
      : `
        <div style="background: #063928; border-left: 4px solid #10b981; border-radius: 10px; padding: 16px; margin: 22px 0;">
          <div style="color: #34d399; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            ✅ Situation Financière à Jour
          </div>
          <p style="margin: 0; font-size: 13px; color: #a7f3d0; line-height: 1.6;">
            Votre cotisation annuelle est intégralement réglée (<strong>${totalDue} DT / ${totalDue} DT</strong>). Aucun autre versement n'est requis pour ce mandat.
          </p>
        </div>
      `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090f; color: #ffffff; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #12121e; border: 1px solid #ffffff15; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
        <div style="background: linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #8b5cf640;">
          <div style="display: inline-block; background: ${badgeColor}25; color: ${badgeColor}; padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; border: 1px solid ${badgeColor}50; margin-bottom: 12px;">
            ${badgeText}
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 800; letter-spacing: 0.5px;">
            ${mainTitle}
          </h1>
          <div style="color: #c4b5fd; font-size: 13px; margin-top: 6px;">
            Trésorerie Officielle • HEC Entrepreneurs IHEC Carthage
          </div>
        </div>

        <div style="padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1;">
          <p>Bonjour <strong>${fullName}</strong>,</p>
          <p>${introMessage}</p>

          <div style="margin: 22px 0; background: #0c0c16; border: 1px solid #ffffff12; border-radius: 12px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; font-size: 13px;">
              <span style="color: #94a3b8;">Membre :</span>
              <strong style="color: #f8fafc; margin-left: auto;">${fullName}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; font-size: 13px;">
              <span style="color: #94a3b8;">Catégorie :</span>
              <strong style="color: #c4b5fd; margin-left: auto;">${categoryLabel}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; font-size: 13px;">
              <span style="color: #94a3b8;">Montant reçu :</span>
              <strong style="color: #34d399; margin-left: auto;">${amountPaid} DT / ${totalDue} DT</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10; font-size: 13px;">
              <span style="color: #94a3b8;">Reste à payer :</span>
              <strong style="color: ${remainingAmount > 0 ? "#fbbf24" : "#34d399"}; margin-left: auto;">${remainingAmount} DT</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px;">
              <span style="color: #94a3b8;">Date de mise à jour :</span>
              <strong style="color: #f8fafc; margin-left: auto;">${dateStr}</strong>
            </div>
          </div>

          ${reminderBlock}

          <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
            Pour toute question relative à votre cotisation, vous pouvez contacter directement le pôle Trésorerie du club.
          </p>
        </div>

        <div style="background: #08080d; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
          HEC Entrepreneurs • IHEC Carthage — « Bâtir le Possible »
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function loadAllTreasuryMembers(): Promise<MemberTreasuryItem[]> {
  // 1. Fetch all club profiles
  const { data: profiles, error } = await supabaseAdmin
    .from("club_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const sortedProfiles = sortClubProfiles(profiles || []);

  // 2. Fetch auth users metadata (secure server-only storage for treasury state)
  const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });
  const metadataById = new Map<string, any>();
  for (const u of authUsersData?.users || []) {
    if (u.user_metadata?.treasury) {
      metadataById.set(u.id, u.user_metadata.treasury);
    }
  }

  // 3. Also check if optional SQL table `club_treasury` exists
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
    // Table optional
  }

  return sortedProfiles.map((p) => {
    const tariff = getMemberTariff(p);
    const tbl = tableById.get(p.id);
    const meta = metadataById.get(p.id);
    const saved = tbl || meta || {};

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

    const remainingAmount = Math.max(0, tariff.total_due - amountPaid);

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
      remaining_amount: remainingAmount,
      last_payment_at: saved.last_payment_at || null,
      last_reminder_at: saved.last_reminder_at || null,
      updated_by: saved.updated_by || null,
      notes: saved.notes || null,
    };
  });
}

// GET /api/portail/tresorerie - Strictly for Trésorier and Développeur
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyTreasurerOrDev(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès strictement réservé au Trésorier et au Développeur." },
        { status: 403 }
      );
    }

    const members = await loadAllTreasuryMembers();
    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/portail/tresorerie - Update member payment status & send confirmation email / trigger n8n
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyTreasurerOrDev(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès strictement réservé au Trésorier et au Développeur." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      userId,
      paymentStatus,
      customAmountPaid,
      notes,
      sendEmail = true,
    }: {
      userId: string;
      paymentStatus: PaymentStatus;
      customAmountPaid?: number;
      notes?: string;
      sendEmail?: boolean;
    } = body;

    if (!userId || !["non_paye", "partiel", "paye"].includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Paramètres invalides (userId et paymentStatus requis)." },
        { status: 400 }
      );
    }

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("club_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
    }

    const tariff = getMemberTariff(profile);

    let amountPaid = 0;
    if (paymentStatus === "paye") {
      amountPaid = tariff.total_due;
    } else if (paymentStatus === "partiel") {
      amountPaid =
        typeof customAmountPaid === "number" && customAmountPaid > 0
          ? customAmountPaid
          : tariff.first_tranche_amount;
    }

    const remainingAmount = Math.max(0, tariff.total_due - amountPaid);
    const nowIso = new Date().toISOString();

    const treasuryRecord = {
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      total_due: tariff.total_due,
      remaining_amount: remainingAmount,
      last_payment_at: paymentStatus !== "non_paye" ? nowIso : null,
      updated_by: auth.actorName,
      notes: notes ?? null,
    };

    // 1. Save in auth.users.user_metadata.treasury (works immediately without SQL migration and is hidden from regular members)
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const existingMeta = existingAuthUser?.user?.user_metadata || {};
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMeta,
        treasury: {
          ...(existingMeta.treasury || {}),
          ...treasuryRecord,
        },
      },
    });

    // 2. Also upsert into `club_treasury` table if it exists
    try {
      await supabaseAdmin.from("club_treasury").upsert(
        {
          user_id: userId,
          ...treasuryRecord,
          updated_at: nowIso,
        },
        { onConflict: "user_id" }
      );
    } catch {
      // Optional table
    }

    // 3. Send automatic email & trigger n8n webhook if marked 'paye' or 'partiel'
    let emailSent = false;
    let n8nTriggered = false;

    if (paymentStatus === "paye" || paymentStatus === "partiel") {
      const eventPayload = {
        event: "treasury_payment_updated",
        userId,
        fullName: profile.full_name,
        email: profile.email,
        role: profile.role,
        poste: profile.poste,
        isNewMember: tariff.is_new_member,
        paymentStatus,
        amountPaid,
        totalDue: tariff.total_due,
        remainingAmount,
        firstTrancheAmount: tariff.first_tranche_amount,
        secondTrancheAmount: tariff.second_tranche_amount,
        updatedBy: auth.actorName,
        updatedAt: nowIso,
      };

      const n8nWebhookUrl =
        process.env.N8N_TREASURY_WEBHOOK_URL ||
        process.env.NEXT_PUBLIC_N8N_TREASURY_WEBHOOK_URL;

      if (n8nWebhookUrl) {
        try {
          await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventPayload),
          });
          n8nTriggered = true;
        } catch (wErr) {
          console.warn("n8n treasury webhook warning:", wErr);
        }
      }

      if (sendEmail && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && profile.email) {
        try {
          const subject =
            paymentStatus === "paye"
              ? `✅ Confirmation de Paiement Reçu (${amountPaid} DT) — HEC Entrepreneurs`
              : `💳 Confirmation 1re Tranche Reçue (${amountPaid} DT) & Rappel 2e Tranche — HEC Entrepreneurs`;

          const html = buildPaymentEmailHtml({
            fullName: profile.full_name,
            isNewMember: tariff.is_new_member,
            status: paymentStatus,
            amountPaid,
            totalDue: tariff.total_due,
            remainingAmount,
          });

          await transporter.sendMail({
            from: `"Trésorerie HEC Entrepreneurs" <${process.env.GMAIL_USER}>`,
            to: profile.email,
            subject,
            html,
          });
          emailSent = true;
        } catch (mailErr) {
          console.warn("Treasury confirmation email warning:", mailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      n8nTriggered,
      treasury: {
        id: profile.id,
        payment_status: paymentStatus,
        amount_paid: amountPaid,
        total_due: tariff.total_due,
        remaining_amount: remainingAmount,
        last_payment_at: treasuryRecord.last_payment_at,
        updated_by: auth.actorName,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/tresorerie - Send 2nd tranche reminder email (single member or all 'partiel' members)
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyTreasurerOrDev(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès strictement réservé au Trésorier et au Développeur." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId }: { userId?: string } = body;

    const allMembers = await loadAllTreasuryMembers();
    const targets = userId
      ? allMembers.filter((m) => m.id === userId && m.payment_status === "partiel")
      : allMembers.filter((m) => m.payment_status === "partiel");

    if (targets.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: "Aucun membre en paiement partiel à relancer.",
      });
    }

    let sentCount = 0;
    const nowIso = new Date().toISOString();

    for (const member of targets) {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && member.email) {
        try {
          const html = buildPaymentEmailHtml({
            fullName: member.full_name,
            isNewMember: member.is_new_member,
            status: "partiel",
            amountPaid: member.amount_paid,
            totalDue: member.total_due,
            remainingAmount: member.remaining_amount,
            isReminderOnly: true,
          });

          await transporter.sendMail({
            from: `"Trésorerie HEC Entrepreneurs" <${process.env.GMAIL_USER}>`,
            to: member.email,
            subject: `🔔 Rappel 2e Tranche de Cotisation (Reste ${member.remaining_amount} DT) — HEC Entrepreneurs`,
            html,
          });
          sentCount++;

          const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserById(member.id);
          const existingMeta = existingAuthUser?.user?.user_metadata || {};
          await supabaseAdmin.auth.admin.updateUserById(member.id, {
            user_metadata: {
              ...existingMeta,
              treasury: {
                ...(existingMeta.treasury || {}),
                last_reminder_at: nowIso,
              },
            },
          });
        } catch (e) {
          console.warn(`Failed to send reminder to ${member.email}:`, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `${sentCount} e-mail(s) de rappel 2e tranche envoyé(s) avec succès.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
