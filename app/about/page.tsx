"use client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Zap, Heart, Star, Target, Users, Rocket, Globe, Lightbulb } from "lucide-react";
import { useRef, useState } from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

const values = [
    {
        id: "engagement",
        label: "Engagement",
        icon: Zap,
        color: "text-yellow-400",
        desc: "Chaque membre s’implique activement dans la vie du club, respecte ses engagements et assume pleinement ses responsabilités. L’engagement se traduit par la participation régulière aux activités, le respect des délais et la contribution concrète aux projets. Grâce à cet engagement, les membres développent un fort sentiment d’appartenance, qu’ils transmettent dans leur environnement académique et associatif, assurant la continuité, la crédibilité et l’efficacité du club."
    },
    {
        id: "esprit",
        label: "Esprit entrepreneurial",
        icon: Target,
        color: "text-red-400",
        desc: "Le club encourage l’audace, la créativité et l’initiative, considérant l’échec comme une étape normale de l’apprentissage. Les membres sont incités à identifier des opportunités, proposer des solutions innovantes et transformer leurs idées en projets concrets et impactantes. Cette culture développe leur autonomie, résilience et capacité à agir dans un environnement complexe et évolutif, reflétant l’esprit entrepreneurial promu par le club."
    },
    {
        id: "impact",
        label: "Impact & Responsabilité",
        icon: Heart,
        color: "text-pink-400",
        desc: "Toutes les initiatives intègrent des principes d’éthique, de durabilité et de RSE, en tenant compte de leurs impacts économiques, sociaux et environnementaux. Les membres développent une conscience accrue de leur rôle en tant que futurs leaders responsables, capables de générer un impact positif et durable dans leur environnement et la société."
    },
    {
        id: "excellence",
        label: "Excellence & Professionnalisme",
        icon: Star,
        color: "text-primary",
        desc: "Le club agit avec rigueur, discipline et sérieux dans toutes ses activités, en adoptant une organisation structurée, une communication claire et des standards élevés. Cette exigence renforce la crédibilité et le rayonnement de HEC Entrepreneurs tout en valorisant l’image de l’IHEC Carthage."
    },
    {
        id: "collaboration",
        label: "Collaboration & Partage",
        icon: Users,
        color: "text-secondary",
        desc: "L’intelligence collective est au cœur du club : esprit d’équipe, entraide, écoute et respect mutuel permettent de co-créer des projets à forte valeur. Le partage des idées, des connaissances et des expériences favorise l’apprentissage, l’innovation et la réussite collective, tout en instaurant un climat inclusif et coopératif."
    },
];

const team = [
    { name: "Youssef Drira", role: "Président", image: "/team/youssef.JPG" },
    { name: "Yassmin Zghal", role: "Secrétaire Général", image: "/team/yassmin.jpg" },
    { name: "Melek Kammoun", role: "Trésorier", image: "/team/melek.jpg" },
    { name: "Nourhene Ben Amor", role: "Vice-Président chargé des Adhérents (VPA)", image: "/team/nourhene.jpg" },
    { name: "Omar Boudaya", role: "Vice-Président chargé des Relations (VPR)", image: "/team/omar.jpg" },
    { name: "Eya Cherif", role: "Vice-Président chargé de la Communication (VPCOM)", image: "/team/eya.jpg" },
    { name: "Jihed Hersi", role: "Responsable Marketing et design", image: "/team/jihed.jpg" },
    { name: "Noura Derbel", role: "Adjointe Secrétaire Général", image: "/team/noura.jpg" },
];

