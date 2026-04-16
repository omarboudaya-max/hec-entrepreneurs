"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb, CheckCircle2 } from "lucide-react";

export default function TribunalVote() {
  const router = useRouter();
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const voteStatus = localStorage.getItem("tribunalVoteStatus");
    if (voteStatus) {
      setHasVoted(true);
    }
  }, []);

  const handleVote = async (voteOption: "yes" | "no") => {
    if (hasVoted) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const sheetsUrl = process.env.NEXT_PUBLIC_VOTE_SHEETS_SCRIPT_URL; // You need to set this in your .env
      
      const payload = {
        vote: voteOption,
        votedAt: new Date().toLocaleString(),
        action: "vote"
      };

      if (sheetsUrl) {
        await fetch(sheetsUrl, {
          method: "POST",
          mode: "no-cors",
          cache: "no-cache",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
        });
      } else {
        console.warn("NEXT_PUBLIC_VOTE_SHEETS_SCRIPT_URL is not defined. Simulating vote...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      localStorage.setItem("tribunalVoteStatus", "true");
      setHasVoted(true);
    } catch (err) {
      console.error("Vote failed:", err);
      setError("Une erreur est survenue lors du vote. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center py-20 px-4">
      {/* Background styling matching the Tribunal theme */}
      <div className="absolute inset-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat bg-fixed filter brightness-50 z-0"></div>
      <div className="absolute inset-0 bg-[#110704]/80 backdrop-blur-sm z-0"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-[rgba(139,0,0,0.05)] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[rgba(218,165,32,0.03)] blur-[120px] rounded-full pointer-events-none" />
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-center opacity-30 z-0">
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-[#5c2312] to-transparent mx-12"></div>
        <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-[#d4af37]/30 to-transparent mx-12"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Link 
          href="/evenements/tribunal" 
          className="inline-flex items-center text-[#d4af37]/70 hover:text-[#d4af37] transition-colors mb-8 text-sm uppercase tracking-widest font-serif"
        >
          ← Retourner au Tribunal
        </Link>
        
        <div className="bg-[#1c0804]/90 backdrop-blur-xl border border-[#d4af37]/30 p-6 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-2xl relative isolate">
          <div className="absolute inset-2 border border-[#d4af37]/20 pointer-events-none -z-10"></div>
          
          <div className="absolute -top-10 -right-10 w-64 h-64 text-[#d4af37]/5 -z-20 rotate-12">
            <Lightbulb className="w-full h-full" strokeWidth={1} />
          </div>

          <div className="text-center mb-12 border-b border-[#d4af37]/20 pb-10">
            <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.2em] mb-4 text-[#ece2d0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Le Vote du <br/><span className="text-[#d4af37] font-bold">Public</span>
            </h1>
            <p className="text-[#cbb0a5] font-serif italic text-lg mt-4">
              Votre voix compte dans ce procès.
            </p>
          </div>

          <div className="text-center space-y-8 py-4">
            {hasVoted ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="flex flex-col items-center justify-center space-y-6"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#110704] border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <CheckCircle2 className="w-12 h-12 text-[#d4af37]" />
                </div>
                <h2 className="text-2xl font-serif uppercase tracking-widest text-[#ece2d0]">
                  Merci pour votre vote !
                </h2>
                <p className="text-[#cbb0a5] text-lg font-serif">
                  Le verdict final sera bientôt dévoilé.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="bg-[rgba(212,175,55,0.05)] border border-[#d4af37]/20 p-8 rounded-xl shadow-inner">
                  <h2 className="text-2xl md:text-3xl font-serif text-[#ece2d0] leading-relaxed">
                    L&apos;entrepreneuriat doit-il aller en prison ?
                  </h2>
                </div>

                {error && (
                  <p className="text-[#ff6b6b] font-serif text-sm bg-[#8b0000]/10 p-4 border border-[#8b0000]/30 rounded">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <button
                    onClick={() => handleVote("yes")}
                    disabled={isSubmitting}
                    className="group relative overflow-hidden py-8 px-6 border-2 border-[#8b0000] bg-[#110704] transition-all hover:bg-[rgba(139,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <span className="text-3xl">⛓️</span>
                      <span className="text-xl font-serif uppercase tracking-widest text-[#ff6b6b] group-hover:text-white transition-colors">
                        Oui
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleVote("no")}
                    disabled={isSubmitting}
                    className="group relative overflow-hidden py-8 px-6 border-2 border-[#d4af37] bg-[#110704] transition-all hover:bg-[rgba(218,165,32,0.15)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <span className="text-3xl">🕊️</span>
                      <span className="text-xl font-serif uppercase tracking-widest text-[#d4af37] group-hover:text-white transition-colors">
                        Non
                      </span>
                    </div>
                  </button>
                </div>
              </>
            )}

            <div className="pt-12">
              <Link href="/">
                <button type="button" className="py-4 px-8 text-sm font-serif tracking-[0.2em] uppercase transition-all duration-300 border border-[#d4af37]/30 bg-transparent text-[#9c8278] hover:bg-[#110704] hover:text-[#d4af37] hover:border-[#d4af37]/50">
                  Retourner à l&apos;accueil
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
