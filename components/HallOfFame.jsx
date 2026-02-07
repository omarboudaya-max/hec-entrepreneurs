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
            <div className="w-full bg-primary/10 border-y border-primary/20 overflow-hidden mb-20 py-4 relative">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                <div className="flex whitespace-nowrap animate-ticker">
                    {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
                        <span key={idx} className="mx-8 font-mono text-primary font-bold text-lg tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
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
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Celebrating the visionaries who started their journey at HEC Carthage.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
                >
                    {startups.map((startup, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                            }}
                            className={`glass p-8 rounded-3xl hover:border-secondary/50 transition-all hover:-translate-y-2 group flex flex-col justify-between ${idx === 0 || idx === 3 ? "md:col-span-2 bg-gradient-to-br from-white/5 to-transparent" : "bg-white/5"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                                        <img src={startup.photo} alt={startup.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-secondary transition-colors mb-1">{startup.name}</h3>
                                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[10px] text-gray-400 border border-white/10 group-hover:border-secondary/30 group-hover:text-secondary transition-colors uppercase tracking-widest font-black">
                                            {startup.domain}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-secondary">↗</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-gray-400 text-sm leading-relaxed">{startup.description}</p>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-6 group-hover:via-secondary/50 transition-colors" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
