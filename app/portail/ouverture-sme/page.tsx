"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import {
  CHAPELLE_SEATS,
  SmeSeat,
} from "@/lib/sme-seating";
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  UserCheck,
  Users,
  Armchair,
  RotateCcw,
  Sparkles,
  Download,
  MessageSquareQuote,
} from "lucide-react";

interface SmeRegistration {
  id: string;
  qr_code_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  status_detail: string;
  institution: string;
  seat_id: string;
  seat_code: string;
  seat_label: string;
  one_word: string;
  created_at: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

interface ScanFeedback {
  scanResult: "granted" | "already_used" | "invalid" | "undone";
  message: string;
  participant?: SmeRegistration;
  alreadyCheckedInAt?: string;
  alreadyCheckedInBy?: string;
}

export default function PortailOuvertureSmeScannerPage() {
  const { user, canScanDoctoriales, loading: authLoading } = usePortailAuth();

  const [registrations, setRegistrations] = useState<SmeRegistration[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [scanningSubmit, setScanningSubmit] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const scannerRef = useRef<any>(null);
  const scanBusyRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number }>({
    code: "",
    time: 0,
  });

  // Filters & active seat inspection
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "pending" | "pro" | "student">("all");
  const [inspectedSeatId, setInspectedSeatId] = useState<string | null>(null);

  const fetchSmeData = useCallback(async () => {
    try {
      setLoadingData(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/ouverture-sme", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.registrations) {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error("Erreur de chargement Ouverture SME:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && canScanDoctoriales) {
      fetchSmeData();
    }
  }, [authLoading, user, canScanDoctoriales, fetchSmeData]);

  // Cooldown timer for camera rescan protection
  useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const t = setTimeout(() => {
      setCooldownSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearTimeout(t);
  }, [cooldownSecondsLeft]);

  const submitScan = useCallback(
    async (qrText: string, forceUndo = false) => {
      if (!qrText.trim()) return;
      setScanningSubmit(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch("/api/portail/ouverture-sme", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            qrInput: qrText.trim(),
            forceUndo,
          }),
        });

        const data = await res.json();
        if (data.scanResult) {
          setScanFeedback(data);
          await fetchSmeData();
        } else if (data.error) {
          setScanFeedback({
            scanResult: "invalid",
            message: data.error,
          });
        }
      } catch (err: any) {
        setScanFeedback({
          scanResult: "invalid",
          message: err.message || "Erreur réseau lors de la vérification du QR.",
        });
      } finally {
        setScanningSubmit(false);
      }
    },
    [fetchSmeData]
  );

  // Start / Stop Camera
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);

    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5QrCode = new Html5Qrcode("sme-qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          async (decodedText: string) => {
            const cleaned = decodedText.trim();
            const now = Date.now();

            if (scanBusyRef.current) return;
            if (
              lastScannedCodeRef.current.code === cleaned &&
              now - lastScannedCodeRef.current.time < 12000
            ) {
              return;
            }

            scanBusyRef.current = true;
            lastScannedCodeRef.current = { code: cleaned, time: now };
            setCooldownSecondsLeft(4);

            try {
              if (scannerRef.current?.pause) {
                scannerRef.current.pause(true);
              }
            } catch {
              // ignore pause error
            }

            await submitScan(cleaned, false);

            setTimeout(() => {
              try {
                if (scannerRef.current?.resume) {
                  scannerRef.current.resume();
                }
              } catch {
                // ignore resume error
              }
              scanBusyRef.current = false;
            }, 4000);
          },
          () => {
            // frame scan ignore
          }
        );
      } catch (err: any) {
        setCameraError(
          "Impossible d'accéder à la caméra. Vérifiez les permissions de votre navigateur ou utilisez la saisie manuelle."
        );
        setCameraActive(false);
      }
    }, 150);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Map seat_id -> SmeRegistration
  const registrationBySeatId = useMemo(() => {
    const map: Record<string, SmeRegistration> = {};
    for (const r of registrations) {
      if (r.seat_id) {
        map[r.seat_id] = r;
      }
    }
    return map;
  }, [registrations]);

  const inspectedRegistration = inspectedSeatId
    ? registrationBySeatId[inspectedSeatId] || null
    : null;

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.seat_code.toLowerCase().includes(q) ||
        r.one_word.toLowerCase().includes(q) ||
        r.qr_code_id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "present") return r.checkedIn;
      if (statusFilter === "pending") return !r.checkedIn;
      if (statusFilter === "pro") return r.status.toLowerCase().includes("professionnel");
      if (statusFilter === "student") return !r.status.toLowerCase().includes("professionnel");
      return true;
    });
  }, [registrations, searchQuery, statusFilter]);

  const totalCount = registrations.length;
  const presentCount = registrations.filter((r) => r.checkedIn).length;

  const exportCsv = () => {
    const headers = [
      "ID Pass",
      "Nom & Prénom",
      "Email",
      "Téléphone",
      "Statut",
      "Classe / Profession",
      "Établissement",
      "Chaise",
      "Mot (Entrepreneuriat)",
      "Présent",
      "Heure d'entrée",
    ];
    const rows = registrations.map((r) => [
      r.qr_code_id,
      `"${(r.full_name || "").replace(/"/g, '""')}"`,
      r.email,
      `"${(r.phone || "").replace(/"/g, '""')}"`,
      r.status,
      `"${(r.status_detail || "").replace(/"/g, '""')}"`,
      `"${(r.institution || "").replace(/"/g, '""')}"`,
      r.seat_code,
      `"${(r.one_word || "").replace(/"/g, '""')}"`,
      r.checkedIn ? "OUI" : "NON",
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString("fr-FR") : "",
    ]);

    const csv = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ouverture-SME-2026-Inscrits-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const renderAdminChair = (seat: SmeSeat) => {
    const reg = registrationBySeatId[seat.id];
    const isInspected = inspectedSeatId === seat.id;

    let style = "";
    if (reg?.checkedIn) {
      style = "bg-emerald-500 border-white shadow-[0_0_10px_rgba(16,185,129,0.8)]";
    } else if (reg) {
      style = "bg-fuchsia-500 border-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.6)]";
    } else if (seat.preReserved) {
      style = "bg-red-700/70 border-red-400/40 opacity-75";
    } else {
      style = "bg-[#f5f0e6]/80 border-[#d6cfc2]";
    }

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => setInspectedSeatId(seat.id)}
        title={
          reg
            ? `${seat.code} — ${reg.full_name} (${reg.checkedIn ? "PRÉSENT" : "Réservé"}) • Mot: « ${reg.one_word} »`
            : `${seat.code} — ${seat.preReserved ? "Réservé" : "Libre"}`
        }
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-t-md rounded-b-[3px] border transition ${style} ${
          isInspected ? "ring-2 ring-white scale-115 z-10" : ""
        }`}
      />
    );
  };

  if (!authLoading && !canScanDoctoriales) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-300">
          Accès réservé au Développeur et au compte Scanner.
        </div>
      </div>
    );
  }

  const topLeftRows = [1, 2, 3, 4].map((c) =>
    CHAPELLE_SEATS.filter((s) => s.wing === "top-left" && s.col === c)
  );
  const topRightRows = [1, 2, 3, 4].map((c) =>
    CHAPELLE_SEATS.filter((s) => s.wing === "top-right" && s.col === c)
  );
  const middleRows = [1, 2, 3, 4, 5, 6, 7, 8].map((r) => ({
    row: r,
    left: CHAPELLE_SEATS.filter((s) => s.wing === "middle-left" && s.row === r),
    right: CHAPELLE_SEATS.filter((s) => s.wing === "middle-right" && s.row === r),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Event Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Contrôle d&apos;Accès & Plan des Sièges • La Chapelle
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ouverture de la SME 2026 — Scan QR
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portail/doctoriales"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition"
          >
            Aller vers Scan Doctoriales →
          </Link>
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl bg-fuchsia-600/20 hover:bg-fuchsia-600/30 border border-fuchsia-500/40 text-xs font-bold text-fuchsia-300 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={fetchSmeData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#121217] border border-white/10">
          <div className="text-xs text-gray-400">Chaises Réservées</div>
          <div className="text-2xl font-black text-white mt-1">{totalCount} / 87</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#121217] border border-emerald-500/30">
          <div className="text-xs text-emerald-400">Présents (Scannés)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{presentCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#121217] border border-amber-500/30">
          <div className="text-xs text-amber-400">En attente d&apos;arrivée</div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {Math.max(0, totalCount - presentCount)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#121217] border border-fuchsia-500/30">
          <div className="text-xs text-fuchsia-300">Taux de Présence</div>
          <div className="text-2xl font-black text-fuchsia-400 mt-1">
            {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* SCANNER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Camera + Manual Input */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-fuchsia-400" />
              <span>Scanner un Billet QR (Entrée Unique)</span>
            </h2>

            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-fuchsia-600/30"
              >
                <Camera className="w-4 h-4" />
                <span>Activer Caméra</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5"
              >
                <CameraOff className="w-4 h-4" />
                <span>Arrêter Caméra</span>
              </button>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {cameraError}
            </div>
          )}

          {cameraActive && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-fuchsia-500/40 bg-black">
              <div id="sme-qr-reader" className="w-full" />
              {cooldownSecondsLeft > 0 && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                  <div className="text-sm font-bold text-white">
                    QR lu ! Verrouillage anti-double scan...
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    Prochain scan dans {cooldownSecondsLeft}s
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitScan(manualInput, false);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Code SME-XXXX, N° Chaise (ex: G3-2) ou Email..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-fuchsia-500"
            />
            <button
              type="submit"
              disabled={scanningSubmit}
              className="px-4 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs sm:text-sm shrink-0 disabled:opacity-50"
            >
              Valider
            </button>
          </form>
        </div>

        {/* Right: Instant Scan Result Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 flex flex-col justify-center">
          {!scanFeedback ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Scannez un QR Code ou saisissez un numéro de chaise pour afficher le siège et valider l&apos;entrée du participant.
            </div>
          ) : (
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                scanFeedback.scanResult === "granted"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                  : scanFeedback.scanResult === "already_used"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                  : scanFeedback.scanResult === "undone"
                  ? "bg-blue-500/10 border-blue-500/40 text-blue-200"
                  : "bg-red-500/10 border-red-500/40 text-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {scanFeedback.scanResult === "granted" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : scanFeedback.scanResult === "already_used" ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider font-bold">
                    {scanFeedback.scanResult === "granted"
                      ? "ENTRÉE VALIDÉE"
                      : scanFeedback.scanResult === "already_used"
                      ? "DOUBLON DÉTECTÉ (DÉJÀ ENTRÉ)"
                      : scanFeedback.scanResult === "undone"
                      ? "POINTAGE ANNULÉ"
                      : "CODE INVALIDE"}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {scanFeedback.message}
                  </div>
                </div>
              </div>

              {scanFeedback.participant && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-base font-extrabold text-white">
                        {scanFeedback.participant.full_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {scanFeedback.participant.status} • {scanFeedback.participant.institution}
                      </div>
                    </div>

                    <div className="px-3.5 py-2 rounded-xl bg-fuchsia-600 text-white font-mono font-black text-lg shadow">
                      🪑 {scanFeedback.participant.seat_code}
                    </div>
                  </div>

                  <div className="text-xs text-purple-200 flex items-center justify-between pt-2 border-t border-white/10">
                    <span>{scanFeedback.participant.seat_label}</span>
                    <span className="text-pink-300 font-bold italic">
                      Mot : « {scanFeedback.participant.one_word} »
                    </span>
                  </div>

                  {scanFeedback.participant.checkedIn && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => submitScan(scanFeedback.participant!.qr_code_id, true)}
                        className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-300 underline"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Annuler ce pointage</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LIVE INTERACTIVE SEAT MAP OF LA CHAPELLE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Armchair className="w-5 h-5 text-fuchsia-400" />
              <span>Plan en Direct de La Chapelle</span>
            </h2>
            <p className="text-xs text-gray-400">
              Vert = Participant présent dans la salle • Rose = Siège réservé (en attente) • Cliquez sur une chaise pour voir le participant
            </p>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-2">
          <div className="w-[560px] sm:w-[640px] mx-auto py-4 px-2 select-none">
            {/* Top Wings */}
            <div className="grid grid-cols-[176px_1fr_176px] sm:grid-cols-[200px_1fr_200px] items-stretch">
              <div className="rounded-l-[80px] border-t-[3px] border-l-[3px] border-b-[3px] border-red-500 bg-[#080510] py-4 pl-6 pr-3 flex items-center justify-center gap-2 sm:gap-2.5">
                {topLeftRows.map((col, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    {col.map((s) => renderAdminChair(s))}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-end pb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300/50">
                  SCÈNE
                </span>
              </div>

              <div className="rounded-r-[80px] border-t-[3px] border-r-[3px] border-b-[3px] border-red-500 bg-[#080510] py-4 pr-6 pl-3 flex items-center justify-center gap-2 sm:gap-2.5">
                {topRightRows.map((col, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    {col.map((s) => renderAdminChair(s))}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Nave */}
            <div className="w-[376px] sm:w-[424px] mx-auto -mt-[3px] border-x-[3px] border-b-[3px] border-red-500 bg-[#080510] pt-5 pb-6 px-4 sm:px-5">
              <div className="grid grid-cols-[1fr_54px_1fr] sm:grid-cols-[1fr_64px_1fr] gap-3 sm:gap-4 items-stretch">
                <div className="flex flex-col justify-between gap-2">
                  {middleRows.map(({ row, left }) => (
                    <div key={row} className="flex items-center justify-between gap-1 sm:gap-1.5">
                      {left.map((s) => renderAdminChair(s))}
                    </div>
                  ))}
                </div>

                <div className="rounded-sm bg-[#b9b2d8] text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center lowercase tracking-[0.2em]">
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    piste
                  </span>
                </div>

                <div className="flex flex-col justify-between gap-2">
                  {middleRows.map(({ row, right }) => (
                    <div key={row} className="flex items-center justify-between gap-1 sm:gap-1.5">
                      {right.map((s) => renderAdminChair(s))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspected Chair Details */}
        {inspectedSeatId && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {inspectedRegistration ? (
              <>
                <div>
                  <div className="text-sm font-bold text-white">
                    Chaise <span className="text-fuchsia-400 font-mono">{inspectedRegistration.seat_code}</span> —{" "}
                    {inspectedRegistration.full_name} ({inspectedRegistration.status})
                  </div>
                  <div className="text-xs text-gray-400">
                    {inspectedRegistration.email} • {inspectedRegistration.institution} • Mot :{" "}
                    <strong className="text-pink-300">« {inspectedRegistration.one_word} »</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!inspectedRegistration.checkedIn ? (
                    <button
                      type="button"
                      onClick={() => submitScan(inspectedRegistration.qr_code_id, false)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Pointer Présent
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => submitScan(inspectedRegistration.qr_code_id, true)}
                      className="px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold"
                    >
                      Annuler Présence
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-400">
                Chaise <strong className="text-white font-mono">{inspectedSeatId}</strong> : Aucun participant inscrit sur ce siège.
              </div>
            )}
          </div>
        )}
      </div>

      {/* PARTICIPANTS TABLE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-400" />
            <span>Liste des Participants & Mots ({filteredRegistrations.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, chaise, mot..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {(
              [
                { id: "all", label: "Tous" },
                { id: "present", label: "Présents" },
                { id: "pending", label: "En attente" },
                { id: "pro", label: "Pros" },
                { id: "student", label: "Étudiants" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? "bg-fuchsia-600 text-white"
                    : "bg-white/[0.04] text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Chaise</th>
                <th className="py-3 px-3">Participant</th>
                <th className="py-3 px-3">Statut & Établissement</th>
                <th className="py-3 px-3">Mot (Mosaïque)</th>
                <th className="py-3 px-3">Statut Entrée</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucune inscription trouvée.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-mono font-bold">
                        {r.seat_code}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{r.full_name}</div>
                      <div className="text-gray-400 text-[11px]">{r.email}</div>
                      {r.phone && (
                        <div className="text-fuchsia-300/80 text-[11px] font-mono">{r.phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-purple-300 font-semibold">
                        {r.status}
                        {r.status_detail ? ` (${r.status_detail})` : ""}
                      </div>
                      <div className="text-gray-400 text-[11px]">{r.institution}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-semibold italic">
                        <MessageSquareQuote className="w-3 h-3" />« {r.one_word} »
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {r.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                          <UserCheck className="w-3.5 h-3.5" />
                          Présent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10 text-[11px]">
                          Non scanné
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!r.checkedIn ? (
                        <button
                          type="button"
                          onClick={() => submitScan(r.qr_code_id, false)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold transition"
                        >
                          Pointer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => submitScan(r.qr_code_id, true)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 transition"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

