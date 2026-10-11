"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, MapPin, Sparkles, Phone, Mail, ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LUNDI_SLOTS = [
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:30",
  "12:30 - 13:00",
  "13:00 - 13:30",
  "13:30 - 14:00",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
];

export default function AutresCreneauxPage() {
  const [fullName, setFullName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [slotLimit, setSlotLimit] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch current slot availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch("/api/recruitment/autres");
        const data = await res.json();
        if (data.counts) setSlotCounts(data.counts);
        if (data.limit) setSlotLimit(data.limit);
      } catch (err) {
        console.error("Erreur lors de la récupération des créneaux:", err);
      }
    };
    fetchAvailability();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Veuillez renseigner votre nom et prénom.");
      return;
    }

    if (!selectedSlot) {
      setErrorMsg("Veuillez sélectionner un créneau horaire pour le lundi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recruitment/autres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          interviewTime: selectedSlot,
          phone: contactInfo.trim(),
          email: contactInfo.includes("@") ? contactInfo.trim() : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'enregistrement.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      <Navbar />

      {/* Decorative ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24 relative z-10 w-full">
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
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono uppercase tracking-widest">
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Recrutement 2026/2027 • Session Spéciale</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                  Choix de Créneau — <span className="text-wave">Lundi</span>
                </h1>

                <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Planification des entretiens pour les créneaux personnalisés de 30 minutes, de 09h00 à 15h30.
                </p>
              </div>

              {/* Notice Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3.5 shadow-lg shadow-amber-950/20">
                <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 uppercase tracking-wider text-xs">
                    Formulaire réservé exclusivement
                  </div>
                  <p className="text-amber-100/90 leading-relaxed text-xs sm:text-sm">
                    Cette page est <strong>exclusivement destinée</strong> aux candidats ayant déjà rempli le formulaire de recrutement officiel et ayant sélectionné l&apos;option <strong>« Autre »</strong> dans le choix des créneaux.
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-[#101016] border border-white/10 shadow-2xl space-y-8 backdrop-blur-xl">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-2">
                    <span className="font-bold">Erreur :</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Question 1: Name */}
                <div className="space-y-3">
                  <label className="block text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center text-xs font-mono">
                      1
                    </span>
                    <span>Votre Nom & Prénom</span>
                    <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Mohamed Ali Ben Amor"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 pl-1">
                    Indiquez exactement les mêmes prénom et nom renseignés dans votre candidature initiale.
                  </p>
                </div>

                {/* Optional Contact Field */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-medium text-gray-400 flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span>Numéro de Téléphone ou Email (Recommandé pour confirmation)</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Ex: 50 123 456 ou candidat@gmail.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white text-xs focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-500"
                  />
                </div>

                {/* Question 2: Slot Selection */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center text-xs font-mono">
                        2
                      </span>
                      <span>Choisissez votre créneau pour le Lundi</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs text-purple-400 font-mono">
                      Intervalles de 30 min (09h00 à 15h30)
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Cliquez sur l&apos;horaire de votre choix pour valider votre heure de passage :
                  </p>

                  {/* Grid of Slots */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {LUNDI_SLOTS.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      const booked = slotCounts[slot] || 0;
                      const isFull = booked >= slotLimit;
                      const remaining = Math.max(0, slotLimit - booked);

                      if (isFull) {
                        return (
                          <div
                            key={slot}
                            className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] text-gray-500 flex items-center justify-between opacity-50 cursor-not-allowed select-none"
                            title="Créneau complet"
                          >
                            <div className="flex items-center gap-2.5">
                              <Clock size={15} className="text-gray-600" />
                              <span className="text-xs font-semibold line-through">{slot}</span>
                            </div>
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                              Complet
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                            isSelected
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                              : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06] hover:border-purple-500/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Clock
                              size={15}
                              className={isSelected ? "text-white" : "text-purple-400 group-hover:text-purple-300"}
                            />
                            <span className="text-xs font-bold tracking-wide">{slot}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isSelected ? (
                              <CheckCircle2 size={16} className="text-white" />
                            ) : (
                              <span className="text-[10px] font-mono text-gray-400 group-hover:text-gray-300">
                                {remaining} place{remaining > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-400">
                    {selectedSlot ? (
                      <span>
                        Créneau sélectionné : <strong className="text-purple-300 font-bold">{selectedSlot} (Lundi)</strong>
                      </span>
                    ) : (
                      <span>Veuillez sélectionner un créneau pour valider.</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!fullName.trim() || !selectedSlot || isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-purple-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              className="p-8 sm:p-12 rounded-3xl bg-[#101016] border border-emerald-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 size={40} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono uppercase tracking-wider">
                  Confirmation Validée
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Créneau d&apos;Entretien Enregistré !
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto">
                  Merci <strong>{fullName}</strong>, votre entretien individuel avec les membres du bureau HEC Entrepreneurs est bien planifié.
                </p>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Candidat :</span>
                  <span className="font-bold text-white">{fullName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Jour :</span>
                  <span className="font-bold text-purple-300">Lundi</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Horaire de passage :</span>
                  <span className="font-mono font-bold text-emerald-300">{selectedSlot}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400">Lieu :</span>
                  <span className="text-white flex items-center gap-1 font-medium">
                    <MapPin size={13} className="text-pink-400" />
                    Salle Club HEC — IHEC Carthage
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Veuillez vous présenter 5 minutes à l&apos;avance devant la salle du club. Préparez-vous à exprimer votre motivation et votre ambition !
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Retour à l&apos;accueil
                </Link>
                <Link
                  href="/portail"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/20 hover:opacity-90 transition-opacity"
                >
                  Espace Membres
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
