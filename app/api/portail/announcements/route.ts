import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { broadcastToClubMembers } from "@/lib/email-broadcast";

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET /api/portail/announcements - Fetch announcements with interactions
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Fetch announcements
    const { data: announcements, error: annError } = await supabaseAdmin
      .from("announcements")
      .select(`
        id,
        author_id,
        content,
        image_url,
        link_url,
        link_title,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (annError) {
      return NextResponse.json({ error: annError.message }, { status: 400 });
    }

    if (!announcements || announcements.length === 0) {
      return NextResponse.json({ announcements: [] });
    }

    const announcementIds = announcements.map((a) => a.id);
    const authorIds = Array.from(new Set(announcements.map((a) => a.author_id)));

    // Fetch authors
    const { data: authors } = await supabaseAdmin
      .from("club_profiles")
      .select("id, full_name, role, poste, avatar_url")
      .in("id", authorIds);

    const authorsMap = new Map((authors || []).map((a) => [a.id, a]));

    // Fetch likes
    const { data: likes } = await supabaseAdmin
      .from("announcement_likes")
      .select("announcement_id, user_id")
      .in("announcement_id", announcementIds);

    // Fetch comments
    const { data: comments } = await supabaseAdmin
      .from("announcement_comments")
      .select(`
        id,
        announcement_id,
        user_id,
        content,
        created_at
      `)
      .in("announcement_id", announcementIds)
      .order("created_at", { ascending: true });

    // Fetch comment authors
    const commentAuthorIds = Array.from(new Set((comments || []).map((c) => c.user_id)));
    const { data: commentAuthors } = await supabaseAdmin
      .from("club_profiles")
      .select("id, full_name, role, poste, avatar_url")
      .in("id", commentAuthorIds);

    const commentAuthorsMap = new Map((commentAuthors || []).map((a) => [a.id, a]));

    const enrichedAnnouncements = announcements.map((ann) => {
      const annLikes = (likes || []).filter((l) => l.announcement_id === ann.id);
      const annComments = (comments || [])
        .filter((c) => c.announcement_id === ann.id)
        .map((c) => ({
          ...c,
          author: commentAuthorsMap.get(c.user_id),
        }));

      return {
        ...ann,
        author: authorsMap.get(ann.author_id),
        likes_count: annLikes.length,
        has_liked: annLikes.some((l) => l.user_id === user.id),
        comments: annComments,
      };
    });

    return NextResponse.json({ announcements: enrichedAnnouncements });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/announcements - Publish an announcement (Bureau or Developer)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check role
    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowed = isOmar || profile?.role === "bureau" || profile?.role === "developpeur";
    if (!allowed) {
      return NextResponse.json(
        { error: "Seuls les membres du bureau ou le développeur peuvent publier une annonce." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, image_url, link_url, link_title, broadcastEmail } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Le contenu de l'annonce est requis." }, { status: 400 });
    }

    const { data: newPost, error: insertError } = await supabaseAdmin
      .from("announcements")
      .insert({
        author_id: user.id,
        content: content.trim(),
        image_url: image_url || null,
        link_url: link_url || null,
        link_title: link_title || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    if (broadcastEmail) {
      await broadcastToClubMembers({
        subject: `Nouvelle annonce officielle sur l'Intranet`,
        badge: "Annonce Officielle",
        title: "Nouvelle communication du Club",
        message: content.trim(),
        actionText: "Voir l'annonce sur l'Intranet",
        actionUrl: "https://hec-entrepreneurs.org/portail/annonces",
      });
    }

    return NextResponse.json({ announcement: newPost });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/portail/announcements - Delete announcement
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID annonce requis" }, { status: 400 });
    }

    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isDev = isOmar || profile?.role === "developpeur";

    // Check ownership
    const { data: post } = await supabaseAdmin
      .from("announcements")
      .select("author_id")
      .eq("id", id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    if (!isDev && post.author_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé à supprimer cette annonce" }, { status: 403 });
    }

    const { error: delError } = await supabaseAdmin
      .from("announcements")
      .delete()
      .eq("id", id);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
