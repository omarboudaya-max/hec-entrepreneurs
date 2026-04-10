"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Lightbulb } from "lucide-react";

export default function TribunalSuccess() {
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center py-20 px-4">
      {/* Background with the faded poster visual */}
      <div className="absolute inset-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat bg-fixed filter brightness-[0.25] z-0"></div>
      
      {/* Dark tint overlay for Tribunal ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#110704]/80 to-[#050100]/95 backdrop-blur-[2px] z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10 text-center"
      >
        <div className="bg-[#1c0804]/80 backdrop-blur-md border-[4px] border-[#38160d] p-12 md:p-16 shadow-[0_30px_60px_rgba(0,0,0,1),inset_0_0_40px_rgba(0,0,0,0.8)] relative isolate">
          {/* Inner gold trim */}
          <div className="absolute inset-2 border border-[#d4af37]/20 pointer-events-none -z-10"></div>
          
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Lightbulb className="w-24 h-24 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" strokeWidth={1.5} />
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-[0.2em] mb-6 text-[#ece2d0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            La Cour a reçu votre <br/><span className="text-[#d4af37] font-bold">Plaidoyer</span>
          </h1>

          <div className="w-24 h-1 bg-[#d4af37]/50 mx-auto my-8"></div>

          <p className="text-[#cbb0a5] font-serif text-xl leading-relaxed mb-10">
            Votre inscription au <strong className="text-[#d4af37] font-normal italic">Tribunal de l&apos;entrepreneuriat</strong> a bien été enregistrée. 
            <br/><br/>
            Préparez vos arguments, affûtez vos discours et tenez-vous prêt à comparaître le <strong>17 Avril 2026</strong>.
          </p>

          <Link href="/">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-[#3d160b] text-[#d4af37] text-sm md:text-base font-serif tracking-[0.2em] uppercase hover:bg-[#521d0e] hover:text-white transition-all duration-300 border border-[#d4af37]/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden group shadow-[#000]"
              >
                Retourner dans la salle d&apos;attente (Accueil)
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
