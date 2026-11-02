import { NextRequest, NextResponse } from "next/server";
import { loadAllTreasuryMembers } from "../route";

export const dynamic = "force-dynamic";

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

    const allMembers = await loadAllTreasuryMembers();
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
