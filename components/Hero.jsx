"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Holographic Corner Logos */}
            <div className="absolute top-8 left-8 z-20 animate-hologram hidden md:block">
                <Image src="/logo-club.png" alt="Club Logo" width={100} height={100} className="filter brightness-200 contrast-125" />
            </div>
            <div className="absolute top-8 right-8 z-20 animate-hologram hidden md:block delay-700">
                <Image src="/logo-univ.jpg" alt="University Logo" width={120} height={48} className="filter grayscale brightness-200 contrast-125" />
            </div>

            {/* Tech Grid Background */}
            <div className="absolute inset-0 tech-grid opacity-20 animate-grid" />

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.15),transparent_60%)]" />

            {/* Drifting Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary/40 rounded-full blur-sm animate-drift" />
                <motion.div className="absolute top-1/2 right-1/4 w-6 h-6 bg-secondary/30 rounded-full blur-md animate-drift [animation-delay:2s]" />
                <motion.div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-accent/20 rounded-full blur-sm animate-drift [animation-delay:4s]" />
                <motion.div className="absolute top-1/3 right-1/3 w-8 h-8 bg-primary/20 rounded-full blur-xl animate-drift [animation-delay:1s]" />
            </div>

            {/* Animated Orbs */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[80px] md:blur-[100px]"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-secondary/10 rounded-full blur-[80px] md:blur-[100px]"
            />

            <div className="container mx-auto px-4 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tighter text-wave leading-tight text-glow"
                        initial={{ filter: "blur(10px)", opacity: 0 }}
                        animate={{ filter: "blur(0px)", opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        HEC ENTREPRENEURS
                    </motion.h1>

                    <h2 className="text-xl md:text-3xl font-bold mb-8 text-white uppercase tracking-widest opacity-80 decoration-primary decoration-4 underline-offset-8">BUILD THE FUTURE.</h2>

                    <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 px-4 italic font-light">
                        Join HEC Entrepreneurs and transform your ideas into reality.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
                        <Link href="/join" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(124,58,237,0.6)] border border-white/20">
                                Join the Club
                            </button>
                        </Link>
                        <Link href="/team-up" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-primary/50 hover:bg-primary/10 text-white font-black text-xl backdrop-blur-md transition-all shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_40px_rgba(124,58,237,0.4)]">
                                I’m Building a Startup
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
