-- =========================================================
-- PORTAIL HEC ENTREPRENEURS - TABLE TRÉSORERIE & COTISATIONS
-- Accès strictement réservé au Trésorier et au Développeur
-- =========================================================

CREATE TABLE IF NOT EXISTS public.club_treasury (
  user_id UUID REFERENCES public.club_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  payment_status TEXT NOT NULL DEFAULT 'non_paye' CHECK (payment_status IN ('non_paye', 'partiel', 'paye')),
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  total_due NUMERIC NOT NULL DEFAULT 50,
  remaining_amount NUMERIC NOT NULL DEFAULT 50,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  last_reminder_at TIMESTAMP WITH TIME ZONE,
  updated_by TEXT,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.club_treasury ENABLE ROW LEVEL SECURITY;

-- Seuls le Trésorier et le Développeur peuvent voir ou modifier la table club_treasury
DROP POLICY IF EXISTS "Only Treasurer and Dev can access treasury" ON public.club_treasury;
CREATE POLICY "Only Treasurer and Dev can access treasury"
  ON public.club_treasury
  FOR ALL
  TO authenticated
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.club_profiles
      WHERE id = auth.uid()
      AND (
        role = 'developpeur'
        OR lower(email) IN ('omarboudaya1@gmail.com', 'kamounmelek40@gmail.com', 'hammemimohamed597@gmail.com')
        OR lower(poste) LIKE '%trésorier%'
        OR lower(poste) LIKE '%tresorier%'
      )
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.club_profiles
      WHERE id = auth.uid()
      AND (
        role = 'developpeur'
        OR lower(email) IN ('omarboudaya1@gmail.com', 'kamounmelek40@gmail.com', 'hammemimohamed597@gmail.com')
        OR lower(poste) LIKE '%trésorier%'
        OR lower(poste) LIKE '%tresorier%'
      )
    )
  );
