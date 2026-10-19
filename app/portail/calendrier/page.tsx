"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, MapPin, Users, Plus, CheckCircle2,
  XCircle, HelpCircle, Trash2, Send, AlertCircle, Sparkles, Filter,
  FileText, Printer, Copy, Check, Edit3, ShieldAlert, Lock,
  UploadCloud, Download, ExternalLink, Paperclip, FileCheck,
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown, ChevronUp, Archive
} from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";

interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  event_type: "reunion" | "ag" | "workshop" | "deadline" | "teambuilding";
  created_at: string;
  userRsvp?: "present" | "absent" | "peut_etre" | null;
  presentCount?: number;
  absentCount?: number;
  maybeCount?: number;
  custom_present_count?: number | null;
  custom_absent_count?: number | null;
  pv_file_url?: string | null;
  pv_file_name?: string | null;
  pv_content?: string | null;
  pv_author_name?: string | null;
  pv_decisions?: string | null;
  pv_updated_at?: string | null;
}

export default function CalendrierPage() {
  const { user, isResponsable, isBureau } = usePortailAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  // Monthly Calendar Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventItem["event_type"]>("reunion");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("13:30");
  const [endTime, setEndTime] = useState("15:00");
  const [location, setLocation] = useState("IHEC Carthage - Salle Club");
  const [description, setDescription] = useState("");
  const [broadcastEmail, setBroadcastEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // PV Reader & Editor Modal State
  const [selectedEventForPv, setSelectedEventForPv] = useState<EventItem | null>(null);
  const [editingPvEvent, setEditingPvEvent] = useState<EventItem | null>(null);
  const [pvFile, setPvFile] = useState<File | null>(null);
  const [pvFileUrl, setPvFileUrl] = useState<string>("");
  const [pvFileName, setPvFileName] = useState<string>("");
  const [pvAuthorName, setPvAuthorName] = useState("");
  const [pvDecisions, setPvDecisions] = useState("");
  const [customPresentCount, setCustomPresentCount] = useState<number | string>("");
  const [customAbsentCount, setCustomAbsentCount] = useState<number | string>("");
  const [isSavingPv, setIsSavingPv] = useState(false);
  const [isUploadingPvFile, setIsUploadingPvFile] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/events", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          event_type: eventType,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          location,
          description,
          broadcastEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création.");

      setStatusMsg({
        type: "success",
        text: broadcastEmail
          ? "Événement planifié et convocation envoyée par email à tous les membres !"
          : "Événement planifié avec succès !",
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      await fetchEvents();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRsvp = async (eventId: string, status: "present" | "absent" | "peut_etre") => {
    const targetEvt = events.find((e) => e.id === eventId);
    if (targetEvt) {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      let isDone = targetEvt.event_date < todayStr;
      if (targetEvt.event_date === todayStr && targetEvt.end_time) {
        const [endH, endM] = targetEvt.end_time.split(":").map(Number);
        if (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM)) {
          isDone = true;
        }
      }
      if (isDone) {
        alert("Cet événement est déjà terminé. Les présences sont clôturées et ne peuvent plus être modifiées.");
        return;
      }
    }

    // Optimistic update
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id !== eventId) return evt;
        const oldStatus = evt.userRsvp;
        let pCount = evt.presentCount || 0;
        let aCount = evt.absentCount || 0;
        let mCount = evt.maybeCount || 0;

        if (oldStatus === "present") pCount = Math.max(0, pCount - 1);
        if (oldStatus === "absent") aCount = Math.max(0, aCount - 1);
        if (oldStatus === "peut_etre") mCount = Math.max(0, mCount - 1);

        if (status === "present") pCount += 1;
        if (status === "absent") aCount += 1;
        if (status === "peut_etre") mCount += 1;

        return {
          ...evt,
          userRsvp: status,
          presentCount: pCount,
          absentCount: aCount,
          maybeCount: mCount,
        };
      })
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Impossible de modifier la présence.");
        fetchEvents(); // rollback
      }
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      fetchEvents(); // rollback
    }
  };

  const handleDeleteEvent = async (id: string, evtTitle: string) => {
    if (!confirm(`Supprimer l'événement "${evtTitle}" du calendrier ?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/events?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleOpenPvReader = (evt: EventItem) => {
    setSelectedEventForPv(evt);
  };

  const handleOpenPvEditor = (evt: EventItem) => {
    setEditingPvEvent(evt);
    setPvFile(null);
    setPvFileUrl(evt.pv_file_url || "");
    setPvFileName(evt.pv_file_name || "");
    const defaultAuthor =
      user?.email?.toLowerCase().includes("omarboudaya")
        ? "Omar Boudaya (Responsable IT & Secrétariat)"
        : "Secrétariat Général - HEC";
    setPvAuthorName(evt.pv_author_name || defaultAuthor);
    setPvDecisions(evt.pv_decisions || "");
    setCustomPresentCount(
      evt.custom_present_count != null
        ? evt.custom_present_count
        : evt.presentCount != null
        ? evt.presentCount
        : ""
    );
    setCustomAbsentCount(
      evt.custom_absent_count != null
        ? evt.custom_absent_count
        : evt.absentCount != null
        ? evt.absentCount
        : ""
    );
    setSelectedEventForPv(null);
  };

  const handleSavePv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPvEvent) return;

    if (!pvFile && !pvFileUrl) {
      alert("Veuillez sélectionner un fichier à joindre pour le Procès-Verbal (PDF, Word, etc.).");
      return;
    }

    setIsSavingPv(true);
    setStatusMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Votre session a expiré ou vous n'êtes pas connecté. Veuillez vous reconnecter au portail.");
        setIsSavingPv(false);
        return;
      }

      let finalFileUrl = pvFileUrl;
      let finalFileName = pvFileName;

      // 1. Upload file if a new one was selected
      if (pvFile) {
        setIsUploadingPvFile(true);
        const formData = new FormData();
        formData.append("file", pvFile);
        formData.append("bucket", "portail-documents");

        const uploadRes = await fetch("/api/portail/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Erreur lors du téléversement du fichier.");
        finalFileUrl = uploadData.url;
        finalFileName = pvFile.name;
        setIsUploadingPvFile(false);
      }

      // 2. Update event PV metadata
      const res = await fetch(`/api/portail/events/${editingPvEvent.id}/pv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          pv_file_url: finalFileUrl,
          pv_file_name: finalFileName,
          pv_author_name: pvAuthorName,
          pv_decisions: pvDecisions,
          custom_present_count: customPresentCount !== "" ? Number(customPresentCount) : null,
          custom_absent_count: customAbsentCount !== "" ? Number(customAbsentCount) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement du PV.");

      setStatusMsg({
        type: "success",
        text: "Le document du Procès-Verbal (PV) et les présences ont été enregistrés avec succès !",
      });

      setEditingPvEvent(null);
      await fetchEvents();
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement du PV : " + (err.message || "Erreur inconnue"));
      setStatusMsg({ type: "error", text: err.message || "Erreur lors de l'enregistrement" });
    } finally {
      setIsSavingPv(false);
      setIsUploadingPvFile(false);
    }
  };

  const handleCopyPv = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const MONTH_NAMES = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const formatFullDateFr = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const isEventDone = (evt: EventItem) => {
    if (evt.event_date < todayStr) return true;
    if (evt.event_date === todayStr && evt.end_time) {
      const [endH, endM] = evt.end_time.split(":").map(Number);
      if (now.getHours() > endH || (now.getHours() === endH && now.getMinutes() >= endM)) {
        return true;
      }
    }
    return false;
  };

  const getDotColor = (type: EventItem["event_type"]) => {
    switch (type) {
      case "reunion":
        return "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]";
      case "ag":
        return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]";
      case "workshop":
        return "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]";
      case "deadline":
        return "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]";
      case "teambuilding":
        return "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]";
      default:
        return "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]";
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const t = new Date();
    setCurrentMonthDate(t);
    setSelectedDateStr(t.toISOString().split("T")[0]);
  };

  const calendarGridDays = useMemo(() => {
    const y = currentMonthDate.getFullYear();
    const m = currentMonthDate.getMonth();

    const firstDay = new Date(y, m, 1);
    const startDayOffset = (firstDay.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();

    const cells = [];

    for (let i = startDayOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = m === 0 ? 11 : m - 1;
      const prevYear = m === 0 ? y - 1 : y;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        day,
        dateStr,
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
      });
    }

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        day,
        dateStr,
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false,
      });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let day = 1; day <= remaining; day++) {
        const nextMonth = m === 11 ? 0 : m + 1;
        const nextYear = m === 11 ? y + 1 : y;
        const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cells.push({
          day,
          dateStr,
          isCurrentMonth: false,
          isPrevMonth: false,
          isNextMonth: true,
        });
      }
    }

    return cells;
  }, [currentMonthDate]);

  const filteredEvents = events.filter((evt) => {
    if (filterType === "all") return true;
    return evt.event_type === filterType;
  });

  const upcomingEvents = filteredEvents.filter((evt) => !isEventDone(evt));
  const pastEvents = filteredEvents.filter((evt) => isEventDone(evt));

  const getTypeBadge = (type: EventItem["event_type"]) => {
    switch (type) {
      case "reunion":
        return { label: "Réunion", bg: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
      case "ag":
        return { label: "Assemblée Générale", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "workshop":
        return { label: "Workshop / Formation", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "deadline":
        return { label: "Deadline Projet", bg: "bg-red-500/20 text-red-300 border-red-500/30" };
      case "teambuilding":
        return { label: "Teambuilding", bg: "bg-pink-500/20 text-pink-300 border-pink-500/30" };
      default:
        return { label: type, bg: "bg-white/10 text-white border-white/20" };
    }
  };

  const renderEventCard = (evt: EventItem, isPastSection: boolean = false) => {
    const badge = getTypeBadge(evt.event_type);
    const dateObj = new Date(evt.event_date);
    const dayNum = dateObj.toLocaleDateString("fr-FR", { day: "numeric" });
    const monthStr = dateObj.toLocaleDateString("fr-FR", { month: "short" });
    const weekdayStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long" });

    const isDone = isEventDone(evt);
    const isPastOrToday = evt.event_date <= todayStr;
    const isMeetingOrAg = evt.event_type === "reunion" || evt.event_type === "ag";

    return (
      <div
        key={evt.id}
        className={`p-6 sm:p-7 rounded-3xl border shadow-xl flex flex-col justify-between gap-5 transition-all ${
          isDone
            ? "bg-[#111116]/90 border-white/10 hover:border-white/20"
            : "bg-[#121217] border-white/10 hover:border-purple-500/30 shadow-purple-950/10"
        }`}
      >
        {/* Explicit Status Banner if event is done */}
        {isDone && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/60 text-zinc-300 text-xs">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-amber-400" />
              <span className="font-semibold text-white tracking-wide">
                Événement Clôturé
              </span>
              <span className="text-gray-400 hidden sm:inline">
                — Séance tenue le {dayNum} {monthStr} {dateObj.getFullYear()}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Archivé
            </span>
          </div>
        )}

        {/* Top Section: Date & Details + RSVP */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Date Badge & Details */}
          <div className="flex items-start gap-4">
            {/* Calendar Date Block */}
            <div
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg text-center ${
                isDone
                  ? "bg-gradient-to-b from-zinc-800/60 to-black/80 border border-zinc-700/50"
                  : "bg-gradient-to-b from-purple-900/40 to-black/60 border border-purple-500/30"
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  isDone ? "text-gray-400" : "text-purple-400"
                }`}
              >
                {monthStr}
              </span>
              <span className="text-xl font-black text-white leading-none">
                {dayNum}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-gray-400 capitalize">{weekdayStr}</span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">{evt.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                {evt.start_time && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Clock size={13} className="text-purple-400" />
                    <span>{evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ""}</span>
                  </div>
                )}
                {evt.location && (
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <MapPin size={13} className="text-pink-400" />
                    <span>{evt.location}</span>
                  </div>
                )}
              </div>

              {evt.description && (
                <div className="pt-2 text-xs leading-relaxed max-w-xl">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
                    Ordre du jour :
                  </span>
                  <p className="whitespace-pre-line text-gray-300 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    {evt.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: RSVP & Attendance */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
            {/* Attendance counters */}
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                ✓ {evt.presentCount || 0} présent{(evt.presentCount || 0) > 1 ? "s" : ""}
              </span>
              {(evt.maybeCount || 0) > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  ? {evt.maybeCount}
                </span>
              )}
              {(evt.absentCount || 0) > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                  ✕ {evt.absentCount}
                </span>
              )}
            </div>

            {/* Interactive RSVP buttons OR Locked status if event is already done */}
            {isDone ? (
              <div className="flex items-center gap-2">
                {evt.userRsvp === "present" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Votre présence : Confirmé ✓</span>
                  </div>
                ) : evt.userRsvp === "absent" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold shadow-sm">
                    <XCircle size={13} className="text-red-400" />
                    <span>Votre présence : Noté absent</span>
                  </div>
                ) : evt.userRsvp === "peut_etre" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                    <HelpCircle size={13} className="text-amber-400" />
                    <span>Votre présence : Était indécis</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-400 text-xs font-medium">
                    <Lock size={12} className="text-gray-400" />
                    <span>Présences clôturées</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => handleRsvp(evt.id, "present")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    evt.userRsvp === "present"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Je participe</span>
                </button>

                <button
                  onClick={() => handleRsvp(evt.id, "peut_etre")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    evt.userRsvp === "peut_etre"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <HelpCircle size={13} />
                  <span>Peut-être</span>
                </button>

                <button
                  onClick={() => handleRsvp(evt.id, "absent")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    evt.userRsvp === "absent"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <XCircle size={13} />
                  <span>Absent</span>
                </button>
              </div>
            )}

            {/* Bureau/Creator delete */}
            {isBureau && (
              <button
                onClick={() => handleDeleteEvent(evt.id, evt.title)}
                className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors self-end"
              >
                <Trash2 size={12} />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Section: Procès-Verbal (PV) Bar */}
        <div className="pt-3.5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.015] -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 px-6 sm:px-7 py-3.5 rounded-b-3xl">
          {evt.pv_file_url || evt.pv_content ? (
            <div className="flex flex-wrap items-center gap-3 w-full justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleOpenPvReader(evt)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/25 to-purple-600/25 hover:from-amber-500/40 hover:to-purple-600/40 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-900/10"
                >
                  <FileText size={15} className="text-amber-400" />
                  <span>Consulter / Télécharger le PV {evt.event_type === "ag" ? "(AG)" : "(Réunion)"}</span>
                </button>

                {evt.pv_file_name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[11px] text-gray-300 border border-white/10 font-mono">
                    <Paperclip size={12} className="text-purple-400" />
                    <span className="truncate max-w-[200px]">{evt.pv_file_name}</span>
                  </span>
                )}

                <span className="hidden sm:inline-block text-xs text-gray-400">
                  Joint par <strong className="text-purple-300 font-medium">{evt.pv_author_name || "Secrétariat"}</strong>
                </span>
              </div>

              {isBureau && (
                <button
                  onClick={() => handleOpenPvEditor(evt)}
                  className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4 flex items-center gap-1"
                >
                  <Edit3 size={13} />
                  <span>Remplacer le fichier PV</span>
                </button>
              )}
            </div>
          ) : isPastOrToday && isMeetingOrAg ? (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2 text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <Clock size={13} className="text-amber-400 shrink-0" />
                <span>PV en attente de dépôt du document (PDF / Word)</span>
              </div>

              {isBureau && (
                <button
                  onClick={() => handleOpenPvEditor(evt)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/30 hover:from-amber-500/35 hover:to-purple-600/45 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                >
                  <UploadCloud size={14} className="text-amber-400" />
                  <span>Joindre le fichier PV (PDF / Word)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-gray-400 italic">
              <Clock size={12} className="text-gray-500" />
              <span>Séance à venir — Le document officiel du PV sera joint et publié après la réunion.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSelectedDayEventsContent = () => {
    const selectedDayEvents = events.filter((e) => e.event_date === selectedDateStr);
    const formattedDate = formatFullDateFr(selectedDateStr);

    return (
      <div className="space-y-4">
        {/* Date Title Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
              Détails du jour sélectionné
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white capitalize">
              {formattedDate}
            </h4>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
            {selectedDayEvents.length} {selectedDayEvents.length > 1 ? "événements" : "événement"}
          </span>
        </div>

        {/* Events List for this date */}
        {selectedDayEvents.length === 0 ? (
          <div className="p-8 text-center bg-white/[0.015] border border-white/5 rounded-2xl space-y-3">
            <CalendarIcon size={32} className="mx-auto text-gray-500 opacity-40" />
            <p className="text-xs text-gray-400 font-medium">
              Aucun événement prévu pour le {formattedDate}.
            </p>
            {isResponsable && (
              <button
                onClick={() => {
                  setEventDate(selectedDateStr);
                  setIsCalendarModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="mt-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Planifier un événement ce jour</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {selectedDayEvents.map((evt) => {
              const badge = getTypeBadge(evt.event_type);
              const isDone = isEventDone(evt);

              return (
                <div
                  key={evt.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all space-y-3"
                >
                  {/* Header: Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    {isDone ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-gray-300 border border-zinc-700 flex items-center gap-1">
                        <Lock size={10} />
                        <span>Terminé</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles size={10} />
                        <span>À venir</span>
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h5 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {evt.title}
                  </h5>

                  {/* Time & Location */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                    {evt.start_time && (
                      <div className="flex items-center gap-1 text-purple-300">
                        <Clock size={12} />
                        <span>{evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ""}</span>
                      </div>
                    )}
                    {evt.location && (
                      <div className="flex items-center gap-1 text-pink-300">
                        <MapPin size={12} />
                        <span className="truncate max-w-[200px]">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {evt.description && (
                    <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5 whitespace-pre-line">
                      {evt.description}
                    </p>
                  )}

                  {/* Attendance Summary */}
                  <div className="flex items-center gap-2 text-[11px] pt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ✓ {evt.presentCount || 0} présent{(evt.presentCount || 0) > 1 ? "s" : ""}
                    </span>
                    {(evt.absentCount || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
                        ✕ {evt.absentCount}
                      </span>
                    )}
                  </div>

                  {/* PV Button if completed, or RSVP if upcoming */}
                  {isDone ? (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      {evt.pv_file_url || evt.pv_content ? (
                        <button
                          onClick={() => handleOpenPvReader(evt)}
                          className="w-full px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/25 hover:from-amber-500/35 hover:to-purple-600/40 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <FileText size={14} className="text-amber-400" />
                          <span>Consulter le Procès-Verbal (PV)</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-gray-500 italic flex items-center gap-1">
                          <Clock size={11} />
                          <span>PV en attente de dépôt</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">Votre présence :</span>
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => handleRsvp(evt.id, "present")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            evt.userRsvp === "present"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          ✓ Participe
                        </button>
                        <button
                          onClick={() => handleRsvp(evt.id, "peut_etre")}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            evt.userRsvp === "peut_etre"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          ?
                        </button>
                        <button
                          onClick={() => handleRsvp(evt.id, "absent")}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            evt.userRsvp === "absent"
                              ? "bg-red-600 text-white shadow-sm"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-purple-400" />
            <span>Calendrier & Réunions Internes</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Consultez le planning des réunions de pôles, des ateliers et confirmez votre présence en un clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Prominent CALENDRIER Button */}
          <button
            id="open-calendar-modal-btn"
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex-1 md:flex-none px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/30 hover:from-purple-900/60 hover:to-indigo-900/50 border border-purple-500/40 hover:border-purple-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-purple-950/50 hover:shadow-purple-600/20 transition-all group backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <CalendarDays size={14} className="text-white" />
            </div>
            <span>Calendrier</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              Mois
            </span>
          </button>

          {isResponsable && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all shrink-0"
            >
              <Plus size={16} />
              <span>Planifier une Réunion</span>
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-xs text-gray-400 mr-2 flex items-center gap-1">
          <Filter size={14} /> Filtre :
        </span>
        {[
          { key: "all", label: "Tous" },
          { key: "reunion", label: "Réunions" },
          { key: "ag", label: "Assemblées" },
          { key: "workshop", label: "Workshops" },
          { key: "deadline", label: "Deadlines" },
          { key: "teambuilding", label: "Teambuilding" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              filterType === f.key
                ? "bg-purple-600 text-white"
                : "bg-white/[0.04] text-gray-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#121217] border border-white/5 animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Upcoming Events */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Événements & Réunions à Venir
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                  {upcomingEvents.length}
                </span>
              </div>

              {pastEvents.length > 0 && (
                <button
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Archive size={13} />
                  <span>{showPastEvents ? "Masquer les archives" : `Voir les archives (${pastEvents.length})`}</span>
                  {showPastEvents ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#121217] border border-white/5 text-center text-gray-400 space-y-3">
                <CalendarIcon size={36} className="mx-auto text-purple-400/50" />
                <p className="text-base font-semibold text-white">Aucun événement à venir pour le moment</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Toutes les réunions prévues s&apos;afficheront ici. Vous pouvez consulter les séances passées et leurs PV officiels dans le calendrier ou les archives ci-dessous.
                </p>
                <button
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm"
                >
                  <CalendarDays size={14} />
                  <span>Explorer le Calendrier Mensuel</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.map((evt) => renderEventCard(evt, false))}
              </div>
            )}
          </div>

          {/* Section 2: Past Events & Archives (Collapsible) */}
          {pastEvents.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Archive size={16} className="text-amber-400" />
                  <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                    Historique des Réunions & PV Archivés
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                    {pastEvents.length}
                  </span>
                </div>

                <button
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>{showPastEvents ? "Réduire" : `Afficher (${pastEvents.length})`}</span>
                  {showPastEvents ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {showPastEvents && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                    <span>
                      Ces séances sont déjà tenues. Vous pouvez consulter les comptes-rendus, votes et procès-verbaux officiels (PV) en cliquant sur chaque réunion.
                    </span>
                  </div>

                  <div className="space-y-6">
                    {pastEvents.map((evt) => renderEventCard(evt, true))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Monthly Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-[#101016] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Calendrier Mensuel du Club</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 hidden sm:block">
                    Sélectionnez un jour pour explorer les réunions, workshops et PV archivés.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split view on Desktop, Stacked on Mobile */}
            <div className="p-3.5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Left Side: Calendar Month View (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                {/* Month Navigation Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                      title="Mois précédent"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <h4 className="text-sm sm:text-lg font-extrabold text-white tracking-tight min-w-[120px] sm:min-w-[150px] text-center capitalize">
                      {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </h4>
                    <button
                      onClick={goToNextMonth}
                      className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                      title="Mois suivant"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <button
                    onClick={goToToday}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all"
                  >
                    Aujourd&apos;hui
                  </button>
                </div>

                {/* Weekday Labels Header */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {WEEK_DAYS.map((wd) => (
                    <span key={wd} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1">
                      {wd}
                    </span>
                  ))}
                </div>

                {/* Calendar Grid Tiles */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {calendarGridDays.map((cell, idx) => {
                    const cellEvents = events.filter((e) => e.event_date === cell.dateStr);
                    const isSelected = cell.dateStr === selectedDateStr;
                    const isToday = cell.dateStr === todayStr;

                    return (
                      <button
                        key={`${cell.dateStr}-${idx}`}
                        onClick={() => {
                          setSelectedDateStr(cell.dateStr);
                          if (cell.isPrevMonth) goToPreviousMonth();
                          if (cell.isNextMonth) goToNextMonth();
                        }}
                        className={`min-h-[50px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col items-center justify-between transition-all relative ${
                          cell.isCurrentMonth ? "text-white" : "text-gray-600 opacity-40 hover:opacity-75"
                        } ${
                          isSelected
                            ? "bg-purple-600 text-white font-bold ring-2 ring-purple-400 shadow-lg shadow-purple-600/30 scale-[1.02] z-10"
                            : isToday
                            ? "bg-purple-950/40 border border-purple-500/50 hover:bg-white/10"
                            : cellEvents.length > 0
                            ? "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]"
                            : "bg-white/[0.015] border border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <span className={`text-xs sm:text-sm ${isToday && !isSelected ? "text-purple-300 font-extrabold" : ""}`}>
                          {cell.day}
                        </span>

                        {/* Dots for event types */}
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-1 min-h-[8px]">
                          {cellEvents.slice(0, 3).map((evt) => (
                            <span
                              key={evt.id}
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getDotColor(evt.event_type)} ring-1 ring-black/40`}
                              title={`${evt.title} (${getTypeBadge(evt.event_type).label})`}
                            />
                          ))}
                          {cellEvents.length > 3 && (
                            <span className="text-[8px] leading-none text-purple-300 font-bold">
                              +{cellEvents.length - 3}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Color Legend */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-400">Légende :</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                      <span>Réunion</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      <span>Assemblée Générale</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                      <span>Workshop</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                      <span>Deadline</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
                      <span>Teambuilding</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side on Desktop: Side Details Panel (lg:col-span-5) */}
              <div className="hidden lg:flex lg:col-span-5 flex-col bg-[#14141c] border border-white/10 rounded-2xl p-5 overflow-y-auto max-h-[600px] shadow-inner">
                {renderSelectedDayEventsContent()}
              </div>

              {/* Mobile View: Renders directly below the grid (lg:hidden) */}
              <div className="block lg:hidden mt-4 pt-4 border-t border-white/10">
                {renderSelectedDayEventsContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121217] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={18} className="text-purple-400" />
                  <span>Planifier une Réunion / Événement</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Planifiez une convocation officielle dans l&apos;agenda du club.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Titre de la réunion / Objet</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Réunion Générale - Lancement Mandat 2026/2027"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Type d&apos;Événement</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="reunion">Réunion Pôle / Bureau</option>
                    <option value="ag">Assemblée Générale</option>
                    <option value="workshop">Workshop / Formation</option>
                    <option value="deadline">Deadline Projet</option>
                    <option value="teambuilding">Teambuilding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Heure de début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Heure de fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Lieu / Salle</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Salle Club / IHEC Carthage / Google Meet..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-gray-300 font-semibold">
                    Ordre du jour & Points à aborder
                  </label>
                  <span className="text-[10px] text-purple-400 font-medium">
                    Touche Entrée pour aller à la ligne
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={"1. Approbation du PV de la séance précédente\n2. Point d'avancement des pôles et projets\n3. Organisation logistique du prochain événement\n4. Questions diverses"}
                  className="w-full p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 resize-y leading-relaxed font-sans"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Les retours à la ligne seront fidèlement conservés lors de l&apos;affichage pour une présentation claire et structurée.
                </p>
              </div>

              {/* Email Broadcast Checkbox */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="broadcastCheck"
                  checked={broadcastEmail}
                  onChange={(e) => setBroadcastEmail(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="broadcastCheck" className="text-xs text-purple-200 cursor-pointer select-none">
                  <strong>Envoyer une convocation par email</strong> à tous les membres du club.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? "Planification..." : "Valider & Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PV Reader Modal */}
      {selectedEventForPv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#121217] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                    <FileText size={13} />
                    Procès-Verbal Officiel
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {new Date(selectedEventForPv.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedEventForPv.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                  {selectedEventForPv.pv_author_name && (
                    <span>Rédigé / Joint par : <strong className="text-purple-300 font-semibold">{selectedEventForPv.pv_author_name}</strong></span>
                  )}
                  {selectedEventForPv.location && (
                    <span>• Lieu : {selectedEventForPv.location}</span>
                  )}
                  {selectedEventForPv.start_time && (
                    <span>• Horaires : {selectedEventForPv.start_time} {selectedEventForPv.end_time ? `- ${selectedEventForPv.end_time}` : ""}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedEventForPv(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Attendance recap */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-gray-400 font-medium">Émargement & Présences :</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  ✓ {selectedEventForPv.presentCount || 0} Présent{(selectedEventForPv.presentCount || 0) > 1 ? "s" : ""}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 font-bold">
                  ✕ {selectedEventForPv.absentCount || 0} Absent{(selectedEventForPv.absentCount || 0) > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Document Download & Action Card */}
            {selectedEventForPv.pv_file_url ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-amber-900/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedEventForPv.pv_file_name || "Document_PV_Officiel"}</span>
                    </h4>
                    <p className="text-xs text-gray-400">
                      Document officiel certifié du Club HEC Entrepreneurs
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <a
                    href={selectedEventForPv.pv_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={selectedEventForPv.pv_file_name || "PV_Officiel"}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
                  >
                    <Download size={14} />
                    <span>Télécharger le PV</span>
                  </a>
                  <a
                    href={selectedEventForPv.pv_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <ExternalLink size={14} />
                    <span>Ouvrir</span>
                  </a>
                </div>
              </div>
            ) : null}

            {/* If PDF preview is available */}
            {selectedEventForPv.pv_file_url && (selectedEventForPv.pv_file_url.toLowerCase().includes(".pdf") || selectedEventForPv.pv_file_name?.toLowerCase().endsWith(".pdf")) ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-purple-300">Aperçu du document PDF :</span>
                  <span className="text-[11px] text-gray-500">Lecture directe intégrée</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner">
                  <iframe
                    src={selectedEventForPv.pv_file_url}
                    className="w-full h-[520px] border-0"
                    title="Aperçu du PV"
                  />
                </div>
              </div>
            ) : null}

            {/* Key Decisions Block if present */}
            {selectedEventForPv.pv_decisions && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  Décisions & Résolutions Adoptées
                </h4>
                <div className="p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-100 text-xs leading-relaxed whitespace-pre-line">
                  {selectedEventForPv.pv_decisions}
                </div>
              </div>
            )}

            {/* Fallback text if no file or additional notes */}
            {selectedEventForPv.pv_content && !selectedEventForPv.pv_content.startsWith("Fichier officiel joint") && !selectedEventForPv.pv_content.startsWith("[FICHIER_PV:") ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Notes & Délibérations</h4>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-200 text-xs leading-relaxed whitespace-pre-line">
                  {selectedEventForPv.pv_content}
                </div>
              </div>
            ) : null}

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                {selectedEventForPv.pv_file_url && (
                  <a
                    href={selectedEventForPv.pv_file_url}
                    download
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Télécharger</span>
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Imprimer</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isBureau && (
                  <button
                    onClick={() => handleOpenPvEditor(selectedEventForPv)}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Edit3 size={14} />
                    <span>Remplacer ce fichier PV</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedEventForPv(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PV Editor Modal (File Attachment) */}
      {editingPvEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#121217] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <UploadCloud size={20} className="text-amber-400" />
                  <span>Joindre le Procès-Verbal (PV)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Événement : <strong className="text-white">{editingPvEvent.title}</strong> ({editingPvEvent.event_date})
                </p>
              </div>
              <button
                onClick={() => setEditingPvEvent(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePv} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Secrétaire / Rédacteur du PV</label>
                <input
                  type="text"
                  required
                  value={pvAuthorName}
                  onChange={(e) => setPvAuthorName(e.target.value)}
                  placeholder="Ex: Yasmine (Secrétaire Générale) ou Omar Boudaya"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1.5">
                  Fichier du Procès-Verbal (PDF, Word, etc.)
                </label>

                {pvFile ? (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileCheck size={26} className="text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{pvFile.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {(pvFile.size / 1024).toFixed(1)} Ko • Prêt pour téléversement
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPvFile(null)}
                      className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded-lg bg-white/5 shrink-0"
                    >
                      Changer
                    </button>
                  </div>
                ) : pvFileUrl ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={26} className="text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {pvFileName || "Document PV actuel"}
                        </div>
                        <div className="text-[10px] text-emerald-300">
                          Fichier actuellement enregistré dans la base
                        </div>
                      </div>
                    </div>
                    <label className="text-xs text-purple-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer shrink-0 transition-colors">
                      Remplacer
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setPvFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) setPvFile(e.dataTransfer.files[0]);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/15 hover:border-purple-500/40 bg-white/[0.02] hover:bg-purple-500/[0.02]"
                    }`}
                  >
                    <UploadCloud size={32} className="text-purple-400 mb-2" />
                    <span className="text-xs font-bold text-white text-center">
                      Cliquez pour choisir le fichier du PV ou glissez-le ici
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1 text-center">
                      Tous formats acceptés : PDF, Word (.docx, .doc), OpenDoc (.odt), etc.
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setPvFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {/* Émargement / Nombre de membres présents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    Membres Présents (Émargement)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customPresentCount}
                    onChange={(e) => setCustomPresentCount(e.target.value)}
                    placeholder="Ex: 28"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Nombre officiel de présences affiché
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    Membres Absents
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customAbsentCount}
                    onChange={(e) => setCustomAbsentCount(e.target.value)}
                    placeholder="Ex: 4"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Nombre officiel d&apos;absences
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-gray-300 font-semibold">
                    Décisions clés & Synthèse (Optionnel)
                  </label>
                  <span className="text-[10px] text-purple-400 font-medium">
                    Touche Entrée pour aller à la ligne
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={pvDecisions}
                  onChange={(e) => setPvDecisions(e.target.value)}
                  placeholder={"1. Approbation du bilan moral\n2. Budget alloué au Startup Weekend\n3. Prochaine réunion fixée au mardi"}
                  className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 leading-relaxed resize-y font-sans"
                />
              </div>

              {statusMsg && statusMsg.type === "error" && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPvEvent(null)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingPv || isUploadingPvFile}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs rounded-xl font-bold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {isUploadingPvFile
                      ? "Téléversement du fichier..."
                      : isSavingPv
                      ? "Publication..."
                      : "Valider & Publier le PV"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
