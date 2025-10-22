import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  username: string;
  role: 'student' | 'instructor';
  avatar_url: string;
  linkedin_handle: string;
  twitter_handle: string;
  fee_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  due_date: string;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  submitted_at: string;
  grade: number | null;
  feedback: string;
  status: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url: string;
  created_at: string;
  read: boolean;
}

export interface Article {
  id: string;
  author_id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}
