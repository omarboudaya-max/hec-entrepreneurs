import Navbar from "@/components/Navbar";
import { Clock } from "lucide-react";

export default function Join() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
            <Navbar />

            {/* Tech Moving Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="tech-dynamic-bg opacity-40 mix-blend-overlay" />
                <div className="tech-bg-overlay opacity-80" />
            </div>

            <div className="z-10 text-center px-4">
                <Clock className="w-20 h-20 text-zinc-400 mx-auto mb-8 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-black mb-6 text-wave uppercase tracking-tighter italic">
                    RECRUTEMENT NOT OPENED YET
                </h1>
                <p className="text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed font-medium">
                    Thank you for your interest in <span className="text-zinc-900 font-black italic">HEC Entrepreneurs</span>.
                    The recruitment session is currently closed.
                    <br /><span className="text-zinc-800 font-black italic">Please wait for the next recruitment cycle!</span>
                </p>

                <div className="mt-12">
                    <a href="/" className="px-10 py-4 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-200 block sm:inline-block">
                        Back to Home
                    </a>
                </div>
            </div>
        </main>
    );
}
