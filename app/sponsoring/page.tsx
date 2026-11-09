"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  BookOpen,
  FileText,
  List,
  X,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const TOTAL_PAGES = 26;

const PAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    pageNumber: i + 1,
    src: `/sponsoring-sme-2026/page-${num}.webp`,
    label:
      i === 0
        ? "Couverture"
        : i === TOTAL_PAGES - 1
        ? "4e de couverture"
        : `Page ${i}`,
  };
});

// Chapitres du sommaire pour accès rapide
const TABLE_OF_CONTENTS = [
  { title: "Couverture", subtitle: "Dossier de Sponsoring SME 2026", pdfPage: 1 },
  { title: "Sommaire", subtitle: "Plan du dossier", pdfPage: 2 },
  {
    title: "A.1 • Présentation du club",
    subtitle: "Contexte, vision, mission & valeurs",
    pdfPage: 4,
  },
  {
    title: "Positionnement & Bureau exécutif",
    subtitle: "L'équipe dirigeante HEC Entrepreneurs",
    pdfPage: 6,
  },
  {
    title: "A.2 • Le Tribunal de l'Entrepreneuriat 1.0",
    subtitle: "Distingué « Meilleur événement 2026 »",
    pdfPage: 7,
  },
  {
    title: "A.3 & A.4 • Nos preuves & Partenaires",
    subtitle: "Ils nous ont fait confiance",
    pdfPage: 10,
  },
  {
    title: "A.5 • Programme annuel 2026–2027",
    subtitle: "Les 6 grands rendez-vous de la saison",
    pdfPage: 11,
  },
  {
    title: "B.1 • La SME 2026 : « La Grande Mosaïque »",
    subtitle: "Concept & Global Entrepreneurship Week",
    pdfPage: 12,
  },
  {
    title: "B.2 • Cérémonie d'ouverture (18 nov. 2026)",
    subtitle: "Performance en 5 actes & déroulé",
    pdfPage: 14,
  },
  {
    title: "B.3 • Plan média de la SME",
    subtitle: "Calendrier de communication Pré/Durant/Post",
    pdfPage: 17,
  },
  {
    title: "B.4 & B.5 • Audience & Retombées Sponsors",
    subtitle: "Ce que vous apporte la SME selon votre secteur",
    pdfPage: 19,
  },
  {
    title: "C.1 & C.2 • Offres & Packs de Sponsoring",
    subtitle: "Packs Bronze, Argent, Or et Diamant",
    pdfPage: 20,
  },
  {
    title: "C.3 & C.4 • Autres soutiens & Modalités",
    subtitle: "Soutien en nature, expertise et règles",
    pdfPage: 22,
  },
  {
    title: "D.1 • Budget prévisionnel de la SME",
    subtitle: "Estimation détaillée des dépenses",
    pdfPage: 23,
  },
  {
    title: "D.2 & D.3 • Engagements & Contacts",
    subtitle: "Mesure des résultats et coordonnées",
    pdfPage: 24,
  },
  {
    title: "Annexe • Modèle de convention",
    subtitle: "Convention de sponsoring SME 2026",
    pdfPage: 25,
  },
  {
    title: "Dos du livre",
    subtitle: "« L'excellence n'est pas un objectif, c'est notre standard »",
    pdfPage: 26,
  },
];

/**
 * En mode "Livre (2 pages)" sur PC :
 * - Spread 0 : Page 1 seule (Couverture fermée)
 * - Spread 1 : Pages 2 & 3 côte à côte
 * - Spread 2 : Pages 4 & 5 côte à côte
 * ...
 * - Spread 12 : Pages 24 & 25 côte à côte
 * - Spread 13 : Page 26 seule (Dos du livre fermé)
 */
function getDesktopSpreads(): number[][] {
  const spreads: number[][] = [[1]];
  for (let p = 2; p < TOTAL_PAGES; p += 2) {
    if (p + 1 < TOTAL_PAGES) {
      spreads.push([p, p + 1]);
    } else {
      spreads.push([p]);
    }
  }
  spreads.push([TOTAL_PAGES]);
  return spreads;
}

const DESKTOP_SPREADS = getDesktopSpreads();

