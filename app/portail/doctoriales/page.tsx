"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Users,
  ShieldCheck,
  Clock,
  RotateCcw,
  Sparkles,
  Calendar,
  Building2,
  GraduationCap,
} from "lucide-react";

interface SessionDef {
  id: string;
  day: string;
  slot: string;
  title: string;
  shortLabel: string;
}

interface RegistrationItem {
  id: string;
  qr_code_id: string;
  full_name: string;
  email: string;
  status: string;
  institution: string;
  education_level: string;
  specialty: string;
  session_choice: string;
  has_laptop_and_charger: string;
  confirmed_prerequisites: boolean;
  created_at: string;
  sessionIds: string[];
  checkIns: Record<string, { at: string; by: string }>;
}

interface ScanFeedback {
  scanResult: "authorized" | "already_scanned" | "wrong_session" | "invalid" | "undone";
  message: string;
  sessionTitle?: string;
  previousScan?: { at: string; by: string };
  participant?: {
    id: string;
    qr_code_id: string;
    full_name: string;
    email: string;
    status: string;
    institution: string;
    education_level: string;
    specialty: string;
    registeredSessionLabels: string[];
  };
  timestamp: string;
}

function playFeedbackSound(type: "success" | "error" | "warning") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "warning") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(190, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch {
    // ignore audio errors
  }
}

