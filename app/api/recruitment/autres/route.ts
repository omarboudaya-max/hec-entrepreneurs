import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Schedule and capacity specification:
// Lundi:
// - 09:00 à 10:00 : 0
// - 10:30 à 11:30 : 1
// - 12:00 à 13:00 : 2
// - 13:30 : 10
// - 14:00 à 15:30 : 3
// - 16:00 à 16:30 : 1
// Mardi:
// - 09:00 à 10:00 : 0
// - 10:30 à 11:30 : 4
// - 12:00 à 13:00 : 0
// - 13:30 : 10
// - 14:00 à 15:30 : 1
// - 16:00 à 16:30 : 1
// Mercredi: Supprimé

export const DEFAULT_CAPACITIES: Record<string, Record<string, number>> = {
  Lundi: {
    "09:00 - 10:00": 0,
    "10:30 - 11:30": 1,
    "12:00 - 13:00": 2,
    "13:30": 10,
    "14:00 - 15:30": 3,
    "16:00 - 16:30": 1,
  },
  Mardi: {
    "09:00 - 10:00": 0,
    "10:30 - 11:30": 4,
    "12:00 - 13:00": 0,
    "13:30": 10,
    "14:00 - 15:30": 1,
    "16:00 - 16:30": 1,
  },
};

// In-memory fallback if Supabase table is not yet migrated
declare global {
  var __autresCreneaux: any[] | undefined;
}

if (!global.__autresCreneaux) {
  global.__autresCreneaux = [];
}

function normalizeSlot(slot: string): string {
  const s = slot.trim();
  if (s === "13:30 - 14:00" || s === "13:30" || s === "13h30") return "13:30";
  if (s === "09:00 à 10:00" || s === "09h00 à 10h00" || s === "09:00-10:00") return "09:00 - 10:00";
  if (s === "10:30 à 11:30" || s === "10h30 à 11h30" || s === "10:30-11:30") return "10:30 - 11:30";
  if (s === "12:00 à 13:00" || s === "12h00 à 13h00" || s === "12:00-13:00") return "12:00 - 13:00";
  if (s === "14:00 à 15:30" || s === "14h00 à 15h30" || s === "14:00-15:30") return "14:00 - 15:30";
  if (s === "16:00 à 16:30" || s === "16h00 à 16h30" || s === "16:00-16:30") return "16:00 - 16:30";
  return s;
}

export async function GET() {
  try {
    const bookedCounts: Record<string, number> = {};

    // 1. Fetch bookings from candidatures_autres_creneaux
    const { data: autresData } = await supabaseAdmin
      .from("candidatures_autres_creneaux")
      .select("interview_date, interview_time");

    if (autresData && Array.isArray(autresData)) {
      for (const row of autresData) {
        const day = row.interview_date || "Lundi";
        const slot = normalizeSlot(row.interview_time || "");
        if (slot) {
          const key = `${day}::${slot}`;
          bookedCounts[key] = (bookedCounts[key] || 0) + 1;
        }
      }
    }

    // 2. Also fetch candidatures_recrutement for Lundi & Mardi
    const { data: mainData } = await supabaseAdmin
      .from("candidatures_recrutement")
      .select("interview_date, interview_time")
      .in("interview_date", ["Lundi", "Mardi"]);

    if (mainData && Array.isArray(mainData)) {
      for (const row of mainData) {
        if (row.interview_time && row.interview_time !== "Autre") {
          const day = row.interview_date || "Lundi";
          const slot = normalizeSlot(row.interview_time);
          const key = `${day}::${slot}`;
          bookedCounts[key] = (bookedCounts[key] || 0) + 1;
        }
      }
    }

    // 3. Fallback memory tally
    if (global.__autresCreneaux) {
      for (const row of global.__autresCreneaux) {
        const day = row.interview_date || "Lundi";
        const slot = normalizeSlot(row.interview_time || "");
        if (slot) {
          const key = `${day}::${slot}`;
          bookedCounts[key] = (bookedCounts[key] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      capacities: DEFAULT_CAPACITIES,
      booked: bookedCounts,
    });
  } catch (err: any) {
    console.error("Error fetching autres creneaux counts:", err);
    return NextResponse.json({
      capacities: DEFAULT_CAPACITIES,
      booked: {},
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, interviewDate, interviewTime, email, phone } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Le nom et prénom sont obligatoires." }, { status: 400 });
    }

    const cleanDay = (interviewDate || "Lundi").trim();
    if (cleanDay !== "Lundi" && cleanDay !== "Mardi") {
      return NextResponse.json({ error: "Veuillez choisir un jour valide (Lundi ou Mardi)." }, { status: 400 });
    }

    if (!interviewTime || !interviewTime.trim()) {
      return NextResponse.json({ error: "Veuillez sélectionner un créneau horaire." }, { status: 400 });
    }

    const cleanName = fullName.trim();
    const cleanSlot = normalizeSlot(interviewTime);
    const cleanEmail = email?.trim() || "";
    const cleanPhone = phone?.trim() || "";

    // Capacity verification
    const dayCapacities = DEFAULT_CAPACITIES[cleanDay];
    const maxCapacity = dayCapacities ? (dayCapacities[cleanSlot] ?? 0) : 0;

    if (maxCapacity === 0) {
      return NextResponse.json(
        { error: `Le créneau ${cleanSlot} du ${cleanDay} n'est pas disponible (0 place).` },
        { status: 400 }
      );
    }

    // Check current bookings count
    const { count: currentBookedCount } = await supabaseAdmin
      .from("candidatures_autres_creneaux")
      .select("id", { count: "exact", head: true })
      .eq("interview_date", cleanDay)
      .eq("interview_time", cleanSlot);

    if (typeof currentBookedCount === "number" && currentBookedCount >= maxCapacity) {
      return NextResponse.json(
        { error: `Le créneau ${cleanSlot} du ${cleanDay} est désormais complet. Veuillez en sélectionner un autre.` },
        { status: 400 }
      );
    }

    const submissionRecord = {
      full_name: cleanName,
      interview_date: cleanDay,
      interview_time: cleanSlot,
      email: cleanEmail,
      phone: cleanPhone,
      created_at: new Date().toISOString(),
    };

    // 1. Insert into candidatures_autres_creneaux
    const { error: insertErr } = await supabaseAdmin
      .from("candidatures_autres_creneaux")
      .insert([submissionRecord]);

    if (insertErr) {
      console.warn("Could not insert into candidatures_autres_creneaux (fallback to memory):", insertErr.message);
      if (global.__autresCreneaux) {
        global.__autresCreneaux.push(submissionRecord);
      }
    }

    // 2. Sync with candidatures_recrutement
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
            interview_date: cleanDay,
            interview_time: cleanSlot,
          })
          .eq("id", existingCandidate.id);
      } else {
        await supabaseAdmin
          .from("candidatures_recrutement")
          .insert([{
            full_name: cleanName,
            education: "Rattrapage créneau Autre",
            phone: cleanPhone || "Non renseigné",
            email: cleanEmail || "non-renseigne@hec.org",
            interview_date: cleanDay,
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
            interviewDate: cleanDay,
            interviewTime: cleanSlot,
            phone: cleanPhone,
            email: cleanEmail,
            source: "formulaire_autres_session",
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
      interviewDate: cleanDay,
      interviewTime: cleanSlot,
    });
  } catch (err: any) {
    console.error("Error in /api/recruitment/autres:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
