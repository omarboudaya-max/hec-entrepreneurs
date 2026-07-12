"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function PromiseSection() {
  const promesseRef = useRef(null);
  const { scrollYProgress: promesseScroll } = useScroll({
    target: promesseRef,
    offset: ["start end", "end start"]
  });
  const promesseY = useTransform(promesseScroll, [0, 1], [100, -100]);

  return (
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
  );
}
