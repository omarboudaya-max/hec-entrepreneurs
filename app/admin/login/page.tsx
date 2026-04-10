"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock } from "lucide-react";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth") === "true";
    if (isAuth) router.push("/admin");
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === "Bureau2026" && credentials.password === "Bureau2026") {
      localStorage.setItem("admin_auth", "true");
      router.push("/admin");
    } else {
      setError("Identifiants incorrects. Accès refusé par la Cour.");
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-[#050100] px-4 overflow-hidden">
      {/* Background themed as Tribunal */}
      <div className="absolute inset-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center opacity-20 filter grayscale z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1c0804] via-black to-[#3d160b]/30 z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#1c0804]/90 backdrop-blur-xl border border-[#d4af37]/30 p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30">
              <Shield className="text-[#d4af37] w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif uppercase tracking-[0.2em] text-[#ece2d0]">Accès Bureau</h1>
            <p className="text-[#9c8278] font-serif italic text-sm mt-2">Zone restreinte - Membres du Bureau 2026</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Identifiant</label>
              <input 
                type="text" 
                required
                className="w-full bg-black/50 border border-[#5c2312] focus:border-[#d4af37] px-4 py-3 text-[#ece2d0] outline-none transition-all font-serif"
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Mot de passe</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  className="w-full bg-black/50 border border-[#5c2312] focus:border-[#d4af37] px-4 py-3 text-[#ece2d0] outline-none transition-all font-serif pr-10"
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c2312]" />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-serif italic text-center">
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-[#3d160b] text-[#d4af37] text-sm font-serif tracking-[0.2em] uppercase hover:bg-[#d4af37] hover:text-[#1c0804] transition-all duration-300 border border-[#d4af37]/30"
            >
              Entrer dans la Cour
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-[#d4af37]/10">
            <Link href="/" className="text-[#9c8278] hover:text-[#ece2d0] text-xs font-serif transition-colors tracking-widest uppercase">
              ← Retour au site public
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
