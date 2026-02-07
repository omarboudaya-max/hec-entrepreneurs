"use client";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Send, Briefcase, Code, Palette, Rocket } from "lucide-react";

const initialFounders = [
    { id: 1, role: "CTO Needed", pitch: "Building Airbnb for campervans in Tunisia.", skills: ["React", "Node.js", "AWS"], type: "Tech" },
    { id: 2, role: "Marketing Lead", pitch: "EdTech platform scaling to MENA region.", skills: ["Growth", "SEO", "Ads"], type: "Business" },
    { id: 3, role: "UI/UX Designer", pitch: "FinTech app for Gen Z savings.", skills: ["Figma", "Prototyping", "UI"], type: "Creative" },
    { id: 4, role: "AI Co-founder", pitch: "AI-based legal assistant for SMEs.", skills: ["AI/ML", "Python", "NLP"], type: "Tech" },
];

// Generate 40+ examples
const additionalRoles = [
    "Marketing Lead", "Frontend Developer", "Backend Developer", "Sales Executive",
    "UI/UX Designer", "Product Manager", "Mobile Developer", "Growth Hacker",
    "Data Scientist", "Social Media Manager", "Operations Lead", "Legal Specialist",
    "Fullstack Developer", "AI Engineer", "Game Designer", "Brand Manager"
];

const areas = [
    "Fintech", "Healthtech", "Edtech", "E-commerce", "SaaS", "Real Estate",
    "Sustainability", "Foodtech", "Logistics", "Travel", "Cybersecurity", "Blockchain"
];

const generatedFounders = Array.from({ length: 40 }, (_, i) => {
    const role = additionalRoles[i % additionalRoles.length];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const type = ["Tech", "Business", "Creative", "Strategy"][Math.floor(Math.random() * 4)];
    return {
        id: i + 5,
        role: role,
        pitch: `${role} for a new ${area} project focused on innovation.`,
        skills: [role.split(' ')[0], "Strategy", "Impact"],
        type: type
    };
});

const founders = [...initialFounders, ...generatedFounders];

export default function TeamUp() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFounder, setSelectedFounder] = useState(null as any);

    const filteredFounders = useMemo(() => {
        return founders.filter(f =>
            f.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.pitch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm]);

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative">
            <Navbar />

            <div className="container mx-auto px-4 pt-40">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black mb-6 text-wave tracking-tighter">TEAM UP</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Find your co-founder, join a project, or build your dream team.
                        </p>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative">
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by skill, role, or keyword..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 pl-14 focus:outline-none focus:border-primary/50 transition-all text-white placeholder-gray-600 focus:bg-white/10 shadow-2xl"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-center text-gray-500 mb-8 font-mono text-sm uppercase tracking-widest">
                    Showing {filteredFounders.length} available talent profiles
                </p>

                {/* Founder Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ staggerChildren: 0.05 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredFounders.map((founder) => (
                        <motion.div
                            layout
                            key={founder.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className="glass p-8 rounded-3xl border border-white/5 hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden group flex flex-col"
                            onClick={() => setSelectedFounder(founder)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${founder.type === 'Tech' ? 'bg-blue-500/10 text-blue-400' :
                                    founder.type === 'Business' ? 'bg-green-500/10 text-green-400' :
                                        founder.type === 'Creative' ? 'bg-pink-500/10 text-pink-400' : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {founder.type === 'Tech' ? <Code className="w-6 h-6" /> :
                                        founder.type === 'Business' ? <Rocket className="w-6 h-6" /> :
                                            founder.type === 'Creative' ? <Palette className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{founder.type}</span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-1">{founder.role}</h3>
                            <p className="text-gray-400 mb-8 flex-1 leading-relaxed line-clamp-3">{founder.pitch}</p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {founder.skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-gray-300 border border-white/5 uppercase tracking-wider">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <button
                                className="w-full py-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold transition-all transform active:scale-95 border border-primary/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFounder(founder);
                                }}
                            >
                                Request Intro
                            </button>
                        </motion.div>
                    ))}
            </div>
        </div>

            {/* Modal */ }
    <AnimatePresence>
        {selectedFounder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-xl bg-[#0f0f1a] border border-primary/30 rounded-3xl md:rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-2xl shadow-primary/20"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

                    <button
                        onClick={() => setSelectedFounder(null)}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="mb-8">
                        <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">{selectedFounder.type} Profile</span>
                        <h3 className="text-3xl font-black mt-2 text-white">Connect with {selectedFounder.role}</h3>
                        <div className="w-20 h-1 bg-primary/30 mt-4 rounded-full" />
                    </div>

                    <p className="text-gray-400 mb-8 italic leading-relaxed">"{selectedFounder.pitch}"</p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Your Message</label>
                            <textarea
                                autoFocus
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                                placeholder="Hi! I'm interested in your vision because..."
                            ></textarea>
                        </div>

                        <button
                            onClick={() => setSelectedFounder(null)}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-accent hover:scale-[1.02] text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20"
                        >
                            <Send className="w-5 h-5" /> Send Connection Request
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
        </main >
    );
}
