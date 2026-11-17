"use client";

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Mic,
  ThumbsUp,
  Users,
  Star,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Instagram,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Download,
  Lock,
  Image as ImageIcon,
} from "lucide-react";

interface SmeLiveStory {
  id: string;
  authorCode: string;
  authorName: string;
  authorSeat: string;
  imageUrl: string;
  caption: string;
  likes: string[];
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
  upvotes: string[];
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
  rating: number;
  comment: string;
  createdAt: string;
}

interface SmeLiveParticipant {
  code: string;
  fullName: string;
  seatCode: string;
  status: string;
  statusDetail: string;
  institution: string;
  checkedIn: boolean;
  isAdmin: boolean;
}

function SmeLiveHubContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [participant, setParticipant] = useState<SmeLiveParticipant | null>(null);
  const [stories, setStories] = useState<SmeLiveStory[]>([]);
  const [messages, setMessages] = useState<SmeLiveMessage[]>([]);
  const [questions, setQuestions] = useState<SmeLiveQuestion[]>([]);
  const [networking, setNetworking] = useState<SmeLiveNetworkProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<SmeLiveFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "chat" | "qa" | "networking" | "feedback" | "gallery"
  >("chat");

  // Story Upload Modal & Viewer
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState("");
  const [uploadingStory, setUploadingStory] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Chat State
  const [chatText, setChatText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Q&A State
  const [qaSpeaker, setQaSpeaker] = useState("Panel Ouverture SME");
  const [qaQuestion, setQaQuestion] = useState("");
  const [sendingQa, setSendingQa] = useState(false);

  // Networking State
  const [netLinkedin, setNetLinkedin] = useState("");
  const [netInstagram, setNetInstagram] = useState("");
  const [netBio, setNetBio] = useState("");
  const [savingNet, setSavingNet] = useState(false);
  const [netSavedMsg, setNetSavedMsg] = useState(false);

  // Feedback (1 to 5 stars) State
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const fetchLiveHub = useCallback(
    async (silent = false) => {
      if (!code) {
        setLoading(false);
        return;
      }
      if (!silent) setRefreshing(true);
      try {
        const res = await fetch(
          `/api/events/ouverture-sme/live?code=${encodeURIComponent(code)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.participant) {
          setParticipant(data.participant);
        }
        if (data.state) {
          setStories(data.state.stories || []);
          setMessages(data.state.messages || []);
          setQuestions(data.state.questions || []);
          setNetworking(data.state.networking || []);
          setFeedbacks(data.state.feedbacks || []);

          if (data.participant) {
            const myFb = (data.state.feedbacks || []).find(
              (f: SmeLiveFeedback) => f.authorCode === data.participant.code
            );
            if (myFb) {
              setRating(myFb.rating);
              setFeedbackComment(myFb.comment);
              setFeedbackSubmitted(true);
            }
          }
        }
      } catch (err) {
        console.warn("Live hub fetch error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [code]
  );

  useEffect(() => {
    fetchLiveHub(false);
    const interval = setInterval(() => {
      fetchLiveHub(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveHub]);

  const applyServerState = (state: any) => {
    if (!state) return;
    setStories(state.stories || []);
    setMessages(state.messages || []);
    setQuestions(state.questions || []);
    setNetworking(state.networking || []);
    setFeedbacks(state.feedbacks || []);
  };

  // Compress smartphone camera photo (e.g. 8MB -> ~120KB) for instant upload
  const compressImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 1200;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          "image/jpeg",
          0.78
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  // Handle Story file selection
  const handleSelectStoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setStoryPreview(URL.createObjectURL(f));
    setStoryModalOpen(true);
    const compressedBlob = await compressImageFile(f);
    const compressedFile = new File([compressedBlob], "story.jpg", {
      type: "image/jpeg",
    });
    setStoryFile(compressedFile);
  };

  const handleUploadStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFile || !participant) return;
    setUploadingStory(true);

    // Optimistic Story insertion for instant feedback
    const tempStory: SmeLiveStory = {
      id: `temp-${Date.now()}`,
      authorCode: participant.code,
      authorName: participant.fullName,
      authorSeat: participant.seatCode,
      imageUrl: storyPreview || "",
      caption: storyCaption,
      likes: [],
      createdAt: new Date().toISOString(),
    };
    setStories((prev) => [tempStory, ...prev]);
    setStoryModalOpen(false);

    try {
      const fd = new FormData();
      fd.append("code", participant.code);
      fd.append("caption", storyCaption);
      fd.append("file", storyFile);

      const res = await fetch("/api/events/ouverture-sme/live", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        applyServerState(data.state);
        setStoryFile(null);
        setStoryPreview(null);
        setStoryCaption("");
        setActiveStoryIndex(0);
      }
    } finally {
      setUploadingStory(false);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    if (!participant) return;
    const res = await fetch("/api/events/ouverture-sme/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "like_story",
        code: participant.code,
        storyId,
      }),
    });
    const data = await res.json();
    if (data.success) applyServerState(data.state);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !participant) return;
    setSendingChat(true);
    try {
      const res = await fetch("/api/events/ouverture-sme/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_message",
          code: participant.code,
          text: chatText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        applyServerState(data.state);
        setChatText("");
      }
    } finally {
      setSendingChat(false);
    }
  };

  const handleLikeMessage = async (messageId: string) => {
    if (!participant) return;
    const res = await fetch("/api/events/ouverture-sme/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "like_message",
        code: participant.code,
        messageId,
      }),
    });
    const data = await res.json();
    if (data.success) applyServerState(data.state);
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !participant) return;
    setSendingQa(true);
    try {
      const res = await fetch("/api/events/ouverture-sme/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_question",
          code: participant.code,
          targetSpeaker: qaSpeaker,
          question: qaQuestion.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        applyServerState(data.state);
        setQaQuestion("");
      }
    } finally {
      setSendingQa(false);
    }
  };

  const handleUpvoteQuestion = async (questionId: string) => {
    if (!participant) return;
    const res = await fetch("/api/events/ouverture-sme/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upvote_question",
        code: participant.code,
        questionId,
      }),
    });
    const data = await res.json();
    if (data.success) applyServerState(data.state);
  };

  const handleSaveNetworking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;
    setSavingNet(true);
    setNetSavedMsg(false);
    try {
      const res = await fetch("/api/events/ouverture-sme/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_network",
          code: participant.code,
          linkedin: netLinkedin,
          instagram: netInstagram,
          bio: netBio,
        }),
      });
      const data = await res.json();
      if (data.success) {
        applyServerState(data.state);
        setNetSavedMsg(true);
      }
    } finally {
      setSavingNet(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/events/ouverture-sme/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_feedback",
          code: participant.code,
          rating,
          comment: feedbackComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        applyServerState(data.state);
        setFeedbackSubmitted(true);
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDeleteItem = async (
    itemType: "story" | "message" | "question",
    itemId: string
  ) => {
    if (!participant?.isAdmin) return;
    const res = await fetch("/api/events/ouverture-sme/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_item",
        code: participant.code,
        itemType,
        itemId,
      }),
    });
    const data = await res.json();
    if (data.success) applyServerState(data.state);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07040e] flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 border-3 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin mb-4" />
        <p className="text-purple-300 text-sm font-mono uppercase tracking-widest">
          Ouverture de l&apos;Espace Live SME 2026...
        </p>
      </div>
    );
  }

  // Gate: Only accessible via the personal link received by email after QR check-in
  if (!participant || (!participant.checkedIn && !participant.isAdmin)) {
    return (
      <div className="min-h-screen bg-[#07040e] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-[#120b24] border border-fuchsia-500/30 p-7 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center mx-auto text-fuchsia-400">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white">
            Espace Live — Ouverture SME 2026
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
            Cet espace commun interactif s&apos;active automatiquement dès que votre{" "}
            <strong>QR Code est scanné à l&apos;entrée de La Chapelle</strong>. Vous recevez alors instantanément votre lien d&apos;accès personnel par e-mail !
          </p>
        </div>
      </div>
    );
  }

  const sortedQuestions = [...questions].sort(
    (a, b) => b.upvotes.length - a.upvotes.length
  );

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : "5.0";

  const activeStory =
    activeStoryIndex !== null && stories[activeStoryIndex]
      ? stories[activeStoryIndex]
      : null;

  return (
    <div className="min-h-screen bg-[#07040e] text-white pb-20">
      {/* Top Sticky Bar */}
      <header className="sticky top-0 z-30 bg-[#0d071b]/90 backdrop-blur-xl border-b border-fuchsia-500/20 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo-club.png"
              alt="HEC Entrepreneurs"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-black tracking-wide text-white truncate">
                  LIVE • OUVERTURE SME 2026
                </span>
              </div>
              <div className="text-[11px] text-fuchsia-300 truncate">
                {participant.fullName}
                {participant.seatCode && participant.seatCode !== "PASS OFFICIEL"
                  ? ` • 🪑 ${participant.seatCode}`
                  : ""}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchLiveHub(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 transition"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 space-y-5">
        {/* 1. INSTAGRAM-STYLE STORIES / INSTANTANÉS BAR (Top Left) */}
        <section className="rounded-3xl bg-[#110a22] border border-fuchsia-500/25 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-fuchsia-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
                Instantanés en Direct ({stories.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-[11px] font-bold shadow-md shadow-fuchsia-600/30 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Prendre une photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleSelectStoryFile}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {/* Leftmost Circle: Add Instantané */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-fuchsia-500 via-pink-500 to-amber-400 relative">
                <div className="w-full h-full rounded-full bg-[#160d2c] flex items-center justify-center group-hover:bg-[#1f123d] transition">
                  <Camera className="w-6 h-6 text-fuchsia-300" />
                </div>
                <span className="w-5 h-5 rounded-full bg-fuchsia-500 border-2 border-[#110a22] text-white flex items-center justify-center absolute bottom-0 right-0">
                  <Plus className="w-3 h-3" />
                </span>
              </div>
              <span className="text-[11px] font-bold text-fuchsia-300 max-w-[70px] truncate">
                Votre photo
              </span>
            </button>

            {/* Participant Story Circles */}
            {stories.map((st, idx) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStoryIndex(idx)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-pink-400 shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition">
                  <img
                    src={st.imageUrl}
                    alt={st.authorName}
                    className="w-full h-full rounded-full object-cover border-2 border-[#0b0616]"
                  />
                </div>
                <span className="text-[11px] font-medium text-purple-100 max-w-[72px] truncate">
                  {st.authorName.split(" ")[0]}
                </span>
              </button>
            ))}

            {stories.length === 0 && (
              <div className="text-xs text-purple-300/60 italic pl-2">
                Soyez le premier à partager un instantané de l&apos;Ouverture SME !
              </div>
            )}
          </div>
        </section>

        {/* 2. NAVIGATION TABS */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/25"
                : "bg-[#110a22] text-purple-200/80 border-white/10 hover:bg-white/5"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat ({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qa")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              activeTab === "qa"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/25"
                : "bg-[#110a22] text-purple-200/80 border-white/10 hover:bg-white/5"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Q&amp;A ({questions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("networking")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              activeTab === "networking"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/25"
                : "bg-[#110a22] text-purple-200/80 border-white/10 hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Réseau ({networking.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("feedback")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              activeTab === "feedback"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/25"
                : "bg-[#110a22] text-purple-200/80 border-white/10 hover:bg-white/5"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Avis ★</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`col-span-4 sm:col-span-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              activeTab === "gallery"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/25"
                : "bg-[#110a22] text-purple-200/80 border-white/10 hover:bg-white/5"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos ({stories.length})</span>
          </button>
        </div>

        {/* TAB 1: LIVE CHAT */}
        {activeTab === "chat" && (
          <section className="rounded-3xl bg-[#110a22] border border-fuchsia-500/25 p-4 sm:p-6 space-y-4 shadow-xl">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Partagez un message ou une réaction en direct..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/15 text-sm text-white focus:outline-none focus:border-fuchsia-400"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatText.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-purple-300/60 text-xs">
                  Aucun message pour le moment. Lancez la discussion !
                </div>
              ) : (
                messages.map((m) => {
                  const hasLiked = m.likes.includes(participant.code);
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {m.authorName}
                          </span>
                          {m.authorSeat && m.authorSeat !== "PASS OFFICIEL" && (
                            <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-[10px] font-mono text-fuchsia-300 font-bold">
                              {m.authorSeat}
                            </span>
                          )}
                          <span className="text-[10px] text-purple-300/50">
                            {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-purple-100 break-words leading-relaxed">
                          {m.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLikeMessage(m.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                            hasLiked
                              ? "bg-pink-500/25 border-pink-400 text-pink-300"
                              : "bg-white/5 border-white/10 text-purple-300"
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              hasLiked ? "fill-pink-400 text-pink-400" : ""
                            }`}
                          />
                          <span>{m.likes.length}</span>
                        </button>

                        {participant.isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem("message", m.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* TAB 2: QUESTIONS AUX INTERVENANTS (Q&A + UPVOTE) */}
        {activeTab === "qa" && (
          <section className="rounded-3xl bg-[#110a22] border border-fuchsia-500/25 p-4 sm:p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-fuchsia-400" />
                <span>Posez vos Questions aux Intervenants</span>
              </h3>
              <p className="text-xs text-purple-200/70 mt-0.5">
                Votez (👍) pour faire remonter les questions les plus pertinentes sur scène.
              </p>
            </div>

            <form onSubmit={handleSendQuestion} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={qaSpeaker}
                  onChange={(e) => setQaSpeaker(e.target.value)}
                  placeholder="Destinataire (ex: Panel, Invité...)"
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                />
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Votre question pour les intervenants..."
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendingQa || !qaQuestion.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Soumettre ma question</span>
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {sortedQuestions.length === 0 ? (
                <div className="text-center py-8 text-purple-300/60 text-xs">
                  Aucune question posée pour l&apos;instant.
                </div>
              ) : (
                sortedQuestions.map((q) => {
                  const hasUpvoted = q.upvotes.includes(participant.code);
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-bold text-purple-200">
                            🎤 {q.targetSpeaker}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {q.authorName}
                          </span>
                          {q.authorSeat && q.authorSeat !== "PASS OFFICIEL" && (
                            <span className="text-[10px] font-mono text-fuchsia-300">
                              ({q.authorSeat})
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpvoteQuestion(q.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition cursor-pointer ${
                            hasUpvoted
                              ? "bg-fuchsia-600 border-fuchsia-300 text-white shadow-md shadow-fuchsia-600/30"
                              : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{q.upvotes.length}</span>
                        </button>

                        {participant.isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem("question", q.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* TAB 3: MUR NETWORKING LINKEDIN / INSTAGRAM */}
        {activeTab === "networking" && (
          <section className="rounded-3xl bg-[#110a22] border border-fuchsia-500/25 p-4 sm:p-6 space-y-6 shadow-xl">
            <form
              onSubmit={handleSaveNetworking}
              className="p-4 rounded-2xl bg-white/[0.03] border border-fuchsia-500/20 space-y-3"
            >
              <div className="text-xs sm:text-sm font-extrabold text-white">
                🤝 Partager ma Carte de Networking dans la Salle
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={netLinkedin}
                  onChange={(e) => setNetLinkedin(e.target.value)}
                  placeholder="Lien ou Nom LinkedIn (optionnel)"
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                />
                <input
                  type="text"
                  value={netInstagram}
                  onChange={(e) => setNetInstagram(e.target.value)}
                  placeholder="@votre_instagram (optionnel)"
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                />
              </div>
              <input
                type="text"
                value={netBio}
                onChange={(e) => setNetBio(e.target.value)}
                placeholder="En une phrase : votre projet, vos centres d'intérêt ou ce que vous cherchez..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400"
              />
              <div className="flex items-center justify-between">
                {netSavedMsg ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Profil affiché sur le mur !
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={savingNet}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-xs cursor-pointer"
                >
                  {savingNet ? "Publication..." : "Publier ma carte"}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {networking.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-purple-300/60 text-xs">
                  Soyez le premier à publier votre carte de networking !
                </div>
              ) : (
                networking.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-white">{n.authorName}</div>
                        <div className="text-[11px] text-purple-300">
                          {n.authorStatus}
                          {n.authorRoleDetail ? ` • ${n.authorRoleDetail}` : ""}
                        </div>
                      </div>
                      {n.authorSeat && n.authorSeat !== "PASS OFFICIEL" && (
                        <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-[10px] font-mono text-fuchsia-300 font-bold">
                          🪑 {n.authorSeat}
                        </span>
                      )}
                    </div>

                    {n.bio && (
                      <p className="text-xs text-purple-100/90 italic">« {n.bio} »</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {n.linkedin && (
                        <a
                          href={
                            n.linkedin.startsWith("http")
                              ? n.linkedin
                              : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
                                  n.linkedin
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[11px] font-semibold"
                        >
                          <Linkedin className="w-3 h-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {n.instagram && (
                        <a
                          href={`https://instagram.com/${n.instagram.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-400/30 text-pink-300 text-[11px] font-semibold"
                        >
                          <Instagram className="w-3 h-3" />
                          <span>@{n.instagram.replace(/^@/, "")}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 4: ÉVALUATION FINALE (1 À 5 ÉTOILES + POURQUOI) */}
        {activeTab === "feedback" && (
          <section className="rounded-3xl bg-[#110a22] border border-fuchsia-500/25 p-5 sm:p-7 space-y-6 shadow-xl">
            <div className="text-center max-w-md mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Votre Avis Compte
              </div>
              <h3 className="text-xl font-black text-white">
                Qu&apos;avez-vous pensé de l&apos;Ouverture de la SME 2026 ?
              </h3>
              <p className="text-xs text-purple-200/75">
                Notez votre expérience de 1 à 5 étoiles et partagez avec nous pourquoi.
              </p>
            </div>

            <form
              onSubmit={handleSubmitFeedback}
              className="max-w-lg mx-auto space-y-5"
            >
              {/* 1 to 5 Stars Selector */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 rounded-2xl transition transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 sm:w-11 sm:h-11 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                          : "text-purple-400/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center text-xs font-bold text-amber-300">
                Note sélectionnée : {rating} / 5
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                  Partagez avec nous pourquoi :
                </label>
                <textarea
                  rows={4}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Ce que vous avez le plus aimé, un moment marquant, une suggestion..."
                  className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              {feedbackSubmitted && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Merci pour votre retour ! Vous pouvez le mettre à jour à tout moment.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingFeedback || !feedbackComment.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-fuchsia-600/30 disabled:opacity-50 cursor-pointer"
              >
                {submittingFeedback
                  ? "Envoi en cours..."
                  : feedbackSubmitted
                  ? "Mettre à jour mon avis"
                  : "Envoyer mon évaluation"}
              </button>
            </form>

            {/* Live Feedback Wall */}
            {feedbacks.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Retours des participants ({feedbacks.length})
                  </span>
                  <span className="text-xs font-extrabold text-amber-300">
                    ★ Moyenne : {avgRating} / 5
                  </span>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {fb.authorName}
                        </span>
                        <span className="text-amber-400 text-xs font-bold">
                          {"★".repeat(fb.rating)}
                          {"☆".repeat(5 - fb.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-purple-100/90">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 5: PHOTO GALLERY (ALL INSTANTANÉS) */}
        {activeTab === "gallery" && (
          <section className="rounded-3xl bg-[#110a22] border border-fuchsia-500/25 p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                📸 Toutes les Photos prises pendant l&apos;Événement ({stories.length})
              </h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {stories.length === 0 ? (
              <div className="text-center py-12 text-purple-300/60 text-xs">
                Aucune photo partagée pour l&apos;instant.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stories.map((st, idx) => (
                  <div
                    key={st.id}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[4/5]"
                  >
                    <img
                      src={st.imageUrl}
                      alt={st.caption || st.authorName}
                      onClick={() => setActiveStoryIndex(idx)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                      <div className="text-xs font-bold text-white truncate">
                        {st.authorName}
                      </div>
                      {st.caption && (
                        <div className="text-[11px] text-purple-200 truncate">
                          {st.caption}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleLikeStory(st.id)}
                          className="text-[11px] text-pink-300 flex items-center gap-1 font-bold"
                        >
                          <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                          <span>{st.likes.length}</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={st.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-1 rounded bg-white/10 text-white hover:bg-white/20"
                            title="Télécharger"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                          {participant.isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem("story", st.id)}
                              className="p-1 rounded bg-red-500/30 text-red-200"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* UPLOAD STORY MODAL */}
      <AnimatePresence>
        {storyModalOpen && storyPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="max-w-sm w-full rounded-3xl bg-[#140b29] border border-fuchsia-500/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  📸 Publier un Instantané
                </h3>
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-black border border-white/10">
                <img
                  src={storyPreview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              </div>

              <form onSubmit={handleUploadStory} className="space-y-3">
                <input
                  type="text"
                  maxLength={120}
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  placeholder="Ajouter une légende (optionnel)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                />
                <button
                  type="submit"
                  disabled={uploadingStory}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-fuchsia-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {uploadingStory ? "Publication en cours..." : "Partager en Direct"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN INSTAGRAM STORY VIEWER */}
      <AnimatePresence>
        {activeStory && activeStoryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3"
          >
            <div className="relative max-w-sm w-full aspect-[9/16] max-h-[88vh] rounded-3xl overflow-hidden bg-[#0c0618] border border-white/15 flex flex-col justify-between">
              {/* Top Story Header */}
              <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {activeStory.authorName}
                  </div>
                  <div className="text-[10px] text-fuchsia-300 font-mono">
                    {activeStory.authorSeat !== "PASS OFFICIEL"
                      ? `🪑 ${activeStory.authorSeat} • `
                      : ""}
                    {new Date(activeStory.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-2 rounded-full bg-black/50 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story Image */}
              <img
                src={activeStory.imageUrl}
                alt={activeStory.caption || activeStory.authorName}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />

              {/* Left / Right Story Navigation */}
              {activeStoryIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(activeStoryIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {activeStoryIndex < stories.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(activeStoryIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Bottom Caption & Like */}
              <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-white font-medium">
                  {activeStory.caption}
                </div>
                <button
                  type="button"
                  onClick={() => handleLikeStory(activeStory.id)}
                  className="px-3.5 py-2 rounded-full bg-pink-500/25 border border-pink-400 text-pink-200 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      activeStory.likes.includes(participant.code)
                        ? "fill-pink-400 text-pink-400"
                        : ""
                    }`}
                  />
                  <span>{activeStory.likes.length}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OuvertureSmeLivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07040e] flex items-center justify-center text-purple-300 font-mono text-sm">
          Chargement de l&apos;Espace Live SME 2026...
        </div>
      }
    >
      <SmeLiveHubContent />
    </Suspense>
  );
}

