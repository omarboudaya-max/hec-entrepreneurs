-- =========================================================
-- PORTAIL HEC ENTREPRENEURS - SUPABASE DATABASE SCHEMA
-- =========================================================

-- 1. Club Profiles Table
CREATE TABLE IF NOT EXISTS public.club_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('membre', 'responsable', 'bureau', 'developpeur')),
  poste TEXT DEFAULT 'Membre',
  avatar_url TEXT,
  bio TEXT,
  career TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.club_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view all club profiles (directory / author badges)
DROP POLICY IF EXISTS "Authenticated users can view club profiles" ON public.club_profiles;
CREATE POLICY "Authenticated users can view club profiles" 
  ON public.club_profiles FOR SELECT 
  TO authenticated 
  USING (true);

-- Users can update their own personal info (avatar, bio, career, phone, full_name)
DROP POLICY IF EXISTS "Users can update their own personal profile" ON public.club_profiles;
CREATE POLICY "Users can update their own personal profile" 
  ON public.club_profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role bypasses all RLS (used by Admin API to create/update roles and postes)


-- 2. Announcements Table (Fil d'Actualités)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  link_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- All authenticated members can view announcements
DROP POLICY IF EXISTS "Authenticated members can view announcements" ON public.announcements;
CREATE POLICY "Authenticated members can view announcements" 
  ON public.announcements FOR SELECT 
  TO authenticated 
  USING (true);

-- Only bureau & developpeur can insert announcements
DROP POLICY IF EXISTS "Bureau and dev can insert announcements" ON public.announcements;
CREATE POLICY "Bureau and dev can insert announcements" 
  ON public.announcements FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  );

-- Only author or developpeur can delete announcements
DROP POLICY IF EXISTS "Author or dev can delete announcements" ON public.announcements;
CREATE POLICY "Author or dev can delete announcements" 
  ON public.announcements FOR DELETE 
  TO authenticated 
  USING (
    author_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role = 'developpeur'
    )
  );


-- 3. Announcement Likes
CREATE TABLE IF NOT EXISTS public.announcement_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(announcement_id, user_id)
);

ALTER TABLE public.announcement_likes ENABLE ROW LEVEL SECURITY;

-- All members can view likes
DROP POLICY IF EXISTS "Authenticated users can view likes" ON public.announcement_likes;
CREATE POLICY "Authenticated users can view likes" 
  ON public.announcement_likes FOR SELECT 
  TO authenticated 
  USING (true);

-- Members can like
DROP POLICY IF EXISTS "Authenticated users can like announcements" ON public.announcement_likes;
CREATE POLICY "Authenticated users can like announcements" 
  ON public.announcement_likes FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Members can unlike their own like
DROP POLICY IF EXISTS "Users can remove their own like" ON public.announcement_likes;
CREATE POLICY "Users can remove their own like" 
  ON public.announcement_likes FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);


-- 4. Announcement Comments
CREATE TABLE IF NOT EXISTS public.announcement_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcement_comments ENABLE ROW LEVEL SECURITY;

-- All authenticated members can view comments
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.announcement_comments;
CREATE POLICY "Authenticated users can view comments" 
  ON public.announcement_comments FOR SELECT 
  TO authenticated 
  USING (true);

-- Authenticated members can insert comments
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.announcement_comments;
CREATE POLICY "Authenticated users can comment" 
  ON public.announcement_comments FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments (or developpeur)
DROP POLICY IF EXISTS "Users or dev can delete comments" ON public.announcement_comments;
CREATE POLICY "Users or dev can delete comments" 
  ON public.announcement_comments FOR DELETE 
  TO authenticated 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role = 'developpeur'
    )
  );


-- 5. Official Documents Table
CREATE TABLE IF NOT EXISTS public.club_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_key TEXT NOT NULL UNIQUE, -- 'reglement', 'protocole', 'book'
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.club_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view club documents" ON public.club_documents;
CREATE POLICY "Authenticated users can view club documents" 
  ON public.club_documents FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Bureau and dev can manage documents" ON public.club_documents;
CREATE POLICY "Bureau and dev can manage documents" 
  ON public.club_documents FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  );

-- Seed initial document placeholders if not exists
INSERT INTO public.club_documents (doc_key, title, file_url, description)
VALUES 
  ('reglement', 'Règlement Intérieur du Club', '', 'Règlement officiel et obligations des membres du club HEC Entrepreneurs.'),
  ('protocole', 'Protocole Officiel du Club', '', 'Directives, organisation des événements et protocole interne.'),
  ('book', 'Book de Bienvenue', '', 'Guide d''intégration et carnet de bord pour les nouveaux membres.')
ON CONFLICT (doc_key) DO NOTHING;


