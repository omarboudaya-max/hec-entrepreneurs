export type ClubRole = 'membre' | 'responsable' | 'bureau' | 'developpeur' | 'nouveau_membre' | 'guest';

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
  doc_key: 'reglement' | 'protocole' | 'protocole_externe' | 'book';
  title: string;
  file_url: string;
  description?: string | null;
  updated_at: string;
}

export interface EventRsvpProfile {
  id: string;
  full_name: string;
  role: ClubRole;
  poste?: string;
  avatar_url?: string | null;
}

export interface EventRsvpItem {
  event_id: string;
  user_id: string;
  status: "present" | "absent" | "peut_etre";
  created_at: string;
  profile?: EventRsvpProfile | null;
}

export interface ClubEventItem {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  event_type: "reunion" | "ag" | "workshop" | "deadline" | "teambuilding";
  created_at: string;
  userRsvp?: "present" | "absent" | "peut_etre" | null;
  presentCount?: number;
  absentCount?: number;
  maybeCount?: number;
  rsvps?: EventRsvpItem[];
  custom_present_count?: number | null;
  custom_absent_count?: number | null;
  pv_file_url?: string | null;
  pv_file_name?: string | null;
  pv_content?: string | null;
  pv_author_name?: string | null;
  pv_decisions?: string | null;
  pv_updated_at?: string | null;
}

export type PaymentStatus = "non_paye" | "partiel" | "paye";

export interface MemberTreasuryItem {
  id: string;
  email: string;
  full_name: string;
  role: ClubRole;
  poste: string;
  avatar_url?: string | null;
  phone?: string | null;
  is_new_member: boolean;
  total_due: number; // 70 DT for new member, 50 DT for old member / responsable / bureau
  first_tranche_amount: number; // 40 DT for new member, 30 DT for old member / responsable / bureau
  second_tranche_amount: number; // 30 DT for new member, 20 DT for old member / responsable / bureau
  payment_status: PaymentStatus;
  amount_paid: number;
  remaining_amount: number;
  last_payment_at?: string | null;
  last_reminder_at?: string | null;
  updated_by?: string | null;
  notes?: string | null;
}



