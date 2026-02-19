"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Zap, Heart, Star, Target, Users, Rocket, Globe, Lightbulb } from "lucide-react";
import { useRef } from "react";
import Footer from "@/components/Footer";

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
    { name: "Youssef Drira", role: "Président" },
    { name: "Yassmin Zghal", role: "Secrétaire Général" },
    { name: "Melek Kammoun", role: "Trésorier" },
    { name: "Nourhene Ben Amor", role: "Vice-Président chargé des Adhérents (VPA)" },
    { name: "Omar Boudaya", role: "Vice-Président chargé des Relations (VPR)", image: "/team/omar.jpeg" },
    { name: "Eya Cherif", role: "Vice-Président chargé de la Communication (VPCOM)" },
    { name: "Jihed Hersi", role: "Responsable Marketing et design" },
    { name: "Noura Derbel", role: "Adjointe Secrétaire Général" },
];

export default function About() {
    const valueRefs = useRef({});

    const scrollToValue = (id: string) => {
        const refs = valueRefs.current as Record<string, HTMLDivElement | null>;
        refs[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

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
                            className="text-6xl md:text-8xl font-black mb-8 text-wave uppercase tracking-tighter"
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
                                className="glass p-10 rounded-[2.5rem] border border-secondary/20 relative group overflow-hidden flex-1"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Lightbulb className="w-24 h-24 text-secondary" />
                                </div>
                                <h2 className="text-3xl font-black mb-6 text-secondary flex items-center gap-3 italic uppercase tracking-tighter">
                                    NOTRE VISION
                                </h2>
                                <p className="text-xl text-gray-300 italic leading-relaxed relative z-10 font-light">
                                    "Faire du Club HEC Entrepreneurs un <span className="text-secondary font-black">pilier</span> de la culture entrepreneuriale à l’<span className="text-primary font-black">IHEC Carthage</span>. Un espace où les idées se transforment en <span className="text-secondary font-black">projets</span>, où les talents s’engagent, et où l’entrepreneuriat devient un levier de <span className="text-primary font-black">création de valeur</span>."
                                </p>
                            </motion.div>
                        </div>

                        {/* Mission Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="glass p-10 rounded-[2.5rem] border border-primary/20 flex flex-col justify-center relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Rocket className="w-32 h-32 text-primary" />
                            </div>
                            <h2 className="text-3xl font-black mb-8 text-primary flex items-center gap-3 italic uppercase tracking-tighter">
                                NOTRE MISSION
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed font-light">
                                <span className="text-primary font-bold uppercase tracking-widest text-sm block mb-4">Inspirer • Accompagner • Former</span>
                                Nous aidons les étudiants de l’IHEC Carthage à explorer l’entrepreneuriat par l’<span className="text-secondary font-bold">action</span>, développer leurs compétences clés et transformer leurs idées en projets <span className="text-accent font-bold">concrets</span>, <span className="text-accent font-bold">responsables</span> et à <span className="text-accent font-bold">impact</span>.
                            </p>
                        </motion.div>
                    </div>

                    {/* Interactive Values Buttons */}
                    <div className="mb-32">
                        <h2 className="text-4xl md:text-6xl font-black text-center mb-16 text-glow uppercase tracking-tighter italic">NOS VALEURS</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-20">
                            {values.map((val, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => scrollToValue(val.id)}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="glass p-6 rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/5 hover:border-primary/50 transition-all group"
                                >
                                    <div className={`p-4 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${val.color}`}>
                                        <val.icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold text-gray-200 text-[10px] md:text-xs tracking-widest uppercase text-center">{val.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Values Detailed Explanations */}
                        <div className="space-y-8">
                            {values.map((val) => (
                                <motion.div
                                    key={val.id}
                                    ref={(el) => {
                                        const refs = valueRefs.current as Record<string, HTMLDivElement | null>;
                                        refs[val.id] = el;
                                    }}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="glass p-10 rounded-[2.5rem] border border-white/5 relative group"
                                >
                                    <div className={`mb-6 flex items-center gap-4 ${val.color}`}>
                                        <val.icon className="w-10 h-10" />
                                        <h3 className="text-2xl font-black uppercase tracking-tight italic">{val.label}</h3>
                                    </div>
                                    <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                        {val.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="mb-32">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-7xl font-black text-wave uppercase tracking-tighter italic mb-4">NOTRE ÉQUIPE</h2>
                            <p className="text-gray-500 font-mono tracking-widest uppercase text-sm">Bureau Exécutif 2025-2026</p>
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
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-10 h-10 text-white/50" />
                                        )}
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">{member.name}</h4>
                                    <p className="text-primary text-xs font-black uppercase tracking-widest leading-tight">
                                        {member.role}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
