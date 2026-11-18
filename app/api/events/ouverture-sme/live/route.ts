import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const OUVERTURE_SME_SESSION_KEY = "OUVERTURE_SME_2026";
const LIVE_HUB_STORAGE_BUCKET = "portail-media";
const LIVE_HUB_STATE_PATH = "sme-live/hub-state.json";

interface SmeLiveStory {
  id: string;
  authorCode: string;
  authorName: string;
  authorSeat: string;
  imageUrl: string;
  caption: string;
  likes: string[]; // array of participant codes
  createdAt: string;
}

interface SmeLiveMessage {
  id: string;
  authorCode: string;
  authorName: string;
  authorSeat: string;
  authorStatus: string;
  text: string;
  likes: string[];
  createdAt: string;
}

interface SmeLiveQuestion {
  id: string;
  authorCode: string;
  authorName: string;
  authorSeat: string;
  targetSpeaker: string;
  question: string;
  upvotes: string[]; // array of participant codes
  answered?: boolean;
  createdAt: string;
}

interface SmeLiveNetworkProfile {
  id: string;
  authorCode: string;
  authorName: string;
  authorSeat: string;
  authorStatus: string;
  authorRoleDetail: string;
  institution: string;
  linkedin: string;
  instagram: string;
  bio: string;
  createdAt: string;
}

interface SmeLiveFeedback {
  id: string;
  authorCode: string;
  authorName: string;
  authorSeat: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

interface SmeLiveHubState {
  stories: SmeLiveStory[];
  messages: SmeLiveMessage[];
  questions: SmeLiveQuestion[];
  networking: SmeLiveNetworkProfile[];
  feedbacks: SmeLiveFeedback[];
}

const EMPTY_STATE: SmeLiveHubState = {
  stories: [],
  messages: [],
  questions: [],
  networking: [],
  feedbacks: [],
};

async function getLiveHubState(): Promise<SmeLiveHubState> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(LIVE_HUB_STORAGE_BUCKET)
      .download(LIVE_HUB_STATE_PATH);

