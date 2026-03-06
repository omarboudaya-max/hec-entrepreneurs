"use client";
import { motion } from "framer-motion";
import { UserPlus, Code, Briefcase, Palette } from "lucide-react";

export default function TeamUp() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl border border-white/10 p-8 md:p-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Trouvez Votre Co-Fondateur</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            Arrêtez de chercher des idées, cherchez des personnes. Connectez-vous avec des talents complémentaires dans le réseau HEC.
                        </p>

                        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
                            {[
                                { label: "Experts Tech", icon: Code },
                                { label: "Esprits Business", icon: Briefcase },
                                { label: "Âmes Créatives", icon: Palette },
                            ].map((role, idx) => (
                                <div key={idx} className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2">
                                    <role.icon className="w-6 h-6 text-primary" />
                                    <span className="font-medium text-gray-200">{role.label}</span>
                                </div>
                            ))}
                        </div>

                        <button disabled className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold flex items-center gap-2 mx-auto cursor-not-allowed">
                            <UserPlus className="w-5 h-5" />
                            Bientôt Disponible
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
