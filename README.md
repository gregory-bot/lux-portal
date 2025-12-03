# LuxDev Portal – Student Collaboration & Assignment Platform 🚀

**#BuildInPublic #Postgres #Data**  
@LuxDevHQ @HarunMbaabu  

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










