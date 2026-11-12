"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Building2,
  MessageSquareQuote,
  Armchair,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  CHAPELLE_SEATS,
  CHAPELLE_SEATS_BY_ID,
  SmeSeat,
} from "@/lib/sme-seating";

export default function OuvertureSmeRegistrationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    status: "Étudiant" as "Étudiant" | "Professionnel",
    institution: "IHEC Carthage",
    institutionCustom: "",
    oneWord: "",
    seatId: "",
  });

  const [bookedSeatIds, setBookedSeatIds] = useState<Set<string>>(new Set());
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBookedSeats = async () => {
    try {
      setLoadingSeats(true);
      const res = await fetch("/api/events/ouverture-sme", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.bookedSeatIds)) {
        setBookedSeatIds(new Set(data.bookedSeatIds));
      }
    } catch (err) {
      console.warn("Erreur lors du chargement des places:", err);
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchBookedSeats();
  }, []);

  const selectedSeat: SmeSeat | null = useMemo(
    () => (formData.seatId ? CHAPELLE_SEATS_BY_ID[formData.seatId] || null : null),
    [formData.seatId]
  );

  const isSeatSelectable = (seat: SmeSeat, currentStatus: "Étudiant" | "Professionnel") => {
    if (seat.preReserved || bookedSeatIds.has(seat.id)) return false;
    if (currentStatus === "Professionnel") {
      return seat.category === "professional";
    }
    return seat.category === "student";
  };

  const handleStatusChange = (newStatus: "Étudiant" | "Professionnel") => {
    setErrorMessage(null);
    const currentSeat = formData.seatId ? CHAPELLE_SEATS_BY_ID[formData.seatId] : null;
    const stillValid = currentSeat ? isSeatSelectable(currentSeat, newStatus) : false;

    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      seatId: stillValid ? prev.seatId : "",
    }));
  };

  const handleSeatClick = (seat: SmeSeat) => {
    setErrorMessage(null);
    if (!isSeatSelectable(seat, formData.status)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      seatId: prev.seatId === seat.id ? "" : seat.id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setErrorMessage("Veuillez renseigner votre nom complet et votre adresse e-mail.");
      return;
    }

    if (formData.institution === "Autre" && !formData.institutionCustom.trim()) {
      setErrorMessage("Veuillez préciser le nom de votre établissement ou organisme.");
      return;
    }

    if (!formData.oneWord.trim()) {
      setErrorMessage("Veuillez décrire l'entrepreneuriat en un seul mot.");
      return;
    }

    if (!formData.seatId) {
      setErrorMessage("Veuillez sélectionner une place disponible sur le plan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events/ouverture-sme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.seatTaken) {
          await fetchBookedSeats();
          setFormData((prev) => ({ ...prev, seatId: "" }));
        }
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      const resolvedInstitution =
        formData.institution === "Autre"
          ? formData.institutionCustom.trim()
          : formData.institution;

      const queryParams = new URLSearchParams({
        id: data.registrationId,
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        status: formData.status,
        institution: resolvedInstitution,
        seatId: formData.seatId,
        seatCode: data.seatCode,
      });

      router.push(`/evenements/ouverture-sme/success?${queryParams.toString()}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de soumettre le formulaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a clean, unlabeled chair: Blanc cassé if selectable, Rouge if reserved, Violet if selected
  const renderChair = (seat: SmeSeat) => {
    const isSelected = formData.seatId === seat.id;
    const canChoose = isSeatSelectable(seat, formData.status);

    let chairClass = "";
    if (isSelected) {
      chairClass =
        "bg-fuchsia-500 border-2 border-white shadow-[0_0_14px_rgba(217,70,239,0.95)] scale-115 z-20 cursor-pointer";
    } else if (canChoose) {
      // Blanc cassé (off-white)
      chairClass =
        "bg-[#f5f0e6] hover:bg-fuchsia-400 border border-[#d6cfc2] hover:border-white shadow-sm cursor-pointer hover:scale-110";
    } else {
      // Réservé (red)
      chairClass =
        "bg-red-600/85 border border-red-400/50 opacity-85 cursor-not-allowed";
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={!canChoose}
        onClick={() => handleSeatClick(seat)}
        aria-label={canChoose ? "Place disponible" : "Place réservée"}
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-t-md rounded-b-[3px] transition-all duration-150 flex flex-col items-center justify-start pt-0.5 select-none shrink-0 ${chairClass}`}
      >
        <span
          className={`w-3/5 h-[2px] rounded-full ${
            isSelected
              ? "bg-white/90"
              : canChoose
              ? "bg-stone-400"
              : "bg-red-200/50"
          }`}
        />
      </button>
    );
  };

  // Group seats symmetrically
  const topLeftCols = [1, 2, 3, 4].map((col) =>
    CHAPELLE_SEATS.filter((s) => s.wing === "top-left" && s.col === col)
  );
  const topRightCols = [1, 2, 3, 4].map((col) =>
    CHAPELLE_SEATS.filter((s) => s.wing === "top-right" && s.col === col)
  );
  const middleRows = [1, 2, 3, 4, 5, 6, 7, 8].map((row) => ({
    row,
    left: CHAPELLE_SEATS.filter((s) => s.wing === "middle-left" && s.row === row),
    right: CHAPELLE_SEATS.filter((s) => s.wing === "middle-right" && s.row === row),
  }));

  return (
    <div className="min-h-screen bg-[#07040e] text-slate-100 relative overflow-x-hidden selection:bg-fuchsia-500 selection:text-white">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] bg-fuchsia-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-fuchsia-500/20 bg-[#0d071b]/85 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-purple-200 hover:text-white transition"
          >
            <img
              src="/logo-club.png"
              alt="HEC Entrepreneurs"
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="font-extrabold tracking-wide text-white block leading-none">
                HEC ENTREPRENEURS
              </span>
              <span className="text-[10px] text-fuchsia-400 font-mono">
                SME 2026 • IHEC Carthage
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            18 Novembre 2026
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Semaine Mondiale de l&apos;Entrepreneuriat 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ouverture de la{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-300 to-pink-400">
              SME 2026
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-purple-200/80 mt-3 font-medium italic">
            « La Grande Mosaïque de l&apos;Entrepreneuriat — L&apos;art de bâtir l&apos;impossible »
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm text-purple-200/90">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-fuchsia-400" />
              <span>Mercredi 18 Novembre 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-fuchsia-400" />
              <span>09h30 – 12h00</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
              <MapPin className="w-4 h-4 text-fuchsia-400" />
              <span>La Chapelle — IHEC Carthage</span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1 : PERSONAL INFORMATION & QUESTION */}
          <div className="rounded-3xl bg-[#110a22]/90 border border-fuchsia-500/25 p-5 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-fuchsia-600/25">
                1
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Vos Informations
                </h2>
                <p className="text-xs text-purple-200/70">
                  Complétez vos coordonnées avant de choisir votre place
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nom & Prénom */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                  Nom & Prénom <span className="text-fuchsia-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="Ex : Youssef Ben Ali"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-fuchsia-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                  Adresse E-mail <span className="text-fuchsia-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="votre.email@exemple.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-fuchsia-500 transition"
                  />
                </div>
              </div>

              {/* Statut : Étudiant ou Professionnel */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                  Statut <span className="text-fuchsia-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Étudiant")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      formData.status === "Étudiant"
                        ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/30"
                        : "bg-white/[0.03] text-purple-200 border-white/15 hover:bg-white/[0.08]"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Étudiant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("Professionnel")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      formData.status === "Professionnel"
                        ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/30"
                        : "bg-white/[0.03] text-purple-200 border-white/15 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Professionnel</span>
                  </button>
                </div>
              </div>

              {/* Établissement : IHEC Carthage ou Autre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                  Établissement / Organisme <span className="text-fuchsia-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, institution: "IHEC Carthage" }))
                    }
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      formData.institution === "IHEC Carthage"
                        ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/30"
                        : "bg-white/[0.03] text-purple-200 border-white/15 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>IHEC Carthage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, institution: "Autre" }))
                    }
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      formData.institution === "Autre"
                        ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/30"
                        : "bg-white/[0.03] text-purple-200 border-white/15 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>Autre (à préciser)</span>
                  </button>
                </div>

                {formData.institution === "Autre" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      required
                      value={formData.institutionCustom}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          institutionCustom: e.target.value,
                        }))
                      }
                      placeholder="Précisez votre établissement ou entreprise..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-fuchsia-500/40 text-white text-sm focus:outline-none focus:border-fuchsia-400"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Question : Comment décririez-vous l'entrepreneuriat en un seul mot ? */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <label className="block text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span>
                  Comment décririez-vous l&apos;entrepreneuriat en un seul mot ?{" "}
                  <span className="text-fuchsia-400">*</span>
                </span>
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={formData.oneWord}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, oneWord: e.target.value }))
                }
                placeholder="Votre réponse en un seul mot..."
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border border-fuchsia-500/30 text-white text-sm sm:text-base font-semibold focus:outline-none focus:border-fuchsia-400 placeholder:font-normal placeholder:text-purple-300/40"
              />
            </div>
          </div>

          {/* STEP 2 : SYMMETRIC CINEMA SEAT SELECTION */}
          <div className="rounded-3xl bg-[#0b0616] border-2 border-fuchsia-500/30 p-4 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-fuchsia-600/25 shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-fuchsia-400" />
                    <span>Choisissez votre Place</span>
                  </h2>
                  <p className="text-xs text-purple-200/70">
                    Cliquez sur une chaise disponible pour sélectionner votre place
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchBookedSeats}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-purple-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSeats ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </div>

            {/* Minimal 3-state Legend: Disponible (Blanc cassé), Réservé (Rouge), Sélectionné */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-6 py-3 px-4 rounded-2xl bg-black/50 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-t-md rounded-b-[2px] bg-[#f5f0e6] border border-[#d6cfc2] inline-block" />
                <span className="text-slate-200 font-medium">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-t-md rounded-b-[2px] bg-red-600/85 border border-red-400/50 inline-block" />
                <span className="text-red-300 font-medium">Réservé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-t-md rounded-b-[2px] bg-fuchsia-500 border-2 border-white inline-block" />
                <span className="text-fuchsia-300 font-semibold">Votre place</span>
              </div>
            </div>

            {/* PERFECTLY SYMMETRIC ARCHITECTURAL PLAN OF LA CHAPELLE */}
            <div className="w-full overflow-x-auto pb-2">
              <div className="w-[560px] sm:w-[640px] mx-auto py-4 px-2 select-none">
                {/* TOP SECTION : Left Wing + Center Gap + Right Wing */}
                <div className="grid grid-cols-[176px_1fr_176px] sm:grid-cols-[200px_1fr_200px] items-stretch">
                  {/* Top-Left Curved Alcove (4 cols x 5 chairs) */}
                  <div className="rounded-l-[80px] border-t-[3px] border-l-[3px] border-b-[3px] border-red-500 bg-[#080510] py-4 pl-6 pr-3 flex items-center justify-center gap-2 sm:gap-2.5">
                    {topLeftCols.map((colSeats, cIdx) => (
                      <div key={`tl-c-${cIdx}`} className="flex flex-col gap-1.5">
                        {colSeats.map((seat) => renderChair(seat))}
                      </div>
                    ))}
                  </div>

                  {/* Center Top Space */}
                  <div className="flex flex-col items-center justify-end pb-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300/50">
                      SCÈNE
                    </div>
                  </div>

                  {/* Top-Right Curved Alcove (4 cols x 5 chairs) */}
                  <div className="rounded-r-[80px] border-t-[3px] border-r-[3px] border-b-[3px] border-red-500 bg-[#080510] py-4 pr-6 pl-3 flex items-center justify-center gap-2 sm:gap-2.5">
                    {topRightCols.map((colSeats, cIdx) => (
                      <div key={`tr-c-${cIdx}`} className="flex flex-col gap-1.5">
                        {colSeats.map((seat) => renderChair(seat))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MIDDLE NAVE SECTION : Directly connected to the inner walls */}
                <div className="w-[376px] sm:w-[424px] mx-auto -mt-[3px] border-x-[3px] border-b-[3px] border-red-500 bg-[#080510] pt-5 pb-6 px-4 sm:px-5">
                  <div className="grid grid-cols-[1fr_54px_1fr] sm:grid-cols-[1fr_64px_1fr] gap-3 sm:gap-4 items-stretch">
                    {/* Middle-Left (8 rows x 5 chairs) */}
                    <div className="flex flex-col justify-between gap-2">
                      {middleRows.map(({ row, left }) => (
                        <div
                          key={`ml-r-${row}`}
                          className="flex items-center justify-between gap-1 sm:gap-1.5"
                        >
                          {left.map((seat) => renderChair(seat))}
                        </div>
                      ))}
                    </div>

                    {/* Central Piste */}
                    <div className="rounded-sm bg-[#b9b2d8] text-slate-950 flex items-center justify-center shadow-inner">
                      <span
                        className="font-bold text-sm sm:text-base tracking-[0.2em] lowercase"
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                        }}
                      >
                        piste
                      </span>
                    </div>

                    {/* Middle-Right (8 rows x 5 chairs) */}
                    <div className="flex flex-col justify-between gap-2">
                      {middleRows.map(({ row, right }) => (
                        <div
                          key={`mr-r-${row}`}
                          className="flex items-center justify-between gap-1 sm:gap-1.5"
                        >
                          {right.map((seat) => renderChair(seat))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Seat Reveal Box (Only shows the Word + Line Number AFTER selection) */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#160d2e] border border-fuchsia-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shrink-0">
                  <Armchair className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-purple-300 uppercase tracking-wider font-bold">
                    Votre Place Sélectionnée
                  </div>
                  {selectedSeat ? (
                    <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
                      <span className="text-fuchsia-400 font-mono tracking-wide">
                        {selectedSeat.code}
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-purple-200/60 font-medium mt-0.5">
                      Cliquez sur une chaise disponible (blanc cassé) pour découvrir le numéro de votre place
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[320px] py-4 px-8 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-[0_12px_35px_rgba(192,38,211,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Confirmation en cours...</span>
                </>
              ) : (
                <>
                  <span>
                    Confirmer ma place {selectedSeat ? `(${selectedSeat.code})` : ""}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
