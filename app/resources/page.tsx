"use client";
import Navbar from "@/components/Navbar";
import { Lock, Check, Gift, Users, BookOpen, Activity, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const perks = [
    {
        name: "Formations",
        value: "20+ Domains",
        bg: "from-zinc-100 to-white",
        text: "text-zinc-600",
        icon: BookOpen,
        desc: "Certified workshops in AI, No-Code, and Strategy."
    },
    {
        name: "Startup Simulation",
        value: "Real-Time Visual",
        bg: "from-zinc-100 to-white",
        text: "text-zinc-500",
        icon: Activity,
        desc: "Virtual playground to test your business models."
    },
    {
        name: "Stripe",
        value: "Founder Tier",
        bg: "from-zinc-100 to-white",
        text: "text-zinc-900",
        icon: CreditCard,
        desc: "Exclusive payment infrastructure for student startups."
    },
];

const mentors = [
    { name: "Youssef Drira", expertise: "Certified Trainer", company: "HEC Network", bio: "Ex-Google trainer specializing in high-performance leadership." },
];

export default function Resources() {
    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Tech Moving Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="tech-dynamic-bg opacity-20 mix-blend-overlay" />
                <div className="tech-bg-overlay opacity-90" />
            </div>

            <div className="container mx-auto px-4 pt-44 relative z-10">
                <div className="text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-black mb-6 text-wave tracking-tighter uppercase italic"
                    >
                        RESOURCES
                    </motion.h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        The ultimate toolkit for the modern entrepreneur.
                    </p>
                </div>

                {/* Perks Locker */}
                <div className="mb-32">
                    <div className="grid md:grid-cols-3 gap-8">
                        {perks.map((perk, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${perk.bg} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                                <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-zinc-100 relative overflow-hidden group hover:border-zinc-300 transition-all flex flex-col h-full bg-white/60">

                                    <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-[8px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 p-8 text-center translate-y-4 group-hover:translate-y-0">
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                            <Lock className="w-8 h-8 text-white" />
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-widest mb-3">MEMBERS ONLY</h4>
                                        <p className="text-sm text-zinc-400 font-medium mb-8 leading-relaxed">Unlock access by joining the HEC Entrepreneurs ecosystem.</p>
                                        <button className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                                            Join Now <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className={`w-14 h-14 rounded-2xl bg-zinc-50 ${perk.text} flex items-center justify-center mb-8 shadow-sm border border-zinc-100`}>
                                        <perk.icon className="w-7 h-7" />
                                    </div>

                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-4 ${perk.text}`}>{perk.name}</h3>
                                    <p className="text-4xl font-black text-zinc-900 mb-6 tracking-tighter uppercase italic">{perk.value}</p>
                                    <p className="text-zinc-500 text-base font-medium leading-relaxed flex-1">{perk.desc}</p>

                                    <div className="w-full h-1 bg-white/5 mt-10 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r ${perk.bg} w-1/3 group-hover:w-full transition-all duration-1000`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mentor Directory */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center gap-4 mb-14 text-center">
                        <div className="p-4 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                            <Users className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-widest italic text-wave">MENTORS</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {mentors.map((mentor, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 border border-zinc-200 hover:border-zinc-300 transition-all group bg-white/60 shadow-sm hover:shadow-md"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-foreground via-zinc-400 to-white flex items-center justify-center font-black text-background text-4xl shadow-xl shadow-zinc-200 group-hover:rotate-12 transition-transform">
                                    {mentor.name[0]}
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic">{mentor.name}</h3>
                                        <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black rounded-full border border-zinc-200 uppercase tracking-widest w-fit mx-auto md:mx-0">
                                            {mentor.expertise}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4 italic">{mentor.company}</p>
                                    <p className="text-zinc-600 text-lg leading-relaxed font-medium italic">{mentor.bio}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
