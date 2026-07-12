"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const PARTNERS = [
  { name: "TLF", src: "/partners/tlf_clean_v2.png" },
  { name: "KAYCO Motors", src: "/partners/kayco_clean.png" },
  { name: "Emagine", src: "/partners/emagine_clean_v3.png" },
];

export default function PartnersSection() {
  return (
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
          {PARTNERS.map((partner, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="relative w-full max-w-[400px] h-32 md:h-48 flex items-center justify-center group"
            >
              <div className="relative w-full h-full p-4 transition-all duration-500 flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  width={300}
                  height={120}
                  className="object-contain w-full h-full max-h-full max-w-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
