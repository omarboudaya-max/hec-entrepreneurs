"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Lightbulb, Code2, Rocket, Mic, Laptop, Building2, Users } from "lucide-react";

const tracks = [
    {
        id: "discover",
        title: "DISCOVER",
        icon: Lightbulb,
        description: "Ignite your entrepreneurial spirit.",
        content: [
            { title: "Speaker Series", desc: "Learn from successful founders.", icon: Mic },
            { title: "Intro to Tech", desc: "Workshops on No-Code, AI, and Design.", icon: Laptop }
        ]
    },
    {
        id: "build",
        title: "BUILD",
        icon: Code2,
        description: "Turn your idea into a MVP.",
        content: [
            { title: "Hackathons", desc: "48-hour intensive building sprees.", icon: Code2 },
            { title: "Co-founder Matching", desc: "Find your perfect business partner.", icon: Users }
        ]
    },
    {
        id: "scale",
        title: "SCALE",
        icon: Rocket,
        description: "Accelerate your growth.",
        content: [
            { title: "Station F Fast-Track", desc: "Direct access to the world's biggest startup campus.", icon: Building2 },
            { title: "VC Office Hours", desc: "Pitch to top investors.", icon: Rocket }
        ]
    }
];

export default function JourneyTracks() {
    const [activeTrack, setActiveTrack] = useState(tracks[0].id);

    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-glow">THE JOURNEY</h2>

                <div className="flex flex-col items-center">
                    {/* Tabs */}
                    <div className="w-full overflow-x-auto pb-4 hide-scrollbar flex justify-center">
                        <div className="flex items-center gap-2 md:gap-4 p-2 glass rounded-full whitespace-nowrap">
                            {tracks.map((track) => (
                                <button
                                    key={track.id}
                                    onClick={() => setActiveTrack(track.id)}
                                    className={clsx(
                                        "px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300",
                                        activeTrack === track.id
                                            ? "bg-primary text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                                            : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    {track.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full max-w-4xl min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {tracks.map((track) => (
                                activeTrack === track.id && (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="glass p-8 md:p-12 rounded-3xl border border-primary/20 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-12 opacity-5">
                                            <track.icon className="w-64 h-64" />
                                        </div>

                                        <h3 className="text-3xl font-bold mb-4 text-secondary">{track.description}</h3>

                                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                                            {track.content.map((item, idx) => (
                                                <div key={idx} className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 hover:border-primary/30 group">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                        <item.icon className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                                                    <p className="text-gray-400">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