export default function About() {
    const [expandedValue, setExpandedValue] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className="container mx-auto px-4 pt-40 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-24">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-3xl sm:text-5xl md:text-7xl font-thin mb-8 text-wave uppercase tracking-[0.1em] sm:tracking-[0.2em]"
                        >
                            QUI SOMMES-NOUS
                        </motion.h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-32">
                        {/* Vision Column */}
                        <div className="flex flex-col gap-12">
                            {/* Vision */}
                            <motion.div
                                initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-secondary/20 relative group overflow-hidden flex-1"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                                    <Lightbulb className="w-24 h-24 text-secondary" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-light mb-6 text-secondary flex items-center gap-3 italic uppercase tracking-[0.1em]">
                                    NOTRE VISION
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-300 italic leading-relaxed relative z-10 font-light">
                                    &quot;Faire du Club HEC Entrepreneurs un <span className="text-secondary font-black">pilier</span> de la culture entrepreneuriale à l’<span className="text-primary font-black">IHEC Carthage</span>. Un espace où les idées se transforment en <span className="text-secondary font-black">projets</span>, où les talents s’engagent, et où l’entrepreneuriat devient un levier de <span className="text-primary font-black">création de valeur</span>.&quot;
                                </p>
                            </motion.div>
                        </div>

                        {/* Mission Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-primary/20 flex flex-col justify-center relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                                <Rocket className="w-32 h-32 text-primary" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-light mb-8 text-primary flex items-center gap-3 italic uppercase tracking-[0.1em]">
                                NOTRE MISSION
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                                <span className="text-primary font-bold uppercase tracking-widest text-sm block mb-4">Inspirer • Accompagner • Former</span>
                                Nous aidons les étudiants de l’IHEC Carthage à explorer l’entrepreneuriat par l’<span className="text-secondary font-bold">action</span>, développer leurs compétences clés et transformer leurs idées en projets <span className="text-accent font-bold">concrets</span>, <span className="text-accent font-bold">responsables</span> et à <span className="text-accent font-bold">impact</span>.
                            </p>
                        </motion.div>
                    </div>

                    {/* Interactive Values Accordion */}
                    <div className="mb-32">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-light text-center mb-16 text-glow uppercase tracking-[0.15em] italic">NOS VALEURS</h2>
                        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                            {values.map((val, idx) => {
                                const isExpanded = expandedValue === val.id;
                                return (
                                    <motion.div
                                        key={idx}
                                        layout
                                        onClick={() => setExpandedValue(isExpanded ? null : val.id)}
                                        className="glass rounded-2xl border border-white/5 overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        <div className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                                            <div className={`p-4 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${val.color}`}>
                                                <val.icon className="w-8 h-8" />
                                            </div>
                                            <span className="font-light text-gray-200 text-lg tracking-[0.2em] uppercase">
                                                {val.label}
                                            </span>
                                            
                                            {/* Expand Icon Indicator */}
                                            <div className="mt-2 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                                                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
                                                    ▼
                                                </motion.span>
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-6 pb-8"
                                                >
                                                    <div className="w-full max-w-lg mx-auto h-px bg-white/10 mb-6" />
                                                    <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light text-center max-w-3xl mx-auto">
                                                        {val.desc}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="mb-32">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin text-wave uppercase tracking-[0.1em] italic mb-4">NOTRE ÉQUIPE</h2>
                            <p className="text-gray-500 font-mono tracking-[0.3em] uppercase text-xs">Bureau Exécutif 2025-2026</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {team.map((member, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="glass p-8 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all text-center group"
                                >
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-6 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform overflow-hidden shadow-xl shadow-primary/10">
                                        {member.image ? (
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className={clsx(
                                                    "w-full h-full object-cover transition-transform duration-500",
                                                    member.name === "Omar Boudaya" && "scale-[1.4] object-center"
                                                )}
                                            />
                                        ) : (
                                            <Users className="w-10 h-10 text-white/50" />
                                        )}
                                    </div>
                                    <h4 className="text-lg font-light text-white uppercase tracking-[0.05em] mb-2 italic">{member.name}</h4>
                                    <p className="text-primary text-[10px] font-medium uppercase tracking-[0.15em] leading-tight opacity-80">
                                        {member.role}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Projects Section */}
                    <div className="mb-32 mt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin text-wave uppercase tracking-[0.1em] italic mb-4">NOS PROJETS</h2>
                            <p className="text-gray-500 font-mono tracking-[0.3em] uppercase text-xs">Les initiatives qui font la différence</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <Link href="/projets/tribunal" className="block group">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.5 }}
                                    className="glass rounded-[2rem] overflow-hidden border border-white/10 group-hover:border-[#d4af37]/50 transition-colors flex flex-col md:flex-row relative bg-[#050505]/80"
                                >
                                    <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:h-[450px] relative z-0 bg-[#120805]">
                                        <Image 
                                            src="/affiche-tribunal.png" 
                                            alt="Affiche Tribunal de l'entrepreneuriat" 
                                            fill 
                                            className="object-contain p-4 group-hover:scale-105 group-hover:brightness-110 transition-all duration-700"
                                        />
                                    </div>

                                    <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative z-20">
                                        <h3 className="text-2xl md:text-4xl font-serif text-[#ece2d0] uppercase tracking-[0.1em] leading-tight mb-4 drop-shadow-md">
                                            LE GRAND TRIBUNAL DE<br/><span className="text-[#d4af37]">L&apos;ENTREPRENEURIAT</span>
                                        </h3>
                                        <p className="text-[#cbb0a5] text-sm md:text-base leading-relaxed font-light mb-8">
                                            Le procès spectaculaire qui remet en question le mythe de l'entrepreneuriat à l'IHEC Carthage. Un événement unique, récompensé "Meilleur Événement 2026".
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-[#d4af37] font-serif uppercase tracking-widest text-xs group-hover:text-white transition-colors">
                                            <span>Découvrir l'événement</span>
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
