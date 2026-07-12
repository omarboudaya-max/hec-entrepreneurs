"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yTitle = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const ySubtitle = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scaleOrb = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />

            {/* Animated Orbs */}
            <motion.div
                style={{ scale: scaleOrb }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    backgroundColor: ["#7c3aed", "#db2777", "#06b6d4", "#7c3aed"]
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[100px]"
            />
            <motion.div
                style={{ scale: scaleOrb }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    backgroundColor: ["#06b6d4", "#7c3aed", "#db2777", "#06b6d4"]
                }}
                transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[100px]"
            />

            <motion.div
                style={{ opacity: opacityHero }}
                className="container mx-auto px-4 z-10 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        style={{ y: yTitle }}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-[0.1em] text-wave leading-tight uppercase"
                        initial={{ filter: "blur(10px)", opacity: 0 }}
                        animate={{ filter: "blur(0px)", opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        HEC ENTREPRENEURS
                    </motion.h1>

                    <motion.h2
                        style={{ y: ySubtitle }}
                        className="text-xl md:text-3xl font-semibold mb-8 text-white uppercase tracking-widest"
                    >
                        Des idées à l'impact
                    </motion.h2>

                    <motion.p
                        style={{ y: ySubtitle }}
                        className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 px-4"
                    >
                        Nous ne parlons pas d’entrepreneuriat. Nous le construisons.
                    </motion.p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
                        <Link href="/entrepreuneuriat" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-transparent border border-white/40 hover:bg-white/5 text-white font-light text-base backdrop-blur-sm transition-all tracking-[0.15em] uppercase">
                                Découvrir nos projets
                            </button>
                        </Link>
                        <Link href="/join" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-normal text-base transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] tracking-[0.15em] uppercase">
                                Rejoindre le Club
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
