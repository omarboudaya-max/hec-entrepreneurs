-- =========================================================
-- HEC DOCTORIALES - ATELIER IA ET PRISE DE DÉCISIONS
-- TABLE SUPABASE : doctoriales_registrations
-- =========================================================

CREATE TABLE IF NOT EXISTS public.doctoriales_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  status_custom TEXT,
  education_level TEXT NOT NULL,
  education_level_custom TEXT,
  specialty TEXT NOT NULL,
  specialty_custom TEXT,
  has_laptop_and_charger TEXT NOT NULL,
  can_attend_full_session TEXT NOT NULL,
  preferred_language TEXT NOT NULL,
  confirmed_prerequisites BOOLEAN DEFAULT true,
  qr_code_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_doctoriales_email ON public.doctoriales_registrations(email);
CREATE INDEX IF NOT EXISTS idx_doctoriales_created_at ON public.doctoriales_registrations(created_at DESC);

-- Sécurité Row Level Security (RLS)
ALTER TABLE public.doctoriales_registrations ENABLE ROW LEVEL SECURITY;

-- Autoriser tout le monde (invités / étudiants) à soumettre le formulaire d'inscription
DROP POLICY IF EXISTS "Public can submit doctoriales registration" ON public.doctoriales_registrations;
CREATE POLICY "Public can submit doctoriales registration" 
  ON public.doctoriales_registrations 
  FOR INSERT 
  WITH CHECK (true);

-- Seuls les administrateurs authentifiés peuvent lire toutes les inscriptions
DROP POLICY IF EXISTS "Admins can view doctoriales registrations" ON public.doctoriales_registrations;
CREATE POLICY "Admins can view doctoriales registrations" 
  ON public.doctoriales_registrations 
  FOR SELECT 
  USING (
    auth.role() = 'service_role' OR 
    EXISTS (SELECT 1 FROM public.club_profiles WHERE id = auth.uid() AND role IN ('bureau', 'developpeur', 'responsable'))
  );
