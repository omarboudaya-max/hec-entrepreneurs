"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />

            {/* Animated Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    backgroundColor: ["#7c3aed", "#db2777", "#06b6d4", "#7c3aed"]
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    backgroundColor: ["#06b6d4", "#7c3aed", "#db2777", "#06b6d4"]
                }}
                transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[100px]"
            />

            <div className="container mx-auto px-4 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tighter text-wave leading-tight"
                        initial={{ filter: "blur(10px)", opacity: 0 }}
                        animate={{ filter: "blur(0px)", opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        HEC ENTREPRENEURS
                    </motion.h1>

                    <h2 className="text-xl md:text-3xl font-bold mb-8 text-white uppercase tracking-widest">BUILD THE FUTURE.</h2>

                    <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 px-4">
                        Join HEC Entrepreneurs and transform your ideas into reality.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
                        <Link href="/join" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                                Join the Club
                            </button>
                        </Link>
                        <Link href="/team-up" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent border border-primary/50 hover:bg-primary/10 text-white font-bold text-lg backdrop-blur-sm transition-all shadow-[0_0_15px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]">
                                I’m Building a Startup
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
