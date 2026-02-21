"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const links = [
    { href: "/", label: "Accueil" },
    { href: "/about", label: "À Propos" },
    { href: "/entrepreuneuriat", label: "Entrepreuneuriat" },
    { href: "/resources", label: "Ressources" },
    { href: "/team-up", label: "Team Up" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 pt-6 px-4"
        >
            {/* Corner Logos */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-8 items-center flex">
                <img src="/logo-ihec.png" alt="IHEC Carthage" className="h-12 sm:h-24 md:h-32 w-auto opacity-100 transition-opacity" />
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 items-center flex">
                <img src="/logo-club.png" alt="HEC Entrepreneurs" className="h-12 sm:h-24 md:h-32 w-auto opacity-100 transition-opacity" />
            </div>

            <div className="flex justify-center">
                <div className="glass px-2 py-2 rounded-full flex items-center gap-1 relative">
                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "relative px-4 py-2 rounded-full text-sm font-light tracking-widest transition-colors",
                                    pathname === link.href ? "text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-primary/20 rounded-full border border-primary/50"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
                                className="absolute top-full left-1/2 mt-4 p-2 glass rounded-[2rem] border border-primary/20 md:hidden flex flex-col gap-1 w-[280px] shadow-2xl"
                            >
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={clsx(
                                            "px-6 py-3 rounded-2xl text-xs font-light uppercase tracking-[0.1em] transition-all text-center",
                                            pathname === link.href
                                                ? "bg-primary/20 text-primary border border-primary/30"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.nav>
    );
}
