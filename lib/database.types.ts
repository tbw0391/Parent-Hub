// Hand-written types matching supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is live if you'd
// rather have the CLI keep this in sync automatically.

export type Role = 'parent' | 'power_user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  phone: string | null;
  anniversary: string | null;
  spouse_id: string | null;
  birthday: string | null;
  profession: string | null;
  photo_path: string | null;
  is_married: boolean;
  spouse_name: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  disabled_at: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  title: string;
  body_richtext: string;
  image_url: string | null;
  created_at: string;
}

export interface ScheduleEvent {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
}

export interface TechRecommendation {
  id: string;
  author_id: string;
  name: string;
  description: string | null;
  url: string | null;
  platform: string | null;
  created_at: string;
}

export interface AppRecommendation {
  id: string;
  author_id: string;
  name: string;
  description: string | null;
  url: string | null;
  platform: string | null;
  created_at: string;
}

export interface PrayerPraise {
  id: string;
  author_id: string;
  kind: 'prayer' | 'praise';
  body: string;
  created_at: string;
}

export interface PrayerPraiseAck {
  id: string;
  entry_id: string;
  user_id: string;
  created_at: string;
}

export interface Poll {
  id: string;
  author_id: string;
  question: string;
  created_at: string;
  closed_at: string | null;
  allow_multiple: boolean;
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  position: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_id: string;
  created_at: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  is_dm: boolean;
  created_by: string;
  created_at: string;
}

export interface ChatGroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}
