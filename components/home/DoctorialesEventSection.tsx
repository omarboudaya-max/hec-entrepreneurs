"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BrainCircuit, Sparkles, ArrowRight, Clock, MapPin, Laptop, ShieldCheck } from "lucide-react";

export default function DoctorialesEventSection() {
  return (
    <section id="doctoriales" className="py-16 md:py-24 relative overflow-hidden flex items-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Visual Poster Banner */}
          <motion.div
            className="flex-1 w-full max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-50px", once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-full aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden border-2 border-purple-500/30 bg-[#0d0c1d] shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
              <Image
                src="/hec-doctoriales-banner.jpg"
                alt="Affiche HEC Doctoriales - Atelier IA et Prise de Décisions"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070712] via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="px-3 py-1 rounded-full bg-purple-900/80 backdrop-blur-md border border-purple-400/30 font-semibold flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                  HEC Doctoriales • 14e Édition
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 font-mono text-[11px] text-slate-300">
                  5 &amp; 6 Novembre 2026
                </span>
              </div>
            </div>
          </motion.div>

          {/* Text & Action */}
          <motion.div
            className="flex-1 space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-50px", once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex items-center justify-center lg:justify-between gap-4 max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>HEC Doctoriales Series • 5 &amp; 6 Novembre 2026</span>
              </div>

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white border-2 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.3)] shrink-0">
                <Image
                  src="/ecole-doctorale-logo.jpg"
                  alt="École Doctorale IHEC Carthage"
                  fill
                  className="object-contain p-1"
                />
              </div>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
                HEC{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400">
                  Doctoriales
                </span>
              </h2>
              <p className="text-purple-600 dark:text-purple-300 italic font-serif text-base sm:text-lg mt-2">
                « Faire de la recherche doctorale un levier d&apos;excellence »
              </p>
            </div>

            <p className="text-stone-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Organisées par l&apos;<strong>École Doctorale de l&apos;IHEC Carthage</strong> les <strong>5 &amp; 6 novembre 2026</strong>, les <strong>HEC Doctoriales</strong> réunissent enseignants-chercheurs, doctorants et étudiants autour de panels transversaux, séminaires et sessions de spécialités (Économie, Comptabilité, Finance, Marketing &amp; Management).
            </p>

            {/* Quick Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700 dark:text-slate-300 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20">
                <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                <span>5 &amp; 6 Novembre 2026 (09h00 – 17h30)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20">
                <Laptop className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Panels, Séminaires &amp; Sessions</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-500/5 dark:bg-slate-900/60 border border-slate-700/40">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0" />
                <span>IHEC Carthage</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Économie, Comptabilité, Finance, Marketing, Management</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/evenements/doctoriales"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-all shadow-xl shadow-purple-600/25 hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <span>Accéder au formulaire d&apos;inscription</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
