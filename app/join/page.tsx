import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock } from "lucide-react";

export default function Join() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />

            <div className="z-10 text-center px-4 py-32">
                <Clock className="w-20 h-20 text-primary mx-auto mb-8 animate-pulse" />
                <h1 className="text-3xl md:text-5xl font-thin mb-6 text-wave uppercase tracking-[0.2em]">
                    RECRUTEMENT PAS ENCORE OUVERT
                </h1>
                <p className="text-lg font-light text-gray-400 max-w-lg mx-auto leading-relaxed">
                    Merci pour votre intérêt pour <span className="text-white font-medium uppercase tracking-widest">HEC Entrepreneurs</span>.
                    La session de recrutement est actuellement fermée.
                    <br /><span className="text-secondary font-medium uppercase tracking-widest opacity-80 mt-4 block">Veuillez attendre le prochain cycle de recrutement !</span>
                </p>

                <div className="mt-12">
                    <a href="/" className="px-8 py-3 rounded-full glass border border-primary/30 text-white font-bold hover:bg-primary/20 transition-all">
                        Retour à l'Accueil
                    </a>
                </div>
            </div>
            <Footer />
        </main>
    );
}
