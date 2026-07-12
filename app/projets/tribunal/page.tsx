"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRef } from "react";
import { Award, Camera, Gavel, Lightbulb, TrendingUp } from "lucide-react";

export default function TribunalPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    return (
        <main className="min-h-screen bg-[#050505] text-[#ece2d0] overflow-hidden selection:bg-[#d4af37]/30">
            <Navbar />

            {/* Hero Section */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]" />
                </motion.div>

                <div className="container mx-auto px-4 z-10 relative text-center mt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <Gavel className="w-16 h-16 md:w-24 md:h-24 mx-auto text-[#d4af37] mb-8 opacity-80" />
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif uppercase tracking-[0.15em] mb-6 drop-shadow-2xl">
                            Le Grand Tribunal<br />
                            <span className="text-[#d4af37] font-light italic">de l&apos;Entrepreneuriat</span>
                        </h1>
                        <p className="text-[#cbb0a5] text-xl md:text-2xl font-light tracking-[0.3em] uppercase max-w-2xl mx-auto">
                            Le procès qui a bouleversé l&apos;IHEC Carthage
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                    <span className="text-[#d4af37] text-xs tracking-widest uppercase font-serif">Découvrir l&apos;histoire</span>
                    <div className="w-px h-16 bg-gradient-to-b from-[#d4af37] to-transparent animate-pulse" />
                </motion.div>
            </section>

            {/* Origine & But */}
            <section className="py-32 relative">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 text-[#d4af37]">
                                <Lightbulb className="w-8 h-8" />
                                <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-widest">L&apos;Origine de l&apos;Idée</h2>
                            </div>
                            <p className="text-lg leading-relaxed font-light text-justify text-[#cbb0a5]">
                                L&apos;entrepreneuriat est souvent idéalisé. On parle de succès fulgurants, de levées de fonds et d&apos;innovation sans limites. Mais est-ce la seule voie ? Face à ce mythe omniprésent, le Club HEC Entrepreneurs a décidé de faire une pause et de poser la question ultime : et si l&apos;entrepreneuriat n&apos;était pas la panacée ?
                            </p>
                            <p className="text-lg leading-relaxed font-light text-justify text-[#cbb0a5]">
                                De là est née l&apos;idée d&apos;un &quot;Tribunal&quot; : un format théâtral et interactif où l&apos;entrepreneuriat serait littéralement mis en procès, avec des avocats pour la défense, des procureurs pour l&apos;accusation, et un jury prêt à trancher.
                            </p>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="relative aspect-square md:aspect-[4/5] rounded-tl-[100px] rounded-br-[100px] overflow-hidden border border-[#d4af37]/20 p-2"
                        >
                            <div className="w-full h-full rounded-tl-[90px] rounded-br-[90px] overflow-hidden relative bg-[#1a0c07] flex items-center justify-center group">
                                {/* PLACEHOLDER FOR PHOTO */}
                                <Image src="/placeholder-idea.jpg" alt="Photo de l'idée" fill className="object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#d4af37]/50 text-center px-6">
                                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                                    <p className="font-serif italic text-sm">Espace réservé pour la photo de la préparation / réflexion</p>
                                    <p className="text-xs font-mono mt-2 opacity-50">public/placeholder-idea.jpg</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Exécution & Finalité */}
            <section className="py-32 relative bg-[#120805] border-y border-[#d4af37]/10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="space-y-8 flex-1"
                        >
                            <div className="flex items-center gap-4 text-[#d4af37]">
                                <TrendingUp className="w-8 h-8" />
                                <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-widest">L&apos;Exécution & La Finalité</h2>
                            </div>
                            <p className="text-lg leading-relaxed font-light text-justify text-[#cbb0a5]">
                                L&apos;exécution a été un véritable spectacle. La Chapelle historique de l&apos;IHEC Carthage s&apos;est transformée en une cour de justice imposante. Les orateurs, soigneusement préparés, ont livré des plaidoiries vibrantes. L&apos;ambiance était électrique, rythmée par les objections, les témoignages surprises et un public en haleine.
                            </p>
                            <blockquote className="border-l-4 border-[#d4af37] pl-6 italic text-xl text-[#ece2d0] my-8 font-serif">
                                &quot;L&apos;entrepreneuriat n&apos;est pas un conte de fées, c&apos;est une arène. Et aujourd&apos;hui, nous avons regardé la bête dans les yeux.&quot;
                            </blockquote>
                            <p className="text-lg leading-relaxed font-light text-justify text-[#cbb0a5]">
                                La finalité n&apos;était pas de condamner ou d&apos;absoudre l&apos;entrepreneuriat, mais de forcer l&apos;audience à développer un esprit critique. Le verdict final a laissé une empreinte indélébile sur les étudiants, redéfinissant la vision de l&apos;innovation à l&apos;IHEC.
                            </p>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="relative flex-1 w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#d4af37]/20 p-2"
                        >
                            <div className="w-full h-full rounded bg-[#1a0c07] relative flex items-center justify-center group">
                                {/* PLACEHOLDER FOR PHOTO */}
                                <Image src="/placeholder-execution.jpg" alt="Photo de l'exécution" fill className="object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#d4af37]/50 text-center px-6">
                                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                                    <p className="font-serif italic text-sm">Espace réservé pour la photo de l&apos;événement (La Chapelle)</p>
                                    <p className="text-xs font-mono mt-2 opacity-50">public/placeholder-execution.jpg</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Galerie Souvenirs */}
            <section className="py-32 relative">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-widest text-[#d4af37] mb-4">Galerie Souvenirs</h2>
                        <p className="text-[#cbb0a5] font-light tracking-[0.2em] uppercase text-sm">Les moments inoubliables du procès</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative group overflow-hidden rounded-xl bg-[#1a0c07] border border-[#d4af37]/10 aspect-square ${idx === 0 || idx === 3 ? 'md:col-span-2 md:aspect-[2/1]' : ''}`}
                            >
                                {/* PLACEHOLDER FOR GALLERY PHOTOS */}
                                <Image src={`/gallery-tribunal-${item}.jpg`} alt={`Souvenir ${item}`} fill className="object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#d4af37]/40 text-center p-4 bg-black/40 group-hover:bg-transparent transition-colors">
                                    <Camera className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-0 transition-opacity" />
                                    <p className="font-mono text-xs group-hover:opacity-0 transition-opacity">gallery-tribunal-{item}.jpg</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Award Section */}
            <section className="py-32 relative bg-gradient-to-b from-[#050505] to-[#1a0c07] border-t border-[#d4af37]/20">
                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Award className="w-20 h-20 md:w-32 md:h-32 mx-auto text-[#d4af37] mb-8" />
                        <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-widest text-white mb-6">Meilleur Événement 2026</h2>
                        <p className="text-[#cbb0a5] text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-16">
                            Le Grand Tribunal de l&apos;Entrepreneuriat a été couronné &quot;Meilleur Événement de l&apos;année 2026&quot;, une reconnaissance éclatante de l&apos;effort, de l&apos;originalité et de l&apos;impact généré par l&apos;équipe HEC Entrepreneurs.
                        </p>

                        {/* Trophy Image Placeholder */}
                        <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden border-4 border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] group p-2 bg-[#0a0503]">
                            <div className="w-full h-full relative rounded-xl overflow-hidden bg-[#1a0c07] flex items-center justify-center">
                                <Image src="/trophee-tribunal.jpg" alt="Trophée Meilleur Événement" fill className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#d4af37] text-center px-6 pointer-events-none group-hover:opacity-0 transition-opacity duration-500">
                                    <Award className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="font-serif italic text-lg">Photo du Trophée</p>
                                    <p className="text-sm font-mono mt-2 opacity-50">public/trophee-tribunal.jpg</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
