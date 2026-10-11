import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// In-memory fallback if Supabase table is not yet migrated
declare global {
  var __autresCreneaux: any[] | undefined;
}

if (!global.__autresCreneaux) {
  global.__autresCreneaux = [];
}

const DEFAULT_SLOT_LIMIT = 4; // Max 4 candidates per 30-min slot

export async function GET() {
  try {
    // 1. Fetch bookings from candidatures_autres_creneaux
    const { data: autresData } = await supabaseAdmin
      .from("candidatures_autres_creneaux")
      .select("interview_time");

    // 2. Also fetch any candidatures_recrutement where interview_date = 'Lundi'
    const { data: mainData } = await supabaseAdmin
      .from("candidatures_recrutement")
      .select("interview_time")
      .eq("interview_date", "Lundi");

    const counts: Record<string, number> = {};

    // Tally from DB
    if (autresData && Array.isArray(autresData)) {
      for (const row of autresData) {
        if (row.interview_time) {
          counts[row.interview_time] = (counts[row.interview_time] || 0) + 1;
        }
      }
    }

    if (mainData && Array.isArray(mainData)) {
      for (const row of mainData) {
        if (row.interview_time && row.interview_time !== "Autre") {
          counts[row.interview_time] = (counts[row.interview_time] || 0) + 1;
        }
      }
    }

    // Tally from memory fallback
    if (global.__autresCreneaux) {
      for (const row of global.__autresCreneaux) {
        if (row.interview_time) {
          counts[row.interview_time] = (counts[row.interview_time] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      counts,
      limit: DEFAULT_SLOT_LIMIT,
    });
  } catch (err: any) {
    console.error("Error fetching autres creneaux counts:", err);
    return NextResponse.json({ counts: {}, limit: DEFAULT_SLOT_LIMIT });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, interviewTime, email, phone } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Le nom et prénom sont obligatoires." }, { status: 400 });
    }

    if (!interviewTime || !interviewTime.trim()) {
      return NextResponse.json({ error: "Veuillez sélectionner un créneau horaire." }, { status: 400 });
    }

    const cleanName = fullName.trim();
    const cleanSlot = interviewTime.trim();
    const cleanEmail = email?.trim() || "";
    const cleanPhone = phone?.trim() || "";

    const submissionRecord = {
      full_name: cleanName,
      interview_date: "Lundi",
      interview_time: cleanSlot,
      email: cleanEmail,
      phone: cleanPhone,
      created_at: new Date().toISOString(),
    };

    // 1. Save to dedicated table candidatures_autres_creneaux
    const { error: insertErr } = await supabaseAdmin
      .from("candidatures_autres_creneaux")
      .insert([submissionRecord]);

    if (insertErr) {
      console.warn("Could not insert into candidatures_autres_creneaux (fallback to memory):", insertErr.message);
      if (global.__autresCreneaux) {
        global.__autresCreneaux.push(submissionRecord);
      }
    }

    // 2. Also check if candidate exists in candidatures_recrutement to update their slot
    try {
      const { data: existingCandidate } = await supabaseAdmin
        .from("candidatures_recrutement")
        .select("id")
        .ilike("full_name", cleanName)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingCandidate) {
        await supabaseAdmin
          .from("candidatures_recrutement")
          .update({
            interview_date: "Lundi",
            interview_time: cleanSlot,
          })
          .eq("id", existingCandidate.id);
      } else {
        // Create an entry in candidatures_recrutement for admin visibility
        await supabaseAdmin
          .from("candidatures_recrutement")
          .insert([{
            full_name: cleanName,
            education: "Rattrapage créneau Autre",
            phone: cleanPhone || "Non renseigné",
            email: cleanEmail || "non-renseigne@hec.org",
            interview_date: "Lundi",
            interview_time: cleanSlot,
            status: "creneau_autre_confirme",
          }]);
      }
    } catch (dbErr) {
      console.warn("Could not sync with candidatures_recrutement:", dbErr);
    }

    // 3. Forward to Google Sheets Webhook if configured
    const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw71VZcsn6yWJk19lzPRCKBtF7R-VgxcjIgbAqyB-NyKFiKgscwtOAws2jyYxsDCl1G/exec";
    if (sheetsUrl) {
      try {
        await fetch(sheetsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: cleanName,
            interviewDate: "Lundi",
            interviewTime: cleanSlot,
            phone: cleanPhone,
            email: cleanEmail,
            source: "formulaire_autres_lundi",
            submittedAt: new Date().toLocaleString("fr-FR"),
          }),
        });
      } catch (sheetErr) {
        console.warn("Google sheets forward error:", sheetErr);
      }
    }

    return NextResponse.json({
      success: true,
      fullName: cleanName,
      interviewDate: "Lundi",
      interviewTime: cleanSlot,
    });
  } catch (err: any) {
    console.error("Error in /api/recruitment/autres:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
