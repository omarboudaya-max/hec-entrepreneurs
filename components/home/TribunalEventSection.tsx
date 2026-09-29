"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Gavel } from "lucide-react";

export default function TribunalEventSection() {
  const eventRef = useRef(null);
  const { scrollYProgress: eventScroll } = useScroll({
    target: eventRef,
    offset: ["start center", "center center"]
  });
  const backgroundOpacity = useTransform(eventScroll, [0, 1], [0.3, 1]);

  return (
    <section ref={eventRef} className="py-16 md:py-36 relative overflow-hidden flex items-center min-h-0 md:min-h-[85vh]">
      {/* Background photo faded (bg-cover without bg-fixed for mobile compatibility) */}
      <motion.div 
        className="absolute inset-0 z-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat"
        style={{ opacity: backgroundOpacity, filter: "brightness(0.25) saturate(0.8)" }}
      />
      {/* Dark overlay to ensure text readability */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/85 to-[#050505] z-0"
        style={{ opacity: backgroundOpacity }}
      />

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Poster Image Container */}
          <motion.div 
            className="flex-1 w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-50px", once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#120805] border-4 md:border-[8px] border-[#38160d] shadow-[0_0_50px_rgba(0,0,0,0.8)] group">
              <Image 
                src="/affiche-tribunal.png" 
                alt="Affiche Tribunal de l'entrepreneuriat" 
                fill 
                className="object-contain p-2 transition-transform duration-700 group-hover:scale-105 group-hover:brightness-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center -z-10 text-[#d4af37]/60">
                <p className="font-serif italic text-xs sm:text-sm tracking-widest text-center mt-20">Affiche Tribunal de l'Entrepreneuriat</p>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            className="flex-1 space-y-6 text-center md:text-left relative w-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-50px", once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Watermark Gavel Icon */}
            <div className="absolute -top-12 -left-6 w-48 h-48 md:w-64 md:h-64 text-[#d4af37]/5 -z-10 -rotate-12 pointer-events-none hidden sm:block">
              <Gavel className="w-full h-full" strokeWidth={1} />
            </div>

            <div className="inline-block">
              <div className="inline-flex items-center gap-2 text-[#d4af37] bg-[#d4af37]/10 px-3.5 py-1.5 rounded-full border border-[#d4af37]/30 mb-4 text-xs font-serif uppercase tracking-widest shadow-md">
                <Award className="w-4 h-4 text-[#d4af37]" />
                <span>Meilleur Événement 2026</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#ece2d0] uppercase tracking-tight sm:tracking-[0.1em] drop-shadow-md leading-tight border-b border-[#d4af37]/30 pb-4 break-words">
                LE TRIBUNAL DE<br/><span className="text-[#d4af37]">L&apos;ENTREPRENEURIAT</span>
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-2">
              <p className="text-[#cbb0a5] text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto md:mx-0 font-serif font-light text-left sm:text-justify tracking-wide">
                Pendant des années, on vous a dit : entreprenez, innovez, prenez des risques...
                Mais aujourd&apos;hui, une seule question change tout :
              </p>
              
              <p className="text-[#d4af37] text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0 font-serif italic text-left sm:text-justify">
                &quot;L&apos;entrepreneuriat est-il réellement la voie de l&apos;avenir ?&quot;
              </p>
              
              <h3 className="text-base sm:text-xl text-[#ece2d0] font-serif uppercase tracking-widest border-l-4 border-[#d4af37] pl-4 text-left">
                L&apos;ENTREPRENEURIAT A ÉTÉ MIS EN PROCÈS
              </h3>
            </div>

            {/* CTA Button to Showcase Project */}
            <div className="pt-4 flex items-center justify-center md:justify-start">
              <Link 
                href="/projets/tribunal"
                className="px-8 py-4 bg-[#3d160b] hover:bg-[#541e0f] text-[#d4af37] hover:text-white border border-[#d4af37]/50 rounded-xl font-serif text-xs sm:text-sm uppercase tracking-[0.15em] transition-all shadow-lg hover:scale-[1.02] text-center flex items-center justify-center gap-3 group"
              >
                <span>Découvrir l&apos;événement & l&apos;histoire</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
