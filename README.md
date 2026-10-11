# AI-Powered Interview Assistant (MERN + OpenAI)

A full-stack platform built with the MERN stack (MongoDB, Express, React, Node.js) and OpenAI API integration. It helps candidates prepare for technical, architectural, and behavioral interviews by parsing resumes, generating personalized questions, conducting conversational mock interviews with live speech recognition, providing granular rubric feedback, and tracking preparation analytics over time.

---

## ✨ Key Features

1. **User Authentication & Profiles**
   - Secure JWT-based authentication with bcrypt password hashing.
   - Profile management with target role, experience level, bio, and target skills.
   - 1-Click Demo Candidate Login for instant evaluation.

2. **Resume Parsing & Skill Extraction (NLP / AI)**
   - Upload PDF, DOCX, DOC, or TXT resumes (Multer + `pdf-parse` + `mammoth`).
   - Automated OpenAI NLP extraction for structured skills, years of experience, past roles, seniority level, and education.
   - Interactive skill tag editor (add/remove skills).

3. **Personalized Question Generation**
   - Generates tailored question sets across **DSA**, **System Design**, **Role-Specific Technical**, and **Behavioral / STAR**.
   - Configurable difficulty tiers (Junior, Mid-Level, Senior, Lead).
   - Detailed hints, expected evaluation criteria, and follow-up prompts per question.

4. **Conversational AI Mock Interview Room**
   - Interactive split-screen workspace with AI Interviewer avatar and animated audio waveform visualizer.
   - Web Speech API microphone integration for real-time speech-to-text transcription.
   - Context-aware dialogue with intelligent follow-up probing and smooth question progression.
   - Live session timer and question navigation.

5. **Automated Rubric Feedback & Model Answers**
   - Multi-dimensional scoring (Correctness, Clarity, Structure, Communication/STAR).
   - Hiring verdict badge (*Strong Hire*, *Hire*, *Lean Hire*, *Needs Improvement*).
   - Question-by-question breakdown with strengths, weaknesses, actionable suggestions, and ideal senior-level model answers.
   - Confetti celebration upon completion.

6. **Analytics Dashboard & Skill Gap Matrix**
   - Readiness index gauge and historical score progression charts (Recharts).
   - Competency radar breakdown.
   - Target role skill gap comparison table (Required vs Demonstrated proficiency).
   - Curated learning roadmaps and study links (System Design Primer, NeetCode, React/Node docs).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti, Axios, Web Speech API.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), JWT, bcryptjs, Multer, pdf-parse, mammoth, OpenAI API (`gpt-4o-mini`).
- **Database**: Standard MongoDB URI (local / Atlas) with automatic fallback to `mongodb-memory-server` for zero-friction local execution.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
From the project root:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Environment Variables
In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/interview_assistant
JWT_SECRET=super_secret_interview_assistant_jwt_key_2026
OPENAI_API_KEY=your_openai_api_key_here
```
> **Note**: If `OPENAI_API_KEY` is not provided or if MongoDB is not running locally, the system automatically uses in-memory database storage and heuristic AI algorithms so that every feature works reliably out of the box!

### 3. Seed Demo Data
To populate the database with realistic candidate profiles, resumes, question sets, completed interview transcripts, and analytics:
```bash
npm run seed
```

**Demo Credentials**:
- **Email**: `demo@interviewai.com`
- **Password**: `password123`

### 4. Run Locally
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them individually:
- **Backend**: `cd backend && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

---

## 📡 API Endpoints

### Auth (`/api/auth`)
- `POST /api/auth/signup` - Register a new candidate
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current authenticated user profile
- `PUT /api/auth/profile` - Update target role, experience, bio, and skills

### Resume (`/api/resume`)
- `POST /api/resume/upload` - Upload PDF/DOCX resume for AI parsing & skill extraction
- `GET /api/resume` - Retrieve latest parsed resume profile
- `PUT /api/resume/skills` - Update extracted skills list

### Questions (`/api/questions`)
- `POST /api/questions/generate` - Generate tailored question set with AI
- `GET /api/questions` - List all user and preset question sets
- `GET /api/questions/:id` - Get question set by ID
- `DELETE /api/questions/:id` - Delete custom question set

### Mock Interview (`/api/interview`)
- `POST /api/interview/start` - Initialize a new mock interview session
- `POST /api/interview/:sessionId/message` - Send candidate response & get AI interviewer reply
- `POST /api/interview/:sessionId/end` - Conclude interview & generate rubric scorecard
- `GET /api/interview/sessions` - List user's past mock sessions
- `GET /api/interview/:sessionId` - Get session details and full message transcript

### Feedback (`/api/feedback`)
- `GET /api/feedback/:sessionId` - Retrieve detailed rubric scorecard & model answers
- `GET /api/feedback/history` - Retrieve all feedback records for user

### Analytics (`/api/analytics`)
- `GET /api/analytics` - Get user readiness score, trend telemetry, and skill gaps
- `POST /api/analytics/refresh` - Recalculate metrics across all sessions

---

## 📂 Project Structure

```
interview assistant/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB & in-memory DB configuration
│   │   ├── controllers/     # Auth, Resume, Question, Interview, Feedback, Analytics controllers
│   │   ├── middleware/      # JWT auth, Multer upload, error handling
│   │   ├── models/          # Mongoose Schemas (User, Resume, QuestionSet, InterviewSession, Feedback, Analytics)
│   │   ├── routes/          # Express route definitions
│   │   ├── seeds/           # Database seeder script
│   │   ├── services/        # OpenAI integration, Resume parser, Analytics engine
│   │   └── server.js        # Express app server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, AudioVisualizer, StatCard, Modal, LoadingSkeleton
│   │   ├── context/         # AuthContext with token persistence
│   │   ├── pages/           # Landing, Login, Signup, Dashboard, Resume, Questions, Mock Interview, Feedback, Analytics, History
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Route configuration & layout
│   │   ├── index.css        # Tailwind styling & glassmorphism
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── package.json             # Root workspace orchestration
```
