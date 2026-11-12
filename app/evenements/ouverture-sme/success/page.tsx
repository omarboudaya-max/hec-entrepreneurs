"use client";

import React, { Suspense, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  Sparkles,
  Armchair,
  ArrowLeft,
  User,
  Building2,
  Phone,
} from "lucide-react";

function OuvertureSmeTicketContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || `SME-${Date.now().toString(36).toUpperCase()}`;
  const name = searchParams.get("name") || "Participant";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const status = searchParams.get("status") || "Étudiant";
  const statusDetail = searchParams.get("statusDetail") || "";
  const institution = searchParams.get("institution") || "IHEC Carthage";
  const seatCode = searchParams.get("seatCode") || "IMPACT 1";
  const autoDownload = searchParams.get("download") === "1";

  const qrValue = `HEC-SME-2026|ID:${id}|SEAT:${seatCode}|NAME:${name}`;
  const hasAutoDownloadedRef = useRef(false);

  const downloadBadge = useCallback(() => {
    const qrCanvas = document.getElementById("sme-qr-canvas") as HTMLCanvasElement;
    if (!qrCanvas) return;

    const badgeCanvas = document.createElement("canvas");
    const width = 800;
    const height = 1120;
    badgeCanvas.width = width;
    badgeCanvas.height = height;

    const ctx = badgeCanvas.getContext("2d");
    if (!ctx) return;

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#190d33");
    bgGrad.addColorStop(0.5, "#0f0720");
    bgGrad.addColorStop(1, "#070310");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = "#d946ef";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 2. Top Header Banner
    const headerGrad = ctx.createLinearGradient(20, 20, width - 20, 200);
    headerGrad.addColorStop(0, "#701a75");
    headerGrad.addColorStop(0.5, "#4c1d95");
    headerGrad.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(23, 23, width - 46, 175);

    ctx.fillStyle = "#f5d0fe";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CLUB HEC ENTREPRENEURS • IHEC CARTHAGE", width / 2, 78);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 40px sans-serif";
    ctx.fillText("OUVERTURE DE LA SME 2026", width / 2, 132);

    ctx.fillStyle = "#e9d5ff";
    ctx.font = "600 18px sans-serif";
    ctx.fillText("BADGE D'ACCÈS OFFICIEL", width / 2, 168);

    // 3. Prominent Seat Box
    ctx.fillStyle = "#261247";
    ctx.strokeStyle = "#e879f9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(70, 230, width - 140, 150, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f0abfc";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("🪑 VOTRE PLACE RÉSERVÉE", width / 2, 275);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 58px monospace";
    ctx.fillText(seatCode, width / 2, 348);

    // 4. White Frame + QR Code
    const qrBoxSize = 350;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 415;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
    ctx.fill();

    ctx.drawImage(qrCanvas, qrBoxX + 25, qrBoxY + 25, qrBoxSize - 50, qrBoxSize - 50);

    // 5. Reference ID
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 24px monospace";
    ctx.fillText(id, width / 2, 810);

    // 6. Participant Details Box
    ctx.fillStyle = "#120924";
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, 840, width - 140, 195, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(name, width / 2, 888);

    const statusLine = statusDetail
      ? `${status} (${statusDetail}) • ${institution}`
      : `${status} • ${institution}`;
    ctx.fillStyle = "#d8b4fe";
    ctx.font = "600 20px sans-serif";
    ctx.fillText(statusLine, width / 2, 926);

    ctx.fillStyle = "#f0abfc";
    ctx.font = "bold 21px sans-serif";
    ctx.fillText("Mercredi 18 Novembre 2026 • Check-in : 08h30 | Début : 09h00", width / 2, 968);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "600 19px sans-serif";
    ctx.fillText("📍 La Chapelle — IHEC Carthage", width / 2, 1005);

    // 7. Footer
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 16px sans-serif";
    ctx.fillText(
      "Présentez ce badge (QR Code + Place) à l'entrée dès 08h30.",
      width / 2,
      1072
    );

    const pngUrl = badgeCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Badge-SME-2026-${seatCode.replace(/\s+/g, "-")}-${name.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }, [id, institution, name, seatCode, status, statusDetail]);

  useEffect(() => {
    if (autoDownload && !hasAutoDownloadedRef.current) {
      hasAutoDownloadedRef.current = true;
      const timer = setTimeout(() => {
        downloadBadge();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, downloadBadge]);

  return (
    <div className="max-w-xl mx-auto">
      {/* Top Confirmation Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center mb-4 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
          Place & Billet Confirmés
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Merci {name} !
        </h1>
        <p className="text-purple-200/80 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Votre place <strong className="text-fuchsia-300 font-mono">{seatCode}</strong> est réservée pour l&apos;
          <strong>Ouverture de la SME 2026</strong>. Un e-mail de confirmation contenant votre billet vous a été envoyé{email ? ` à ${email}` : ""}.
        </p>
      </motion.div>

      {/* CINEMA PASS CARD */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-fuchsia-500/35 bg-gradient-to-b from-[#170e2e] to-[#0b0618] shadow-[0_25px_65px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-900/70 via-purple-900/60 to-indigo-950/80 p-6 border-b border-fuchsia-500/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo-club.png"
              alt="HEC Entrepreneurs"
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-fuchsia-300">
                HEC Entrepreneurs • IHEC Carthage
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white leading-tight mt-0.5">
                Ouverture de la SME 2026
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/40 font-black">
              {seatCode}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Chair Number Highlight */}
          <div className="p-5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shrink-0">
              <Armchair className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-300">
                Votre Place Réservée
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
                {seatCode}
              </div>
            </div>
          </div>

          {/* QR Code & Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#080411] p-5 rounded-2xl border border-white/10">
            <div className="bg-white p-3.5 rounded-2xl shadow-xl shrink-0">
              <QRCodeCanvas
                id="sme-qr-canvas"
                value={qrValue}
                size={155}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
              <div className="text-[11px] font-mono uppercase tracking-widest text-fuchsia-400 font-bold">
                PASS D&apos;ACCÈS PERSONNEL
              </div>
              <div className="text-lg font-mono font-extrabold text-sky-400 tracking-wider">
                {id}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-purple-100">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <User className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>
                    <strong>{name}</strong> ({status}
                    {statusDetail ? ` — ${statusDetail}` : ""})
                  </span>
                </div>
                {phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>{phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>{institution}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Mercredi 18 Novembre 2026 • Check-in : 08h30 | Début : 09h00</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>La Chapelle — IHEC Carthage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={downloadBadge}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger mon Badge (QR + Place {seatCode})</span>
            </button>

            <Link
              href="/evenements/ouverture-sme"
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OuvertureSmeSuccessPage() {
  return (
    <div className="min-h-screen bg-[#07040e] text-white py-12 px-4">
      <Suspense
        fallback={
          <div className="text-center py-20 text-purple-300 font-mono text-sm">
            Génération de votre billet officiel...
          </div>
        }
      >
        <OuvertureSmeTicketContent />
      </Suspense>
    </div>
  );
}
