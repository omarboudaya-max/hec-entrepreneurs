"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, BookOpen, Activity, CreditCard, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";

const perks = [
    {
        name: "Formations",
        value: "20+ Domaines",
        bg: "from-primary/20 to-primary/5",
        text: "text-primary",
        icon: BookOpen,
        desc: "Ateliers certifiés en soft skills, hard skills et Stratégie."
    },
    {
        name: "Simulation de startup",
        value: "Visuel Temps Réel",
        bg: "from-secondary/20 to-secondary/5",
        text: "text-secondary",
        icon: Activity,
        desc: "Espace virtuel pour tester vos modèles d'affaires."
    },
    {
        name: "Pépinière d'Innovation",
        value: "Éclosion & Mentorat",
        bg: "from-accent/20 to-accent/5",
        text: "text-accent",
        icon: CreditCard,
        desc: "Accompagnement personnalisé pour transformer vos intuitions en projets structurés."
    },
];

const mentors = [
    { name: "Youssef Drira", expertise: "Formateur Certifié", company: "Réseau HEC", bio: "Ex-formateur Google spécialisé dans le leadership haute performance." },
];

export default function Resources() {
    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse-slow delay-700" />
            </div>

            <div className="container mx-auto px-4 pt-44 relative z-10">
                <div className="text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl sm:text-5xl md:text-7xl font-thin mb-6 text-wave tracking-[0.1em] sm:tracking-[0.2em] uppercase"
                    >
                        RESSOURCES
                    </motion.h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                        La boîte à outils ultime pour l&apos;entrepreneur moderne.
                    </p>
                </div>

                {/* Perks Locker */}
                <div className="mb-32">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ staggerChildren: 0.1 }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {perks.map((perk, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 80 }}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${perk.bg} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="glass p-6 sm:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-primary/40 transition-all flex flex-col h-full">

                                    <div className="absolute inset-0 bg-black/95 backdrop-blur-[8px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 p-8 text-center translate-y-4 group-hover:translate-y-0">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                                            <Lock className="w-8 h-8 text-primary" />
                                        </div>
                                        <h4 className="text-lg font-light text-white uppercase tracking-[0.2em] mb-3">MEMBRES UNIQUEMENT</h4>
                                        <p className="text-sm text-gray-400 font-light mb-8 leading-relaxed">Débloquez l&apos;accès en rejoignant l&apos;écosystème HEC Entrepreneurs.</p>
                                        <button className="flex items-center gap-2 text-primary font-light uppercase tracking-[0.1em] text-xs hover:gap-4 transition-all">
                                            Rejoindre Maintenant <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 ${perk.text} flex items-center justify-center mb-8 shadow-inner`}>
                                        <perk.icon className="w-7 h-7" />
                                    </div>

                                    <h3 className={`text-xs sm:text-sm font-light uppercase tracking-[0.2em] mb-4 text-glow ${perk.text}`}>{perk.name}</h3>
                                    <p className="text-2xl sm:text-3xl font-thin text-white mb-6 tracking-wide">{perk.value}</p>
                                    <p className="text-gray-400 text-sm font-light leading-relaxed flex-1">{perk.desc}</p>

                                    <div className="w-full h-1 bg-white/5 mt-10 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r ${perk.bg} w-1/3 group-hover:w-full transition-all duration-1000`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Mentor Directory */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center gap-4 mb-14 text-center">
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                            <Users className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-thin uppercase tracking-[0.3em] italic text-wave">MENTORS</h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ staggerChildren: 0.2 }}
                        className="grid grid-cols-1 gap-6"
                    >
                        {mentors.map((mentor, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ x: 10, scale: 1.01 }}
                                className="glass rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 border border-white/5 hover:border-primary/30 transition-all group"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary flex items-center justify-center font-black text-white text-4xl shadow-2xl shadow-primary/30 group-hover:rotate-12 transition-transform">
                                    {mentor.name[0]}
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h3 className="text-xl font-light text-white tracking-[0.05em] uppercase italic">{mentor.name}</h3>
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-light rounded-full border border-primary/20 uppercase tracking-[0.2em] w-fit mx-auto md:mx-0">
                                            {mentor.expertise}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs font-light uppercase tracking-[0.2em] mb-4">{mentor.company}</p>
                                    <p className="text-gray-400 text-lg leading-relaxed">{mentor.bio}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
