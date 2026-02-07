"use client";
import { motion } from "framer-motion";

const startups = [
    { name: "Youssef Jemmeli", domain: "Fashion Entrepreneur", description: "Founder of Mateha, 1K+ visitors.", photo: "/alumni/youssef.png" },
    { name: "Aziz Ghorbel", domain: "Economic Policy Advisor", description: "Founder of SmartLeap, 10+ employees.", photo: "/alumni/aziz.jpg" },
    { name: "Skander Chamgui", domain: "Marketing Consultant", description: "Founder of Cloop Solution, 40+ projects.", photo: "/alumni/skander.jpg" },
    { name: "Amir Montacer", domain: "Professor & Researcher", description: "Founder of MAJ Jewels, International store.", photo: "/alumni/amir.jpg" },
];

const tickerItems = [
    "STARTUPS INCUBATED: 0",
    "FUNDS RAISED: 0DT",
    "ACTIVE MENTORS: 1",
    "PARTNERS: 5+"
];

export default function HallOfFame() {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            {/* Ticker */}
            <div className="w-full bg-white/40 border-y border-zinc-200 shadow-sm overflow-hidden mb-20 py-4 relative backdrop-blur-md">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                <div className="flex whitespace-nowrap animate-ticker">
                    {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
                        <span key={idx} className="mx-8 font-mono text-zinc-600 font-bold text-lg tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-wave">
                        HALL OF FAME
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto font-medium">
                        Celebrating the visionaries who started their journey at HEC Carthage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
                    {startups.map((startup, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass p-8 rounded-3xl hover:border-zinc-300 transition-all hover:-translate-y-2 group flex flex-col justify-between ${idx === 0 || idx === 3 ? "md:col-span-2 bg-gradient-to-br from-white/80 to-zinc-50/50" : "bg-white/60"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-100 group-hover:border-zinc-300 transition-colors shadow-sm">
                                        <img src={startup.photo} alt={startup.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 mb-1">{startup.name}</h3>
                                        <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-[10px] text-zinc-500 border border-zinc-200 uppercase tracking-widest font-black">
                                            {startup.domain}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    <span className="text-zinc-900 font-bold">↗</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{startup.description}</p>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent mt-6 transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
