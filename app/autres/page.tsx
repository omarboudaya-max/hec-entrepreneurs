"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, CheckCircle2, AlertTriangle, ArrowRight,
  MapPin, Sparkles, Phone, Mail, Award, Rocket, Instagram, Linkedin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Statut de la campagne de recrutement (basculer à true si une nouvelle session s'ouvre)
export const IS_RECRUITMENT_OPEN = false;

type DayOption = "Lundi" | "Mardi";

interface SlotItem {
  id: string;
  label: string;
  period: string;
}

const LUNDI_SLOTS: SlotItem[] = [
  { id: "10:00 - 10:30", label: "10h00 - 10h30", period: "Matin" },
  { id: "10:30 - 11:00", label: "10h30 - 11h00", period: "Matin" },
  { id: "11:00 - 11:30", label: "11h00 - 11h30", period: "Matin" },
  { id: "11:30 - 12:00", label: "11h30 - 12h00", period: "Matin" },
  { id: "13:00 - 13:30", label: "13h00 - 13h30", period: "Midi" },
  { id: "13:30 - 14:00", label: "13h30 - 14h00", period: "Midi" },
  { id: "14:00 - 14:30", label: "14h00 - 14h30", period: "Après-midi" },
  { id: "14:30 - 15:00", label: "14h30 - 15h00", period: "Après-midi" },
  { id: "15:00 - 15:30", label: "15h00 - 15h30", period: "Après-midi" },
  { id: "15:30 - 16:00", label: "15h30 - 16h00", period: "Après-midi" },
  { id: "16:00 - 16:30", label: "16h00 - 16h30", period: "Après-midi" },
  { id: "16:30 - 17:00", label: "16h30 - 17h00", period: "Fin d'après-midi" },
];

const MARDI_SLOTS: SlotItem[] = [
  { id: "10:00 - 10:30", label: "10h00 - 10h30", period: "Matin" },
  { id: "10:30 - 11:00", label: "10h30 - 11h00", period: "Matin" },
  { id: "11:00 - 11:30", label: "11h00 - 11h30", period: "Matin" },
  { id: "11:30 - 12:00", label: "11h30 - 12h00", period: "Matin" },
  { id: "13:00 - 13:30", label: "13h00 - 13h30", period: "Midi" },
  { id: "13:30 - 14:00", label: "13h30 - 14h00", period: "Midi" },
  { id: "14:00 - 14:30", label: "14h00 - 14h30", period: "Après-midi" },
  { id: "14:30 - 15:00", label: "14h30 - 15h00", period: "Après-midi" },
  { id: "15:30 - 16:00", label: "15h30 - 16h00", period: "Après-midi" },
  { id: "16:00 - 16:30", label: "16h00 - 16h30", period: "Après-midi" },
  { id: "16:30 - 17:00", label: "16h30 - 17h00", period: "Fin d'après-midi" },
];

const SLOTS_BY_DAY: Record<DayOption, SlotItem[]> = {
  Lundi: LUNDI_SLOTS,
  Mardi: MARDI_SLOTS,
};

export default function AutresCreneauxPage() {
  const [selectedDay, setSelectedDay] = useState<DayOption>("Lundi");
  const [fullName, setFullName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [fullSlots, setFullSlots] = useState<Record<string, string[]>>({ Lundi: [], Mardi: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmedDay, setConfirmedDay] = useState<DayOption>("Lundi");
  const [confirmedSlot, setConfirmedSlot] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAvailability = async () => {
    try {
      const res = await fetch("/api/recruitment/autres");
      const data = await res.json();
      if (data.fullSlots) {
        setFullSlots(data.fullSlots);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des créneaux:", err);
    }
  };

  useEffect(() => {
    if (IS_RECRUITMENT_OPEN) {
      fetchAvailability();
    }
  }, []);

  const handleDayChange = (day: DayOption) => {
    setSelectedDay(day);
    setSelectedSlot("");
  };

  const isSlotUnavailable = (slotId: string) => {
    return fullSlots[selectedDay]?.includes(slotId) || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Veuillez renseigner votre nom et prénom.");
      return;
    }

    if (!selectedSlot) {
      setErrorMsg("Veuillez sélectionner un créneau horaire.");
      return;
    }

    if (isSlotUnavailable(selectedSlot)) {
      setErrorMsg("Ce créneau est complet. Veuillez en sélectionner un autre.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recruitment/autres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          interviewDate: selectedDay,
          interviewTime: selectedSlot,
          phone: contactInfo.trim(),
          email: contactInfo.includes("@") ? contactInfo.trim() : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'enregistrement.");
      }

      setConfirmedDay(selectedDay);
      setConfirmedSlot(selectedSlot);
      setSubmitted(true);
      fetchAvailability();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSlots = SLOTS_BY_DAY[selectedDay];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-gray-100 flex flex-col selection:bg-purple-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24 relative z-10 w-full">
        {!IS_RECRUITMENT_OPEN ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-10"
          >
            {/* Header Section */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono uppercase tracking-widest shadow-sm font-semibold"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span>Session 2026/2027 • Recrutements & Entretiens Clôturés</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-thin tracking-[0.1em] sm:tracking-[0.15em] uppercase text-slate-900 dark:text-white">
                <span className="text-wave">RECRUTEMENT CLÔTURÉ</span>
              </h1>
              <p className="text-slate-500 dark:text-gray-400 font-mono tracking-widest text-xs uppercase">
                Club HEC Entrepreneurs — IHEC Carthage
              </p>
              <p className="text-slate-700 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                La période des entretiens individuels ainsi que la réservation des créneaux sont désormais définitivement closes.
                Un immense merci aux centaines d&apos;étudiants ayant candidaté et partagé leur enthousiasme avec le bureau !
              </p>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101016] border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-lg dark:shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Délibérations en cours
                  </h3>
                  <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Le bureau HEC Entrepreneurs finalise l&apos;évaluation des profils. Les résultats officiels et l&apos;intégration seront annoncés directement aux candidats retenus.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
                  <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 font-semibold uppercase">
                    Résultats imminents
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101016] border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-lg dark:shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Événements & Conférences
                  </h3>
                  <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Même sans être membre actif du bureau, nos conférences, workshops et le prestigieux Tribunal de l&apos;Entrepreneuriat restent ouverts à tous les étudiants de l&apos;IHEC.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
                  <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold uppercase">
                    Accès libre
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#101016] border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:border-pink-500/40 transition-all flex flex-col justify-between shadow-lg dark:shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Restez Connectés
                  </h3>
                  <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Suivez nos actualités officielles pour ne rien manquer de nos prochaines initiatives, masterclasses et opportunités de l&apos;écosystème.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
                  <span className="text-[11px] font-mono text-pink-700 dark:text-pink-300 font-semibold uppercase">
                    Communauté active
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#101016] border border-slate-200 dark:border-white/10 text-center space-y-6 shadow-xl dark:shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                Explorez l&apos;univers HEC Entrepreneurs
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
                Découvrez nos projets phares, les produits exclusifs de la boutique IHEC Store ou connectez-vous au portail.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/entrepreuneuriat"
                  className="px-7 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-purple-600/25 hover:scale-105"
                >
                  Découvrir nos projets
                </Link>
                <Link
                  href="/store"
                  className="px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white font-bold text-xs uppercase tracking-widest transition-all border border-slate-300 dark:border-white/20 hover:scale-105"
                >
                  IHEC Store
                </Link>
                <Link
                  href="/portail"
                  className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-600/25 hover:scale-105"
                >
                  Portail Membres
                </Link>
                <Link
                  href="/"
                  className="px-7 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 font-bold text-xs uppercase tracking-widest transition-all border border-slate-200 dark:border-white/10 hover:scale-105"
                >
                  Accueil
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-gray-400">
                <a
                  href="https://www.instagram.com/hec_entrepreneurs?igsh=MTdsOW4xOHVnbDdsYw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Instagram Officiel</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/hec-entrepreneurs-ab35773b2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  <Linkedin className="w-4 h-4 text-blue-500" />
                  <span>LinkedIn Officiel</span>
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-mono uppercase tracking-widest font-semibold">
                    <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
                    <span>Recrutement 2026/2027 • Rattrapage Créneaux</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Choix de Créneau — <span className="text-wave">Lundi & Mardi</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Sélectionnez votre tranche horaire pour l&apos;entretien individuel avec les membres du bureau HEC Entrepreneurs.
                  </p>
                </div>

                {/* Notice Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3.5 shadow-sm">
                  <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-xs">
                      Formulaire réservé exclusivement
                    </div>
                    <p className="text-amber-950/90 dark:text-amber-100/90 leading-relaxed text-xs sm:text-sm font-medium">
                      Cette page est <strong>exclusivement destinée</strong> aux candidats ayant déjà soumis leur formulaire de recrutement avec l&apos;option <strong>« Autre »</strong> dans le choix des créneaux.
                    </p>
                  </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#101016] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl space-y-8 backdrop-blur-xl">
                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
                      <span className="font-bold">Erreur :</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Question 1: Name */}
                  <div className="space-y-3">
                    <label className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600/15 dark:bg-purple-600/30 border border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-mono font-bold">
                        1
                      </span>
                      <span>Votre Nom & Prénom</span>
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Mohamed Ali Ben Amor"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500 shadow-sm"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 pl-1">
                      Indiquez exactement les mêmes prénom et nom renseignés dans votre candidature initiale.
                    </p>
                  </div>

                  {/* Optional Contact Field */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-gray-400 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400 dark:text-gray-500" />
                      <span>Numéro de Téléphone ou Email (Pour confirmation & rappel)</span>
                    </label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Ex: 50 123 456 ou candidat@gmail.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500 shadow-sm"
                    />
                  </div>

                  {/* Question 2: Day & Slot Selection */}
                  <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-white/10">
                    <label className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600/15 dark:bg-purple-600/30 border border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-mono font-bold">
                        2
                      </span>
                      <span>Choisissez votre Jour & Créneau d&apos;Entretien</span>
                      <span className="text-red-500">*</span>
                    </label>

                    {/* Day Selector Tabs */}
                    <div className="grid grid-cols-2 gap-3">
                      {(["Lundi", "Mardi"] as DayOption[]).map((day) => {
                        const isSelected = selectedDay === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayChange(day)}
                            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                              isSelected
                                ? "bg-purple-50 dark:bg-purple-600/20 border-purple-500 shadow-md text-purple-950 dark:text-white"
                                : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-600 dark:text-gray-400"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Calendar size={18} className={isSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-gray-500"} />
                              <span className="text-sm sm:text-base font-black tracking-wide">{day}</span>
                            </div>
                            <span className={`text-[11px] font-semibold ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-slate-400 dark:text-gray-500"}`}>
                              10h00 - 16h30
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Slots Grid for Selected Day */}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-purple-600 dark:text-purple-400" />
                        Créneaux de 30 min pour le <strong className="text-slate-900 dark:text-white">{selectedDay}</strong> :
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentSlots.map((slot) => {
                          const isFull = isSlotUnavailable(slot.id);
                          const isSelected = selectedSlot === slot.id;

                          if (isFull) {
                            return (
                              <div
                                key={slot.id}
                                className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.015] text-slate-400 dark:text-gray-500 flex items-center justify-between opacity-60 cursor-not-allowed select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock size={15} className="text-slate-400 dark:text-gray-600" />
                                  <span className="text-xs font-bold line-through text-slate-400 dark:text-gray-500">
                                    {slot.label}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                  Complet
                                </span>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlot(slot.id)}
                              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group shadow-sm ${
                                isSelected
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-md shadow-purple-600/30 scale-[1.02]"
                                  : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:bg-purple-50/50 dark:hover:bg-white/[0.06] hover:border-purple-300 dark:hover:border-purple-500/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Clock
                                  size={15}
                                  className={isSelected ? "text-white" : "text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"}
                                />
                                <span className="text-xs font-bold tracking-wide">
                                  {slot.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isSelected ? (
                                  <CheckCircle2 size={16} className="text-white" />
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-gray-300">
                                    {slot.period}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-600 dark:text-gray-400">
                      {selectedSlot ? (
                        <span>
                          Créneau sélectionné :{" "}
                          <strong className="text-purple-700 dark:text-purple-300 font-bold">
                            {selectedDay} à {currentSlots.find((s) => s.id === selectedSlot)?.label || selectedSlot}
                          </strong>
                        </span>
                      ) : (
                        <span>Veuillez sélectionner un créneau pour valider.</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!fullName.trim() || !selectedSlot || isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Confirmation...</span>
                        </div>
                      ) : (
                        <>
                          <span>Confirmer mon Créneau</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Confirmation Success Screen */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#101016] border border-emerald-500/40 text-center space-y-6 shadow-xl dark:shadow-2xl relative overflow-hidden"
              >
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-md">
                  <CheckCircle2 size={40} />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono uppercase tracking-wider font-semibold">
                    Confirmation Validée
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Créneau d&apos;Entretien Enregistré !
                  </h2>
                  <p className="text-slate-600 dark:text-gray-300 text-xs sm:text-sm max-w-lg mx-auto">
                    Merci <strong>{fullName}</strong>, votre entretien individuel avec les membres du bureau HEC Entrepreneurs est bien planifié.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-left space-y-3 text-xs sm:text-sm shadow-sm">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/80 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400">Candidat :</span>
                    <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/80 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400">Jour :</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">{confirmedDay}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/80 dark:border-white/5">
                    <span className="text-slate-500 dark:text-gray-400">Horaire de passage :</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {SLOTS_BY_DAY[confirmedDay]?.find((s) => s.id === confirmedSlot)?.label || confirmedSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 dark:text-gray-400">Lieu :</span>
                    <span className="text-slate-900 dark:text-white flex items-center gap-1 font-medium">
                      <MapPin size={13} className="text-pink-600 dark:text-pink-400" />
                      Salle Club HEC — IHEC Carthage
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Veuillez vous présenter 5 minutes à l&apos;avance devant la salle du club.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Retour à l&apos;accueil
                  </Link>
                  <Link
                    href="/portail"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-600/20 hover:opacity-90 transition-opacity"
                  >
                    Espace Membres
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}
