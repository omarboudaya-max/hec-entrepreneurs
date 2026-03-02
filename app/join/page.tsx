"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, User, GraduationCap, Mail, Phone, MapPin,
    Facebook, Rocket, Sparkles, Calendar, Clock,
    ChevronLeft, ChevronRight, CheckCircle2, Briefcase
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

    useEffect(() => {
        if (step === 2) {
            fetchAvailability();
        }
    }, [step]);

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
                    {!submitted && (
                        <header className="text-center mb-12">
                            <motion.div variants={itemVariants}>
                                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-thin mb-4 text-wave uppercase tracking-[0.2em] px-2">
                                    REJOIGNEZ NOUS
                                </h1>
                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <div className={`flex items-center gap-2 ${step === 1 ? 'text-white' : 'text-gray-500'}`}>
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 1 ? 'border-primary bg-primary/20' : 'border-gray-700'}`}>1</span>
                                        <span className="text-sm font-medium uppercase tracking-widest hidden sm:inline">Infos & Compétences</span>
                                    </div>
                                    <div className="w-12 h-px bg-gray-800" />
                                    <div className={`flex items-center gap-2 ${step === 2 ? 'text-white' : 'text-gray-500'}`}>
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 2 ? 'border-primary bg-primary/20' : 'border-gray-700'}`}>2</span>
                                        <span className="text-sm font-medium uppercase tracking-widest hidden sm:inline">Entretien</span>
                                    </div>
                                </div>
                            </motion.div>
                        </header>
                    )}

                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            step === 1 ? (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={nextStep}
                                    className="glass p-5 sm:p-8 md:p-12 rounded-3xl space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                <User size={16} className="text-primary" /> Nom et Prénom
                                            </label>
                                            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Votre nom complet" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                <GraduationCap size={16} className="text-primary" /> Niveau scolaire et filière
                                            </label>
                                            <input required type="text" name="education" value={formData.education} onChange={handleChange} placeholder="Ex: 3ème liscence finance" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                <Mail size={16} className="text-primary" /> Email
                                            </label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@mail.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                <Phone size={16} className="text-primary" /> Numéro de téléphone
                                            </label>
                                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="00 000 000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white text-base" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                            <MapPin size={16} className="text-primary" /> Adresse
                                        </label>
                                        <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Votre adresse actuelle" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                            <Facebook size={16} className="text-primary" /> Lien Facebook
                                        </label>
                                        <input required type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/votre.profil" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all text-white" />
                                    </div>

                                    {/* Skills Section */}
                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <label className="text-base font-medium text-white flex items-center gap-2">
                                            <Briefcase size={18} className="text-primary" /> Choisir les compétences que vous sachiez faire ou ce que vous aimerais developper :
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {SKILLS_OPTIONS.map((skill) => (
                                                <button
                                                    key={skill.id}
                                                    type="button"
                                                    onClick={() => toggleSkill(skill.label)}
                                                    className={`p-4 rounded-xl border text-left transition-all ${formData.skills.includes(skill.label) ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                                >
                                                    <div className="text-sm font-bold">{skill.label}</div>
                                                    {skill.desc && <div className="text-xs opacity-60 mt-1">{skill.desc}</div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <label className="text-base font-medium text-white flex items-center gap-2">
                                            <Rocket size={18} className="text-secondary" /> Avez-vous un projet personnel que vous aimeriez développer ?
                                        </label>
                                        <div className="flex gap-6">
                                            {["oui", "non"].map((opt) => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" name="hasProject" value={opt} checked={formData.hasProject === opt} onChange={handleChange} className="w-4 h-4 accent-primary" />
                                                    <span className={`capitalize transition-colors ${formData.hasProject === opt ? "text-primary font-bold" : "text-gray-400 group-hover:text-white"}`}>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {formData.hasProject === "oui" && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                                                <label className="text-sm font-medium text-gray-400">Parle-nous de ce projet si tu veux</label>
                                                <textarea name="projectDetails" value={formData.projectDetails} onChange={handleChange} placeholder="Décrivez brièvement votre idée ou projet..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary/50 transition-all text-white resize-none" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-primary/40 transition-all flex items-center justify-center gap-3">
                                        Étape Suivante <ChevronRight size={20} />
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass p-5 sm:p-8 md:p-12 rounded-3xl space-y-8"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-white">
                                            <Calendar className="text-primary" />
                                            <h2 className="text-xl font-medium tracking-wide">Choisissez la date de votre entretien</h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {DATES.map((date) => (
                                                <button
                                                    key={date}
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, interviewDate: date, interviewTime: "" }))}
                                                    className={`py-3 px-2 rounded-xl border transition-all text-xs font-medium ${formData.interviewDate === date ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50'}`}
                                                >
                                                    {date.split('/')[0]}/{date.split('/')[1]}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, interviewDate: "Autre", interviewTime: "CONTACT DIRECT" }))}
                                                className={`py-3 px-2 rounded-xl border transition-all text-sm font-medium ${formData.interviewDate === "Autre" ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50'}`}
                                            >
                                                Autre
                                            </button>
                                        </div>
                                    </div>

                                    {formData.interviewDate === "Autre" && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-4">
                                            <div className="flex items-center gap-3 text-primary">
                                                <Sparkles className="w-6 h-6" />
                                                <h3 className="text-lg font-bold">Contactez-nous directement</h3>
                                            </div>
                                            <p className="text-gray-300 text-sm">
                                                Si aucune de ces dates ne vous convient, veuillez contacter notre VPA pour fixer un rendez-vous personnalisé :
                                            </p>
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center gap-3 text-white">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-400 uppercase tracking-wider">VPA</div>
                                                        <div className="font-medium">Nourhene Ben Amor</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-white">
                                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Téléphone</div>
                                                        <div className="font-medium text-lg">98 135 135</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-white border-t border-white/5 pt-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Email Club</div>
                                                        <div className="font-medium">hecentrepreneurs8@gmail.com</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {formData.interviewDate && formData.interviewDate !== "Autre" && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <div className="flex items-center gap-4 text-white">
                                                <Clock className="text-secondary" />
                                                <h2 className="text-lg sm:text-xl font-medium tracking-wide">Choisissez l'heure</h2>
                                            </div>
                                            {isLoadingSlots ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                    {TIMES.filter(time => {
                                                        if (formData.interviewDate === "07/03/2026") {
                                                            return ["09:00", "09:30", "10:00", "10:30"].includes(time);
                                                        }
                                                        if (["03/03/2026", "04/03/2026", "05/03/2026", "06/03/2026"].includes(formData.interviewDate)) {
                                                            return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"].includes(time);
                                                        }
                                                        return ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"].includes(time);
                                                    }).map((time) => {
                                                        const full = isSlotFull(formData.interviewDate, time);
                                                        return (
                                                            <button
                                                                key={time}
                                                                disabled={full}
                                                                onClick={() => setFormData(p => ({ ...p, interviewTime: time }))}
                                                                className={`py-3 rounded-xl border transition-all text-sm ${formData.interviewTime === time ? 'bg-secondary border-secondary text-white' : full ? 'bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed' : 'bg-white/5 border-white/10 text-gray-400 hover:border-secondary/50'}`}
                                                            >
                                                                {time} {full && "(Plein)"}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <button onClick={prevStep} className="w-full sm:flex-1 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2 order-2 sm:order-1">
                                            <ChevronLeft size={20} /> Retour
                                        </button>
                                        <button
                                            disabled={!formData.interviewDate || !formData.interviewTime || isSubmitting}
                                            onClick={handleSubmit}
                                            className="w-full sm:flex-[2] py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 order-1 sm:order-2"
                                        >
                                            {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirmer mon inscription"}
                                        </button>
                                    </div>
                                </motion.div>
                            )
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
                                <h1 className="text-3xl md:text-5xl font-thin text-wave uppercase tracking-[0.2em]">Enregistré</h1>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xl text-white font-light uppercase tracking-widest">Candidature Envoyée</p>
                                        <p className="text-gray-400 max-w-sm mx-auto">
                                            Merci <span className="text-primary font-medium">{formData.fullName.split(' ')[0]}</span> !
                                            Ton entretien est prévu le <span className="text-white">{formData.interviewDate}</span> à <span className="text-white">{formData.interviewTime}</span>.
                                        </p>
                                    </div>
                                    <p className="text-secondary font-medium max-w-xs mx-auto text-sm">
                                        nous allons vous contacter via mail le plus tot possible pour confirmer votre entretien
                                    </p>
                                </div>
                                <div className="pt-8">
                                    <a href="/" className="px-12 py-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all uppercase text-sm tracking-widest">
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
