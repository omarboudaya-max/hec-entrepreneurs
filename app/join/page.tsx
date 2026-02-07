import Navbar from "@/components/Navbar";
import { Clock } from "lucide-react";

export default function Join() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />

            <div className="z-10 text-center px-4">
                <Clock className="w-20 h-20 text-primary mx-auto mb-8 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-black mb-6 text-wave uppercase tracking-tighter">
                    RECRUTEMENT NOT OPENED YET
                </h1>
                <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
                    Thank you for your interest in <span className="text-white font-bold">HEC Entrepreneurs</span>.
                    The recruitment session is currently closed.
                    <br /><span className="text-secondary font-bold">Please wait for the next recruitment cycle!</span>
                </p>

                <div className="mt-12">
                    <a href="/" className="px-8 py-3 rounded-full glass border border-primary/30 text-white font-bold hover:bg-primary/20 transition-all">
                        Back to Home
                    </a>
                </div>
            </div>
        </main>
    );
}