export default function SponsoringBookPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [singlePageModeOnDesktop, setSinglePageModeOnDesktop] = useState(false);

  // currentPage is 1-indexed (1..26)
  const [currentPage, setCurrentPage] = useState(1);
  // direction: 1 = forward (next), -1 = backward (prev)
  const [flipDirection, setFlipDirection] = useState<1 | -1>(1);
  const [isFlipping, setIsFlipping] = useState(false);

  // Zoom & Fullscreen & Sommaire
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  // Touch / Mouse drag swipe tracking
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Detect screen size
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 960);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Preload adjacent pages for instant flipping
  useEffect(() => {
    const pagesToPreload = new Set<number>();
    for (let d = -3; d <= 4; d++) {
      const target = currentPage + d;
      if (target >= 1 && target <= TOTAL_PAGES) {
        pagesToPreload.add(target);
      }
    }
    pagesToPreload.forEach((p) => {
      const img = new window.Image();
      img.src = PAGES[p - 1].src;
    });
  }, [currentPage]);

  const isSpreadMode = !isMobile && !singlePageModeOnDesktop;

  // Find current spread index from currentPage
  const currentSpreadIndex = DESKTOP_SPREADS.findIndex((spread) =>
    spread.includes(currentPage)
  );
  const activeSpread =
    DESKTOP_SPREADS[currentSpreadIndex >= 0 ? currentSpreadIndex : 0];

  const canGoPrev = isSpreadMode ? currentSpreadIndex > 0 : currentPage > 1;
  const canGoNext = isSpreadMode
    ? currentSpreadIndex < DESKTOP_SPREADS.length - 1
    : currentPage < TOTAL_PAGES;

  const triggerFlipSoundVisual = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 420);
  };

  const goNext = useCallback(() => {
    if (zoom > 1) setZoom(1);
    if (isSpreadMode) {
      if (currentSpreadIndex < DESKTOP_SPREADS.length - 1) {
        setFlipDirection(1);
        triggerFlipSoundVisual();
        setCurrentPage(DESKTOP_SPREADS[currentSpreadIndex + 1][0]);
      }
    } else {
      if (currentPage < TOTAL_PAGES) {
        setFlipDirection(1);
        triggerFlipSoundVisual();
        setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1));
      }
    }
  }, [isSpreadMode, currentSpreadIndex, currentPage, zoom]);

  const goPrev = useCallback(() => {
    if (zoom > 1) setZoom(1);
    if (isSpreadMode) {
      if (currentSpreadIndex > 0) {
        setFlipDirection(-1);
        triggerFlipSoundVisual();
        setCurrentPage(DESKTOP_SPREADS[currentSpreadIndex - 1][0]);
      }
    } else {
      if (currentPage > 1) {
        setFlipDirection(-1);
        triggerFlipSoundVisual();
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    }
  }, [isSpreadMode, currentSpreadIndex, currentPage, zoom]);

  const jumpToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_PAGES, targetPage));
    setFlipDirection(clamped >= currentPage ? 1 : -1);
    triggerFlipSoundVisual();
    setCurrentPage(clamped);
    setShowToc(false);
    setZoom(1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        setShowToc(false);
        setShowThumbnails(false);
        setZoom(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Touch & Mouse Swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom > 1) return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (zoom > 1 || pointerStartX.current === null || pointerStartY.current === null) {
      return;
    }
    const deltaX = e.clientX - pointerStartX.current;
    const deltaY = e.clientY - pointerStartY.current;
    pointerStartX.current = null;
    pointerStartY.current = null;

    // Ensure horizontal swipe dominates vertical scroll
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  // Page label display
  const getPageIndicatorText = () => {
    if (isSpreadMode) {
      if (activeSpread.length === 1) {
        return activeSpread[0] === 1
          ? "Couverture (1 / 26)"
          : `Dos du dossier (${TOTAL_PAGES} / ${TOTAL_PAGES})`;
      }
      return `Pages ${activeSpread[0]} – ${activeSpread[1]} sur ${TOTAL_PAGES}`;
    }
    return currentPage === 1
      ? `Couverture (1 / ${TOTAL_PAGES})`
      : `Page ${currentPage} sur ${TOTAL_PAGES}`;
  };

  // Progress percentage
  const progressPercent = isSpreadMode
    ? ((activeSpread[activeSpread.length - 1] - 1) / (TOTAL_PAGES - 1)) * 100
    : ((currentPage - 1) / (TOTAL_PAGES - 1)) * 100;

  // 3D Book Flip Variants
  const bookFlipVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 38 : -38,
      opacity: 0,
      scale: 0.96,
      transformOrigin: dir > 0 ? "left center" : "right center",
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transformOrigin: "center center",
      transition: {
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -38 : 38,
      opacity: 0,
      scale: 0.96,
      transformOrigin: dir > 0 ? "left center" : "right center",
      transition: {
        duration: 0.34,
        ease: [0.4, 0, 1, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] h-screen w-full bg-[#090612] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Ambient luxury glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-fuchsia-600/15 blur-[150px]" />
        <div className="absolute -bottom-32 right-1/4 w-[520px] h-[520px] rounded-full bg-purple-700/15 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#05030a_100%)]" />
      </div>

      {/* TOP HEADER BAR */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-[#110b22]/85 backdrop-blur-xl border-b border-fuchsia-500/20">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center shadow-lg shadow-fuchsia-600/25 shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">
                Dossier de Sponsoring • SME 2026
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                <Sparkles className="w-3 h-3" />
                HEC Entrepreneurs
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-purple-200/70 truncate">
              Semaine Mondiale de l&apos;Entrepreneuriat • IHEC Carthage
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sommaire button */}
          <button
            type="button"
            onClick={() => {
              setShowToc((v) => !v);
              setShowThumbnails(false);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all ${
              showToc
                ? "bg-fuchsia-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/30"
                : "bg-white/5 hover:bg-white/10 text-purple-100 border-white/10"
            }`}
            title="Sommaire interactif"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Sommaire</span>
          </button>

          {/* Desktop 1-page / 2-page switch */}
          {!isMobile && (
            <button
              type="button"
              onClick={() => {
                setSinglePageModeOnDesktop((prev) => !prev);
                setZoom(1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-purple-100 border border-white/10 transition-all"
              title={
                singlePageModeOnDesktop
                  ? "Passer en mode Livre (2 pages)"
                  : "Passer en mode Page simple"
              }
            >
              {singlePageModeOnDesktop ? (
                <>
                  <BookOpen className="w-4 h-4 text-fuchsia-400" />
                  <span className="hidden lg:inline">Mode Livre</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-fuchsia-400" />
                  <span className="hidden lg:inline">1 Page</span>
                </>
              )}
            </button>
          )}

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              disabled={zoom <= 1}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-purple-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
              disabled={zoom >= 2}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-100 transition"
            title="Plein écran"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Download PDF */}
          <a
            href="/dossier-sponsoring-sme-2026.pdf"
            download="Dossier-Sponsoring-SME-2026-HEC-Entrepreneurs.pdf"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-600/25 transition-all"
            title="Télécharger le PDF original"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">PDF</span>
          </a>
        </div>
      </header>

      {/* MAIN BOOK STAGE */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative z-10 flex-1 flex items-center justify-center w-full overflow-auto px-2 sm:px-10 py-2 sm:py-4"
        style={{ perspective: "2400px" }}
      >
        {/* Left Navigation Floating Arrow */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Page précédente"
          className="fixed sm:absolute left-1.5 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#160e2c]/85 hover:bg-fuchsia-600 text-white border border-fuchsia-400/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur-md active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Navigation Floating Arrow */}
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Page suivante"
          className="fixed sm:absolute right-1.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#160e2c]/85 hover:bg-fuchsia-600 text-white border border-fuchsia-400/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur-md active:scale-90"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* THE 3D BOOK */}
        <div
          className="relative flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            transformStyle: "preserve-3d",
          }}
        >
          <AnimatePresence mode="wait" custom={flipDirection}>
            {isSpreadMode ? (
              /* DESKTOP SPREAD VIEW (Cover single, Interior 2-pages side-by-side, Back cover single) */
              <motion.div
                key={`spread-${activeSpread.join("-")}`}
                custom={flipDirection}
                variants={bookFlipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                {activeSpread.length === 1 ? (
                  /* SINGLE COVER OR BACK COVER */
                  <div
                    onClick={() => {
                      if (activeSpread[0] === 1) goNext();
                      else goPrev();
                    }}
                    className="relative cursor-pointer group rounded-r-xl rounded-l-md overflow-hidden bg-white shadow-[0_28px_80px_rgba(0,0,0,0.85),0_0_45px_rgba(192,38,211,0.22)] border border-white/15 transition-transform duration-300 hover:scale-[1.01]"
                  >
                    {/* Realistic Book Spine on Left (for Front Cover) or Right (for Back Cover) */}
                    {activeSpread[0] === 1 ? (
                      <>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/55 via-white/20 to-transparent z-20" />
                        {/* Stacked paper edge effect on the right */}
                        <div className="pointer-events-none absolute inset-y-1 right-0 w-2 bg-gradient-to-l from-stone-300 via-white to-stone-200 border-l border-stone-300/60 z-20" />
                      </>
                    ) : (
                      <>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-black/55 via-white/20 to-transparent z-20" />
                        <div className="pointer-events-none absolute inset-y-1 left-0 w-2 bg-gradient-to-r from-stone-300 via-white to-stone-200 border-r border-stone-300/60 z-20" />
                      </>
                    )}

                    <img
                      src={PAGES[activeSpread[0] - 1].src}
                      alt={PAGES[activeSpread[0] - 1].label}
                      draggable={false}
                      className="h-[calc(100vh-145px)] max-h-[840px] w-auto object-contain block select-none"
                    />

                    {/* Subtle prompt on Cover */}
                    {activeSpread[0] === 1 && (
                      <div className="absolute bottom-4 right-5 z-30 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:bg-fuchsia-600 transition-all shadow-lg">
                        <span>Cliquer ou glisser pour ouvrir le livre</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* TWO-PAGE OPEN BOOK SPREAD */
                  <div className="relative flex items-center justify-center rounded-xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.18)] border border-white/15 bg-[#f8f5fb]">
                    {/* Left Page */}
                    <div
                      onClick={goPrev}
                      title="Cliquer pour tourner à la page précédente"
                      className="relative cursor-pointer group overflow-hidden bg-white"
                    >
                      <img
                        src={PAGES[activeSpread[0] - 1].src}
                        alt={PAGES[activeSpread[0] - 1].label}
                        draggable={false}
                        className="h-[calc(100vh-145px)] max-h-[840px] w-auto object-contain block select-none"
                      />
                      {/* Inner spine shadow on right side of left page */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/28 via-black/8 to-transparent z-20" />
                      {/* Hover corner curl hint */}
                      <div className="pointer-events-none absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-purple-900/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Center Book Binding Crease */}
                    <div className="w-[2px] self-stretch bg-gradient-to-b from-stone-400 via-stone-700 to-stone-400 z-30 shadow-[0_0_12px_rgba(0,0,0,0.6)]" />

                    {/* Right Page */}
                    <div
                      onClick={goNext}
                      title="Cliquer pour tourner à la page suivante"
                      className="relative cursor-pointer group overflow-hidden bg-white"
                    >
                      <img
                        src={PAGES[activeSpread[1] - 1].src}
                        alt={PAGES[activeSpread[1] - 1].label}
                        draggable={false}
                        className="h-[calc(100vh-145px)] max-h-[840px] w-auto object-contain block select-none"
                      />
                      {/* Inner spine shadow on left side of right page */}
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/28 via-black/8 to-transparent z-20" />
                      {/* Hover corner curl hint */}
                      <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-purple-900/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* MOBILE OR SINGLE-PAGE DESKTOP VIEW */
              <motion.div
                key={`page-${currentPage}`}
                custom={flipDirection}
                variants={bookFlipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative rounded-xl overflow-hidden bg-white shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(192,38,211,0.2)] border border-white/15">
                  {/* Left spine subtle shadow */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/35 via-black/10 to-transparent z-20" />
                  {/* Right page stack edge */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-l from-stone-300 to-transparent z-20" />

                  <img
                    src={PAGES[currentPage - 1].src}
                    alt={PAGES[currentPage - 1].label}
                    draggable={false}
                    className="max-h-[calc(100vh-155px)] max-w-[92vw] w-auto h-auto object-contain block select-none"
                  />

                  {/* Invisible tap zones on left/right 25% of page for effortless flipping */}
                  {zoom === 1 && (
                    <>
                      <div
                        onClick={goPrev}
                        className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer"
                        title="Page précédente"
                      />
                      <div
                        onClick={goNext}
                        className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer"
                        title="Page suivante"
                      />
                    </>
                  )}

                  {/* Swipe hint on Cover (page 1) */}
                  {currentPage === 1 && (
                    <div
                      onClick={goNext}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white flex items-center gap-1.5 whitespace-nowrap shadow-lg cursor-pointer"
                    >
                      <span>Glisser ou toucher pour feuilleter</span>
                      <ChevronRight className="w-3.5 h-3.5 text-fuchsia-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM NAVIGATION & PROGRESS BAR */}
      <footer className="relative z-30 bg-[#110b22]/90 backdrop-blur-xl border-t border-fuchsia-500/20 px-3 sm:px-6 py-2.5">
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mb-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${ Math.max(4, progressPercent) }%` }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Return to Cover button */}
          <button
            type="button"
            onClick={() => jumpToPage(1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 disabled:opacity-30 transition"
            title="Retourner à la couverture"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Couverture</span>
          </button>

          {/* Center Page status + Thumbnails drawer toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowThumbnails((v) => !v);
                setShowToc(false);
              }}
              className="px-3 sm:px-4 py-1 rounded-full bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/30 text-xs font-semibold text-fuchsia-200 transition"
              title="Afficher toutes les pages en miniatures"
            >
              {getPageIndicatorText()}
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick jump to Packs de Sponsoring (Page 20) */}
          <button
            type="button"
            onClick={() => jumpToPage(20)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition"
          >
            <span>Nos Packs</span>
          </button>
        </div>
      </footer>

      {/* INTERACTIVE TABLE OF CONTENTS (SOMMAIRE) DRAWER */}
      <AnimatePresence>
        {showToc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToc(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-[#120b24] border-r border-fuchsia-500/30 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-fuchsia-400" />
                    <span>Sommaire du Dossier</span>
                  </h2>
                  <p className="text-xs text-purple-300/70 mt-0.5">
                    Accès direct aux chapitres
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowToc(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {TABLE_OF_CONTENTS.map((item) => {
                  const isActive =
                    currentPage === item.pdfPage ||
                    (isSpreadMode && activeSpread.includes(item.pdfPage));
                  return (
                    <button
                      key={item.pdfPage}
                      type="button"
                      onClick={() => jumpToPage(item.pdfPage)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-fuchsia-600/20 border-fuchsia-500 text-white"
                          : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-purple-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-purple-300/70 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-fuchsia-300 shrink-0">
                        {item.pdfPage === 1
                          ? "Couv."
                          : item.pdfPage === TOTAL_PAGES
                          ? "Fin"
                          : `p.${item.pdfPage - 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* THUMBNAILS FILMSTRIP MODAL */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-x-0 bottom-14 z-40 bg-[#120b24]/95 backdrop-blur-xl border-t border-fuchsia-500/30 p-4 shadow-2xl"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
                  Aperçu rapide des 26 pages
                </span>
                <button
                  type="button"
                  onClick={() => setShowThumbnails(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {PAGES.map((p) => {
                  const selected = isSpreadMode
                    ? activeSpread.includes(p.pageNumber)
                    : currentPage === p.pageNumber;
                  return (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => {
                        jumpToPage(p.pageNumber);
                        setShowThumbnails(false);
                      }}
                      className={`group shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                        selected
                          ? "bg-fuchsia-600/25 border-fuchsia-400 scale-105"
                          : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={p.src}
                        alt={p.label}
                        loading="lazy"
                        className="h-24 w-auto rounded object-contain bg-white"
                      />
                      <span className="text-[10px] font-medium text-purple-200">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
