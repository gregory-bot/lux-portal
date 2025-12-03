# LuxDev Portal – Student Collaboration & Assignment Platform

![Lux preview](lux1.jpg) 

A modern web platform built with **React** (frontend) and **PostgreSQL** (backend/database) to streamline student workflows. Students can submit assignments, receive grades, message classmates and instructors, share articles, and track their progress—all in one intuitive dashboard.  

This solves the pain of scattered submissions across emails, drives, or external tools, making tracking and collaboration seamless for educational institutions.

## 🌐 Live Demo
- **Deployed App**: [https://lux-portal.netlify.app](https://lux-portal.netlify.app)  
  (Note: Full access may require login credentials—contact @LuxDevHQ for demo accounts.)

## ✨ Key Features
- **Assignment Submission**: Upload files, descriptions, and metadata directly—no more lost emails or slow external platforms.
- **Grading & Feedback**: Instructors assign grades, provide comments, and track submission status in real-time.
- **Messaging System**: Secure chat between students, peers, and instructors for quick queries and discussions.
- **Article Sharing**: Curate and share educational resources, articles, or notes with your class community.
- **Progress Tracking**: Visual dashboards to monitor grades, completion rates, and personal milestones.
- **User Roles**: Separate dashboards for students and instructors with role-based permissions.

## 🛠 Tech Stack
| Component | Technology |
|-----------|------------|
| **Frontend** | React.js (with hooks, routing, and state management) |
| **Backend/Database** | PostgreSQL (for secure data storage, queries, and authentication) |
| **Deployment** | Netlify (frontend hosting) + (Backend hosted separately for API endpoints) |
| **Other** | Node.js/Express (likely for API), JWT for auth |

## 🚀 Quick Start – Clone & Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- Yarn or npm
- Git

### Setup Instructions
1. **Clone the Repo**:
   git clone https://github.com/yourusername/luxdev-portal.git  # Replace with your repo URL
   cd luxdev-portal


2. **Frontend Setup** (React App):
   cd client  # Or frontend directory
   npm install  # Or yarn install
   npm start    # Runs on http://localhost:3000

### How the Frontend Communicates with PostgreSQL (via Supabase)The React app never connects directly to PostgreSQL.
 --It uses the official Supabase JavaScript client — a thin, secure layer that enforces RLS automatically.1. Supabase Client Setup (src/lib/supabaseClient.js)

### 1. Supabase Client Setup (src/lib/supabaseClient.js)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

### Steps
git clone https://github.com/LuxDevHQ/luxdev-portal.git
cd luxdev-portal
npm install

### Create .env in the root:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

### Run:
npm run dev

### Database SetupGo to your Supabase dashboard → SQL Editor
run the full schema script (provided in supabase/migrations/ or earlier in this README)


## SQL QUERRIES**
```/*
  # LuxDev Portal Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique, required)
      - `role` (text, either 'student' or 'instructor')
      - `avatar_url` (text, profile image URL)
      - `linkedin_handle` (text)
      - `twitter_handle` (text)
      - `fee_paid` (boolean, default false, only for students)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `assignments`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `instructor_id` (uuid, references profiles)
      - `due_date` (timestamptz)
      - `created_at` (timestamptz)

    - `submissions`
      - `id` (uuid, primary key)
      - `assignment_id` (uuid, references assignments)
      - `student_id` (uuid, references profiles)
      - `file_url` (text, submission file)
      - `submitted_at` (timestamptz)
      - `grade` (integer, 0-100)
      - `feedback` (text)
      - `status` (text, default 'submitted')

    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `content` (text)
      - `file_url` (text, optional attachment)
      - `created_at` (timestamptz)
      - `read` (boolean, default false)

    - `articles`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references profiles)
      - `title` (text, required)
      - `content` (text, required)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `article_likes`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `article_comments`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `user_id` (uuid, references profiles)
      - `content` (text, required)
      - `created_at` (timestamptz)

    - `article_bookmarks`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all profiles, update only their own
    - Assignments: Instructors can create/update, students can read
    - Submissions: Students can create/read their own, instructors can read/update all
    - Messages: Users can read messages where they are sender or receiver, create messages
    - Articles: All authenticated users can read, create their own, update their own
    - Likes/Comments/Bookmarks: Users can manage their own interactions
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'instructor')),
  avatar_url text DEFAULT '',
  linkedin_handle text DEFAULT '',
  twitter_handle text DEFAULT '',
  fee_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  instructor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  due_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can create assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instructor'
    )
  );

CREATE POLICY "Instructors can update own assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete own assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (instructor_id = auth.uid());

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  grade integer CHECK (grade >= 0 AND grade <= 100),
  feedback text DEFAULT '',
  status text DEFAULT 'submitted',
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'instructor'
  ));

CREATE POLICY "Students can create own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can update submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instructor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instructor'
    )
  );

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  file_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own articles"
  ON articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id)
);

ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
  ON article_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own likes"
  ON article_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes"
  ON article_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create article_comments table
CREATE TABLE IF NOT EXISTS article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments"
  ON article_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON article_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON article_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON article_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create article_bookmarks table
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id)
);

ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON article_bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookmarks"
  ON article_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON article_bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_assignments_instructor ON assignments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_article ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_article ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user ON article_bookmarks(user_id);
```/*
