"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Zap, Heart, Star, Target, Users, Rocket, Globe, Lightbulb } from "lucide-react";

const values = [
    { label: "Engagement", icon: Zap, color: "text-amber-500" },
    { label: "Esprit Entrepreneurial", icon: Target, color: "text-rose-500" },
    { label: "Impact & Responsabilité", icon: Heart, color: "text-rose-400" },
    { label: "Excellence", icon: Star, color: "text-zinc-600" },
    { label: "Collaboration", icon: Users, color: "text-zinc-500" },
];

export default function About() {
    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Tech Moving Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="tech-dynamic-bg opacity-20 mix-blend-overlay" />
                <div className="tech-bg-overlay opacity-90" />
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
                            className="glass p-10 rounded-[2.5rem] border border-zinc-200 flex flex-col justify-center relative group overflow-hidden bg-white/60"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <Rocket className="w-32 h-32 text-zinc-900" />
                            </div>
                            <h2 className="text-3xl font-black mb-8 text-zinc-900 flex items-center gap-3 italic tracking-tight uppercase">
                                OUR MISSION
                            </h2>
                            <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed font-medium">
                                <span className="text-zinc-900 font-black italic">Inspirer</span>, <span className="text-zinc-900 font-black italic">accompagner</span> et <span className="text-zinc-900 font-black italic">former</span> les étudiants de l’IHEC Carthage à explorer l’entrepreneuriat par l’<span className="text-zinc-800 font-bold">action</span>, développer leurs compétences clés (<span className="text-zinc-800 font-bold">leadership</span>, <span className="text-zinc-800 font-bold">innovation</span>, <span className="text-zinc-800 font-bold">stratégie</span>, <span className="text-zinc-800 font-bold">RSE</span>) et transformer leurs idées en projets <span className="text-zinc-900 font-black italic text-lg uppercase tracking-widest">concrets</span>, <span className="text-zinc-900 font-black italic text-lg uppercase tracking-widest">responsables</span> et à <span className="text-zinc-900 font-black italic text-lg uppercase tracking-widest">impact</span>.
                            </p>
                            <p className="mt-6 text-lg text-zinc-500 leading-relaxed font-medium">
                                À travers événements, projets, formations et partenariats stratégiques, HEC Entrepreneurs crée un <span className="text-zinc-800 font-bold uppercase italic text-sm tracking-widest">pont vivant</span> entre le monde académique et l’écosystème entrepreneurial, tout en contribuant activement au rayonnement de l’IHEC Carthage.
                            </p>
                        </motion.div>

                        {/* Vision & Values Column */}
                        <div className="flex flex-col gap-12">
                            {/* Vision */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass p-10 rounded-[2.5rem] border border-zinc-200 relative group overflow-hidden flex-1 bg-white/60"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                    <Lightbulb className="w-24 h-24 text-zinc-900" />
                                </div>
                                <h2 className="text-3xl font-black mb-6 text-zinc-900 flex items-center gap-3 italic tracking-tight uppercase">
                                    OUR VISION
                                </h2>
                                <p className="text-xl text-zinc-600 italic leading-relaxed relative z-10 font-medium">
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
                                        className="glass p-6 rounded-2xl flex items-center gap-4 hover:shadow-xl hover:shadow-zinc-200 transition-all border border-zinc-100 hover:border-zinc-300 group bg-white/80"
                                    >
                                        <div className={`p-3 rounded-xl bg-zinc-50 group-hover:scale-110 transition-transform ${val.color} border border-zinc-100`}>
                                            <val.icon className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-zinc-900 text-sm tracking-tighter uppercase italic">{val.label}</span>
                                    </div>
                                ))}
                                <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-zinc-200 bg-zinc-100 shadow-inner">
                                    <Globe className="w-6 h-6 text-zinc-600" />
                                    <span className="font-black text-zinc-600 text-sm uppercase tracking-[0.2em] italic">Global Reach</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
