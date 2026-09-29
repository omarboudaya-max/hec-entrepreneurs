"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";

const PARTNERS = [
  { 
    id: "tlf",
    name: "TLF Leasing", 
    src: "/partners/tlf_clean_v2.png",
    mobileScale: "scale-75 md:scale-100",
    mobileHeight: "h-20 sm:h-24 md:h-48",
  },
  { 
    id: "kayco",
    name: "KAYCO Motors", 
    src: "/partners/kayco_clean.png",
    mobileScale: "scale-[1.35] md:scale-100",
    mobileHeight: "h-36 sm:h-40 md:h-48",
  },
  { 
    id: "emagine",
    name: "Emagine", 
    src: "/partners/emagine_clean_v3.png",
    mobileScale: "scale-[1.35] md:scale-100",
    mobileHeight: "h-36 sm:h-40 md:h-48",
  },
];

export default function PartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-[#050505] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 z-10 relative">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl sm:text-2xl md:text-3xl font-light text-center mb-10 md:mb-16 text-[#d4af37] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-serif"
        >
          NOS PARTENAIRES
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-center justify-items-center">
          {PARTNERS.map((partner, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className={clsx(
                "relative w-full max-w-[340px] md:max-w-[400px] flex items-center justify-center group transition-all duration-300",
                partner.mobileHeight
              )}
            >
              <div className={clsx(
                "relative w-full h-full p-2 sm:p-4 transition-all duration-500 flex items-center justify-center",
                partner.mobileScale
              )}>
                <Image
                  src={partner.src}
                  alt={partner.name}
                  width={320}
                  height={140}
                  className="object-contain w-full h-full max-h-full max-w-full drop-shadow-md"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
