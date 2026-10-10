"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell, FileText, User, Users, ShoppingBag, ShieldCheck,
  LogOut, Menu, X, Sparkles, ChevronRight, Lock, Calendar, CheckSquare
} from "lucide-react";
import { PortailAuthProvider, usePortailAuth } from "@/contexts/PortailAuthContext";
import ThemeToggle from "@/components/ThemeToggle";

function RoleBadge({ role }: { role: string }) {
  // Display override: developers are displayed as Responsable to members
  const effectiveRole = role === "developpeur" ? "responsable" : role;
  switch (effectiveRole) {
    case "bureau":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <Sparkles size={12} /> Bureau
        </span>
      );
    case "responsable":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Responsable
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Membre
        </span>
      );
  }
}

function PortailShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, isDeveloper, isBureau, signOut } = usePortailAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== "/portail/login") {
      router.push("/portail/login");
    }
  }, [loading, user, pathname, router]);

  // If on login page, render without dashboard shell
  if (pathname === "/portail/login") {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm tracking-widest uppercase font-mono">Chargement du portail...</p>
      </div>
    );
  }

  const navItems = [
    {
      label: "Fil d'Annonces",
      href: "/portail/annonces",
      icon: Bell,
      show: true,
    },
    {
      label: "Calendrier & Réunions",
      href: "/portail/calendrier",
      icon: Calendar,
      show: true,
    },
    {
      label: "Tâches par Pôle",
      href: "/portail/taches",
      icon: CheckSquare,
      show: true,
    },
    {
      label: "Annuaire Membres",
      href: "/portail/membres",
      icon: Users,
      show: true,
    },
    {
      label: "Documents Officiels",
      href: "/portail/documents",
      icon: FileText,
      show: true,
    },
    {
      label: "Mon Profil",
      href: "/portail/profil",
      icon: User,
      show: true,
    },
    {
      label: "Gestion Membres",
      href: "/portail/gestion-membres",
      icon: Lock,
      show: isBureau, // Bureau (RH) + Dev
    },
    {
      label: "IHEC Store",
      href: "/portail/store",
      icon: ShoppingBag,
      show: isBureau, // Bureau + Dev
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/portail/login");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121217] border-b border-white/5 sticky top-0 z-50">
        <Link href="/portail/annonces" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            HEC
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-wide">PORTAIL INTERNE</div>
            <div className="text-[10px] text-gray-400">HEC Entrepreneurs</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#101015] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:static md:h-screen md:sticky md:top-0`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/portail/annonces" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              HEC
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-wider">ESPACE INTERNE</div>
              <div className="text-[11px] text-purple-400 font-medium">HEC Entrepreneurs</div>
            </div>
          </Link>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>

        {/* User Card */}
        {profile && (
          <div className="p-4 mx-4 my-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold overflow-hidden relative">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
                ) : (
                  profile.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white truncate">{profile.full_name}</div>
                <div className="text-xs text-gray-400 truncate mb-1">
                  {profile.role === "developpeur" || profile.email?.toLowerCase().includes("omarboudaya")
                    ? "Responsable IT & Dev Web"
                    : (profile.poste || "Membre")}
                </div>
                <RoleBadge role={profile.role} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.filter((i) => i.show).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/portail/annonces" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] transition-colors"
          >
            ← Retour au site public
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 font-medium transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-8">
        {children}
      </main>
    </div>
  );
}

export default function PortailLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortailAuthProvider>
      <PortailShell>{children}</PortailShell>
    </PortailAuthProvider>
  );
}
