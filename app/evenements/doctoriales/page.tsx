"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Sparkles,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  Clock,
  MapPin,
  Globe2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  FileArchive,
  Chrome,
} from "lucide-react";

export default function DoctorialesRegistrationPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    status: "",
    statusCustom: "",
    institution: "",
    institutionCustom: "",
    educationLevel: "",
    educationLevelCustom: "",
    specialty: "",
    specialtyCustom: "",
    sessionChoice: "",
    hasLaptopAndCharger: "",
    canAttendFullSession: "",
    preferredLanguage: "",
    confirmedPrerequisites: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status choices
  const statusOptions = [
    "Étudiant(e)",
    "Docteur",
    "Enseignant(e)-chercheur(se)",
    "Autre",
  ];

  // Institution choices
  const institutionOptions = [
    "IHEC Carthage",
    "Autre",
  ];

  // Education Level choices (L1, L2, L3 removed)
  const educationLevelOptions = [
    "Master M1",
    "Master M2",
    "Doctorat",
    "Autre",
  ];

  // Specialty choices
  const specialtyOptions = [
    "Marketing",
    "Management",
    "Entrepreneuriat",
    "Comptabilité",
    "Finance",
    "Informatique et technologies de l’information",
    "Autre",
  ];

  // Session choices
  const sessionOptions = [
    "Finance",
    "Comptabilité",
    "Marketing",
    "Management",
  ];

  // Attendance choices
  const attendanceOptions = ["Oui", "Non", "Pas encore sûr(e)"];

  // Language choices
  const languageOptions = [
    { label: "Français", flag: "🇫🇷" },
    { label: "Arabe", flag: "🇹🇳" },
    { label: "Anglais", flag: "🇬🇧" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, confirmedPrerequisites: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setErrorMessage("Veuillez renseigner votre nom complet et votre adresse e-mail.");
      return;
    }

    if (!formData.status) {
      setErrorMessage("Veuillez sélectionner votre statut.");
      return;
    }
    if (formData.status === "Autre" && !formData.statusCustom.trim()) {
      setErrorMessage("Veuillez préciser votre statut personnalisé.");
      return;
    }

    if (!formData.institution) {
      setErrorMessage("Veuillez sélectionner votre établissement.");
      return;
    }
    if (formData.institution === "Autre" && !formData.institutionCustom.trim()) {
      setErrorMessage("Veuillez préciser votre établissement.");
      return;
    }

    if (!formData.educationLevel) {
      setErrorMessage("Veuillez sélectionner votre niveau d’études.");
      return;
    }
    if (formData.educationLevel === "Autre" && !formData.educationLevelCustom.trim()) {
      setErrorMessage("Veuillez préciser votre niveau d’études personnalisé.");
      return;
    }

    if (!formData.specialty) {
      setErrorMessage("Veuillez sélectionner votre formation ou spécialité.");
      return;
    }
    if (formData.specialty === "Autre" && !formData.specialtyCustom.trim()) {
      setErrorMessage("Veuillez préciser votre formation ou spécialité.");
      return;
    }

    if (!formData.sessionChoice) {
      setErrorMessage("Veuillez choisir la session à laquelle vous souhaitez participer.");
      return;
    }

    if (!formData.hasLaptopAndCharger) {
      setErrorMessage("Veuillez indiquer si vous disposez d'un PC portable et d'un chargeur.");
      return;
    }

    if (!formData.canAttendFullSession) {
      setErrorMessage("Veuillez indiquer si vous pouvez participer pendant les 3 heures.");
      return;
    }

    if (!formData.preferredLanguage) {
      setErrorMessage("Veuillez choisir votre langue préférée pour l'atelier.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events/doctoriales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Une erreur est survenue lors de l'envoi.");
      }

      // Also send to sheets webhook if configured in client
      const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL;
      if (sheetsUrl) {
        try {
          await fetch(sheetsUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "doctoriales_registration",
              registrationId: result.registrationId,
              ...formData,
              submittedAt: new Date().toISOString(),
            }),
          });
        } catch (sErr) {
          console.warn("Client-side sheets notification error:", sErr);
        }
      }

      // Redirection vers la page de succès et ticket QR
      const query = new URLSearchParams({
        id: result.registrationId || `DOC-${Date.now()}`,
        name: formData.fullName,
        email: formData.email,
        status: formData.status === "Autre" ? formData.statusCustom : formData.status,
        institution: formData.institution === "Autre" ? formData.institutionCustom : formData.institution,
        session: formData.sessionChoice,
        lang: formData.preferredLanguage,
        specialty: formData.specialty === "Autre" ? formData.specialtyCustom : formData.specialty,
      }).toString();

      router.push(`/evenements/doctoriales/success?${query}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(
        err.message || "Erreur de connexion. Veuillez vérifier votre réseau et réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#070712] text-slate-100 py-10 sm:py-16 px-4 sm:px-6 selection:bg-purple-500 selection:text-white">
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-purple-600/15 blur-[160px] rounded-full" />
        <div className="absolute top-24 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 blur-[180px] rounded-full" />
      </div>

      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a0d_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a0d_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 px-4 py-2 rounded-full transition-all backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              École Doctorale • IHEC Carthage
            </span>
          </div>
        </motion.div>

        {/* Hero Card Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-[#0d0d1f]/95 to-[#090916] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl mb-8"
        >
          {/* Subtle Banner Graphic Overlay */}
          <div className="absolute top-0 right-0 w-full md:w-2/3 h-full opacity-30 md:opacity-40 pointer-events-none">
            <Image
              src="/hec-doctoriales-banner.jpg"
              alt="HEC Doctoriales"
              fill
              className="object-cover object-right mix-blend-screen"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#070712] via-[#070712]/90 to-transparent" />

          <div className="relative z-10">
            {/* Event Tag & Round Logo aligned opposite each other */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>HEC Doctoriales Series • 14e Édition</span>
              </div>

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] shrink-0">
                <Image
                  src="/ecole-doctorale-logo.jpg"
                  alt="École Doctorale IHEC Carthage"
                  fill
                  className="object-contain p-1"
                />
              </div>
            </div>

            {/* Title & Slogan */}
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-1.5">
                HEC <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300">Doctoriales</span>
              </h1>
              <p className="text-purple-200/90 italic font-serif text-base sm:text-lg">
                « Faire de la recherche doctorale un levier d&apos;excellence »
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal max-w-2xl">
              Rejoignez la 14<sup>e</sup> édition des <strong>HEC Doctoriales</strong> les <strong>5 &amp; 6 novembre 2026</strong> à l&apos;<strong>IHEC Carthage</strong>. Inscrivez-vous aux panels transversaux, séminaires de recherche et sessions de spécialités (Finance, Comptabilité, Marketing &amp; Management).
            </p>

            {/* Quick Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>5 &amp; 6 Novembre 2026 (09h00 – 17h30)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>IHEC Carthage</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Panels, Séminaires &amp; Sessions</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CRITICAL PREREQUISITES BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-purple-900/15 to-slate-900/90 p-5 sm:p-7 mb-8 relative overflow-hidden backdrop-blur-xl shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base sm:text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <span>Consignes & Prérequis indispensables pour chaque participant</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Pour participer activement aux ateliers pratiques, chaque participant doit se munir d&apos;un <strong>ordinateur portable avec son chargeur</strong> et s&apos;assurer d&apos;avoir préalablement installé les deux outils suivants :
              </p>
            </div>

            {/* Direct Download Badges */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <a
                href="https://www.google.com/chrome/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-medium text-xs sm:text-sm transition-all hover:scale-105 shadow-md shadow-blue-500/20"
              >
                <Chrome className="w-4 h-4 text-yellow-300" />
                <span>Google Chrome</span>
                <Download className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="https://www.7-zip.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm transition-all hover:scale-105 shadow-md shadow-emerald-500/20"
              >
                <FileArchive className="w-4 h-4 text-emerald-200" />
                <span>Utilitaire Zip (7-Zip)</span>
                <Download className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* REGISTRATION FORM */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl border border-slate-800 bg-[#0c0c1b]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle Header */}
          <div className="border-b border-slate-800/80 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                <span>Formulaire d&apos;inscription</span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Tous les champs marqués d&apos;une étoile (<span className="text-pink-400">*</span>) sont obligatoires.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 w-fit">
              5 &amp; 6 Novembre 2026 • IHEC Carthage
            </div>
          </div>

          {/* Form Element */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* QUESTION 1: Nom et prénom */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>
                  1. Nom et prénom <span className="text-pink-400">*</span>
                </span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Ex : Mohamed Ben Salah"
                className="w-full bg-[#121226] border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-4 py-3.5 rounded-xl text-white placeholder:text-slate-500 text-sm transition-all outline-none"
              />
            </div>

            {/* QUESTION 2: Adresse e-mail */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>
                  2. Adresse e-mail <span className="text-pink-400">*</span>
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  Pour recevoir votre badge & les liens
                </span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre.email@exemple.com"
                className="w-full bg-[#121226] border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-4 py-3.5 rounded-xl text-white placeholder:text-slate-500 text-sm transition-all outline-none"
              />
            </div>

            {/* QUESTION 3: Statut */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 block">
                3. Statut <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        status: opt,
                        statusCustom: opt !== "Autre" ? "" : prev.statusCustom,
                      }))
                    }
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.status === opt
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{opt}</span>
                    {formData.status === opt && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Champ conditionnel pour 'Autre' */}
              <AnimatePresence>
                {formData.status === "Autre" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      name="statusCustom"
                      required
                      value={formData.statusCustom}
                      onChange={handleInputChange}
                      placeholder="Précisez votre statut (ex : Consultant, Professionnel, etc.)"
                      className="w-full bg-[#14142e] border border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 px-4 py-3 rounded-xl text-white placeholder:text-slate-400 text-sm outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QUESTION 4: Établissement */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 block">
                4. Établissement <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {institutionOptions.map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        institution: inst,
                        institutionCustom: inst !== "Autre" ? "" : prev.institutionCustom,
                      }))
                    }
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.institution === inst
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{inst === "Autre" ? "Autre (à préciser)" : inst}</span>
                    {formData.institution === inst && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Champ conditionnel pour 'Autre' établissement */}
              <AnimatePresence>
                {formData.institution === "Autre" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      name="institutionCustom"
                      required
                      value={formData.institutionCustom}
                      onChange={handleInputChange}
                      placeholder="Précisez votre établissement ou université"
                      className="w-full bg-[#14142e] border border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 px-4 py-3 rounded-xl text-white placeholder:text-slate-400 text-sm outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QUESTION 5: Niveau d’études */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 block">
                5. Niveau d’études <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {educationLevelOptions.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        educationLevel: lvl,
                        educationLevelCustom:
                          lvl !== "Autre" ? "" : prev.educationLevelCustom,
                      }))
                    }
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                      formData.educationLevel === lvl
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{lvl}</span>
                    {formData.educationLevel === lvl && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Champ conditionnel pour 'Autre' */}
              <AnimatePresence>
                {formData.educationLevel === "Autre" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      name="educationLevelCustom"
                      required
                      value={formData.educationLevelCustom}
                      onChange={handleInputChange}
                      placeholder="Précisez votre niveau d’études"
                      className="w-full bg-[#14142e] border border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 px-4 py-3 rounded-xl text-white placeholder:text-slate-400 text-sm outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QUESTION 6: Formation ou spécialité */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 block">
                6. Formation ou spécialité <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specialtyOptions.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        specialty: spec,
                        specialtyCustom:
                          spec !== "Autre" ? "" : prev.specialtyCustom,
                        sessionChoice: sessionOptions.includes(spec)
                          ? spec
                          : prev.sessionChoice,
                      }))
                    }
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.specialty === spec
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="truncate pr-2">{spec}</span>
                    {formData.specialty === spec && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Champ conditionnel pour 'Autre' */}
              <AnimatePresence>
                {formData.specialty === "Autre" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      name="specialtyCustom"
                      required
                      value={formData.specialtyCustom}
                      onChange={handleInputChange}
                      placeholder="Précisez votre formation ou spécialité"
                      className="w-full bg-[#14142e] border border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 px-4 py-3 rounded-xl text-white placeholder:text-slate-400 text-sm outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QUESTION 7: Session souhaitée */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-sm font-semibold text-slate-200 block">
                  7. La session à laquelle vous souhaitez participer <span className="text-pink-400">*</span>
                </label>
                <span className="text-xs text-slate-400">
                  5 &amp; 6 Novembre (09h00 – 17h30)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sessionOptions.map((sess) => (
                  <button
                    key={sess}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        sessionChoice: sess,
                      }))
                    }
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.sessionChoice === sess
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-400"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{sess}</span>
                    {formData.sessionChoice === sess && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* QUESTION 8: Disposez-vous d’un ordinateur portable et de son chargeur ? */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-slate-200 block">
                8. Disposez-vous d’un ordinateur portable et de son chargeur ?{" "}
                <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, hasLaptopAndCharger: "Oui" }))
                  }
                  className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border font-semibold text-sm transition-all ${
                    formData.hasLaptopAndCharger === "Oui"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500"
                      : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>Oui</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, hasLaptopAndCharger: "Non" }))
                  }
                  className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border font-semibold text-sm transition-all ${
                    formData.hasLaptopAndCharger === "Non"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500"
                      : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span>Non</span>
                </button>
              </div>

              {formData.hasLaptopAndCharger === "Non" && (
                <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Note : Les cas pratiques nécessitent un ordinateur portable. Nous vous invitons vivement à en emprunter un pour la session.
                  </span>
                </p>
              )}
            </div>

            {/* QUESTION 9: Pouvez-vous participer pendant les trois heures complètes ? */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 block">
                9. Pouvez-vous participer pendant les trois heures complètes ?{" "}
                <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {attendanceOptions.map((att) => (
                  <button
                    key={att}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, canAttendFullSession: att }))
                    }
                    className={`flex items-center justify-center p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      formData.canAttendFullSession === att
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span>{att}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* QUESTION 10: Quelle est votre langue préférée pour l’atelier ? */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200">
                  10. Quelle est votre langue préférée pour l’atelier ?{" "}
                  <span className="text-pink-400">*</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.label}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, preferredLanguage: lang.label }))
                    }
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      formData.preferredLanguage === lang.label
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-400"
                        : "bg-[#121226] border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CONFIRMATION CHECKLIST (sans mention du PC) */}
            <div className="pt-4 border-t border-slate-800/80">
              <label className="relative flex items-start gap-3.5 p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 hover:border-purple-600/60 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmedPrerequisites"
                  checked={formData.confirmedPrerequisites}
                  onChange={handleCheckboxChange}
                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-[#121226] border-slate-700"
                />
                <span className="text-xs sm:text-sm text-slate-300 leading-snug">
                  Je confirme avoir bien pris connaissance des consignes de l&apos;atelier et avoir téléchargé <strong>Google Chrome</strong> ainsi qu&apos;un <strong>logiciel Zip</strong>.
                </span>
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Valider mon inscription à l&apos;Atelier</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">
                Un billet digital officiel avec QR Code vous sera délivré instantanément.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
