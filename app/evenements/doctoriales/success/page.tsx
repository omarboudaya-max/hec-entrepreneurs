"use client";

import { Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import {
  BrainCircuit,
  CheckCircle2,
  Download,
  Calendar,
  Laptop,
  Chrome,
  FileArchive,
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

function SuccessTicketContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || `DOC-${Date.now().toString(36).toUpperCase()}`;
  const name = searchParams.get("name") || "Participant";
  const email = searchParams.get("email") || "";
  const status = searchParams.get("status") || "Participant";
  const institution = searchParams.get("institution") || "IHEC Carthage";
  const session = searchParams.get("session") || "";
  const specialty = searchParams.get("specialty") || "Non spécifié";
  const isMgmt = searchParams.get("mgmt") === "1" || session.includes("Management | IA & Prise de décision");
  const sessionList = session ? session.split(" • ") : [];

  // Download pass as PNG
  const downloadBadge = () => {
    const canvas = document.getElementById("doctoriales-qr") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Pass-HEC-Doctoriales-${name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Add event to calendar (.ics download)
  const downloadCalendarFile = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HEC Entrepreneurs//HEC Doctoriales 2026//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "DTSTART:20261106T080000Z",
      "DTEND:20261106T113000Z",
      `SUMMARY:HEC Doctoriales - Session ${session}`,
      `DESCRIPTION:HEC Doctoriales (5 & 6 novembre 2026) - Faire de la recherche doctorale un levier d'excellence.\\nSession: ${session}\\nParticipant: ${name}\\nÉtablissement: ${institution}\\nNuméro de pass: ${id}`,
      `LOCATION:IHEC Carthage, Tunis`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "HEC-Doctoriales-2026.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top Success Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Inscription Confirmée
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Votre place est réservée !
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Félicitations <strong>{name}</strong>, votre inscription aux <strong>HEC Doctoriales Series</strong> est bien validée.
        </p>
      </motion.div>

      {/* DIGITAL PASS TICKET */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#13122c] to-[#0d0c1e] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden relative"
      >
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900/80 p-6 border-b border-purple-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-purple-400/50 shadow-md shrink-0">
              <Image
                src="/ecole-doctorale-logo.jpg"
                alt="École Doctorale IHEC Carthage"
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                HEC Doctoriales Series • 14e Édition
              </div>
              <div className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                Faire de la recherche doctorale un levier d&apos;excellence
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-200 border border-purple-500/40 font-semibold">
              PASS OFFICIEL
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0a0a16] p-5 rounded-2xl border border-slate-800">
            {/* QR Code Canvas */}
            <div className="bg-white p-3 rounded-xl shadow-lg shrink-0">
              <QRCodeCanvas
                id="doctoriales-qr"
                value={`HEC-DOCTORIALES|ID:${id}|NAME:${name}|INST:${institution}|STATUS:${status}`}
                size={140}
                level={"H"}
                includeMargin={true}
              />
            </div>

            {/* Info details */}
            <div className="space-y-2 text-center sm:text-left w-full overflow-hidden">
              <div className="text-xs text-slate-400 font-mono">IDENTIFIANT UNIQUE</div>
              <div className="text-base sm:text-lg font-mono font-bold text-cyan-400 truncate tracking-wider">
                {id}
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Participant</span>
                  <span className="text-white font-medium truncate block">{name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Statut</span>
                  <span className="text-white font-medium truncate block">{status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Établissement</span>
                  <span className="text-white font-medium truncate block">{institution}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Spécialité</span>
                  <span className="text-white font-medium truncate block">{specialty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Sessions List */}
          {sessionList.length > 0 && (
            <div className="rounded-2xl bg-[#0a0a16] border border-slate-800 p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Sessions sélectionnées
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {sessionList.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Logistics Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <span>5 &amp; 6 Novembre 2026 (09h00 – 17h30)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>IHEC Carthage</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={downloadBadge}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger mon Pass (PNG)</span>
            </button>

            <button
              onClick={downloadCalendarFile}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Ajouter à mon Agenda</span>
            </button>
          </div>
        </div>

        {/* PREREQUISITES REMINDER BOX INSIDE PASS (Uniquement si IA & Prise de décision est sélectionné) */}
        {isMgmt && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <Laptop className="w-4 h-4 text-amber-400" />
              <span>Informations pratiques &amp; Prérequis</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              L’atelier se déroule sur l’ensemble de la matinée, de <strong>09h00 à 12h30</strong>.
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour participer aux activités pratiques, il est recommandé de prévoir un <strong>ordinateur portable avec chargeur</strong> et d&apos;installer au préalable <strong>Google Chrome</strong>.
            </p>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              📌 À la fin de l’activité, vous devrez télécharger <strong>deux fichiers</strong> et les regrouper dans un seul dossier compressé au format <strong>.zip</strong>. Si vous rencontrez des difficultés, utilisez directement notre outil en ligne :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href="https://www.google.com/chrome/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-blue-500 text-xs text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Chrome className="w-4 h-4 text-yellow-300" />
                  <span>Google Chrome</span>
                </div>
                <Download className="w-3.5 h-3.5 text-blue-400 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <Link
                href="/evenements/doctoriales/zip"
                className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 text-xs text-purple-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-cyan-300" />
                  <span>Outil de création .ZIP en ligne</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* Return to home link */}
      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retourner au site d&apos;accueil</span>
        </Link>
      </div>
    </div>
  );
}

export default function DoctorialesSuccessPage() {
  return (
    <main className="min-h-screen bg-[#070712] text-slate-100 py-12 px-4 sm:px-6 relative overflow-x-hidden flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[180px] rounded-full pointer-events-none -z-10" />

      <Suspense
        fallback={
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Génération de votre pass officiel...</p>
          </div>
        }
      >
        <SuccessTicketContent />
      </Suspense>
    </main>
  );
}
