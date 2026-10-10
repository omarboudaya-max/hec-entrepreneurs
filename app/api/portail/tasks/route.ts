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

// In-memory fallback if SQL table hasn't been run in Supabase yet
let memoryTasks: any[] = [
  {
    id: "tsk-default-1",
    title: "Finalisation du dossier de Sponsoring 2026/2027",
    description: "Relecture des offres pack Gold, Silver et mise à jour de la grille tarifaire pour les entreprises partenaires.",
    pole: "Sponsoring",
    status: "en_cours",
    priority: "urgente",
    due_date: "2026-10-18",
    created_at: new Date().toISOString(),
  },
  {
    id: "tsk-default-2",
    title: "Création des visuels pour le Fil d'Actualité & Instagram",
    description: "Préparation des templates Canva & Figma pour les annonces des sessions de formation et teambuilding.",
    pole: "Communication",
    status: "a_faire",
    priority: "normale",
    due_date: "2026-10-22",
    created_at: new Date().toISOString(),
  },
  {
    id: "tsk-default-3",
    title: "Mise en place de l'Intranet & Synchronisation des Profils",
    description: "Développement du portail membres, intégration du feed, calendrier et synchronisation avec Notre Équipe.",
    pole: "IT & Web",
    status: "termine",
    priority: "urgente",
    due_date: "2026-10-10",
    created_at: new Date().toISOString(),
  }
];

// GET /api/portail/tasks
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: tasks, error } = await supabaseAdmin
      .from("club_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !tasks) {
      return NextResponse.json({ tasks: memoryTasks, isFallback: true });
    }

    // Attach assignee profiles
    const assigneeIds = Array.from(new Set(tasks.map((t) => t.assigned_to).filter(Boolean)));
    const { data: profiles } = await supabaseAdmin
      .from("club_profiles")
      .select("id, full_name, email, avatar_url, poste")
      .in("id", assigneeIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const enrichedTasks = tasks.map((t) => ({
      ...t,
      assignee: t.assigned_to ? profileMap.get(t.assigned_to) : null,
    }));

    return NextResponse.json({ tasks: enrichedTasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/portail/tasks
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const isOmar = user.email?.toLowerCase() === "omarboudaya1@gmail.com";
    const { data: profile } = await supabaseAdmin
      .from("club_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowed = isOmar || profile?.role === "bureau" || profile?.role === "responsable" || profile?.role === "developpeur";
    if (!allowed) {
      return NextResponse.json({ error: "Accès réservé aux responsables et au bureau." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      pole = "Général",
      assigned_to,
      status = "a_faire",
      priority = "normale",
      due_date,
    } = body;

    if (!title) return NextResponse.json({ error: "Titre requis." }, { status: 400 });

    let createdTask: any = null;

    const { data, error } = await supabaseAdmin
      .from("club_tasks")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        pole,
        assigned_to: assigned_to || null,
        status,
        priority,
        due_date: due_date || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !data) {
      createdTask = {
        id: `tsk-${Date.now()}`,
        title: title.trim(),
        description: description?.trim() || null,
        pole,
        assigned_to: assigned_to || null,
        status,
        priority,
        due_date: due_date || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
      };
      memoryTasks.unshift(createdTask);
    } else {
      createdTask = data;
    }

    // If assigned to a member, notify them by email
    if (assigned_to) {
      const { data: assignedUser } = await supabaseAdmin
        .from("club_profiles")
        .select("email, full_name")
        .eq("id", assigned_to)
        .single();

      if (assignedUser?.email) {
        await broadcastToClubMembers({
          subject: `Nouvelle mission assignée : ${title}`,
          badge: `Pôle ${pole}`,
          title: `Mission : ${title}`,
          message: `Bonjour ${assignedUser.full_name},\n\nUne nouvelle tâche vous a été assignée dans le cadre des activités du Pôle ${pole} :\n\n• Titre : ${title}\n• Priorité : ${priority.toUpperCase()}\n${due_date ? `• Date limite : ${due_date}\n` : ''}${description ? `• Description :\n${description}\n` : ''}\nConnectez-vous sur l'Intranet pour consulter vos tâches et mettre à jour leur progression.`,
          actionText: "Voir mes tâches",
          actionUrl: "https://hec-entrepreneurs.org/portail/taches",
          recipients: [assignedUser.email],
        });
      }
    }

    return NextResponse.json({ task: createdTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/portail/tasks
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { id, status, priority, assigned_to } = body;

    if (!id) return NextResponse.json({ error: "ID tâche requis." }, { status: 400 });

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    await supabaseAdmin
      .from("club_tasks")
      .update(updates)
      .eq("id", id);

    // Also update memory fallback
    memoryTasks = memoryTasks.map((t) => (t.id === id ? { ...t, ...updates } : t));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/portail/tasks?id=...
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });

    await supabaseAdmin.from("club_tasks").delete().eq("id", id);
    memoryTasks = memoryTasks.filter((t) => t.id !== id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
