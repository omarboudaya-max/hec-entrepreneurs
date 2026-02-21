"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const promesseRef = useRef(null);
  const differentRef = useRef(null);

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
              "Le Club HEC Entrepreneurs est une plateforme d’action, de formation et d’innovation dédiée aux étudiants qui souhaitent entreprendre, innover et avoir un impact réel sur leur environnement."
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Approche 100 % action", desc: "Nous ne restons pas dans la théorie, nous construisons des projets concrets." },
              { title: "Connexion réelle avec l’écosystème", desc: "Un lien direct avec les entrepreneurs et investisseurs tunisiens." },
              { title: "Leadership & entrepreneuriat responsable", desc: "Former des leaders conscients de leur impact social et environnemental." },
              { title: "Premier club HEC avec un site web", desc: "L'innovation commence par nos propres outils numériques." }
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


      <Footer />
    </main>
  );
}
