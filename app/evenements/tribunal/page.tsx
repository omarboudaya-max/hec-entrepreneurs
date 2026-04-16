"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Lightbulb } from "lucide-react";

export default function TribunalRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    university: "",
    otherUniversityName: "",
    educationLevel: "",
    job: "",
    specialty: "",
  });
  const [userType, setUserType] = useState('etudiant');
  const [otherUniversity, setOtherUniversity] = useState(false);
  const [role, setRole] = useState('defenseur');
  const [isSworn, setIsSworn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let docId = "";

    try {
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        otherUniversityName: formData.otherUniversityName,
        educationLevel: formData.educationLevel,
        job: formData.job,
        specialty: formData.specialty,
        userType,
        role,
        event: "Tribunal de l'Entrepreneuriat 2026",
        source: "tribunal_event"
      };

      // 1. Save to Google Sheets (PRIORITY - most likely to work)
      const sheetsUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL;
      let sheetsSubmitted = false;
      if (sheetsUrl) {
        try {
          await fetch(sheetsUrl, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              ...submissionData,
              action: "create",
              submittedAt: new Date().toLocaleString()
            }),
          });
          sheetsSubmitted = true;
          console.log("Sheets submission attempt finished.");
        } catch (err) {
          console.error("Sheets submission failed:", err);
        }
      }

      // 2. Save to Firebase (Non-blocking fallback)
      try {
        const docRef = await addDoc(collection(db, "participants"), {
          ...submissionData,
          attended: false,
          submittedAt: Timestamp.now()
        });
        docId = docRef.id;
        console.log("Firebase submission successful. ID:", docId);
      } catch (fbErr) {
        console.error("Firebase permission error:", fbErr);
        // We do NOT block the redirection if Sheets was attempted
      }

      // Always redirect to success page
      // Use docId if available, fallback to email encoded
      const identifier = docId || encodeURIComponent(formData.email);
      router.push(`/evenements/tribunal/success?id=${identifier}&email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.firstName)}`);

    } catch (error) {
      console.error("Critical submission error:", error);
      alert("Une erreur est survenue lors de l'envoi. Veuillez vérifier votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center py-20 px-4">
      {/* Faded background image */}
      <div className="absolute inset-0 bg-[url('/event-tribunal.jpg')] bg-cover bg-center bg-no-repeat bg-fixed filter brightness-50 z-0"></div>
      
      {/* Dark tint overlay for text readability and Tribunal theme */}
      <div className="absolute inset-0 bg-[#110704]/80 backdrop-blur-sm z-0"></div>

      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-[rgba(139,0,0,0.05)] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[rgba(218,165,32,0.03)] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Decorative lines */}
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
          href="/" 
          className="inline-flex items-center text-[#d4af37]/70 hover:text-[#d4af37] transition-colors mb-8 text-sm uppercase tracking-widest font-serif"
        >
          ← Retourner à la page d&apos;accueil
        </Link>
        
        <div className="bg-[#1c0804]/90 backdrop-blur-xl border border-[#d4af37]/30 p-6 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-2xl relative isolate">
          {/* Inner gold trim */}
          <div className="absolute inset-2 border border-[#d4af37]/20 pointer-events-none -z-10"></div>
          
          {/* Lightbulb icon background watermark */}
          <div className="absolute -top-10 -right-10 w-64 h-64 text-[#d4af37]/5 -z-20 rotate-12">
            <Lightbulb className="w-full h-full" strokeWidth={1} />
          </div>

          <div className="text-center mb-12 border-b border-[#d4af37]/20 pb-10">
            <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-[0.2em] mb-4 text-[#ece2d0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Audience du <br/><span className="text-[#d4af37] font-bold">Tribunal</span>
            </h1>
            <p className="text-[#cbb0a5] font-serif italic text-lg">
              Les inscriptions sont désormais fermées.
            </p>
          </div>

          {/* Registration closed message */}
          <div className="text-center space-y-6 py-4 mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#110704] border-2 border-[#8b0000] mb-4 shadow-[0_0_30px_rgba(139,0,0,0.3)]">
              <svg className="w-10 h-10 text-[#ff6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-serif uppercase tracking-widest text-[#d4af37]">
              Capacité Maximale Atteinte
            </h2>
            
            <p className="text-[#ece2d0] text-lg font-serif leading-relaxed max-w-2xl mx-auto">
              Nous vous remercions pour l&apos;intérêt que vous portez au Tribunal de l&apos;Entrepreneuriat ! Les inscriptions sont malheureusement fermées car la capacité maximale a été atteinte.
            </p>
            
            <div className="bg-[rgba(212,175,55,0.05)] border border-[#d4af37]/20 p-6 rounded-xl mt-8">
              <p className="text-[#cbb0a5] font-serif flex items-start gap-4 text-left">
                <Lightbulb className="w-8 h-8 text-[#d4af37] flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-[#d4af37] block mb-2 text-lg">Tout le monde est le bienvenu !</strong>
                  Vous pouvez quand même venir profiter de l&apos;ambiance en extérieur et découvrir l&apos;événement. Cependant, veuillez noter que <strong>seuls les participants inscrits</strong> pourront accéder à l&apos;intérieur de la salle d&apos;audience.
                </span>
              </p>
            </div>
            
            <div className="pt-8 relative z-10 flex flex-col items-center gap-6">
              <Link href="/evenements/tribunal/vote">
                <button type="button" className="w-full sm:w-auto py-5 px-10 text-base font-serif tracking-[0.2em] uppercase transition-all duration-300 border border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-[#3d160b] text-[#d4af37] hover:bg-[#521d0e] hover:text-white hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transform hover:-translate-y-1">
                  Participer au Vote du Public
                </button>
              </Link>
              
              <Link href="/">
                <button type="button" className="py-4 px-8 text-sm font-serif tracking-[0.2em] uppercase transition-all duration-300 border border-[#d4af37]/30 bg-transparent text-[#9c8278] hover:bg-[#110704] hover:text-[#d4af37] hover:border-[#d4af37]/50">
                  Retourner à l&apos;accueil
                </button>
              </Link>
            </div>
          </div>

          <form className="space-y-6 hidden" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 group">
                <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Prénom du plaignant</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required 
                  className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif"
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Nom de famille</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required 
                  className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Courrier électronique (Email)</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required 
                className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif"
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Numéro de téléphone</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required 
                className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            {/* Switch Étudiant / Entrepreneur */}
            <div className="space-y-4 pt-2">
              <label className="text-sm uppercase tracking-widest text-[#9c8278] font-serif">Vous êtes :</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setUserType('etudiant')} className={`flex-1 py-3 border-2 transition-all font-serif shadow-lg ${userType === 'etudiant' ? 'bg-[#3d160b] border-[#d4af37] text-[#d4af37]' : 'bg-[#110704] border-[#5c2312] text-[#9c8278] hover:border-[#8c3d26]'}`}>Étudiant</button>
                <button type="button" onClick={() => setUserType('pro')} className={`flex-1 py-3 border-2 transition-all font-serif shadow-lg ${userType === 'pro' ? 'bg-[#3d160b] border-[#d4af37] text-[#d4af37]' : 'bg-[#110704] border-[#5c2312] text-[#9c8278] hover:border-[#8c3d26]'}`}>Entrepreneur / Prof</button>
              </div>
            </div>

            <motion.div
              key={userType}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden space-y-6"
            >
              {userType === 'etudiant' && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2 group">
                    <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Université</label>
                    <select 
                      required
                      name="university"
                      value={formData.university}
                      onChange={(e) => {
                        handleInputChange(e);
                        setOtherUniversity(e.target.value === 'autre');
                      }}
                      className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif appearance-none"
                    >
                      <option value="">Sélectionnez votre université</option>
                      <option value="ihec">IHEC Carthage</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  
                  {otherUniversity && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 group">
                      <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Précisez l&apos;université</label>
                      <input 
                        type="text" 
                        name="otherUniversityName"
                        value={formData.otherUniversityName}
                        onChange={handleInputChange}
                        required 
                        className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif" 
                        placeholder="Nom de l'université" 
                      />
                    </motion.div>
                  )}

                  <div className="space-y-2 group">
                    <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Niveau d&apos;étude</label>
                    <input 
                      type="text" 
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      required 
                      className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif" 
                      placeholder="Ex : Master 1 Entrepreneuriat" 
                    />
                  </div>
                </div>
              )}

              {userType === 'pro' && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2 group">
                    <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Métier</label>
                    <input 
                      type="text" 
                      name="job"
                      value={formData.job}
                      onChange={handleInputChange}
                      required 
                      className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif" 
                      placeholder="Votre métier" 
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm uppercase tracking-widest text-[#9c8278] group-focus-within:text-[#d4af37] transition-colors font-serif">Spécialité</label>
                    <input 
                      type="text" 
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      required 
                      className="w-full bg-[#110704] border-2 border-[#5c2312] focus:border-[#d4af37] px-5 py-4 text-[#ece2d0] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-serif" 
                      placeholder="Votre spécialité" 
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Switch Role lors du procès */}
            <div className="space-y-4 pt-6 border-t border-[#d4af37]/20 mt-6">
              <label className="text-sm uppercase tracking-widest text-[#9c8278] font-serif">Choisissez un camp lors du procès (vous n'etes pas obligé de participer au débat) :</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setRole('defenseur')} className={`flex-1 py-4 border-2 transition-all font-serif shadow-lg ${role === 'defenseur' ? 'bg-[rgba(218,165,32,0.15)] border-[#d4af37] text-[#d4af37]' : 'bg-[#110704] border-[#5c2312] text-[#9c8278] hover:border-[#8c3d26]'}`}>
                  <span className="block text-lg">Défenseur</span>
                  <span className="block text-xs mt-1 opacity-70">de l&apos;entrepreneuriat</span>
                </button>
                <button type="button" onClick={() => setRole('accusateur')} className={`flex-1 py-4 border-2 transition-all font-serif shadow-lg ${role === 'accusateur' ? 'bg-[rgba(139,0,0,0.2)] border-[#8b0000] text-[#ff6b6b]' : 'bg-[#110704] border-[#5c2312] text-[#9c8278] hover:border-[#8c3d26]'}`}>
                  <span className="block text-lg">Accusateur</span>
                  <span className="block text-xs mt-1 opacity-70">contre les mythes de l&apos;entrepreneuriat</span>
                </button>
              </div>
            </div>

            <div className="pt-10">
              {/* Checkbox for oath - moved ABOVE the button */}
              <div className="flex items-start gap-4 mb-8 border-t border-[#d4af37]/10 pt-8 group cursor-pointer" onClick={() => setIsSworn(!isSworn)}>
                <div className={`mt-1 flex-shrink-0 w-6 h-6 border-2 transition-all flex items-center justify-center ${isSworn ? 'bg-[#d4af37] border-[#d4af37]' : 'border-[#5c2312] group-hover:border-[#d4af37]/50'}`}>
                  {isSworn && <svg className="w-4 h-4 text-[#1c0804]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <p className={`text-sm md:text-base font-serif italic transition-colors leading-relaxed ${isSworn ? 'text-[#ece2d0]' : 'text-[#9c8278] group-hover:text-[#ece2d0]/70'}`}>
                  Je jure solennellement de me présenter au tribunal lors de l&apos;audience du jury le 17 Avril 2026.
                </p>
              </div>

              <motion.button 
                whileHover={(!isSubmitting && isSworn) ? { scale: 1.02 } : {}}
                whileTap={(!isSubmitting && isSworn) ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isSubmitting || !isSworn}
                className={`w-full py-6 text-lg font-serif tracking-[0.2em] uppercase transition-all duration-300 border border-[#d4af37]/50 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(212,175,55,0.3)] relative overflow-hidden group shadow-lg ${isSubmitting || !isSworn ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed grayscale' : 'bg-[#3d160b] text-[#d4af37] hover:bg-[#521d0e] hover:text-white'}`}
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {isSubmitting ? "Envoi en cours..." : "Frappez le marteau (Soumettre)"}
                  {!isSubmitting && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.59,2.54C5.14,2.5 4.67,2.65 4.29,2.92C3.12,3.77 2,5 2.11,6.54C2.26,8.22 3.65,9.58 5.3,9.73C6.7,9.85 8,8.8 8.44,7.56L14,13.12V18L16,20L18,18V13.12L20.65,10.47C21.43,9.69 21.43,8.42 20.65,7.64C19.87,6.86 18.6,6.86 17.82,7.64L15.17,10.29L9.61,4.73C9.03,3.74 8.03,3 6.81,2.69C6.41,2.58 6,2.53 5.59,2.54M5.44,4.54C5.66,4.53 5.89,4.56 6.1,4.64C6.67,4.86 7.15,5.32 7.46,5.88L14,12.41V16.59L16,18.59L18,16.59V12.41L19.24,11.17L20.17,10.24L18.3,8.37L16.41,10.24L15.17,11.41C15.17,11.41 8.86,5.1 8.86,5.1C8.75,4.92 8.6,4.77 8.44,4.77C7.81,4.11 6.94,3.95 6.16,4.14C5.85,4.21 5.55,4.35 5.3,4.54L5.44,4.54Z" />
                    </svg>
                  )}
                </span>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
