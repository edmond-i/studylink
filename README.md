# 🚀 StudyLink — Academic Social-Learning Platform

A next-generation platform combining Reddit-style forums, Slack-style study groups, DataCamp gamification, and an AI Socratic tutor.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.io
- **AI:** OpenAI API
- **Auth:** JWT + bcrypt
- **Payments:** Stripe
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Deployment:** Vercel (frontend) + Railway (backend)

## Project Structure

```
studylink/
├── client/          # Vite + React frontend
├── server/          # Express backend
└── copilot-instructions.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone & install dependencies:**
```bash
cd studylink
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your secrets
```

3. **Initialize database:**
```bash
npm run db:push
```

4. **Start development servers:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Features

## Deployment

You can deploy StudyLink using a simple Docker container or any Node.js hosting provider. A GitHub Actions workflow **.github/workflows/deploy.yml** is included as a template, building both client and server on pushes to `main`.

### Using Docker

```bash
# build image
docker build -t studylink:latest .

# run container (make sure to provide env vars / link database)
docker run -p 5000:5000 \
  -e DATABASE_URL=postgres://user:pass@db:5432/studylink \
  -e JWT_SECRET=... \
  -e STRIPE_SECRET_KEY=... \
  studylink:latest
```

The server will serve the compiled React app at `/` when `NODE_ENV=production`.


## Features

- 🔐 Email-verified authentication with JWT & refresh tokens
- 📚 Reddit-style public forums with voting & full-text search
- 👥 Slack-style private study groups with real-time chat
- 🤖 Socratic AI tutor that guides without solving
- 🎮 Gamification: XP, streaks, leaderboards, badges
- 🔔 In-app & email notifications
- 💎 Freemium model with Stripe payments
- 📱 Mobile-first design system

## Design System

Dark theme with violet primary, cyan accents, and green success states. All components use design system variables defined in CSS.

See `copilot-instructions.md` for complete specifications.

## Development Standards

- Complete, working code (no TODOs)
- Mobile-first (375px+)
- Error handling on all async operations
- JSDoc comments on functions
- Accessibility & semantic HTML
- Input sanitization (DOMPurify)
- Rate-limited endpoints

## License

MIT
