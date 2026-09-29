export type ClubRole = 'membre' | 'responsable' | 'bureau' | 'developpeur';

export interface ClubProfile {
  id: string;
  email: string;
  full_name: string;
  role: ClubRole;
  poste: string;
  avatar_url?: string | null;
  bio?: string | null;
  career?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface AnnouncementComment {
  id: string;
  announcement_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    role: ClubRole;
    poste: string;
    avatar_url?: string | null;
  };
}

export interface Announcement {
  id: string;
  author_id: string;
  content: string;
  image_url?: string | null;
  link_url?: string | null;
  link_title?: string | null;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    role: ClubRole;
    poste: string;
    avatar_url?: string | null;
  };
  likes_count: number;
  has_liked: boolean;
  comments: AnnouncementComment[];
}

export interface ClubDocument {
  id: string;
  doc_key: 'reglement' | 'protocole' | 'book';
  title: string;
  file_url: string;
  description?: string | null;
  updated_at: string;
}
