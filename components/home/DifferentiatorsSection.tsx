"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const DIFFERENTIATORS = [
  { title: "Approche 100 % action", desc: "Nous ne restons pas dans la théorie, nous construisons des projets concrets." },
  { title: "Connexion réelle avec l’écosystème", desc: "Un lien direct avec les entrepreneurs et investisseurs tunisiens." },
  { title: "Leadership & entrepreneuriat responsable", desc: "Former des leaders conscients de leur impact social et environnemental." }
];

export default function DifferentiatorsSection() {
  const differentRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress: differentScroll } = useScroll({
    target: differentRef,
    offset: ["start end", "end start"]
  });
  const differentY = useTransform(differentScroll, [0, 1], [50, -50]);

  return (
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
          {DIFFERENTIATORS.map((item, idx) => (
            <motion.div
              key={idx}
              style={{ y: shouldReduceMotion ? 0 : (idx % 2 === 0 ? differentY : 0) }}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: shouldReduceMotion ? 0 : idx * 0.1,
                duration: 0.8,
                type: "spring"
              }}
              whileHover={{ y: shouldReduceMotion ? 0 : -10, transition: { duration: 0.2 } }}
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
  );
}
