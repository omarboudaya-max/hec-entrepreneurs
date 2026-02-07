"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

            {/* Tech Moving Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="tech-dynamic-bg opacity-40 mix-blend-overlay" />
                <div className="tech-bg-overlay opacity-80" />
            </div>

            {/* Animated Floating Glass Spheres */}
            <motion.div
                animate={{
                    y: [0, -40, 0],
                    x: [0, 20, 0],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-white/40 rounded-full blur-[40px] md:blur-[60px] border border-white/20 shadow-2xl"
            />
            <motion.div
                animate={{
                    y: [0, 40, 0],
                    x: [0, -20, 0],
                    rotate: [360, 180, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-zinc-200/40 rounded-full blur-[40px] md:blur-[60px] border border-white/20 shadow-2xl"
            />

            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] contrast-200" />

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
                            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-foreground text-background hover:bg-zinc-800 font-black text-lg transition-all hover:scale-105 shadow-xl shadow-zinc-200">
                                Join the Club
                            </button>
                        </Link>
                        <Link href="/team-up" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-900 font-black text-lg backdrop-blur-sm transition-all shadow-lg hover:shadow-xl shadow-zinc-100">
                                I’m Building a Startup
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
