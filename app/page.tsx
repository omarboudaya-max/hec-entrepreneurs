import Navbar from "@/components/Navbar";
import AiAssistant from "@/components/AiAssistant";
import Hero from "@/components/Hero";
import JourneyTracks from "@/components/JourneyTracks";
import HallOfFame from "@/components/HallOfFame";

export const metadata = {
  title: "HEC Entrepreneurs | Build the Possible",
  description: "The premier entrepreneurship club at IHEC Carthage. Ideate, Build, Scale.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden scroll-smooth">
      <Navbar />
      <Hero />

      {/* Visual Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

      <JourneyTracks />

      {/* Visual Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent my-10" />

      <HallOfFame />
      <AiAssistant />
    </main>
  );
}
