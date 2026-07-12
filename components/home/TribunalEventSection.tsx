"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function TribunalEventSection() {
  const eventRef = useRef(null);
  const { scrollYProgress: eventScroll } = useScroll({
    target: eventRef,
    offset: ["start center", "center center"]
  });
  const backgroundOpacity = useTransform(eventScroll, [0, 1], [0, 1]);

  return (
    <section ref={eventRef} className="py-40 relative overflow-hidden flex items-center min-h-[90vh]">
      {/* Background photo faded */}
      <motion.div 
        className="absolute inset-0 z-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ opacity: backgroundOpacity, filter: "brightness(0.3) saturate(0.8)" }}
      />
      {/* Dark overlay to ensure text readability */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/70 to-[#050505] z-0"
        style={{ opacity: backgroundOpacity }}
      />

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px", once: true }}
            transition={{ duration: 1 }}
          >
            <div className="relative w-full aspect-[3/4] max-w-sm lg:max-w-md mx-auto rounded-md overflow-hidden bg-[#120805] border-[8px] border-[#38160d] shadow-[0_0_60px_rgba(0,0,0,0.8)] group relative">
              {/* Image Placeholder that falls back or displays the actual image */}
              <Image 
                src="/affiche-tribunal.png" 
                alt="Affiche Tribunal de l'entrepreneuriat" 
                fill 
                className="object-contain p-2 transition-transform duration-700 group-hover:scale-105 group-hover:brightness-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Fallback shadow text if image is missing */}
              <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center -z-10 text-[#d4af37]/60">
                <p className="font-serif italic text-sm tracking-widest text-center mt-20">Veuillez sauvegarder votre affiche<br/>sous public/affiche-tribunal.png</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 space-y-8 text-center md:text-left relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px", once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Gavel icon background watermark */}
            <svg className="absolute -top-20 -left-10 w-64 h-64 text-[#d4af37]/5 -z-10 -rotate-12" fill="currentColor" viewBox="0 0 24 24">
               <path d="M5.59,2.54C5.14,2.5 4.67,2.65 4.29,2.92C3.12,3.77 2,5 2.11,6.54C2.26,8.22 3.65,9.58 5.3,9.73C6.7,9.85 8,8.8 8.44,7.56L14,13.12V18L16,20L18,18V13.12L20.65,10.47C21.43,9.69 21.43,8.42 20.65,7.64C19.87,6.86 18.6,6.86 17.82,7.64L15.17,10.29L9.61,4.73C9.03,3.74 8.03,3 6.81,2.69C6.41,2.58 6,2.53 5.59,2.54M5.44,4.54C5.66,4.53 5.89,4.56 6.1,4.64C6.67,4.86 7.15,5.32 7.46,5.88L14,12.41V16.59L16,18.59L18,16.59V12.41L19.24,11.17L20.17,10.24L18.3,8.37L16.41,10.24L15.17,11.41C15.17,11.41 8.86,5.1 8.86,5.1C8.75,4.92 8.6,4.77 8.44,4.64C7.81,4.11 6.94,3.95 6.16,4.14C5.85,4.21 5.55,4.35 5.3,4.54L5.44,4.54Z" />
            </svg>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#ece2d0] uppercase tracking-[0.1em] drop-shadow-[0_5px_15px_rgba(0,0,0,1)] leading-tight border-b-2 border-[#d4af37]/30 pb-6 inline-block">
              LE TRIBUNAL DE<br/><span className="text-[#d4af37]">L&apos;ENTREPRENEURIAT</span>
            </h2>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-10 gap-y-4 text-lg md:text-xl font-serif text-[#d4af37]/80">
              <p className="flex items-center gap-4">
                <span className="w-1 h-6 rounded-sm bg-[#5c2312] shadow-[1px_1px_0px_#d4af37]"></span>
                17 Avril 2026 à 14h00
              </p>
              <p className="flex items-center gap-4">
                <span className="w-1 h-6 rounded-sm bg-[#5c2312] shadow-[1px_1px_0px_#d4af37]"></span>
                Chapelle de l&apos;IHEC Carthage
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[#cbb0a5] text-lg leading-relaxed max-w-xl mx-auto md:mx-0 font-serif font-light text-justify uppercase tracking-wide">
                Pendant des années, on vous a dit : entreprenez, innovez, prenez des risques...
                Mais aujourd&apos;hui, une seule question change tout :
              </p>
              
              <p className="text-[#d4af37] text-xl leading-relaxed max-w-xl mx-auto md:mx-0 font-serif italic text-justify">
                &quot;L&apos;entrepreneuriat est-il réellement la voie de l&apos;avenir ?&quot;
              </p>
              
              <h3 className="text-2xl mt-6 text-[#ece2d0] font-serif uppercase tracking-[0.15em] border-l-4 border-[#d4af37] pl-4">
                L&apos;ENTREPRENEURIAT EST MIS EN PROCÈS
              </h3>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
