import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("candidatures_recrutement")
      .select("interview_date, interview_time");

    if (error) {
      console.error("Error fetching recruitment slots:", error);
      return NextResponse.json({ counts: {}, error: error.message }, { status: 500 });
    }

    const counts: Record<string, number> = {};
    if (data && Array.isArray(data)) {
      for (const row of data) {
        if (row.interview_date && row.interview_time) {
          const key = `${row.interview_date}_${row.interview_time}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      counts,
      limits: {
        default: 5,
        "13:00": 10,
        "13:30": 10,
        "Autre": null,
      },
    });
  } catch (err: any) {
    console.error("Slots API error:", err);
    return NextResponse.json({ counts: {}, error: err.message }, { status: 500 });
  }
}
