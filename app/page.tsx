import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PromiseSection from "@/components/home/PromiseSection";
import DifferentiatorsSection from "@/components/home/DifferentiatorsSection";
import TribunalEventSection from "@/components/home/TribunalEventSection";
import PartnersSection from "@/components/home/PartnersSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden scroll-smooth">
      <Navbar />
      <Hero />

      <PromiseSection />

      {/* Visual Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

      <DifferentiatorsSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent my-10" />

      <TribunalEventSection />

      <PartnersSection />

      <Footer />
    </main>
  );
}
