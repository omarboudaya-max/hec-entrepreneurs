"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Lightbulb, Download, QrCode } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Suspense, useRef } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "N/A";
  const name = searchParams.get("name") || "Candidat";
  const email = searchParams.get("email") || "";
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-pass") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Pass-Tribunal-${name}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex justify-center mb-8"
      >
        <Lightbulb className="w-24 h-24 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" strokeWidth={1.5} />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-[0.2em] mb-6 text-[#ece2d0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        La Cour a reçu votre <br/><span className="text-[#d4af37] font-bold">Plaidoyer</span>
      </h1>

      <div className="w-24 h-1 bg-[#d4af37]/50 mx-auto my-8"></div>

      <div className="flex flex-col items-center gap-6 sm:gap-10 mb-10 text-center sm:text-left bg-black/40 p-6 sm:p-8 border border-[#d4af37]/20 rounded-xl">
        <div className="flex-shrink-0 bg-white p-3 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <QRCodeCanvas 
            id="qr-pass"
            value={id} 
            size={180}
            level={"H"}
            includeMargin={true}
          />
        </div>
        <div className="space-y-4 font-serif w-full">
          <h3 className="text-[#d4af37] text-xl sm:text-2xl uppercase tracking-widest font-bold">VOTRE PASS OFFICIEL</h3>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Défendeur : <span className="text-white">{name}</span><br/>
            ID Audience : <span className="text-[#d4af37] font-mono text-xs sm:text-sm">{id}</span>
          </p>
          <button 
            onClick={downloadQR}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#d4af37] text-[#1c0804] rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-white transition-all shadow-lg"
          >
            <Download size={18} /> Télécharger mon pass
          </button>
        </div>
      </div>

      <p className="text-[#cbb0a5] font-serif text-lg leading-relaxed mb-10 text-justify italic border-l-2 border-[#d4af37]/30 pl-6">
        Ce QR Code est votre laissez-passer. Présentez-le à l&apos;entrée de la Chapelle de l&apos;IHEC Carthage le <strong>17 Avril 2026</strong> à 14h00 pour confirmer votre présence.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-4 bg-[#3d160b] text-[#d4af37] text-sm md:text-base font-serif tracking-[0.2em] uppercase hover:bg-[#521d0e] hover:text-white transition-all duration-300 border border-[#d4af37]/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden group shadow-[#000]"
            >
              Accueil
          </motion.button>
        </Link>
      </div>
    </>
  );
}

export default function TribunalSuccess() {
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center py-20 px-4">
      {/* Background with the faded poster visual */}
      <div className="absolute inset-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat bg-fixed filter brightness-[0.25] z-0"></div>
      
      {/* Dark tint overlay for Tribunal ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#110704]/80 to-[#050100]/95 backdrop-blur-[2px] z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10 text-center"
      >
        <div className="bg-[#1c0804]/80 backdrop-blur-md border-[4px] border-[#38160d] p-10 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,1),inset_0_0_40px_rgba(0,0,0,0.8)] relative isolate">
          {/* Inner gold trim */}
          <div className="absolute inset-2 border border-[#d4af37]/20 pointer-events-none -z-10"></div>
          
          <Suspense fallback={<div className="text-[#d4af37] font-serif animate-pulse">Chargement du verdict...</div>}>
            <SuccessContent />
          </Suspense>
        </div>
      </motion.div>
    </main>
  );
}
