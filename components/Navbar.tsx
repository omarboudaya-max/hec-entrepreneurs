"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Filter, ShoppingCart, ShoppingBag, Shield } from "lucide-react";
import clsx from "clsx";
import { useCartStore } from "@/store/cartStore";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
    { href: "/", label: "Accueil" },
    { href: "/evenements/doctoriales", label: "Doctoriales IA" },
    { href: "/about", label: "À Propos" },
    { href: "/entrepreuneuriat", label: "Entrepreuneuriat" },
    { href: "/store", label: "IHEC Store" },
    { href: "/team-up", label: "Team Up" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Store variables
    const isStore = pathname.startsWith("/store") || pathname.startsWith("/admin/store");
    const { items, searchQuery, setSearchQuery } = useCartStore();
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        
        // Fetch admin session
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => setIsAdmin(data.isAdmin))
            .catch(() => setIsAdmin(false));

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 pt-6 px-4"
        >
            {/* Corner Logos */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-8 items-center flex pointer-events-none z-10">
                <img src="/logo-ihec.png" alt="IHEC Carthage" className="h-12 sm:h-24 md:h-32 w-auto opacity-100 transition-opacity pointer-events-auto drop-shadow-sm" />
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 items-center flex pointer-events-none z-10">
                <Link href="/" className="pointer-events-auto">
                    <img src="/logo-club.png" alt="HEC Entrepreneurs" className="h-12 sm:h-24 md:h-32 w-auto opacity-100 transition-opacity drop-shadow-sm" />
                </Link>
            </div>

            <div className="grid grid-cols-3 items-center max-w-[1600px] mx-auto w-full px-4 sm:px-24 md:px-32 relative h-16 gap-4">
                
                {/* Left Column: Search Bar */}
                <div className="flex justify-start items-center">
                    {isStore && (
                        <div className="hidden lg:block relative w-full max-w-xs z-20">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/50" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100/90 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 focus:bg-white focus:dark:bg-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 rounded-full transition-all text-sm outline-none backdrop-blur-md shadow-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Center Column: Main Nav Links */}
                <div className="flex justify-center z-30">
                    <div className="glass px-2 py-2 rounded-full flex items-center gap-1 shadow-md dark:shadow-none">
                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={clsx(
                                            "relative px-4 py-2 rounded-full text-sm tracking-widest transition-colors whitespace-nowrap",
                                            isActive
                                                ? "text-purple-700 dark:text-white font-semibold"
                                                : "text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white font-normal"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute inset-0 bg-primary/15 dark:bg-primary/20 rounded-full border border-primary/40 dark:border-primary/50"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-slate-700 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Right Column: Cart & Filters & Espace Membre */}
                <div className="flex justify-end items-center z-20 gap-2.5">
                    <ThemeToggle />
                    
                    {pathname === "/" && (
                        <Link
                            href="/portail"
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase bg-purple-600 hover:bg-purple-700 text-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500 dark:text-white border border-purple-500/50 dark:border-purple-400/50 shadow-md shadow-purple-600/30 dark:shadow-purple-900/40 transition-all backdrop-blur-md"
                        >
                            <Shield className="w-3.5 h-3.5 text-white" />
                            <span>Espace Membre</span>
                        </Link>
                    )}

                    {isStore && (
                        <div className="hidden lg:flex items-center gap-2">
                            <button className="glass px-4 py-2 rounded-full text-slate-700 dark:text-[#cbb0a5] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 whitespace-nowrap shadow-sm">
                                <Filter className="w-4 h-4" /> Filtres
                            </button>
                            {isAdmin ? (
                                <Link href="/admin/store" className="glass px-4 py-2 bg-primary/20 dark:bg-primary/30 rounded-full text-purple-900 dark:text-white transition-all hover:bg-primary/30 dark:hover:bg-primary/50 flex items-center gap-2 text-sm border border-primary/40 dark:border-primary/50 shadow-md whitespace-nowrap font-medium">
                                    <ShoppingBag className="w-4 h-4" /> Voir Commandes
                                </Link>
                            ) : (
                                <Link href="/store/cart" className="glass px-4 py-2 bg-purple-600/20 dark:bg-purple-600/30 rounded-full text-purple-900 dark:text-white transition-all hover:bg-purple-600/30 dark:hover:bg-purple-600/50 flex items-center gap-2 text-sm border border-purple-400/50 dark:border-purple-500/50 shadow-md whitespace-nowrap font-medium">
                                    <ShoppingCart className="w-4 h-4" /> Panier ({cartItemCount})
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
                            className="absolute top-full left-1/2 mt-4 p-3 glass rounded-[2rem] border border-slate-200 dark:border-primary/20 md:hidden flex flex-col gap-1 w-[280px] shadow-2xl z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                                <span className="text-xs font-semibold text-slate-700 dark:text-gray-400">Mode d&apos;affichage</span>
                                <ThemeToggle />
                            </div>

                            {pathname === "/" && (
                                <Link
                                    href="/portail"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] transition-all text-center bg-purple-600 hover:bg-purple-700 text-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500 dark:text-white border border-purple-500/50 dark:border-purple-400/50 shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 mb-1"
                                >
                                    <Shield className="w-3.5 h-3.5 text-white" />
                                    <span>Espace Membre</span>
                                </Link>
                            )}
                            {isStore && (
                                <div className="p-2 mb-2 border-b border-slate-200 dark:border-white/10">
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 rounded-full text-xs outline-none"
                                    />
                                </div>
                            )}
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={clsx(
                                            "px-6 py-3 rounded-2xl text-xs font-medium uppercase tracking-[0.1em] transition-all text-center",
                                            isActive
                                                ? "bg-primary/20 text-purple-700 dark:text-primary border border-primary/30 font-bold"
                                                : "text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                            {isStore && (
                                <div className="flex justify-between items-center gap-2 p-2 mt-2 border-t border-slate-200 dark:border-white/10">
                                    <button className="flex-1 py-2 text-center text-xs font-medium tracking-widest text-slate-700 dark:text-[#cbb0a5] hover:text-purple-600 dark:hover:text-white">Filtres</button>
                                    {isAdmin ? (
                                        <Link href="/admin/store" onClick={() => setIsOpen(false)} className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-bold bg-primary/30 text-purple-900 dark:text-white rounded-xl border border-primary/50">
                                            <ShoppingBag className="w-3 h-3" /> Commandes
                                        </Link>
                                    ) : (
                                        <Link href="/store/cart" onClick={() => setIsOpen(false)} className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-bold bg-purple-600/30 text-purple-900 dark:text-white rounded-xl border border-purple-500/50">
                                            <ShoppingCart className="w-3 h-3" /> Panier ({cartItemCount})
                                        </Link>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
}
