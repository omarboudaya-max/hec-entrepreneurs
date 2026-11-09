"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PageFlip } from "page-flip";
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
// Aspect ratio exact du PDF (1311 x 1853)
const PAGE_ASPECT_RATIO = 1311 / 1853;

const PAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    pageNumber: i + 1,
    src: `/sponsoring-sme-2026/page-${num}.webp?v=2`,
    label:
      i === 0
        ? "Couverture"
        : i === TOTAL_PAGES - 1
        ? "Dos du livre"
        : `Page ${i}`,
  };
});

// Chapitres du sommaire pour accès rapide (1-indexés selon l'ordre des pages du PDF)
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

export default function SponsoringBookPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const flipMountRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const currentPageIndexRef = useRef<number>(0);

  // currentPageIndex is 0-indexed (0..25)
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [singlePageOnDesktop, setSinglePageOnDesktop] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const isPortraitMode = isMobile || singlePageOnDesktop;

  // Build or rebuild the StPageFlip real paper-curl instance when viewport or mode changes
  const initFlipBook = useCallback(() => {
    const mountRoot = flipMountRef.current;
    const stageEl = stageRef.current;
    if (!mountRoot || !stageEl) return;

    // Destroy previous instance cleanly
    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {
        // ignore cleanup error
      }
      pageFlipRef.current = null;
    }

    mountRoot.innerHTML = "";

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 900;
    setIsMobile(mobile);

    const portrait = mobile || singlePageOnDesktop;

    // Calculate ideal single-page width & height to fit the stage
    const availH = Math.max(300, vh - (mobile ? 132 : 140));
    const availW = Math.max(260, vw - (mobile ? 20 : 120));

    let pageH = availH;
    let pageW = Math.round(pageH * PAGE_ASPECT_RATIO);

    if (portrait) {
      if (pageW > availW) {
        pageW = availW;
        pageH = Math.round(pageW / PAGE_ASPECT_RATIO);
      }
    } else {
      // In 2-page spread mode, total book width is 2 * pageW
      if (pageW * 2 > availW) {
        pageW = Math.floor(availW / 2);
        pageH = Math.round(pageW / PAGE_ASPECT_RATIO);
      }
    }

    // Create host element inside mountRoot
    const bookEl = document.createElement("div");
    bookEl.className = "hec-flipbook-instance";
    mountRoot.appendChild(bookEl);

    // Create DOM page elements
    const pageNodes: HTMLElement[] = PAGES.map((p, idx) => {
      const item = document.createElement("div");
      item.className = "hec-book-page";
      // Use soft paper density on all pages so every page bends & curls like real paper
      item.dataset.density = "soft";

      const isLeftPage = !portrait && idx > 0 && idx % 2 === 1;
      const spineGradient = portrait
        ? "linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.04) 5%, transparent 12%)"
        : isLeftPage
        ? "linear-gradient(to left, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.06) 6%, transparent 15%)"
        : "linear-gradient(to right, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.06) 6%, transparent 15%)";

      item.innerHTML = `
        <div style="position:relative;width:100%;height:100%;background:#ffffff;overflow:hidden;user-select:none;">
          <img
            src="${p.src}"
            alt="${p.label}"
            draggable="false"
            style="width:100%;height:100%;object-fit:fill;display:block;pointer-events:none;user-select:none;"
          />
          <div style="position:absolute;inset:0;pointer-events:none;background:${spineGradient};"></div>
        </div>
      `;
      bookEl.appendChild(item);
      return item;
    });

    const flip = new PageFlip(bookEl, {
      width: pageW,
      height: pageH,
      size: "fixed" as any,
      minWidth: pageW,
      maxWidth: pageW,
      minHeight: pageH,
      maxHeight: pageH,
      drawShadow: true,
      maxShadowOpacity: 0.7,
      flippingTime: 750,
      usePortrait: portrait,
      startPage: currentPageIndexRef.current,
      startZIndex: 2,
      autoSize: true,
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 15,
      clickEventForward: false,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    flip.loadFromHTML(pageNodes);

    // Force all pages (including cover & back cover) to use SOFT paper-curl physics
    // while keeping Page 1 and Page 26 as single-page covers in the spread!
    try {
      const collection = flip.getPageCollection()?.getPages?.() || [];
      collection.forEach((p: any) => {
        p.setDensity?.("soft");
        p.setDrawingDensity?.("soft");
      });
    } catch {
      // ignore if internal API differs
    }

    // Make mobile finger drag curl the paper immediately on touchstart (without 250ms delay)
    const distEl = flip.getUI()?.getDistElement?.();
    if (distEl) {
      distEl.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          if (e.changedTouches && e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const rect = distEl.getBoundingClientRect();
            flip.startUserTouch({
              x: t.clientX - rect.left,
              y: t.clientY - rect.top,
            });
          }
        },
        { passive: true }
      );
    }

    flip.on("flip", (e: any) => {
      const idx = typeof e.data === "number" ? e.data : 0;
      currentPageIndexRef.current = idx;
      setCurrentPageIndex(idx);
    });

    pageFlipRef.current = flip;
  }, [singlePageOnDesktop]);

  useEffect(() => {
    initFlipBook();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initFlipBook();
      }, 180);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {
          // ignore
        }
        pageFlipRef.current = null;
      }
    };
  }, [initFlipBook]);

  // Preload all 26 images in the background so every page curl is instant
  useEffect(() => {
    PAGES.forEach((p) => {
      const img = new window.Image();
      img.src = p.src;
    });
  }, []);

  const goNext = useCallback(() => {
    pageFlipRef.current?.flipNext("bottom" as any);
  }, []);

  const goPrev = useCallback(() => {
    pageFlipRef.current?.flipPrev("bottom" as any);
  }, []);

  const jumpToPdfPage = useCallback((pdfPageNumber: number) => {
    const targetIdx = Math.max(0, Math.min(TOTAL_PAGES - 1, pdfPageNumber - 1));
    currentPageIndexRef.current = targetIdx;
    setCurrentPageIndex(targetIdx);
    try {
      pageFlipRef.current?.flip(targetIdx, "top" as any);
    } catch {
      pageFlipRef.current?.turnToPage(targetIdx);
    }
    setShowToc(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  const currentPdfPage = currentPageIndex + 1;
  const canGoPrev = currentPageIndex > 0;
  const canGoNext = isPortraitMode
    ? currentPageIndex < TOTAL_PAGES - 1
    : currentPageIndex < TOTAL_PAGES - 1;

  const getPageLabel = () => {
    if (isPortraitMode) {
      if (currentPdfPage === 1) return `Couverture (1 / ${TOTAL_PAGES})`;
      if (currentPdfPage === TOTAL_PAGES)
        return `Dos du livre (${TOTAL_PAGES} / ${TOTAL_PAGES})`;
      return `Page ${currentPdfPage} / ${TOTAL_PAGES}`;
    } else {
      if (currentPdfPage === 1) return `Couverture (1 / ${TOTAL_PAGES})`;
      if (currentPdfPage >= TOTAL_PAGES)
        return `Dos du livre (${TOTAL_PAGES} / ${TOTAL_PAGES})`;
      const left = currentPdfPage % 2 === 0 ? currentPdfPage : currentPdfPage - 1;
      const right = Math.min(TOTAL_PAGES, left + 1);
      return `Pages ${left} – ${right} sur ${TOTAL_PAGES}`;
    }
  };

  const progressPercent = (currentPageIndex / (TOTAL_PAGES - 1)) * 100;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] h-screen w-full bg-[#090612] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Fix upstream stPageFlip wrapper CSS and add realistic book shadows */}
      <style jsx global>{`
        .stf__parent {
          position: relative !important;
          display: block !important;
          box-sizing: border-box !important;
          margin: 0 auto !important;
          touch-action: none !important;
          filter: drop-shadow(0 28px 65px rgba(0, 0, 0, 0.85))
            drop-shadow(0 0 40px rgba(192, 38, 211, 0.18));
        }
        .stf__wrapper {
          position: relative !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .stf__block {
          position: absolute !important;
          width: 100% !important;
          height: 100% !important;
          box-sizing: border-box !important;
          perspective: 2200px !important;
        }
        .stf__item {
          display: none;
          position: absolute;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          border-radius: 4px;
          overflow: hidden;
        }
        .stf__outerShadow,
        .stf__innerShadow,
        .stf__hardShadow,
        .stf__hardInnerShadow {
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none !important;
        }
      `}</style>

      {/* Ambient background glow */}
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
              Glissez ou tirez le coin d&apos;une page pour tourner comme un vrai livre
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Sommaire</span>
          </button>

          {!isMobile && (
            <button
              type="button"
              onClick={() => {
                setSinglePageOnDesktop((prev) => !prev);
                setZoom(1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-purple-100 border border-white/10 transition-all"
              title={
                singlePageOnDesktop
                  ? "Afficher en double page (Livre)"
                  : "Afficher 1 page à la fois"
              }
            >
              {singlePageOnDesktop ? (
                <>
                  <BookOpen className="w-4 h-4 text-fuchsia-400" />
                  <span className="hidden lg:inline">Double Page</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-fuchsia-400" />
                  <span className="hidden lg:inline">1 Page</span>
                </>
              )}
            </button>
          )}

          {/* Zoom */}
          <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
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
              onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(2)))}
              disabled={zoom >= 1.8}
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
            href="/dossier-sponsoring-sme-2026.pdf?v=2"
            download="Dossier-Sponsoring-SME-2026-HEC-Entrepreneurs.pdf"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-600/25 transition-all"
            title="Télécharger le PDF original"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">PDF</span>
          </a>
        </div>
      </header>

      {/* MAIN REAL PAPER-CURL BOOK STAGE */}
      <div
        ref={stageRef}
        className="relative z-10 flex-1 flex items-center justify-center w-full overflow-hidden px-2 sm:px-12 py-2"
      >
        {/* Left Arrow */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Page précédente"
          className="fixed sm:absolute left-1.5 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#160e2c]/85 hover:bg-fuchsia-600 text-white border border-fuchsia-400/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur-md active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Page suivante"
          className="fixed sm:absolute right-1.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#160e2c]/85 hover:bg-fuchsia-600 text-white border border-fuchsia-400/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur-md active:scale-90"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* PageFlip Mount Container */}
        <div
          className="flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${zoom}) translateX(${
              !isPortraitMode
                ? currentPageIndex === 0
                  ? "-25%"
                  : currentPageIndex === TOTAL_PAGES - 1
                  ? "25%"
                  : "0%"
                : "0%"
            })`,
            transformOrigin: "center center",
          }}
        >
          <div ref={flipMountRef} className="flex items-center justify-center" />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <footer className="relative z-30 bg-[#110b22]/90 backdrop-blur-xl border-t border-fuchsia-500/20 px-3 sm:px-6 py-2.5">
        <div className="max-w-3xl mx-auto mb-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => jumpToPdfPage(1)}
            disabled={currentPageIndex === 0}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 disabled:opacity-30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Couverture</span>
          </button>

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
            >
              {getPageLabel()}
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

          <button
            type="button"
            onClick={() => jumpToPdfPage(20)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition"
          >
            <span>Nos Packs</span>
          </button>
        </div>
      </footer>

      {/* SOMMAIRE DRAWER */}
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
                  const isActive = currentPdfPage === item.pdfPage;
                  return (
                    <button
                      key={item.pdfPage}
                      type="button"
                      onClick={() => jumpToPdfPage(item.pdfPage)}
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

      {/* THUMBNAILS FILMSTRIP */}
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
                  const selected = currentPdfPage === p.pageNumber;
                  return (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => {
                        jumpToPdfPage(p.pageNumber);
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