-- 6. Storage Buckets for Portal Media & Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('portail-media', 'portail-media', true),
  ('portail-documents', 'portail-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for portal media & documents
DROP POLICY IF EXISTS "Public Read Portal Media" ON storage.objects;
CREATE POLICY "Public Read Portal Media" 
  ON storage.objects FOR SELECT 
  USING (bucket_id IN ('portail-media', 'portail-documents'));

-- Authenticated upload for portal media
DROP POLICY IF EXISTS "Authenticated Upload Portal Media" ON storage.objects;
CREATE POLICY "Authenticated Upload Portal Media" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id IN ('portail-media', 'portail-documents'));


-- 7. Trigger to automatically assign 'developpeur' role to omarboudaya1@gmail.com
CREATE OR REPLACE FUNCTION public.handle_club_user_role() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'omarboudaya1@gmail.com' THEN
    NEW.role := 'developpeur';
    NEW.poste := 'Lead Développeur';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_club_profile_insert ON public.club_profiles;
CREATE TRIGGER on_club_profile_insert
  BEFORE INSERT OR UPDATE ON public.club_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_club_user_role();


-- 8. Candidatures Recrutement 2026/2027 Table
CREATE TABLE IF NOT EXISTS public.candidatures_recrutement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  education TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  facebook TEXT,
  available_time TEXT,
  available_exams TEXT,
  other_engagements TEXT,
  associative_exp TEXT,
  project_contribution TEXT,
  project_details TEXT,
  sponsor_relations TEXT,
  certifications TEXT,
  skills TEXT[],
  portfolio_link TEXT,
  why_join TEXT[],
  strategic_axis TEXT,
  contribution_domain TEXT[],
  first_choice_project TEXT,
  how_did_you_know TEXT,
  has_project_idea TEXT,
  entrepreneurship_interest INT,
  interview_date TEXT,
  interview_time TEXT,
  status TEXT DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.candidatures_recrutement ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a recruitment candidature
DROP POLICY IF EXISTS "Public can submit candidatures" ON public.candidatures_recrutement;
CREATE POLICY "Public can submit candidatures" 
  ON public.candidatures_recrutement FOR INSERT 
  TO public
  WITH CHECK (true);

-- Authenticated bureau and developers can view candidatures
DROP POLICY IF EXISTS "Bureau and dev can view candidatures" ON public.candidatures_recrutement;
CREATE POLICY "Bureau and dev can view candidatures" 
  ON public.candidatures_recrutement FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  );


-- 9. Club Events & Agenda Table (Calendrier Interne)
CREATE TABLE IF NOT EXISTS public.club_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  event_type TEXT NOT NULL DEFAULT 'reunion' CHECK (event_type IN ('reunion', 'ag', 'workshop', 'deadline', 'teambuilding')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pv_content TEXT,
  pv_author_name TEXT,
  pv_decisions TEXT,
  pv_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- In case table already existed, add columns safely
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS pv_content TEXT;
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS pv_author_name TEXT;
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS pv_decisions TEXT;
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS pv_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view club events" ON public.club_events;
CREATE POLICY "Authenticated users can view club events" 
  ON public.club_events FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Bureau and responsables can create events" ON public.club_events;
CREATE POLICY "Bureau and responsables can create events" 
  ON public.club_events FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'responsable', 'developpeur')
    )
  );

DROP POLICY IF EXISTS "Bureau and dev can update events" ON public.club_events;
CREATE POLICY "Bureau and dev can update events" 
  ON public.club_events FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  );

DROP POLICY IF EXISTS "Bureau and creator can delete events" ON public.club_events;
CREATE POLICY "Bureau and creator can delete events" 
  ON public.club_events FOR DELETE 
  TO authenticated 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  );


-- 10. Event RSVPs (Confirmations de Présence)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.club_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'peut_etre')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view rsvps" ON public.event_rsvps;
CREATE POLICY "Authenticated users can view rsvps" 
  ON public.event_rsvps FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage their own rsvp" ON public.event_rsvps;
CREATE POLICY "Authenticated users can manage their own rsvp" 
  ON public.event_rsvps FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 11. Club Tasks Table (Suivi & Kanban par Pôle)
CREATE TABLE IF NOT EXISTS public.club_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pole TEXT NOT NULL DEFAULT 'Général',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire', 'en_cours', 'termine')),
  priority TEXT NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'urgente')),
  due_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.club_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view club tasks" ON public.club_tasks;
CREATE POLICY "Authenticated users can view club tasks" 
  ON public.club_tasks FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Bureau and responsables can create tasks" ON public.club_tasks;
CREATE POLICY "Bureau and responsables can create tasks" 
  ON public.club_tasks FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'responsable', 'developpeur')
    )
  );

DROP POLICY IF EXISTS "Users can update task status" ON public.club_tasks;
CREATE POLICY "Users can update task status" 
  ON public.club_tasks FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Bureau and creator can delete tasks" ON public.club_tasks;
CREATE POLICY "Bureau and creator can delete tasks" 
  ON public.club_tasks FOR DELETE 
  TO authenticated 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.club_profiles 
      WHERE id = auth.uid() AND role IN ('bureau', 'developpeur')
    )
  );
