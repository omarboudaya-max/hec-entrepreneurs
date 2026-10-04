"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, User, GraduationCap, Mail, Phone,
    Facebook, Rocket, Sparkles, Calendar, Clock,
    ChevronLeft, ChevronRight, CheckCircle2, Briefcase,
    Award, HeartHandshake, Link as LinkIcon, Star, Target, Compass
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Scheduling constants
const DATES = ["05/10/2026", "06/10/2026", "07/10/2026", "08/10/2026", "09/10/2026"];
const FULL_DATES = ["05/10/2026"]; // Lundi is full all day
const DATE_LABELS: Record<string, string> = {
    "05/10/2026": "Lundi 05/10",
    "06/10/2026": "Mardi 06/10",
    "07/10/2026": "Mercredi 07/10",
    "08/10/2026": "Jeudi 08/10",
    "09/10/2026": "Vendredi 09/10",
};
const TIMES = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30"
];

// Question Options Definition
const Q_DISPO_TIME = ["Moins de 3h", "3 à 5h", "Plus de 5h"];
const Q_DISPO_EXAMS = ["Oui", "Partiellement", "Non"];
const Q_DISPO_ENGAGEMENTS = ["Aucun", "Un autre club", "Stage ou job", "Autre"];

const Q_EXP_ASSOCIATIVE = ["Aucune", "Membre d'un club", "Responsable / membre du bureau"];
const Q_EXP_PROJECT = ["J'ai organisé un projet", "J'ai contribué à un projet", "Ni l'un ni l'autre"];
const Q_EXP_SPONSORS = ["Jamais", "J'ai contacté", "J'ai négocié", "J'ai obtenu un partenariat"];
const Q_EXP_CERTIFS = ["Aucune", "Leadership / management", "Entrepreneuriat", "Communication", "Autre"];

const Q_SKILLS = [
    "Prise de parole", "Rédaction", "Design / montage", "Réseaux sociaux",
    "Sponsoring et relations externes", "Organisation / logistique",
    "Gestion d'équipe", "Négociation / vente", "Gestion de projet", "Autre"
];

const Q_WHY_JOIN = [
    "Lancer des projets", "Développer mon leadership", "Élargir mon réseau",
    "Apprendre l'entrepreneuriat", "Organiser des événements", "Enrichir mon CV", "Faire partie d'une équipe"
];

const Q_STRATEGIC_AXIS = [
    "Esprit entrepreneurial", "Compétences et leadership",
    "Impact responsable", "Connexion et réseau", "Rayonnement et visibilité"
];

const Q_CONTRIBUTION_DOMAINS = [
    "Organisation d'événements", "Communication / médias",
    "Partenariats / sponsoring", "Ressources humaines", "Formation", "Projets à impact"
];

const Q_FIRST_PROJECT = [
    "Tribunal 2.0",
    "Ouverture de la Semaine mondiale de l'entrepreneuriat",
    "Clôture de la Semaine mondiale de l'entrepreneuriat",
    "Formations",
    "Un nouveau projet"
];

const Q_HOW_KNOW = [
    "Grand Tribunal de l'Entrepreneuriat", "Réseaux sociaux", "Un membre", "Le stand", "Autre"
];

const Q_HAS_IDEA = ["Oui", "Peut-être", "Non"];

interface SlotAvailability {
    [key: string]: number;
}

const getSlotLimit = (time: string): number => {
    if (time === "13:00" || time === "13:30") {
        return 10;
    }
    return 5;
};

