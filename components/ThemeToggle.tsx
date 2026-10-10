"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid SSR hydration mismatch
    return (
      <div className={`w-9 h-9 rounded-full bg-white/5 border border-white/10 ${className}`} />
    );
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isLight ? "Passer en mode sombre" : "Passer en mode clair"}
      title={isLight ? "Mode Sombre" : "Mode Clair"}
      className={`relative inline-flex items-center gap-2 p-2 rounded-full transition-all duration-300 focus:outline-none ${
        isLight
          ? "bg-slate-200/80 hover:bg-slate-300/80 text-amber-600 border border-slate-300 shadow-sm"
          : "bg-white/10 hover:bg-white/15 text-yellow-300 border border-white/15 shadow-inner"
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isLight ? (
          <Moon size={18} className="text-slate-700 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun size={18} className="text-amber-400 transition-transform duration-300 rotate-0 animate-spin-slow" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider pr-2">
          {isLight ? "Mode Sombre" : "Mode Clair"}
        </span>
      )}
    </button>
  );
}