export default function PortailDoctorialesPage() {
  const { canScanDoctoriales, loading: authLoading } = usePortailAuth();

  const [sessions, setSessions] = useState<SessionDef[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("jeudi_matin_rtm");
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);

  // List filter state
  const [viewScope, setViewScope] = useState<"session" | "all">("session");
  const [presenceFilter, setPresenceFilter] = useState<"all" | "checked_in" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const html5QrCodeRef = useRef<any>(null);
  const scanLockedRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<any>(null);
  const lastScannedRef = useRef<{ code: string; sessionId: string; time: number }>({
    code: "",
    sessionId: "",
    time: 0,
  });
  const selectedSessionIdRef = useRef<string>(selectedSessionId);

  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
    // Reset last scanned memory when switching session
    lastScannedRef.current = { code: "", sessionId: selectedSessionId, time: 0 };
  }, [selectedSessionId]);

  const fetchDoctorialesData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/doctoriales", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement des inscrits");
      }

      setSessions(data.sessions || []);
      setRegistrations(data.registrations || []);
      if (data.sessions?.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data.sessions[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load doctoriales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && canScanDoctoriales) {
      fetchDoctorialesData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canScanDoctoriales]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current = null;
          });
      }
    };
  }, []);

  const performScanCheckIn = async (
    qrInput: string,
    targetSessionId?: string,
    forceUndo = false
  ) => {
    const activeSessId = targetSessionId || selectedSessionIdRef.current;
    if (!qrInput.trim() || !activeSessId) return;

    try {
      setScanning(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/doctoriales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          qrInput: qrInput.trim(),
          sessionId: activeSessId,
          forceUndo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la vérification du QR Code");
      }

      setScanFeedback({
        ...data,
        timestamp: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });

      if (data.scanResult === "authorized") {
        playFeedbackSound("success");
      } else if (data.scanResult === "wrong_session") {
        playFeedbackSound("warning");
      } else if (data.scanResult === "already_scanned" || data.scanResult === "invalid") {
        playFeedbackSound("error");
      }

      // Update local state immediately if participant matched
      if (data.participant && data.checkIns) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === data.participant.id
              ? { ...r, checkIns: data.checkIns }
              : r
          )
        );
      }
    } catch (err: any) {
      setScanFeedback({
        scanResult: "invalid",
        message: err.message || "Erreur réseau lors du scan.",
        timestamp: new Date().toLocaleTimeString("fr-FR"),
      });
      playFeedbackSound("error");
    } finally {
      setScanning(false);
    }
  };

  const resumeCameraAfterScan = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    scanLockedRef.current = false;
    setScanPaused(false);
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {
        // ignore if already running
      }
    }
  };

  const startCameraScanner = async () => {
    setCameraError(null);
    setCameraActive(true);
    scanLockedRef.current = false;
    setScanPaused(false);

    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.stop().catch(() => {});
        }

        const scanner = new Html5Qrcode("doctoriales-qr-reader");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 8,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (scanLockedRef.current) return;

            const now = Date.now();
            const docMatch = decodedText.match(/DOC-[A-Z0-9]+-[A-Z0-9]+/i);
            const normalizedKey = docMatch
              ? docMatch[0].toUpperCase()
              : decodedText.trim();
            const currentSess = selectedSessionIdRef.current;

            // Block rescanning the exact same QR code while the phone is kept over it (30 seconds protection)
            if (
              lastScannedRef.current.code === normalizedKey &&
              lastScannedRef.current.sessionId === currentSess &&
              now - lastScannedRef.current.time < 30000
            ) {
              return;
            }

            // Lock scanner immediately & pause video feed for 3.5s
            scanLockedRef.current = true;
            setScanPaused(true);
            lastScannedRef.current = {
              code: normalizedKey,
              sessionId: currentSess,
              time: now,
            };

            try {
              scanner.pause(true);
            } catch {
              // ignore pause error
            }

            performScanCheckIn(decodedText);

            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => {
              resumeCameraAfterScan();
            }, 3500);
          },
          () => {
            // frame scan ignore
          }
        );
      } catch (err: any) {
        console.error("Camera error:", err);
        setCameraError(
          "Impossible d'accéder à la caméra. Vérifiez les permissions du navigateur ou utilisez la saisie manuelle ci-dessous."
        );
        setCameraActive(false);
      }
    }, 150);
  };

  const stopCameraScanner = async () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    scanLockedRef.current = false;
    setScanPaused(false);
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    await performScanCheckIn(manualInput.trim());
    setManualInput("");
  };

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const sessionStats = useMemo(() => {
    const registeredForActive = registrations.filter((r) =>
      r.sessionIds.includes(selectedSessionId)
    );
    const checkedInForActive = registeredForActive.filter(
      (r) => Boolean(r.checkIns?.[selectedSessionId])
    );
    return {
      totalAll: registrations.length,
      registeredCount: registeredForActive.length,
      checkedInCount: checkedInForActive.length,
      pendingCount: Math.max(0, registeredForActive.length - checkedInForActive.length),
    };
  }, [registrations, selectedSessionId]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      if (viewScope === "session" && !r.sessionIds.includes(selectedSessionId)) {
        return false;
      }
      const isCheckedIn = Boolean(r.checkIns?.[selectedSessionId]);
      if (presenceFilter === "checked_in" && !isCheckedIn) return false;
      if (presenceFilter === "pending" && isCheckedIn) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.qr_code_id || "").toLowerCase().includes(q) ||
          (r.institution || "").toLowerCase().includes(q) ||
          (r.specialty || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registrations, viewScope, selectedSessionId, presenceFilter, searchQuery]);

  const exportCsv = () => {
    const headers = [
      "ID Pass (QR)",
      "Nom et Prénom",
      "Email",
      "Statut",
      "Établissement",
      "Niveau d'études",
      "Spécialité",
      "Statut Session Active (" + (activeSession?.shortLabel || selectedSessionId) + ")",
      "Heure de Scan (Session Active)",
      "Toutes les Sessions Inscrites",
      "Nombre Total de Sessions Scannées",
    ];

    const rows = filteredRegistrations.map((r) => {
      const scanInfo = r.checkIns?.[selectedSessionId];
      return [
        `"${r.qr_code_id}"`,
        `"${(r.full_name || "").replace(/"/g, '""')}"`,
        `"${r.email}"`,
        `"${(r.status || "").replace(/"/g, '""')}"`,
        `"${(r.institution || "").replace(/"/g, '""')}"`,
        `"${(r.education_level || "").replace(/"/g, '""')}"`,
        `"${(r.specialty || "").replace(/"/g, '""')}"`,
        scanInfo ? '"PRÉSENT (SCANNÉ)"' : '"NON SCANNÉ"',
        scanInfo ? `"${new Date(scanInfo.at).toLocaleString("fr-FR")}"` : '""',
        `"${(r.session_choice || "").replace(/"/g, '""')}"`,
        Object.keys(r.checkIns || {}).length,
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Doctoriales_Presences_${selectedSessionId}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authLoading && !canScanDoctoriales) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 rounded-3xl bg-white dark:bg-[#12121a] border border-red-500/30 text-center space-y-3">
        <XCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Accès Restreint
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400">
          Cette page est réservée au contrôle d&apos;accès QR des HEC Doctoriales.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#12121a] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <QrCode size={14} /> Contrôle d&apos;Accès Officiel • Anti-Double Scan
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            HEC Doctoriales — Inscrits &amp; Scanner QR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            Sélectionnez la session en cours puis scannez le pass QR de chaque participant. Chaque QR Code ne peut être validé <strong>qu&apos;une seule fois par session</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 font-semibold text-xs sm:text-sm transition-all"
          >
            <Download size={15} />
            <span>Exporter CSV Présences</span>
          </button>

          <button
            onClick={fetchDoctorialesData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 transition-all"
            title="Actualiser la liste"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* STEP 1: ACTIVE SESSION SELECTOR */}
      <div className="bg-gradient-to-br from-purple-950/50 via-[#121222] to-[#0d0d18] p-5 sm:p-6 rounded-3xl border border-purple-500/30 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>1. Session active à contrôler à l&apos;entrée :</span>
          </label>
          <span className="text-xs text-purple-300 font-medium">
            Total inscrits Doctoriales : <strong>{sessionStats.totalAll} participants</strong>
          </span>
        </div>

        <select
          value={selectedSessionId}
          onChange={(e) => {
            setSelectedSessionId(e.target.value);
            setScanFeedback(null);
          }}
          className="w-full bg-[#090914] border-2 border-purple-500/50 focus:border-purple-400 text-white font-bold text-sm sm:text-base px-4 py-3.5 rounded-2xl outline-none transition-all cursor-pointer"
        >
          {sessions.map((s) => {
            const countInSession = registrations.filter((r) =>
              r.sessionIds.includes(s.id)
            ).length;
            const scannedInSession = registrations.filter(
              (r) => r.sessionIds.includes(s.id) && r.checkIns?.[s.id]
            ).length;
            return (
              <option key={s.id} value={s.id} className="bg-[#0d0d1a] text-white py-2">
                {s.shortLabel} — ({scannedInSession}/{countInSession} présents)
              </option>
            );
          })}
        </select>

        {/* Session Stats Pills */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <div className="text-xs text-gray-400">Inscrits à cette session</div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {sessionStats.registeredCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <div className="text-xs text-emerald-300">Scannés / Présents</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">
              {sessionStats.checkedInCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <div className="text-xs text-amber-300">En attente</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-0.5">
              {sessionStats.pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: QR SCANNER & INSTANT VERIFICATION BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera & Manual QR Scanner Card */}
        <div className="bg-white dark:bg-[#12121a] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>2. Scanner un Pass QR</span>
            </h2>

            {!cameraActive ? (
              <button
                type="button"
                onClick={startCameraScanner}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition-all"
              >
                <Camera size={16} />
                <span>Activer la Caméra QR</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCameraScanner}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <CameraOff size={16} />
                <span>Arrêter la Caméra</span>
              </button>
            )}
          </div>

          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Camera Viewport */}
          {cameraActive ? (
            <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-black min-h-[280px] flex items-center justify-center">
              <div id="doctoriales-qr-reader" className="w-full max-w-sm mx-auto" />
              {scanPaused && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 z-10">
                  <CheckCircle2 className="w-10 h-10 text-cyan-400 animate-bounce" />
                  <div className="text-sm font-bold text-white">
                    QR Code lu — Caméra en pause anti-double scan
                  </div>
                  <p className="text-xs text-gray-300 max-w-xs">
                    Vous pouvez retirer le téléphone du QR Code tranquillement.
                  </p>
                  <button
                    type="button"
                    onClick={resumeCameraAfterScan}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all"
                  >
                    Scanner le participant suivant maintenant
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={startCameraScanner}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-purple-500/50 bg-slate-50 dark:bg-[#0d0d15] p-8 text-center space-y-2 transition-all"
            >
              <QrCode className="w-12 h-12 text-purple-400 mx-auto opacity-80" />
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                Cliquez ici pour ouvrir la caméra et scanner un QR Code
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Compatible téléphone mobile (caméra arrière) et ordinateur portable
              </p>
            </div>
          )}

          {/* Manual / USB Barcode Scanner Input */}
          <form onSubmit={handleManualSubmit} className="pt-2 space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
              Ou saisir / coller le numéro de pass (ex: DOC-MVVCXR93-5QXTRJ ou email) :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="DOC-XXXXXXX-XXXXXX ou email..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={scanning || !manualInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-40 shrink-0"
              >
                {scanning ? "Vérification..." : "Vérifier"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Scan Result Card */}
        <div className="bg-white dark:bg-[#12121a] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-center">
          {!scanFeedback ? (
            <div className="text-center py-12 space-y-3 text-slate-400 dark:text-gray-500">
              <ShieldCheck className="w-14 h-14 mx-auto opacity-40" />
              <div className="text-sm font-semibold">
                Prêt à contrôler les accès pour :
              </div>
              <div className="text-xs sm:text-sm font-bold text-purple-400 max-w-md mx-auto">
                {activeSession?.shortLabel}
              </div>
              <p className="text-xs max-w-sm mx-auto">
                Scannez un QR Code ou cliquez sur « Valider l&apos;entrée » dans la liste ci-dessous pour vérifier l&apos;inscription à cette session.
              </p>
            </div>
          ) : (
            <div
              className={`p-6 rounded-2xl border-2 space-y-4 transition-all ${
                scanFeedback.scanResult === "authorized"
                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-100"
                  : scanFeedback.scanResult === "already_scanned"
                  ? "bg-rose-950/50 border-rose-500 text-rose-100"
                  : scanFeedback.scanResult === "wrong_session"
                  ? "bg-amber-950/50 border-amber-500 text-amber-100"
                  : "bg-slate-900 border-rose-500/60 text-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {scanFeedback.scanResult === "authorized" && (
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
                  )}
                  {(scanFeedback.scanResult === "already_scanned" ||
                    scanFeedback.scanResult === "invalid") && (
                    <XCircle className="w-10 h-10 text-rose-400 shrink-0" />
                  )}
                  {scanFeedback.scanResult === "wrong_session" && (
                    <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-widest font-bold opacity-75">
                      Contrôle à {scanFeedback.timestamp}
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold">
                      {scanFeedback.scanResult === "authorized" &&
                        "✅ ACCÈS AUTORISÉ"}
                      {scanFeedback.scanResult === "already_scanned" &&
                        "⛔ ACCÈS REFUSÉ — DÉJÀ SCANNÉ !"}
                      {scanFeedback.scanResult === "wrong_session" &&
                        "⚠️ NON INSCRIT À CETTE SESSION"}
                      {scanFeedback.scanResult === "invalid" &&
                        "❌ QR CODE INVALIDE"}
                      {scanFeedback.scanResult === "undone" &&
                        "↩️ POINTAGE ANNULÉ"}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold leading-relaxed">
                {scanFeedback.message}
              </p>

              {scanFeedback.participant && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Participant :</span>
                    <strong className="text-white text-sm">
                      {scanFeedback.participant.full_name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Code Pass :</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {scanFeedback.participant.qr_code_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut / Établissement :</span>
                    <span className="text-gray-200 font-medium">
                      {scanFeedback.participant.status} • {scanFeedback.participant.institution}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-gray-400 mb-1">
                      Sessions auxquelles ce participant est inscrit :
                    </div>
                    <ul className="space-y-1 text-purple-300 font-medium">
                      {scanFeedback.participant.registeredSessionLabels.map(
                        (lbl, i) => (
                          <li key={i}>• {lbl}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STEP 3: PARTICIPANTS LIST FOR THE ACTIVE SESSION */}
      <div className="bg-white dark:bg-[#12121a] p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scope Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewScope("session")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewScope === "session"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400"
              }`}
            >
              Inscrits de la session active ({sessionStats.registeredCount})
            </button>
            <button
              onClick={() => setViewScope("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewScope === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400"
              }`}
            >
              Tous les inscrits Doctoriales ({sessionStats.totalAll})
            </button>
          </div>

          {/* Presence Filter */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "Tous" },
              { id: "checked_in", label: `Présents scannés (${sessionStats.checkedInCount})` },
              { id: "pending", label: `Non scannés (${sessionStats.pendingCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPresenceFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  presenceFilter === f.id
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, e-mail, code DOC-... ou établissement..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Chargement des inscrits HEC Doctoriales...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-gray-400">
            Aucun participant trouvé pour ce filtre.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredRegistrations.map((reg) => {
              const isRegisteredForActive = reg.sessionIds.includes(selectedSessionId);
              const scanEntry = reg.checkIns?.[selectedSessionId];

              return (
                <div
                  key={reg.id}
                  className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {reg.full_name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                        {reg.qr_code_id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                        {reg.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{reg.email}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={12} /> {reg.institution}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap size={12} /> {reg.education_level} ({reg.specialty})
                      </span>
                    </div>

                    {/* Sessions chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sessions
                        .filter((s) => reg.sessionIds.includes(s.id))
                        .map((s) => {
                          const isCurrent = s.id === selectedSessionId;
                          const isScannedForS = Boolean(reg.checkIns?.[s.id]);
                          return (
                            <span
                              key={s.id}
                              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                                isScannedForS
                                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                  : isCurrent
                                  ? "bg-purple-500/20 border-purple-400 text-purple-200"
                                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400"
                              }`}
                            >
                              {isScannedForS ? "✓ " : ""}
                              {s.shortLabel}
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  {/* Check-in status & manual action for active session */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {!isRegisteredForActive ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                        Non inscrit à cette session
                      </span>
                    ) : scanEntry ? (
                      <div className="flex items-center gap-2">
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-emerald-400" />
                          <span>
                            Présent • Scanné à{" "}
                            {new Date(scanEntry.at).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            performScanCheckIn(reg.qr_code_id, selectedSessionId, true)
                          }
                          title="Annuler ce pointage"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-200 dark:border-white/10 transition-colors"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={scanning}
                        onClick={() =>
                          performScanCheckIn(reg.qr_code_id, selectedSessionId)
                        }
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <QrCode size={14} />
                        <span>Valider l&apos;entrée</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

