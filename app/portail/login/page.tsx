"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, User, Mail, ArrowRight, ShieldCheck, AlertCircle,
  KeyRound, CheckCircle2, HelpCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PortailLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot Password Modal / View State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      let loginEmail = identifier.trim().toLowerCase();

      // If user typed a username (no @), resolve the corresponding email
      if (!loginEmail.includes("@")) {
        const resolveRes = await fetch("/api/portail/auth/resolve-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: loginEmail }),
        });

        const resolveData = await resolveRes.json();
        if (!resolveRes.ok || !resolveData.email) {
          throw new Error(
            resolveData.error ||
            "Nom d'utilisateur introuvable. Entrez votre nom complet sans espaces ni majuscules (ex: emnaallegui)."
          );
        }
        loginEmail = resolveData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password.trim(),
      });

      if (error) {
        setErrorMsg(
          error.message === "Invalid login credentials"
            ? "Identifiants incorrects. Vérifiez votre nom d'utilisateur ou mot de passe, ou utilisez l'option 'Mot de passe oublié'."
            : error.message
        );
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/portail/annonces");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotMsg({ type: "error", text: "Veuillez renseigner votre nom d'utilisateur ou email." });
      return;
    }

    setForgotLoading(true);
    setForgotMsg(null);

    try {
      const res = await fetch("/api/portail/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible de réinitialiser le mot de passe.");
      }

      setForgotMsg({
        type: "success",
        text: data.message || "Un nouveau mot de passe a été envoyé à votre adresse email enregistrée !",
      });
      setForgotIdentifier("");
    } catch (err: any) {
      setForgotMsg({ type: "error", text: err.message || "Erreur de réinitialisation." });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-white/10 mx-auto flex items-center justify-center p-3 shadow-xl shadow-purple-500/15 mb-4">
            <img
              src="/logo-club.png"
              alt="Logo HEC Entrepreneurs"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Espace Intranet
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Portail officiel des membres du Club HEC Entrepreneurs
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl relative">
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3 text-xs text-purple-300">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-purple-400 mt-0.5" />
            <p>
              Connectez-vous avec votre <strong>nom d&apos;utilisateur</strong> (nom complet sans espaces ni majuscules) ou votre email officiel.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-xs text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Nom d&apos;utilisateur (Username) ou Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ex: emnaallegui ou email@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 pl-1">
                Astuce : Tapez votre nom et prénom attachés sans majuscules (ex: <code>emnaallegui</code>).
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Mot de Passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à l&apos;Intranet</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Collapsible Forgot Password View */}
          <AnimatePresence>
            {showForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <KeyRound size={15} className="text-purple-400" />
                    <span>Réinitialiser mon mot de passe</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Renseignez votre nom d&apos;utilisateur ou votre email. Un nouveau mot de passe vous sera immédiatement envoyé par email.
                  </p>

                  {forgotMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        forgotMsg.type === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                          : "bg-red-500/10 border border-red-500/20 text-red-300"
                      }`}
                    >
                      {forgotMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{forgotMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="ex: emnaallegui ou votre email"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                      >
                        {forgotLoading ? "Envoi en cours..." : "Recevoir mon nouveau mot de passe"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForgot(false)}
                        className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-gray-300 text-xs rounded-xl transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Revenir au site vitrine public
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
