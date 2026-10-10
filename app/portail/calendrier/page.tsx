"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon, Clock, MapPin, Users, Plus, CheckCircle2,
  XCircle, HelpCircle, Trash2, Send, AlertCircle, Sparkles, Filter
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
  rsvps?: any[];
}

export default function CalendrierPage() {
  const { user, isResponsable, isBureau } = usePortailAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

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

      await fetch(`/api/portail/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
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

  const filteredEvents = events.filter((evt) => {
    if (filterType === "all") return true;
    return evt.event_type === filterType;
  });

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-purple-400" />
            <span>Calendrier & Réunions Internes</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Consultez le planning des réunions de pôles, des ateliers et confirmez votre présence en un clic.
          </p>
        </div>

        {isResponsable && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all shrink-0"
          >
            <Plus size={16} />
            <span>Planifier une Réunion</span>
          </button>
        )}
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
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
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
      ) : filteredEvents.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#121217] border border-white/5 text-center text-gray-400 space-y-2">
          <CalendarIcon size={36} className="mx-auto text-gray-500 opacity-60" />
          <p className="text-base font-semibold text-white">Aucun événement prévu</p>
          <p className="text-xs text-gray-500">Les nouvelles convocations et réunions apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((evt) => {
            const badge = getTypeBadge(evt.event_type);
            const dateObj = new Date(evt.event_date);
            const dayNum = dateObj.toLocaleDateString("fr-FR", { day: "numeric" });
            const monthStr = dateObj.toLocaleDateString("fr-FR", { month: "short" });
            const weekdayStr = dateObj.toLocaleDateString("fr-FR", { weekday: "long" });

            return (
              <div
                key={evt.id}
                className="p-6 sm:p-7 rounded-3xl bg-[#121217] border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-purple-500/30 transition-all"
              >
                {/* Left: Date Badge & Details */}
                <div className="flex items-start gap-4">
                  {/* Calendar Date Block */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-purple-900/40 to-black/60 border border-purple-500/30 flex flex-col items-center justify-center shrink-0 shadow-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
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
                      <p className="text-xs text-gray-400 pt-1 leading-relaxed max-w-xl">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: RSVP & Actions */}
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

                  {/* Interactive RSVP buttons */}
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
            );
          })}
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
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Ordre du jour & Instructions</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détaillez les points clés abordés durant la séance..."
                  className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
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
                  <strong>Envoyer une convocation par email</strong> à tous les 33 membres inscrits au club.
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
    </div>
  );
}
