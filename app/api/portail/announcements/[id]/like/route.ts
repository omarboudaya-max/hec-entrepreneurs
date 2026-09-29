import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: announcementId } = await context.params;

    // Check if user already liked
    const { data: existingLike } = await supabaseAdmin
      .from("announcement_likes")
      .select("id")
      .eq("announcement_id", announcementId)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // Remove like
      await supabaseAdmin
        .from("announcement_likes")
        .delete()
        .eq("id", existingLike.id);

      return NextResponse.json({ liked: false });
    } else {
      // Add like
      await supabaseAdmin
        .from("announcement_likes")
        .insert({
          announcement_id: announcementId,
          user_id: user.id,
        });

      return NextResponse.json({ liked: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
