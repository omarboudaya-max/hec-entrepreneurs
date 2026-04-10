"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Shield, CheckCircle, XCircle, Camera, LogOut, Users, Zap } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0 }); // Future: Real stats from Firestore
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth") === "true";
    if (!isAuth) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize Scanner with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        if (!scannerRef.current && document.getElementById("reader")) {
          scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );

          scannerRef.current.render(onScanSuccess, (err) => {
            // Ignore scan failures
          });
        }
      } catch (e) {
        console.error("Scanner initialization failed", e);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const onScanSuccess = async (decodedText: string) => {
    if (!isScanning) return;
    setIsScanning(false); // Pause scanning
    setScanResult({ success: true, message: "Identification en cours...", data: null });

    try {
      // 1. Fetch from Firestore
      const docRef = doc(db, "participants", decodedText);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const attendeeData = docSnap.data();
        
        if (attendeeData.attended) {
            setScanResult({ 
                success: false, 
                message: `${attendeeData.firstName} ${attendeeData.lastName} est déjà marqué présent !`,
                data: attendeeData 
            });
        } else {
            // 2. Mark as Present in Firebase
            await updateDoc(docRef, { 
                attended: true, 
                attendedAt: serverTimestamp() 
            });

            // 3. Mark as Present in Google Sheets
            const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL;
            console.log("Tentative de mise à jour Sheets...", { email: attendeeData.email, url: sheetsUrl ? "Configurée" : "Manquante" });
            
            if (sheetsUrl) {
                try {
                    // On envoie en POST mais on s'assure que le contenu est propre
                    const payload = {
                        action: "checkin",
                        email: attendeeData.email,
                        firstName: attendeeData.firstName,
                        lastName: attendeeData.lastName || ""
                    };
                    
                    await fetch(sheetsUrl, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify(payload)
                    });
                    console.log("Requête Sheets envoyée avec succès (no-cors).");
                } catch (e) {
                    console.error("Échec de la synchronisation Sheets :", e);
                }
            }

            setScanResult({ 
                success: true, 
                message: `Bienvenue, ${attendeeData.firstName} ${attendeeData.lastName} ! Présence enregistrée.`,
                data: attendeeData 
            });
        }
      } else {
        setScanResult({ success: false, message: "Code invalide. Participant non trouvé dans la base." });
      }
    } catch (error) {
      console.error("Scan processing error:", error);
      setScanResult({ success: false, message: "Erreur technique lors de la vérification." });
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-[#050100] text-[#ece2d0] font-serif">
      {/* Header */}
      <nav className="border-b border-[#d4af37]/20 bg-[#1c0804]/80 backdrop-blur-md px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Shield className="text-[#d4af37] w-5 h-5 sm:w-6 sm:h-6" />
          <h1 className="uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-sm md:text-base font-bold truncate">Tribunal Control Center</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 text-[#9c8278] hover:text-[#ff6b6b] transition-colors text-[10px] sm:text-xs uppercase tracking-widest"
        >
          <LogOut size={14} className="sm:w-4 sm:h-4" /> <span>Quitter</span>
        </button>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1c0804] border border-[#d4af37]/10 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="text-[#d4af37]" />
                </div>
                <div>
                    <p className="text-[#9c8278] text-[10px] uppercase tracking-widest">Base de données</p>
                    <p className="text-sm font-bold text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Connecté
                    </p>
                </div>
            </div>
            <div className="bg-[#1c0804] border border-[#d4af37]/10 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="text-green-500" />
                </div>
                <div>
                    <p className="text-[#9c8278] text-[10px] uppercase tracking-widest">Status Scanner</p>
                    <p className="text-sm font-bold text-yellow-500">Prêt à scanner</p>
                </div>
            </div>
        </div>

        {/* Permission Alert - Hidden if OK */}
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
          <Shield size={20} className="text-orange-500 flex-shrink-0" />
          <p className="text-xs text-[#ece2d0]/80 italic">
            <strong>Info Tribunal :</strong> Assurez-vous d&apos;avoir autorisé l&apos;accès à la caméra. Si les données ne s&apos;affichent pas, vérifiez les permissions Firestore dans votre console.
          </p>
        </div>

        {/* Scanner Area */}
        <div className="relative">
          <div className="bg-[#1c0804] border-2 border-[#5c2312] rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#5c2312] px-6 py-3 flex items-center gap-2">
              <Camera size={18} className="text-[#d4af37]" />
              <span className="uppercase tracking-widest text-xs text-[#ece2d0]">Scanner d&apos;audience</span>
            </div>
            
            <div className="p-2 sm:p-4 md:p-8 min-h-[300px] flex items-center justify-center bg-black">
                <div id="reader" className="w-full overflow-hidden rounded-lg border border-[#d4af37]/20">
                    {/* Html5Qrcode will inject content here */}
                </div>
            </div>
          </div>

          {/* Result Overlay */}
          <AnimatePresence>
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute inset-0 z-20 flex items-center justify-center p-4 rounded-2xl backdrop-blur-md ${scanResult.success ? 'bg-green-900/40' : 'bg-red-900/40'}`}
              >
                <div className="bg-[#1c0804] border-2 border-[#d4af37] p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                  <div className="flex justify-center mb-6">
                    {scanResult.success ? (
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 animate-pulse">
                        <CheckCircle className="text-green-500 w-12 h-12" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">
                        <XCircle className="text-red-500 w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold uppercase tracking-widest mb-4 ${scanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {scanResult.success ? 'Verdict : Autorisé' : 'Verdict : Refusé'}
                  </h3>
                  
                  <p className="text-[#ece2d0] mb-8 font-light italic">
                    {scanResult.message}
                  </p>

                  <button 
                    onClick={resetScanner}
                    className="w-full py-4 bg-[#d4af37] text-[#1c0804] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-lg"
                  >
                    Suivant (Reprendre le scan)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-[#9c8278] text-center text-xs italic opacity-50 uppercase tracking-widest">
            Tous droits réservés © Bureau HEC Entrepreneurs 2026
        </p>
      </div>

      <style jsx global>{`
        #reader { border: none !important; }
        #reader__status_span { display: none !important; }
        #reader__camera_selection { 
          background: #110704; 
          border: 1px solid #5c2312; 
          color: #d4af37; 
          padding: 8px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        #reader__dashboard_section_csr button {
          background: #3d160b !important;
          color: #d4af37 !important;
          border: 1px solid #d4af37 !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          text-transform: uppercase !important;
          font-family: serif !important;
          letter-spacing: 0.1em !important;
          cursor: pointer !important;
        }
        #reader img { width: 40px !important; margin: 0 auto 10px !important; }
      `}</style>
    </main>
  );
}