export default function Join() {
    const [step, setStep] = useState(1);
    const formTopRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (formTopRef.current) {
            const yOffset = -100;
            const element = formTopRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
    }, [step]);

    const [formData, setFormData] = useState({
        // Section 1. Identité
        fullName: "",
        education: "",
        phone: "",
        email: "",
        facebook: "",

        // Section 2. Disponibilité
        availableTime: "",
        availableExams: "",
        otherEngagements: "",

        // Section 3. Expérience
        associativeExp: "",
        projectContribution: "",
        projectDetails: "",
        sponsorRelations: "",
        certifications: "",

        // Section 4. Compétences
        skills: [] as string[],
        portfolioLink: "",

        // Section 5. Intérêt & Motivation
        whyJoin: [] as string[],
        strategicAxis: "",
        contributionDomain: [] as string[],
        firstChoiceProject: "",
        howDidYouKnow: "",
        hasProjectIdea: "",
        entrepreneurshipInterest: 5,

        // Scheduling
        interviewDate: "",
        interviewTime: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [availability, setAvailability] = useState<SlotAvailability>({});

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch("/api/recruitment/slots", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.counts) {
                        setAvailability(data.counts);
                    }
                }
            } catch (err) {
                console.error("Error fetching slot availability:", err);
            }
        };

        fetchAvailability();
    }, [step]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Helper for single choice button selection
    const selectSingle = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper for multi choice toggle with max limit
    const toggleMulti = (field: "skills" | "whyJoin" | "contributionDomain", value: string, maxLimit?: number) => {
        setFormData(prev => {
            const current = [...prev[field]];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(v => v !== value) };
            } else {
                if (maxLimit && current.length >= maxLimit) {
                    return prev;
                }
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (!formData.fullName || !formData.education || !formData.phone || !formData.email || !formData.facebook?.trim()) {
                alert("Veuillez remplir tous les champs obligatoires de la section Identité (y compris le lien Facebook / réseaux sociaux).");
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.availableTime || !formData.availableExams || !formData.otherEngagements || !formData.associativeExp || !formData.projectContribution) {
                alert("Veuillez répondre à toutes les questions de disponibilité et d'expérience.");
                return false;
            }
            if ((formData.projectContribution === "J'ai organisé un projet" || formData.projectContribution === "J'ai contribué à un projet") && !formData.projectDetails.trim()) {
                alert("Veuillez décrire brièvement le projet auquel vous avez contribué.");
                return false;
            }
        } else if (currentStep === 3) {
            if (formData.skills.length === 0) {
                alert("Veuillez sélectionner au moins une compétence.");
                return false;
            }
        } else if (currentStep === 4) {
            if (!formData.whyJoin.length || !formData.strategicAxis || !formData.contributionDomain.length || !formData.firstChoiceProject || !formData.howDidYouKnow || !formData.hasProjectIdea) {
                alert("Veuillez répondre à toutes les questions de la section Motivation.");
                return false;
            }
        }
        return true;
    };

    const nextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async () => {
        if (!formData.interviewDate || !formData.interviewTime) {
            alert("Veuillez choisir la date et l'heure de votre entretien.");
            return;
        }

        const slotKey = `${formData.interviewDate}_${formData.interviewTime}`;
        const bookedCount = availability[slotKey] || 0;
        const limit = getSlotLimit(formData.interviewTime);
        if (bookedCount >= limit) {
            alert("Désolé, ce créneau horaire est désormais complet. Veuillez sélectionner un autre horaire disponible.");
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionData = {
                fullName: formData.fullName,
                education: formData.education,
                phone: formData.phone,
                email: formData.email,
                facebook: formData.facebook,
                availableTime: formData.availableTime,
                availableExams: formData.availableExams,
                otherEngagements: formData.otherEngagements,
                associativeExp: formData.associativeExp,
                projectContribution: formData.projectContribution,
                projectDetails: formData.projectDetails,
                sponsorRelations: formData.sponsorRelations,
                certifications: formData.certifications,
                skills: formData.skills.join(", "),
                portfolioLink: formData.portfolioLink,
                whyJoin: formData.whyJoin.join(", "),
                strategicAxis: formData.strategicAxis,
                contributionDomain: formData.contributionDomain.join(", "),
                firstChoiceProject: formData.firstChoiceProject,
                howDidYouKnow: formData.howDidYouKnow,
                hasProjectIdea: formData.hasProjectIdea,
                entrepreneurshipInterest: formData.entrepreneurshipInterest,
                interviewDate: formData.interviewDate,
                interviewTime: formData.interviewTime,
                submittedAt: new Date().toLocaleString(),
            };

            // 1. Submit to Supabase Database
            try {
                await supabase.from("candidatures_recrutement").insert([{
                    full_name: formData.fullName,
                    education: formData.education,
                    phone: formData.phone,
                    email: formData.email,
                    facebook: formData.facebook,
                    available_time: formData.availableTime,
                    available_exams: formData.availableExams,
                    other_engagements: formData.otherEngagements,
                    associative_exp: formData.associativeExp,
                    project_contribution: formData.projectContribution,
                    project_details: formData.projectDetails,
                    sponsor_relations: formData.sponsorRelations,
                    certifications: formData.certifications,
                    skills: formData.skills,
                    portfolio_link: formData.portfolioLink,
                    why_join: formData.whyJoin,
                    strategic_axis: formData.strategicAxis,
                    contribution_domain: formData.contributionDomain,
                    first_choice_project: formData.firstChoiceProject,
                    how_did_you_know: formData.howDidYouKnow,
                    has_project_idea: formData.hasProjectIdea,
                    entrepreneurship_interest: formData.entrepreneurshipInterest,
                    interview_date: formData.interviewDate,
                    interview_time: formData.interviewTime,
                }]);
            } catch (dbErr) {
                console.warn("Supabase insert warning:", dbErr);
            }

            // 2. Submit to Google Sheets Script
            const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw71VZcsn6yWJk19lzPRCKBtF7R-VgxcjIgbAqyB-NyKFiKgscwtOAws2jyYxsDCl1G/exec";
            if (sheetsUrl) {
                try {
                    await fetch(sheetsUrl, {
                        method: "POST",
                        mode: "no-cors",
                        cache: "no-cache",
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify(submissionData),
                    });
                } catch (sheetErr) {
                    console.error("Google Sheets submit error:", sheetErr);
                }
            }

            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting candidature:", error);
            alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.08 },
        },
    };

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/30">
            <Navbar />

            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_70%)] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 container mx-auto px-3 sm:px-4 py-16 md:py-28 flex flex-col items-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full max-w-3xl"
                >
                    {!submitted && (
                        <header ref={formTopRef} className="text-center mb-10">
                            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 animate-float" />
                                <h1 className="text-2xl sm:text-4xl md:text-5xl font-thin mb-3 uppercase tracking-[0.1em] sm:tracking-[0.2em] px-2">
                                    <span className="text-wave">REJOIGNEZ LE CLUB</span>
                                </h1>
                                <p className="text-gray-400 font-mono tracking-widest text-xs uppercase mb-8">Formulaire de Recrutement 2026/2027</p>
                                
                                {/* Step Tracker */}
                                <div className="grid grid-cols-5 gap-1 sm:gap-2 max-w-2xl mx-auto mb-6">
                                    {[
                                        { num: 1, label: "Identité" },
                                        { num: 2, label: "Dispo & Exp" },
                                        { num: 3, label: "Compétences" },
                                        { num: 4, label: "Motivation" },
                                        { num: 5, label: "Entretien" },
                                    ].map((s) => (
                                        <div 
                                            key={s.num}
                                            onClick={() => s.num < step && setStep(s.num)}
                                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${step === s.num ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]' : s.num < step ? 'bg-white/5 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-gray-500'}`}
                                        >
                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                                                {s.num < step ? "✓" : s.num}
                                            </span>
                                            <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline truncate max-w-full">
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </header>
                    )}

                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <form onSubmit={step < 5 ? nextStep : (e) => e.preventDefault()}>
                                {/* STEP 1: IDENTITÉ */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="glass p-5 sm:p-8 md:p-10 rounded-3xl space-y-6"
                                    >
                                        <h2 className="text-xl font-light text-primary uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-4">
                                            <User className="w-5 h-5 text-primary" /> Section 1. Identité
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Nom et prénom *</label>
                                                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Votre nom complet" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-white text-sm" />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Classe / Filière *</label>
                                                <input required type="text" name="education" value={formData.education} onChange={handleChange} placeholder="Ex: 2ème Licence Finance / Master..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-white text-sm" />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Numéro de téléphone *</label>
                                                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="XX XXX XXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-white text-sm" />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Adresse email *</label>
                                                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre.email@exemple.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-white text-sm" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                                <Facebook className="w-4 h-4 text-blue-400" /> Lien profil Facebook / réseaux sociaux *
                                            </label>
                                            <input required type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/votre.profil" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-white text-sm" />
                                        </div>

                                        <button type="submit" className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                            <span>Suivant : Disponibilité & Expérience</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    </motion.div>
                                )}

                                {/* STEP 2: DISPONIBILITÉ & EXPÉRIENCE */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="glass p-5 sm:p-8 md:p-10 rounded-3xl space-y-8"
                                    >
                                        {/* DISPONIBILITÉ */}
                                        <div className="space-y-6">
                                            <h2 className="text-lg font-light text-secondary uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-3">
                                                <Clock className="w-5 h-5 text-secondary" /> Section 2. Disponibilité
                                            </h2>

                                            {/* Q5 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    5. Temps disponible par semaine * :
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {Q_DISPO_TIME.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("availableTime", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.availableTime === opt ? 'bg-secondary/30 border-secondary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Q6 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    6. Disponible pendant les périodes d'examens * :
                                                </label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {Q_DISPO_EXAMS.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("availableExams", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.availableExams === opt ? 'bg-secondary/30 border-secondary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Q7 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    7. Autres engagements en parallèle * :
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {Q_DISPO_ENGAGEMENTS.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("otherEngagements", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.otherEngagements === opt ? 'bg-secondary/30 border-secondary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* EXPÉRIENCE */}
                                        <div className="space-y-6 pt-4 border-t border-white/10">
                                            <h2 className="text-lg font-light text-primary uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-3">
                                                <Briefcase className="w-5 h-5 text-primary" /> Section 3. Expérience
                                            </h2>

                                            {/* Q8 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    8. Expérience associative * :
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {Q_EXP_ASSOCIATIVE.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("associativeExp", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.associativeExp === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Q9 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    9. As-tu organisé un projet ou contribué à un projet ? * :
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {Q_EXP_PROJECT.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("projectContribution", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.projectContribution === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Q10 CONDITIONAL */}
                                            <AnimatePresence>
                                                {(formData.projectContribution === "J'ai organisé un projet" || formData.projectContribution === "J'ai contribué à un projet") && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-2 overflow-hidden bg-primary/10 p-4 rounded-2xl border border-primary/30"
                                                    >
                                                        <label className="text-xs font-semibold text-primary uppercase tracking-wider block">
                                                            10. Précisez : Nom du projet, ton rôle et ce que tu as fait concrètement (3 lignes max) *
                                                        </label>
                                                        <textarea
                                                            name="projectDetails"
                                                            value={formData.projectDetails}
                                                            onChange={handleChange}
                                                            rows={3}
                                                            placeholder="Expliquez brièvement le projet, votre rôle et vos réalisations..."
                                                            className="w-full bg-black/40 border border-primary/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary transition-all resize-none"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Q11 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    11. Relations avec des sponsors ou partenaires :
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {Q_EXP_SPONSORS.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("sponsorRelations", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.sponsorRelations === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Q12 */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white block">
                                                    12. Formations ou certifications :
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {Q_EXP_CERTIFS.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => selectSingle("certifications", opt)}
                                                            className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.certifications === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={prevStep} className="w-1/3 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1">
                                                <ChevronLeft size={16} /> Retour
                                            </button>
                                            <button type="submit" className="w-2/3 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                <span>Suivant : Compétences</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: COMPÉTENCES */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="glass p-5 sm:p-8 md:p-10 rounded-3xl space-y-8"
                                    >
                                        <h2 className="text-lg font-light text-accent uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-3">
                                            <Star className="w-5 h-5 text-accent" /> Section 4. Compétences
                                        </h2>

                                        {/* Q13 */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-white block">
                                                    13. Sélectionne les compétences que tu maîtrises * :
                                                </label>
                                                <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                                                    {formData.skills.length} sélectionnée(s)
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Q_SKILLS.map((skill) => {
                                                    const isSelected = formData.skills.includes(skill);
                                                    return (
                                                        <button
                                                            key={skill}
                                                            type="button"
                                                            onClick={() => toggleMulti("skills", skill)}
                                                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${isSelected ? 'bg-primary/30 border-primary text-white shadow-md shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            <span className="text-xs font-semibold">{skill}</span>
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${isSelected ? 'border-primary bg-primary text-white font-bold' : 'border-gray-600'}`}>
                                                                {isSelected && "✓"}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* CONDITIONAL PORTFOLIO LINK */}
                                        <AnimatePresence>
                                            {formData.skills.includes("Design / montage") && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-2 overflow-hidden bg-primary/10 p-4 rounded-2xl border border-primary/30"
                                                >
                                                    <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                                                        <LinkIcon className="w-4 h-4" /> Lien vers votre travail / portfolio (Optionnel)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="portfolioLink"
                                                        value={formData.portfolioLink}
                                                        onChange={handleChange}
                                                        placeholder="https://drive.google.com/... ou Behance / Instagram"
                                                        className="w-full bg-black/40 border border-primary/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary transition-all"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={prevStep} className="w-1/3 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1">
                                                <ChevronLeft size={16} /> Retour
                                            </button>
                                            <button type="submit" className="w-2/3 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                <span>Suivant : Motivation</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 4: INTÉRÊT & MOTIVATION */}
                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="glass p-5 sm:p-8 md:p-10 rounded-3xl space-y-8"
                                    >
                                        <h2 className="text-lg font-light text-primary uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-3">
                                            <Target className="w-5 h-5 text-primary" /> Section 5. Intérêt & Motivation
                                        </h2>

                                        {/* Q14 (Max 3) */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-white block">
                                                    14. Pourquoi rejoindre le club ? * (3 options maximum) :
                                                </label>
                                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${formData.whyJoin.length === 3 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-primary/10 text-primary'}`}>
                                                    {formData.whyJoin.length}/3 max
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Q_WHY_JOIN.map((opt) => {
                                                    const isSelected = formData.whyJoin.includes(opt);
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => toggleMulti("whyJoin", opt, 3)}
                                                            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-semibold ${isSelected ? 'bg-primary/30 border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            <span>{opt}</span>
                                                            {isSelected && <span className="text-primary font-bold">✓</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Q15 */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white block">
                                                15. Axe stratégique qui t'attire le plus * (une seule option) :
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Q_STRATEGIC_AXIS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => selectSingle("strategicAxis", opt)}
                                                        className={`p-3.5 rounded-xl border text-left transition-all text-xs font-semibold ${formData.strategicAxis === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Q16 (Max 2) */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-white block">
                                                    16. Domaine où tu veux contribuer * (2 options maximum) :
                                                </label>
                                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${formData.contributionDomain.length === 2 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-secondary/10 text-secondary'}`}>
                                                    {formData.contributionDomain.length}/2 max
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Q_CONTRIBUTION_DOMAINS.map((opt) => {
                                                    const isSelected = formData.contributionDomain.includes(opt);
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => toggleMulti("contributionDomain", opt, 2)}
                                                            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-semibold ${isSelected ? 'bg-secondary/30 border-secondary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            <span>{opt}</span>
                                                            {isSelected && <span className="text-secondary font-bold">✓</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Q17 */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white block">
                                                17. Sur quoi voudrais-tu travailler en premier ? * :
                                            </label>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {Q_FIRST_PROJECT.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => selectSingle("firstChoiceProject", opt)}
                                                        className={`p-3.5 rounded-xl border text-left transition-all text-xs font-semibold ${formData.firstChoiceProject === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Q18 */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white block">
                                                18. Comment as-tu connu le club ? * :
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {Q_HOW_KNOW.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => selectSingle("howDidYouKnow", opt)}
                                                        className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.howDidYouKnow === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Q19 */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white block">
                                                19. As-tu une idée de projet à proposer ? * :
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {Q_HAS_IDEA.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => selectSingle("hasProjectIdea", opt)}
                                                        className={`p-3.5 rounded-xl border text-center transition-all text-xs font-semibold ${formData.hasProjectIdea === opt ? 'bg-primary/30 border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Q20 RATING */}
                                        <div className="space-y-3 pt-2">
                                            <label className="text-sm font-medium text-white block">
                                                20. Ton intérêt pour l'entrepreneuriat (1 = Faible, 5 = Très élevé) * :
                                            </label>
                                            <div className="grid grid-cols-5 gap-3">
                                                {[1, 2, 3, 4, 5].map((score) => (
                                                    <button
                                                        key={score}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, entrepreneurshipInterest: score }))}
                                                        className={`py-4 rounded-xl border text-center transition-all font-bold text-base ${formData.entrepreneurshipInterest === score ? 'bg-gradient-to-r from-primary to-accent border-primary text-white shadow-lg scale-105' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                    >
                                                        {score} ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={prevStep} className="w-1/3 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-1">
                                                <ChevronLeft size={16} /> Retour
                                            </button>
                                            <button type="submit" className="w-2/3 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                <span>Suivant : Prise de Rendez-vous</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 5: PLANIFICATION ENTRETIEN */}
                                {step === 5 && (
                                    <motion.div
                                        key="step5"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="glass p-5 sm:p-8 md:p-10 rounded-3xl space-y-8"
                                    >
                                        <h2 className="text-lg font-light text-primary uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-3">
                                            <Calendar className="w-5 h-5 text-primary" /> Section 6. Entretien d'Intégration
                                        </h2>

                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-white block">
                                                Choisissez la date de votre entretien d'intégration :
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                                {DATES.map((date) => {
                                                    const isFull = FULL_DATES.includes(date);
                                                    if (isFull) {
                                                        return (
                                                            <div
                                                                key={date}
                                                                className="py-3 px-2 rounded-xl border border-white/5 bg-white/5 text-gray-500 text-xs font-semibold cursor-not-allowed flex flex-col items-center justify-center gap-1 opacity-60 select-none"
                                                                title="Cette journée est complète"
                                                            >
                                                                <span className="line-through">{DATE_LABELS[date] || date}</span>
                                                                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                                                    Complet
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <button
                                                            key={date}
                                                            type="button"
                                                            onClick={() => setFormData(p => ({ ...p, interviewDate: date, interviewTime: "" }))}
                                                            className={`py-3.5 px-2 rounded-xl border transition-all text-xs font-semibold ${formData.interviewDate === date ? 'bg-primary border-primary text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50'}`}
                                                        >
                                                            {DATE_LABELS[date] || date}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {formData.interviewDate && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-white">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="text-secondary w-4 h-4" />
                                                        <label className="text-sm font-medium text-white block">Choisissez l'heure de l'entretien (9h - 15h30) :</label>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        Limité à 5 personnes (10 à 13h & 13h30)
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                                                    {TIMES.map((time) => {
                                                        const slotKey = `${formData.interviewDate}_${time}`;
                                                        const bookedCount = availability[slotKey] || 0;
                                                        const slotLimit = getSlotLimit(time);
                                                        const isFull = bookedCount >= slotLimit;
                                                        const remaining = Math.max(0, slotLimit - bookedCount);
                                                        const isSelected = formData.interviewTime === time;

                                                        if (isFull) {
                                                            return (
                                                                <div
                                                                    key={time}
                                                                    className="py-2.5 px-2 rounded-xl border border-white/5 bg-white/5 text-gray-500 text-xs font-semibold cursor-not-allowed flex flex-col items-center justify-center gap-0.5 opacity-50 select-none"
                                                                    title="Créneau complet"
                                                                >
                                                                    <span className="line-through text-xs">{time}</span>
                                                                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-500/10 px-1 py-0.2 rounded border border-red-500/20">
                                                                        Complet
                                                                    </span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                key={time}
                                                                type="button"
                                                                onClick={() => setFormData(p => ({ ...p, interviewTime: time }))}
                                                                className={`py-2 px-2 rounded-xl border transition-all text-xs font-semibold flex flex-col items-center justify-center gap-0.5 ${
                                                                    isSelected
                                                                        ? 'bg-secondary border-secondary text-white shadow-md shadow-secondary/30 scale-105'
                                                                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-secondary/50 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                <span className="font-medium text-xs">{time}</span>
                                                                <span className={`text-[9px] font-mono tracking-tight ${isSelected ? 'text-white/90' : remaining <= 2 ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                                                                    {remaining} {remaining === 1 ? 'place' : 'places'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                            <button type="button" onClick={prevStep} className="w-full sm:flex-1 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 order-2 sm:order-1">
                                                <ChevronLeft size={16} /> Retour
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!formData.interviewDate || !formData.interviewTime || isSubmitting}
                                                onClick={handleSubmit}
                                                className="w-full sm:flex-[2] py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs uppercase tracking-widest hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 order-1 sm:order-2"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>Confirmer et Envoyer ma Candidature</span>
                                                        <Send size={16} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-6 sm:p-12 rounded-3xl text-center space-y-6 mx-2"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="text-green-500 w-10 h-10" />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-thin text-wave uppercase tracking-[0.2em]">Candidature Reçue</h1>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-gray-300 max-w-md mx-auto text-sm leading-relaxed">
                                            Félicitations <span className="text-primary font-bold">{formData.fullName}</span> ! Ton formulaire a été transmis avec succès au Bureau du Club HEC Entrepreneurs.
                                        </p>
                                        <p className="text-white font-medium text-sm">
                                            Entretien prévu le <span className="text-primary">{formData.interviewDate}</span> à <span className="text-primary">{formData.interviewTime}</span>.
                                        </p>
                                    </div>
                                    <p className="text-gray-400 text-xs max-w-sm mx-auto">
                                        Un e-mail de confirmation te sera envoyé sous peu avec les détails d'accès à l'entretien.
                                    </p>
                                </div>
                                <div className="pt-6">
                                    <a href="/" className="px-10 py-3.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all uppercase text-xs tracking-widest inline-block">
                                        Retour à l'accueil
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
