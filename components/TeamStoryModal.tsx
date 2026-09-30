"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Pause, Play, Sparkles, GraduationCap, Award, Briefcase, CheckCircle2 } from "lucide-react";

export interface StorySlide {
    title: string;
    subtitle: string;
    tagline: string;
    badge?: string;
    highlights: string[];
    bigStat?: { number: string; label: string };
}

export interface TeamMemberBio {
    name: string;
    role: string;
    image?: string | null;
    stories: StorySlide[];
}

interface TeamStoryModalProps {
    member: TeamMemberBio | null;
    onClose: () => void;
}

export default function TeamStoryModal({ member, onClose }: TeamStoryModalProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slidesCount = member?.stories?.length || 0;

    const nextSlide = useCallback(() => {
        if (!member || slidesCount === 0) return;
        if (currentSlideIndex < slidesCount - 1) {
            setCurrentSlideIndex((prev) => prev + 1);
        } else {
            onClose();
        }
    }, [currentSlideIndex, slidesCount, member, onClose]);

    const prevSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex((prev) => prev - 1);
        }
    }, [currentSlideIndex]);

    // Reset slide index when member changes
    useEffect(() => {
        setCurrentSlideIndex(0);
        setIsPaused(false);
    }, [member]);

    // Auto-advance timer
    useEffect(() => {
        if (!member || isPaused || slidesCount === 0) return;
        const timer = setTimeout(() => {
            nextSlide();
        }, 5500);

        return () => clearTimeout(timer);
    }, [currentSlideIndex, isPaused, member, slidesCount, nextSlide]);

    // Toggle body class to hide background widgets when modal is open
    useEffect(() => {
        if (member) {
            document.body.classList.add("story-modal-open");
        } else {
            document.body.classList.remove("story-modal-open");
        }
        return () => {
            document.body.classList.remove("story-modal-open");
        };
    }, [member]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" || e.key === " ") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide, onClose]);

    if (!member || slidesCount === 0) return null;

    const safeIndex = Math.min(Math.max(0, currentSlideIndex), slidesCount - 1);
    const currentSlide = member.stories[safeIndex];

    if (!currentSlide) return null;

    const slideIcons = [GraduationCap, Award, Briefcase];
    const SlideIcon = slideIcons[safeIndex % slideIcons.length] || Sparkles;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl"
                onClick={onClose}
            >
                {/* Story Container Card */}
                <motion.div
                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 30, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="relative w-full max-w-lg h-[85vh] max-h-[720px] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[2.5rem] border border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden flex flex-col justify-between"
                >
                    {/* Background Decorative Auras */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[90px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-[90px] pointer-events-none" />

                    {/* TOP HEADER & PROGRESS BARS */}
                    <div className="relative z-20 p-5 sm:p-6 pb-2 space-y-4">
                        {/* Progress Bar Indicators */}
                        <div className="flex gap-2">
                            {member.stories.map((_, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setCurrentSlideIndex(idx)}
                                    className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                                >
                                    {idx < currentSlideIndex && (
                                        <div className="w-full h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                                    )}
                                    {idx === currentSlideIndex && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: isPaused ? "100%" : "100%" }}
                                            transition={{ duration: isPaused ? 0 : 5.5, ease: "linear" }}
                                            className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Profile Bar */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary/60 p-0.5 overflow-hidden shadow-md shrink-0">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs sm:text-base">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-white text-xs sm:text-base font-medium tracking-wide flex flex-wrap items-center gap-1.5 truncate">
                                        <span className="truncate">{member.name}</span>
                                        {currentSlide.badge && (
                                            <span className="text-[9px] sm:text-[10px] bg-primary/20 text-primary border border-primary/40 px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0">
                                                {currentSlide.badge}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-400 text-[10px] sm:text-xs font-mono truncate">{member.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="p-1.5 sm:p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
                                    title={isPaused ? "Reprendre" : "Pause"}
                                >
                                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 sm:p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN SLIDE CONTENT */}
                    <div className="relative z-10 flex-1 px-4 sm:px-8 py-3 sm:py-4 flex flex-col justify-center overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlideIndex}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 sm:space-y-6"
                            >
                                {/* Category Icon & Subtitle */}
                                <div className="space-y-1.5 sm:space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                                        <SlideIcon className="w-3.5 h-3.5 text-primary" />
                                        <span>{currentSlide.subtitle}</span>
                                    </div>
                                    <h2 className="text-xl sm:text-3xl font-light text-white tracking-wide uppercase italic leading-tight">
                                        {currentSlide.title}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-secondary italic font-light">
                                        &quot;{currentSlide.tagline}&quot;
                                    </p>
                                </div>

                                {/* BIG STAT COUNTER (IF PRESENT) */}
                                {currentSlide.bigStat && (
                                    <div className="bg-gradient-to-r from-primary/20 via-secondary/15 to-transparent p-5 rounded-2xl border border-primary/30 flex items-center gap-4">
                                        <div className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                            {currentSlide.bigStat.number}
                                        </div>
                                        <div className="text-xs uppercase tracking-widest text-gray-300 font-semibold leading-snug">
                                            {currentSlide.bigStat.label}
                                        </div>
                                    </div>
                                )}

                                {/* HIGHLIGHTS LIST */}
                                <div className="space-y-3 pt-2">
                                    {currentSlide.highlights.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 + idx * 0.1 }}
                                            className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl hover:border-primary/40 transition-colors"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-200 font-light leading-relaxed">
                                                {item}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* TOUCH / NAV OVERLAY TAP ZONES */}
                    <div className="absolute inset-y-20 left-0 w-1/3 z-10" onClick={prevSlide} />
                    <div className="absolute inset-y-20 right-0 w-1/3 z-10" onClick={nextSlide} />

                    {/* BOTTOM NAV BAR */}
                    <div className="relative z-20 p-5 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlideIndex === 0}
                            className="flex items-center gap-1 text-xs uppercase tracking-widest text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                        >
                            <ChevronLeft size={16} /> Précédent
                        </button>

                        <div className="text-xs font-mono text-gray-400">
                            {currentSlideIndex + 1} / {slidesCount}
                        </div>

                        <button
                            onClick={nextSlide}
                            className="flex items-center gap-1 text-xs uppercase tracking-widest text-primary font-bold hover:text-white transition-all"
                        >
                            <span>{currentSlideIndex === slidesCount - 1 ? "Fermer" : "Suivant"}</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
