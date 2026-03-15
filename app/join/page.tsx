"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, User, GraduationCap, Mail, Phone, MapPin,
    Facebook, Rocket, Sparkles, Calendar, Clock,
    ChevronLeft, ChevronRight, CheckCircle2, Briefcase, Instagram
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, Timestamp, query } from "firebase/firestore";

// Constants for scheduling
const DATES = ["02/03/2026", "03/03/2026", "04/03/2026", "05/03/2026", "06/03/2026", "07/03/2026"];
const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"];
const SLOT_LIMIT = 2;

const SKILLS_OPTIONS = [
    { id: "tech", label: "Tech & Innovation", desc: "AI, Data & Analyse..." },
    { id: "design", label: "Design & Création", desc: "Graphic Design, Content Creation...." },
    { id: "business", label: "Business & Croissance", desc: "Sponsoring, Marketing..." },
    { id: "management", label: "Management & Leadership", desc: "Gestion de projet, Public Speaking..." },
    { id: "autre", label: "Autre", desc: "" }
];

interface SlotAvailability {
    [key: string]: number; // "date-time" : count
}

export default function Join() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: "",
        education: "",
        email: "",
        phone: "",
        address: "",
        facebook: "",
        skills: [] as string[],
        hasProject: "",
        projectDetails: "",
        interviewDate: "",
        interviewTime: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [availability, setAvailability] = useState<SlotAvailability>({});
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        try {
            const q = query(collection(db, "candidates"));
            const querySnapshot = await getDocs(q);
            const counts: SlotAvailability = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.interviewDate && data.interviewTime) {
                    const key = `${data.interviewDate}-${data.interviewTime}`;
                    counts[key] = (counts[key] || 0) + 1;
                }
            });
            setAvailability(counts);
        } catch (error) {
            console.error("Error fetching availability:", error);
        }
        setIsLoadingSlots(false);
    };

    useEffect(() => {
        if (step === 2) {
            fetchAvailability();
        }
    }, [step]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleSkill = (skillLabel: string) => {
        setFormData(prev => {
            const current = [...prev.skills];
            if (current.includes(skillLabel)) {
                return { ...prev, skills: current.filter(s => s !== skillLabel) };
            } else {
                return { ...prev, skills: [...current, skillLabel] };
            }
        });
    };

    const nextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            if (formData.skills.length === 0) {
                alert("Veuillez choisir au moins une compétence.");
                return;
            }
            if (!formData.hasProject) {
                alert("Veuillez répondre à la question sur le projet personnel.");
                return;
            }
            setStep(2);
        }
    };

    const prevStep = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                skills: formData.skills.join(", "),
                submittedAt: Timestamp.now(),
            };

            // 1. Save to Firebase
            await addDoc(collection(db, "candidates"), submissionData);

            // 2. Save to Google Sheets
            const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL;
            if (sheetsUrl) {
                await fetch(sheetsUrl, {
                    method: "POST",
                    mode: "no-cors",
                    cache: "no-cache",
                    headers: { "Content-Type": "text/plain" },
                    body: JSON.stringify({
                        ...submissionData,
                        submittedAt: new Date().toLocaleString(),
                    }),
                });
            }

            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        }
        setIsSubmitting(false);
    };

    const isSlotFull = (date: string, time: string) => {
        const limit = date === "04/03/2026" ? 3 : SLOT_LIMIT;
        return (availability[`${date}-${time}`] || 0) >= limit;
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.15),transparent_70%)] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 container mx-auto px-4 py-16 md:py-32 flex flex-col items-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full max-w-3xl"
                >
                    <header className="text-center mb-12">
                        <motion.div variants={itemVariants}>
                            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
                            <h1 className="text-3xl sm:text-4xl md:text-6xl font-thin mb-4 text-wave uppercase tracking-[0.2em] px-2 text-center">
                                RECRUTEMENT
                            </h1>
                        </motion.div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-8 sm:p-12 md:p-16 rounded-3xl text-center space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                                />
                                <Clock className="text-primary w-12 h-12 relative z-10" />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-5xl font-thin text-wave uppercase tracking-[0.2em]">
                                    RECRUTEMENT CLÔTURÉ
                                </h2>
                                <p className="text-xl text-white font-light uppercase tracking-widest opacity-80">
                                    Session Actuelle Terminée
                                </p>
                            </div>

                            <div className="max-w-md mx-auto space-y-6">
                                <p className="text-gray-400 leading-relaxed">
                                    Merci énormément pour votre intérêt envers <span className="text-primary font-medium">HEC Entrepreneurs</span>.
                                    Les inscriptions pour cette session sont désormais fermées.
                                </p>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-secondary text-sm font-medium">
                                    ✨ Restez connectés sur nos réseaux pour ne pas rater la prochaine session de recrutement !
                                </div>
                            </div>

                            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/" className="px-8 py-4 rounded-full bg-primary text-white font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all uppercase text-sm tracking-widest">
                                    Retour à l&apos;accueil
                                </Link>
                                <a href="https://www.instagram.com/hec_entrepreneurs" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2">
                                    <Instagram size={16} /> Suivez-nous
                                </a>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
