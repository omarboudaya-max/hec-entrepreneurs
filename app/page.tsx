"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const promesseRef = useRef(null);
  const differentRef = useRef(null);
  const eventRef = useRef(null);

  const { scrollYProgress: promesseScroll } = useScroll({
    target: promesseRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: differentScroll } = useScroll({
    target: differentRef,
    offset: ["start end", "end start"]
  });

  const promesseY = useTransform(promesseScroll, [0, 1], [100, -100]);
  const differentY = useTransform(differentScroll, [0, 1], [50, -50]);

  const { scrollYProgress: eventScroll } = useScroll({
    target: eventRef,
    offset: ["start center", "center center"]
  });
  const backgroundOpacity = useTransform(eventScroll, [0, 1], [0, 1]);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden scroll-smooth">
      <Navbar />
      <Hero />

      {/* Section “Notre promesse” */}
      <section ref={promesseRef} className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            style={{ y: promesseY }}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 1,
              type: "spring",
              bounce: 0.4
            }}
          >
            <h2 className="text-3xl md:text-5xl font-light mb-8 text-white uppercase tracking-[0.2em] text-glow">
              NOTRE PROMESSE
            </h2>
            <p className="text-lg md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light italic">
              &quot;Le Club HEC Entrepreneurs est une plateforme d’action, de formation et d’innovation dédiée aux étudiants qui souhaitent entreprendre, innover et avoir un impact réel sur leur environnement.&quot;
            </p>
          </motion.div>
        </div>

        {/* Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Visual Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

      {/* Section “Pourquoi nous sommes différents” */}
      <section ref={differentRef} className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-light text-center mb-20 text-wave uppercase tracking-[0.1em]"
          >
            POURQUOI NOUS SOMMES DIFFÉRENTS
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Approche 100 % action", desc: "Nous ne restons pas dans la théorie, nous construisons des projets concrets." },
              { title: "Connexion réelle avec l’écosystème", desc: "Un lien direct avec les entrepreneurs et investisseurs tunisiens." },
              { title: "Leadership & entrepreneuriat responsable", desc: "Former des leaders conscients de leur impact social et environnemental." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                style={{ y: idx % 2 === 0 ? differentY : 0 }}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.8,
                  type: "spring"
                }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/50 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-3 group-hover:opacity-10 transition-opacity">
                  <span className="text-7xl font-thin text-white">{idx + 1}</span>
                </div>
                <h3 className="text-xl font-light mb-4 text-primary group-hover:text-white transition-colors uppercase tracking-[0.15em] italic">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent my-10" />

      {/* Section Événement : Tribunal de l'entrepreneuriat */}
      <section ref={eventRef} className="py-40 relative overflow-hidden flex items-center min-h-[90vh]">
        {/* Background photo faded */}
        <motion.div 
          className="absolute inset-0 z-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ opacity: backgroundOpacity, filter: "brightness(0.3) saturate(0.8)" }}
        />
        {/* Dark overlay to ensure text readability */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/60 to-[#050505] z-0"
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
              <div className="relative w-full aspect-[3/4.2] md:aspect-[3/4] max-w-sm lg:max-w-md mx-auto rounded-md overflow-hidden bg-[#241008] border-[8px] border-[#38160d] shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] group relative">
                {/* Image Placeholder that falls back or displays the actual image */}
                <Image 
                  src="/affiche-tribunal.png" 
                  alt="Affiche Tribunal de l'entrepreneuriat" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
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

      {/* Section Partners */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 z-10 relative">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-light text-center mb-16 text-[#d4af37] uppercase tracking-[0.3em] font-serif"
          >
            NOS PARTENAIRES
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-center justify-items-center">
            {[
              { name: "TLF", src: "/partners/tlf_clean.png" },
              { name: "KAYCO Motors", src: "/partners/kayco_clean.png" },
              { name: "Emagine", src: "/partners/emagine_clean.png" },
            ].map((partner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
                className="relative w-full max-w-[320px] h-48 flex items-center justify-center group"
              >
                <div className="relative w-full h-full p-4 transition-all duration-500 flex items-center justify-center">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={300}
                    height={120}
                    className="object-contain w-auto h-auto max-h-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      <Footer />
    </main>
  );
}
