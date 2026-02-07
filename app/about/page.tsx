"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Zap, Heart, Star, Target, Users, Rocket, Globe, Lightbulb } from "lucide-react";

const values = [
    { label: "Engagement", icon: Zap, color: "text-yellow-400" },
    { label: "Esprit Entrepreneurial", icon: Target, color: "text-red-400" },
    { label: "Impact & Responsabilité", icon: Heart, color: "text-pink-400" },
    { label: "Excellence", icon: Star, color: "text-primary" },
    { label: "Collaboration", icon: Users, color: "text-secondary" },
];

export default function About() {
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
                            WHO ARE WE
                        </motion.h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass p-10 rounded-[2.5rem] border border-primary/20 flex flex-col justify-center relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Rocket className="w-32 h-32 text-primary" />
                            </div>
                            <h2 className="text-3xl font-black mb-8 text-primary flex items-center gap-3 italic">
                                OUR MISSION
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
                                <span className="text-primary font-bold">Inspirer</span>, <span className="text-primary font-bold">accompagner</span> et <span className="text-primary font-bold">former</span> les étudiants de l’IHEC Carthage à explorer l’entrepreneuriat par l’<span className="text-secondary font-bold">action</span>, développer leurs compétences clés (<span className="text-secondary font-bold">leadership</span>, <span className="text-secondary font-bold">innovation</span>, <span className="text-secondary font-bold">stratégie</span>, <span className="text-secondary font-bold">RSE</span>) et transformer leurs idées en projets <span className="text-accent font-bold">concrets</span>, <span className="text-accent font-bold">responsables</span> et à <span className="text-accent font-bold">impact</span>.
                            </p>
                            <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                                À travers événements, projets, formations et partenariats stratégiques, HEC Entrepreneurs crée un <span className="text-primary font-bold">pont vivant</span> entre le monde académique et l’écosystème entrepreneurial, tout en contribuant activement au <span className="text-primary font-bold">rayonnement</span> et à l’<span className="text-primary font-bold">influence</span> de l’IHEC Carthage.
                            </p>
                        </motion.div>

                        {/* Vision & Values Column */}
                        <div className="flex flex-col gap-12">
                            {/* Vision */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass p-10 rounded-[2.5rem] border border-secondary/20 relative group overflow-hidden flex-1"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Lightbulb className="w-24 h-24 text-secondary" />
                                </div>
                                <h2 className="text-3xl font-black mb-6 text-secondary flex items-center gap-3 italic">
                                    OUR VISION
                                </h2>
                                <p className="text-xl text-gray-300 italic leading-relaxed relative z-10">
                                    "Faire du Club HEC Entrepreneurs un pilier de la culture entrepreneuriale à l’IHEC Carthage. Un espace où les idées se transforment en projets, où les talents s’engagent, et où l’entrepreneuriat devient un levier de création de valeur."
                                </p>
                            </motion.div>

                            {/* Values Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                {values.map((val, idx) => (
                                    <div
                                        key={idx}
                                        className="glass p-6 rounded-2xl flex items-center gap-4 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all border border-white/5 hover:border-primary/30 group"
                                    >
                                        <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${val.color}`}>
                                            <val.icon className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-gray-200 text-sm tracking-wide uppercase">{val.label}</span>
                                    </div>
                                ))}
                                <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-secondary/20 bg-secondary/5">
                                    <Globe className="w-6 h-6 text-secondary" />
                                    <span className="font-bold text-secondary text-sm uppercase tracking-widest">Global Reach</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
