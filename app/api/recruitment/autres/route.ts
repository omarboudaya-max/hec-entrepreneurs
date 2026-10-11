import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Slots & Rules specification:
// Lundi:
// - 10h, 10h30, 11h, 11h30 : 1 slot each
// - 13h et 13h30 : 8 slots combined
// - 14h, 14h30, 15h : 3 slots each
// - 15h30, 16h, 16h30 : 1 slot each
//
// Mardi:
// - 10h, 10h30, 11h, 11h30 : 5 slots each
// - 13h et 13h30 : 9 slots combined
// - 14h, 14h30 : 1 slot each
// - 15h30, 16h, 16h30 : 1 slot each

export const LUNDI_RULES: Record<string, number> = {
  "10:00 - 10:30": 1,
  "10:30 - 11:00": 1,
  "11:00 - 11:30": 1,
  "11:30 - 12:00": 1,
  "14:00 - 14:30": 3,
  "14:30 - 15:00": 3,
  "15:00 - 15:30": 3,
  "15:30 - 16:00": 1,
  "16:00 - 16:30": 1,
  "16:30 - 17:00": 1,
};
export const LUNDI_COMBINED_13H_MAX = 8; // 13:00 - 13:30 et 13:30 - 14:00 combinés

export const MARDI_RULES: Record<string, number> = {
  "10:00 - 10:30": 5,
  "10:30 - 11:00": 5,
  "11:00 - 11:30": 5,
  "11:30 - 12:00": 5,
  "14:00 - 14:30": 1,
  "14:30 - 15:00": 1,
  "15:30 - 16:00": 1,
  "16:00 - 16:30": 1,
  "16:30 - 17:00": 1,
};
export const MARDI_COMBINED_13H_MAX = 9; // 13:00 - 13:30 et 13:30 - 14:00 combinés

// In-memory fallback
declare global {
  var __autresCreneaux: any[] | undefined;
}

if (!global.__autresCreneaux) {
  global.__autresCreneaux = [];
}

export function normalizeSlot(slot: string): string {
  if (!slot) return "";
  const s = slot.trim().toLowerCase();

  if (s.includes("10h00") || s.includes("10:00") || s === "10h") {
    if (s.includes("10h30") || s.includes("10:30")) return "10:30 - 11:00";
    return "10:00 - 10:30";
  }
  if (s.includes("10h30") || s.includes("10:30")) return "10:30 - 11:00";
  if (s.includes("11h00") || s.includes("11:00") || s === "11h") {
    if (s.includes("11h30") || s.includes("11:30")) return "11:30 - 12:00";
    return "11:00 - 11:30";
  }
  if (s.includes("11h30") || s.includes("11:30")) return "11:30 - 12:00";

  if (s.includes("13h00") || s.includes("13:00") || s === "13h") return "13:00 - 13:30";
  if (s.includes("13h30") || s.includes("13:30")) return "13:30 - 14:00";

  if (s.includes("14h00") || s.includes("14:00") || s === "14h") {
    if (s.includes("14h30") || s.includes("14:30")) return "14:30 - 15:00";
    return "14:00 - 14:30";
  }
  if (s.includes("14h30") || s.includes("14:30")) return "14:30 - 15:00";

  if (s.includes("15h00") || s.includes("15:00") || s === "15h") {
    if (s.includes("15h30") || s.includes("15:30")) return "15:30 - 16:00";
    return "15:00 - 15:30";
  }
  if (s.includes("15h30") || s.includes("15:30")) return "15:30 - 16:00";

  if (s.includes("16h00") || s.includes("16:00") || s === "16h") {
    if (s.includes("16h30") || s.includes("16:30")) return "16:30 - 17:00";
    return "16:00 - 16:30";
  }
  if (s.includes("16h30") || s.includes("16:30")) return "16:30 - 17:00";

  return slot.trim();
}

export function isSlotFull(day: string, slotId: string, bookedCounts: Record<string, number>): boolean {
  const normSlot = normalizeSlot(slotId);

  if (day === "Lundi") {
    if (normSlot === "13:00 - 13:30" || normSlot === "13:30 - 14:00") {
      const c13_00 = bookedCounts["Lundi::13:00 - 13:30"] || 0;
      const c13_30 = bookedCounts["Lundi::13:30 - 14:00"] || 0;
      return c13_00 + c13_30 >= LUNDI_COMBINED_13H_MAX;
    }
    const cap = LUNDI_RULES[normSlot];
    if (cap === undefined) return true; // not offered on Lundi
    const booked = bookedCounts[`Lundi::${normSlot}`] || 0;
    return booked >= cap;
  }

  if (day === "Mardi") {
    if (normSlot === "13:00 - 13:30" || normSlot === "13:30 - 14:00") {
      const c13_00 = bookedCounts["Mardi::13:00 - 13:30"] || 0;
      const c13_30 = bookedCounts["Mardi::13:30 - 14:00"] || 0;
      return c13_00 + c13_30 >= MARDI_COMBINED_13H_MAX;
    }
    const cap = MARDI_RULES[normSlot];
    if (cap === undefined) return true; // not offered on Mardi
    const booked = bookedCounts[`Mardi::${normSlot}`] || 0;
    return booked >= cap;
  }

  return true;
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
          if (slot) {
            const key = `${day}::${slot}`;
            bookedCounts[key] = (bookedCounts[key] || 0) + 1;
          }
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

    // Determine full slots per day without exposing exact capacity numbers
    const lundiSlots = [
      "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00",
      "13:00 - 13:30", "13:30 - 14:00",
      "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30",
      "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00",
    ];

    const mardiSlots = [
      "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00",
      "13:00 - 13:30", "13:30 - 14:00",
      "14:00 - 14:30", "14:30 - 15:00",
      "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00",
    ];

    const fullSlots: Record<string, string[]> = {
      Lundi: lundiSlots.filter((slot) => isSlotFull("Lundi", slot, bookedCounts)),
      Mardi: mardiSlots.filter((slot) => isSlotFull("Mardi", slot, bookedCounts)),
    };

    return NextResponse.json({
      fullSlots,
      booked: bookedCounts,
    });
  } catch (err: any) {
    console.error("Error fetching autres creneaux status:", err);
    return NextResponse.json({
      fullSlots: { Lundi: [], Mardi: [] },
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

    // Fetch existing bookings to check capacity
    const bookedCounts: Record<string, number> = {};
    const { data: currentBookings } = await supabaseAdmin
      .from("candidatures_autres_creneaux")
      .select("interview_date, interview_time")
      .eq("interview_date", cleanDay);

    if (currentBookings && Array.isArray(currentBookings)) {
      for (const row of currentBookings) {
        const slot = normalizeSlot(row.interview_time || "");
        if (slot) {
          const key = `${cleanDay}::${slot}`;
          bookedCounts[key] = (bookedCounts[key] || 0) + 1;
        }
      }
    }

    if (isSlotFull(cleanDay, cleanSlot, bookedCounts)) {
      return NextResponse.json(
        { error: `Ce créneau (${cleanSlot}) est désormais complet. Veuillez en sélectionner un autre.` },
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
      console.warn("Fallback to memory insert:", insertErr.message);
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