    if (error || !data) return { ...EMPTY_STATE };
    const text = await data.text();
    const parsed = JSON.parse(text);
    return {
      stories: Array.isArray(parsed.stories) ? parsed.stories : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      networking: Array.isArray(parsed.networking) ? parsed.networking : [],
      feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : [],
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

async function saveLiveHubState(state: SmeLiveHubState): Promise<void> {
  const payload = Buffer.from(JSON.stringify(state), "utf-8");
  await supabaseAdmin.storage
    .from(LIVE_HUB_STORAGE_BUCKET)
    .upload(LIVE_HUB_STATE_PATH, payload, {
      contentType: "application/json",
      upsert: true,
    });
}

function isCheckedIn(rawField?: string | null): boolean {
  if (!rawField || typeof rawField !== "string") return false;
  try {
    const parsed = JSON.parse(rawField);
    return Boolean(parsed?.ouverture_sme);
  } catch {
    return false;
  }
}

async function resolveParticipant(codeInput: string | null, nameInput?: string | null) {
  const code = (codeInput || "").trim();
  const customName = (nameInput || "").trim();

  if (code.toUpperCase() === "ADMIN-HEC" || code.toUpperCase() === "OMAR-ADMIN") {
    return {
      code: "ADMIN-HEC",
      fullName: "Club HEC Entrepreneurs",
      seatCode: "ORGANISATION",
      status: "Bureau Exécutif",
      statusDetail: "HEC Entrepreneurs",
      institution: "IHEC Carthage",
      checkedIn: true,
      isAdmin: true,
    };
  }

  if (code && !code.startsWith("GUEST-")) {
    const { data: matched } = await supabaseAdmin
      .from("doctoriales_registrations")
      .select(
        "id, qr_code_id, full_name, status, preferred_language, institution, specialty_custom, can_attend_full_session"
      )
      .eq("session_choice", OUVERTURE_SME_SESSION_KEY)
      .ilike("qr_code_id", code)
      .maybeSingle();

    if (matched) {
      return {
        code: matched.qr_code_id || matched.id,
        fullName: matched.full_name,
        seatCode: matched.specialty_custom || "PASS OFFICIEL",
        status: matched.status || "Participant",
        statusDetail:
          matched.preferred_language && matched.preferred_language !== "Français"
            ? matched.preferred_language
            : "",
        institution: matched.institution || "IHEC Carthage",
        checkedIn: true,
        isAdmin: false,
      };
    }
  }

  if (customName) {
    const safeSlug = customName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return {
      code: code || `GUEST-${safeSlug || Date.now()}`,
      fullName: customName,
      seatCode: "PASS OFFICIEL",
      status: "Participant",
      statusDetail: "",
      institution: "SME 2026",
      checkedIn: true,
      isAdmin: false,
    };
  }

  return null;
}

// GET /api/events/ouverture-sme/live?code=SME-...&name=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const name = searchParams.get("name");

    const participant = await resolveParticipant(code, name);
    const state = await getLiveHubState();

    return NextResponse.json({
      participant,
      state,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/events/ouverture-sme/live - Actions: add_story, like_story, add_message, like_message, add_question, upvote_question, save_network, submit_feedback, delete_item
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart FormData for Story Photo upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const code = String(formData.get("code") || "").trim();
      const authorName = String(formData.get("authorName") || "").trim();
      const caption = String(formData.get("caption") || "").trim();
      const file = formData.get("file") as File | null;

      const participant = await resolveParticipant(code, authorName);
      if (!participant) {
        return NextResponse.json(
          { error: "Veuillez indiquer votre nom pour partager une photo." },
          { status: 400 }
        );
      }

      if (!file) {
        return NextResponse.json({ error: "Veuillez sélectionner ou prendre une photo." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const filePath = `sme-live/story-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("portail-media")
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: "Erreur lors de l'envoi de la photo : " + uploadError.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("portail-media")
        .getPublicUrl(filePath);

      const state = await getLiveHubState();
      const newStory: SmeLiveStory = {
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        authorCode: participant.code,
        authorName: participant.fullName,
        authorSeat: participant.seatCode,
        imageUrl: publicUrlData.publicUrl,
        caption: caption.slice(0, 140),
        likes: [],
        createdAt: new Date().toISOString(),
      };

      state.stories.unshift(newStory);
      await saveLiveHubState(state);

      return NextResponse.json({ success: true, story: newStory, state });
    }

    // 2. Handle JSON actions
    const body = await req.json();
    const { action, code, authorName } = body;

    const participant = await resolveParticipant(code, authorName);
    if (!participant) {
      return NextResponse.json(
        { error: "Veuillez indiquer votre nom pour participer." },
        { status: 400 }
      );
    }

    const state = await getLiveHubState();

    if (action === "like_story") {
      const { storyId } = body;
      const story = state.stories.find((s) => s.id === storyId);
      if (story) {
        const idx = story.likes.indexOf(participant.code);
        if (idx >= 0) story.likes.splice(idx, 1);
        else story.likes.push(participant.code);
        await saveLiveHubState(state);
      }
      return NextResponse.json({ success: true, state });
    }

    if (action === "add_message") {
      const text = String(body.text || "").trim();
      if (!text) {
        return NextResponse.json({ error: "Veuillez écrire un message." }, { status: 400 });
      }
      const newMsg: SmeLiveMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        authorCode: participant.code,
        authorName: participant.fullName,
        authorSeat: participant.seatCode,
        authorStatus: participant.status,
        text: text.slice(0, 400),
        likes: [],
        createdAt: new Date().toISOString(),
      };
      state.messages.unshift(newMsg);
      await saveLiveHubState(state);
      return NextResponse.json({ success: true, state });
    }

    if (action === "like_message") {
      const { messageId } = body;
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg) {
        const idx = msg.likes.indexOf(participant.code);
        if (idx >= 0) msg.likes.splice(idx, 1);
        else msg.likes.push(participant.code);
        await saveLiveHubState(state);
      }
      return NextResponse.json({ success: true, state });
    }

    if (action === "add_question") {
      const question = String(body.question || "").trim();
      const targetSpeaker = String(body.targetSpeaker || "Panel / Intervenants").trim();
      if (!question) {
        return NextResponse.json({ error: "Veuillez saisir votre question." }, { status: 400 });
      }
      const newQ: SmeLiveQuestion = {
        id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        authorCode: participant.code,
        authorName: participant.fullName,
        authorSeat: participant.seatCode,
        targetSpeaker: targetSpeaker.slice(0, 80),
        question: question.slice(0, 350),
        upvotes: [participant.code],
        createdAt: new Date().toISOString(),
      };
      state.questions.unshift(newQ);
      await saveLiveHubState(state);
      return NextResponse.json({ success: true, state });
    }

    if (action === "upvote_question") {
      const { questionId } = body;
      const q = state.questions.find((item) => item.id === questionId);
      if (q) {
        const idx = q.upvotes.indexOf(participant.code);
        if (idx >= 0) q.upvotes.splice(idx, 1);
        else q.upvotes.push(participant.code);
        await saveLiveHubState(state);
      }
      return NextResponse.json({ success: true, state });
    }

    if (action === "save_network") {
      const linkedin = String(body.linkedin || "").trim();
      const instagram = String(body.instagram || "").trim();
      const bio = String(body.bio || "").trim();

      if (!linkedin && !instagram && !bio) {
        return NextResponse.json(
          { error: "Veuillez renseigner au moins votre LinkedIn, Instagram ou une courte présentation." },
          { status: 400 }
        );
      }

      const existingIdx = state.networking.findIndex((n) => n.authorCode === participant.code);
      const profileEntry: SmeLiveNetworkProfile = {
        id: `net-${participant.code}`,
        authorCode: participant.code,
        authorName: participant.fullName,
        authorSeat: participant.seatCode,
        authorStatus: participant.status,
        authorRoleDetail: participant.statusDetail,
        institution: participant.institution,
        linkedin: linkedin.slice(0, 160),
        instagram: instagram.replace(/^@/, "").slice(0, 80),
        bio: bio.slice(0, 220),
        createdAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        state.networking[existingIdx] = profileEntry;
      } else {
        state.networking.unshift(profileEntry);
      }
      await saveLiveHubState(state);
      return NextResponse.json({ success: true, state });
    }

    if (action === "submit_feedback") {
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const comment = String(body.comment || "").trim();

      const existingIdx = state.feedbacks.findIndex((f) => f.authorCode === participant.code);
      const fbEntry: SmeLiveFeedback = {
        id: `fb-${participant.code}`,
        authorCode: participant.code,
        authorName: participant.fullName,
        authorSeat: participant.seatCode,
        rating,
        comment: comment.slice(0, 500),
        createdAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        state.feedbacks[existingIdx] = fbEntry;
      } else {
        state.feedbacks.unshift(fbEntry);
      }
      await saveLiveHubState(state);
      return NextResponse.json({ success: true, state });
    }

    if (action === "delete_item" && participant.isAdmin) {
      const { itemType, itemId } = body;
      if (itemType === "story") {
        state.stories = state.stories.filter((s) => s.id !== itemId);
      } else if (itemType === "message") {
        state.messages = state.messages.filter((m) => m.id !== itemId);
      } else if (itemType === "question") {
        state.questions = state.questions.filter((q) => q.id !== itemId);
      }
      await saveLiveHubState(state);
      return NextResponse.json({ success: true, state });
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
