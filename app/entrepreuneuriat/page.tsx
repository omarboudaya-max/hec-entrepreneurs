"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HallOfFame from "@/components/HallOfFame";
import { motion } from "framer-motion";
import { Lightbulb, Target, Rocket, HelpCircle } from "lucide-react";

export default function Entrepreuneuriat() {
    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <div className="container mx-auto px-4 pt-44 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-20">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black mb-6 text-wave tracking-tighter uppercase"
                        >
                            ENTREPRENEURIAT
                        </motion.h1>
                        <p className="text-xl md:text-2xl text-gray-400 font-light italic">
                            De l'idée à la réalité : tracez votre propre chemin.
                        </p>
                    </div>

                    {/* Section: Qu'est-ce que l'entrepreneuriat ? */}
                    <motion.section
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 glass p-10 rounded-[2.5rem] border border-primary/20"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <HelpCircle className="w-10 h-10 text-primary" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">C'EST QUOI ?</h2>
                        </div>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                            L'entrepreneuriat ne se résume pas à créer une entreprise. C'est un <span className="text-primary font-bold italic">état d'esprit</span>. C'est la capacité à identifier un problème, à imaginer une solution et à mobiliser les ressources nécessaires pour transformer cette vision en <span className="text-secondary font-bold">impact réel</span>. C'est l'art de bâtir le possible.
                        </p>
                    </motion.section>

                    {/* Section: Pourquoi l'entrepreneuriat ? */}
                    <motion.section
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mb-24 glass p-10 rounded-[2.5rem] border border-secondary/20"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Target className="w-10 h-10 text-secondary" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">POURQUOI ?</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-black text-secondary mb-3">IMPACT</h3>
                                <p className="text-gray-400">Résoudre des défis sociétaux et économiques concrets par l'innovation.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-secondary mb-3">LIBERTÉ</h3>
                                <p className="text-gray-400">Devenir l'architecte de sa propre carrière et de sa vision.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-secondary mb-3">APPRENTISSAGE</h3>
                                <p className="text-gray-400">Un parcours accéléré de croissance personnelle et professionnelle.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-secondary mb-3">CRÉATIVITÉ</h3>
                                <p className="text-gray-400">Donner vie à ses idées les plus audacieuses sans limites.</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section: Comment devenir entrepreneur ? */}
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-32 relative"
                    >
                        <div className="text-center mb-16">
                            <Rocket className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest italic">COMMENT ?</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { step: "01", title: "OBSERVER", desc: "Soyez à l'écoute de votre environnement et identifiez les opportunités." },
                                { step: "02", title: "EXPÉRIMENTER", desc: "Testez vos hypothèses rapidement avec un MVP (Minimum Viable Product)." },
                                { step: "03", title: "S'ENTOURER", desc: "Rejoignez le Club HEC pour accéder à un réseau de mentors et de partenaires." }
                            ].map((step, idx) => (
                                <div key={idx} className="glass p-8 rounded-3xl border border-white/5 relative group hover:border-primary/50 transition-all">
                                    <span className="text-6xl font-black text-primary/10 absolute top-4 right-4 group-hover:text-primary/20 transition-colors">{step.step}</span>
                                    <h3 className="text-2xl font-black text-white mb-4 relative z-10">{step.title}</h3>
                                    <p className="text-gray-400 relative z-10">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-20" />

                {/* Hall Of Fame Integration */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <HallOfFame />
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
