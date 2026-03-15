"use client";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Send, Briefcase, Code, Palette, Rocket } from "lucide-react";

const initialFounders = [
    { id: 1, role: "CTO Recommandé", pitch: "Construire le Airbnb des camping-cars en Tunisie.", skills: ["React", "Node.js", "AWS"], type: "Tech" },
    { id: 2, role: "Responsable Marketing", pitch: "Plateforme EdTech en expansion dans la région MENA.", skills: ["Growth", "SEO", "Ads"], type: "Business" },
    { id: 3, role: "Designer UI/UX", pitch: "Application FinTech pour l'épargne de la Génération Z.", skills: ["Figma", "Prototyping", "UI"], type: "Creative" },
    { id: 4, role: "Co-fondateur IA", pitch: "Assistant juridique basé sur l'IA pour les PME.", skills: ["AI/ML", "Python", "NLP"], type: "Tech" },
];

// Generate 40+ examples
const additionalRoles = [
    "Responsable Marketing", "Développeur Frontend", "Développeur Backend", "Directeur Commercial",
    "Designer UI/UX", "Chef de Produit", "Développeur Mobile", "Growth Hacker",
    "Data Scientist", "Social Media Manager", "Responsable Opérations", "Spécialiste Juridique",
    "Développeur Fullstack", "Ingénieur IA", "Concepteur de Jeux", "Responsable de Marque"
];

const areas = [
    "Fintech", "Healthtech", "Edtech", "E-commerce", "SaaS", "Immobilier",
    "Durabilité", "Foodtech", "Logistique", "Voyage", "Cybersécurité", "Blockchain"
];

const generatedFounders = Array.from({ length: 40 }, (_, i) => {
    const role = additionalRoles[i % additionalRoles.length];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const type = ["Tech", "Business", "Créatif", "Stratégie"][Math.floor(Math.random() * 4)];
    return {
        id: i + 5,
        role: role,
        pitch: `${role} pour un nouveau projet ${area} axé sur l'innovation.`,
        skills: [role.split(' ')[0], "Stratégie", "Impact"],
        type: type
    };
});

const founders = [...initialFounders, ...generatedFounders];

export default function TeamUp() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFounder, setSelectedFounder] = useState<typeof founders[0] | null>(null);

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
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-thin mb-6 text-wave tracking-[0.1em] sm:tracking-[0.3em] uppercase">TEAM UP</h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                            Trouvez votre co-fondateur, rejoignez un projet ou bâtissez votre équipe de rêve.
                        </p>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative px-2">
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 sm:py-5 px-5 sm:px-6 pl-12 sm:pl-14 focus:outline-none focus:border-primary/50 transition-all text-white placeholder-gray-600 focus:bg-white/10 shadow-2xl"
                        />
                        <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-center text-gray-500 mb-8 font-mono text-[10px] sm:text-sm uppercase tracking-widest px-4 leading-tight">
                    Affichage de {filteredFounders.length} profils de talents disponibles
                </p>

                {/* Founder Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ staggerChildren: 0.05 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                >
                    {filteredFounders.map((founder) => (
                        <motion.div
                            layout
                            key={founder.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className="glass p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden group flex flex-col grayscale opacity-60"
                        >
                            {/* Blur & Coming Soon Overlay */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] z-20 flex items-center justify-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="px-4 py-2 sm:px-6 sm:py-2 border-2 border-primary/50 rounded-full bg-black/80 shadow-2xl shadow-primary/20"
                                >
                                    <span className="text-[9px] sm:text-[10px] font-light text-primary uppercase tracking-[0.2em] sm:tracking-[0.3em]">Bientôt disponible</span>
                                </motion.div>
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${founder.type === 'Tech' ? 'bg-blue-500/10 text-blue-400' :
                                    founder.type === 'Business' ? 'bg-green-500/10 text-green-400' :
                                        founder.type === 'Créatif' ? 'bg-pink-500/10 text-pink-400' : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {founder.type === 'Tech' ? <Code className="w-6 h-6" /> :
                                        founder.type === 'Business' ? <Rocket className="w-6 h-6" /> :
                                            founder.type === 'Créatif' ? <Palette className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{founder.type}</span>
                            </div>

                            <h3 className="text-xl font-light mb-4 line-clamp-1 uppercase tracking-tight">{founder.role}</h3>
                            <p className="text-gray-400 mb-8 flex-1 leading-relaxed line-clamp-3">{founder.pitch}</p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {founder.skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-medium text-gray-400 border border-white/5 uppercase tracking-wide">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <button
                                disabled
                                className="w-full py-4 rounded-xl bg-white/5 text-gray-500 font-bold border border-white/5 cursor-not-allowed"
                            >
                                Demander une Intro
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Modal */}
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
                                <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Profil {selectedFounder.type}</span>
                                <h3 className="text-3xl font-black mt-2 text-white">Connecter avec {selectedFounder.role}</h3>
                                <div className="w-20 h-1 bg-primary/30 mt-4 rounded-full" />
                            </div>

                            <p className="text-gray-400 mb-8 italic leading-relaxed">&quot;{selectedFounder.pitch}&quot;</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Votre Message</label>
                                    <textarea
                                        autoFocus
                                        className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                                        placeholder="Salut ! Je suis intéressé par votre vision car..."
                                    ></textarea>
                                </div>

                                <button
                                    onClick={() => setSelectedFounder(null)}
                                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-accent hover:scale-[1.02] text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20"
                                >
                                    <Send className="w-5 h-5" /> Envoyer la Demande
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main >
    );
}
