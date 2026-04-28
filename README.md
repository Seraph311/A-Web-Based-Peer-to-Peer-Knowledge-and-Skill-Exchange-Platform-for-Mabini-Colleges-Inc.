# StudyBridge

StudyBridge is a full-stack peer-learning platform for academic collaboration.  
It includes user onboarding (with admin approval + OTP flow), skill sharing, forum Q&A, real-time study sessions, messaging, feedback, reporting, and admin moderation.

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.IO
- **Database:** PostgreSQL
- **Storage:** Supabase Storage (for uploaded ID documents)
- **Email:** Gmail SMTP (OTP sending)

## Project structure

```text
studybridge/
├── client/                 # React frontend
├── server/                 # Express API + Socket.IO backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── socket/
│   └── setup.sql
├── package.json            # root dependencies
└── .env                    # environment config (local)
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 14+
- Supabase project + storage bucket
- Gmail account + app password (for OTP emails)

## Environment variables

Create/update `.env` in the project root with values similar to:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=studybridge_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=replace_with_secure_secret

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=id-documents

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Comma-separated allowlist for API + Socket CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Create/update `client/.env` (or `client/.env.local`) with:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## Setup

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd client
npm install
cd ..
```

3. Create database schema:

```bash
psql -U your_db_user -f server/setup.sql
```

## Run locally

1. Start backend (from project root):

```bash
node server/index.js
```

2. Start frontend (new terminal):

```bash
cd client
npm run dev
```

## Default local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`
- Socket.IO server: `http://localhost:3001`

## Core API groups

- `/api/auth` - register, login, OTP verify/resend
- `/api/users` - profiles, availability, leaderboard
- `/api/skills` - CRUD/search skills
- `/api/forum` - questions, answers, question delete
- `/api/sessions` - session lifecycle (create/join/leave/end/delete)
- `/api/messages` - session message history
- `/api/feedback` - post and fetch session/user feedback
- `/api/reports` - submit and manage reports
- `/api/admin` - admin user moderation/document checks

## Frontend scripts (`client/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
