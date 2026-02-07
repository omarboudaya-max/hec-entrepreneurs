"use client";
import Link from "next/link";
import { Mail, Instagram, Linkedin, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
    return (
        <footer className="relative bg-black border-t border-white/10 pt-20 pb-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Mission */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-white mb-6 block">
                            HEC <span className="text-primary italic">ENTREPRENEURS</span>
                        </Link>
                        <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                            Le premier club d'entrepreneuriat à l'IHEC Carthage.
                            Idéaliser, Construire, Propulser.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Mail, href: "mailto:contact@hec-entrepreneurs.tn" },
                                { icon: Instagram, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Globe, href: "#" }
                            ].map((social, idx) => (
                                <motion.a
                                    key={idx}
                                    href={social.href}
                                    whileHover={{ scale: 1.1, color: "#7c3aed" }}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-colors"
                                >
                                    <social.icon size={20} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Navigation</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Accueil", href: "/" },
                                { label: "À Propos", href: "/about" },
                                { label: "Entrepreneuriat", href: "/entrepreuneuriat" },
                                { label: "Ressources", href: "/resources" },
                                { label: "TeamUp", href: "/team-up" }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Contact</h4>
                        <p className="text-gray-400 text-sm mb-4">IHEC Carthage</p>
                        <p className="text-gray-400 text-sm mb-4">Carthage Presidence, 2016</p>
                        <p className="text-gray-400 text-sm">Tunisie</p>
                    </div>
                </div>

                {/* Bottom Band */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © 2026 HEC Entrepreneurs IHEC Carthage. Tous droits réservés.
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                        Fait avec <Heart size={12} className="text-primary fill-primary" /> par l'équipe HEC
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
