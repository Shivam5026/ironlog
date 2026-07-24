# 🏋️ IronLog

> **A full-stack workout tracking platform — build workout plans, log sessions, track progress, and get smart fitness insights.**

IronLog is a modern fitness application built for gym enthusiasts who want more than a basic tracker. It combines workout planning, live session logging, analytics, and intelligent recommendations in one place.

> 🚧 **Work in progress** — this is an active development project. Some features described below are planned and not yet built.

---

## 📖 Table of Contents

- [Current Status](#current-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [Development Roadmap](#development-roadmap)
- [License](#license)

---

## 🎯 Current Status

| Area | Status |
| --- | --- |
| Auth (Better Auth, email/password) | ✅ Done |
| Profile management | ✅ Done |
| Exercise library (ExerciseDB API) | ✅ Done |
| Dashboard layout & navigation | ✅ Done |
| UI component library (shadcn-style) | ✅ Done |
| Workout planner | 🔜 Planned |
| Live workout mode | 🔜 Planned |
| Progress tracking & analytics | 🔜 Planned |
| Smart insights & recovery | 🔜 Planned |
| Progress photos | 🔜 Planned |
| Achievements | 🔜 Planned |

---

## ✨ Features

### ✅ Built

**🔐 Authentication** — Secure auth powered by Better Auth
- Email/password registration & login
- Session management with protected routes
- Guest-only and authenticated route guards

**👤 Profile Management**
- Update height, weight, fitness goal, and experience level
- Goal types: Lose Weight, Maintain, Gain Muscle, Strength, Endurance
- Experience levels: Beginner, Intermediate, Advanced

**💪 Exercise Library**
- Browse exercises powered by the ExerciseDB API
- Full exercise details and instructions

**📊 Dashboard**
- Responsive layout with sidebar navigation
- Desktop sidebar + mobile sheet drawer
- Ready for dashboard widgets

### 🔜 Planned

- **Workout Planner** — Create workout plans, choose splits, order exercises via drag-and-drop
- **Live Workout Mode** — Start sessions, rest timer, track sets/reps/weight, compare to previous workouts
- **Progress Tracking** — Body weight, personal records, estimated 1RM, training volume
- **Analytics** — Workout streaks, volume charts, muscle distribution, recovery status
- **Smart Insights** — Progressive overload recommendations, recovery estimation, weekly reports
- **Progress Photos** — Upload physique images, timeline view, before/after comparison
- **Achievements** — First Workout, 7-Day Streak, 100 Workouts, and more

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| [React](https://react.dev) (19) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vite.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) (4) | Utility-first styling |
| [React Router](https://reactrouter.com) (7) | Routing |
| [TanStack Query](https://tanstack.com/query) (5) | Server state & caching |
| [Zustand](https://zustand-demo.pmnd.rs) | Global client state |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form validation |
| [Axios](https://axios-http.com) | HTTP client |
| [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) | Component primitives |
| [Lucide](https://lucide.dev) | Icons |
| [Recharts](https://recharts.org) | Charts (planned) |
| [Framer Motion](https://motion.dev) | Animations (planned) |
| [DnD Kit](https://dndkit.com) | Drag & drop (planned) |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |
| [Sonner](https://sonner.emilkowal.ski) | Toast notifications |

### Backend

| Technology | Purpose |
| --- | --- |
| [Node.js](https://nodejs.org) | Runtime |
| [Express](https://expressjs.com) (5) | Web framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [PostgreSQL](https://www.postgresql.org) | Database |
| [Prisma ORM](https://www.prisma.io) (7) | Database access & migrations |
| [Better Auth](https://www.better-auth.com) | Authentication |
| [Helmet](https://helmetjs.github.io) | Security headers |
| [express-rate-limit](https://express-rate-limit.mintlify.app) | Rate limiting |
| [Morgan](https://github.com/expressjs/morgan) | HTTP logging |
| [Compression](https://github.com/expressjs/compression) | Response compression |
| [Zod](https://zod.dev) | Request validation |
| [tsx](https://tsx.is) | TypeScript execution & watch mode |

### External Services

- [ExerciseDB API](https://exercisedb.p.rapidapi.com) — Exercise library data
- [Cloudinary](https://cloudinary.com) — Image hosting for progress photos (planned)

---

## 📂 Project Structure

```text
ironlog/
├── client/                          # React frontend
│   └── src/
│       ├── app/
│       │   ├── providers/           # Auth, Query, Router providers
│       │   └── router/              # Route definitions
│       ├── assets/                  # Static assets
│       ├── features/                # Feature-based modules
│       │   ├── auth/                # Login, register, logout
│       │   │   ├── api/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   ├── schemas/
│       │   │   └── types/
│       │   └── profile/             # Profile management
│       │       ├── api/
│       │       ├── components/
│       │       ├── hooks/
│       │       ├── page/
│       │       ├── schemas/
│       │       └── types/
│       ├── layouts/                 # Root, Auth, Dashboard layouts
│       ├── pages/                   # Top-level route pages
│       └── shared/                  # Shared UI & utilities
│           ├── components/
│           │   ├── common/          # Spinner, FullPageLoader
│           │   ├── dashboard/       # Sidebar, Navbar
│           │   ├── navigation/      # Navbar
│           │   ├── routes/          # ProtectedRoute, GuestRoute
│           │   └── ui/              # shadcn-style primitives
│           ├── config/
│           ├── hooks/
│           ├── lib/                 # Axios, auth client, query client
│           └── types/
│
├── server/                          # Express backend
│   └── src/
│       ├── config/                  # Env, Prisma, DB config
│       ├── generated/prisma/        # Auto-generated Prisma client
│       ├── middlewares/             # auth, validate, rateLimiter, errorHandler
│       ├── modules/                 # Feature-based modules
│       │   ├── auth/                # Better Auth setup
│       │   ├── exercise/            # ExerciseDB API integration
│       │   └── profile/             # Profile CRUD
│       ├── types/                   # Express type extensions
│       └── utils/                   # ApiError, ApiResponse, asyncHandler
│
├── docs/                            # Project documentation
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [PostgreSQL](https://www.postgresql.org) database
- An [ExerciseDB API](https://rapidapi.com/justin-WFnsXH_t5/api/exercisedb) key (free tier)
- A [Cloudinary](https://cloudinary.com) account (for progress photos — optional for now)

### Clone & Install

```bash
git clone https://github.com/your-username/ironlog.git
cd ironlog

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Database Setup

```bash
cd server

# Create the database
npx prisma migrate dev

# (Or run existing migrations)
npx prisma db push
```

### Run the Project

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

---

## ⚙ Environment Variables

Create a `.env` file in the `server/` directory (see `.env.sample`):

```env
PORT=5000

NODE_ENV=development

CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@localhost:5432/ironlog

BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:5000

EXERCISE_DB_API_KEY=your-rapidapi-key

# Optional (for future features)
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📡 API Overview

| Module | Endpoints | Status |
| --- | --- | --- |
| Auth | `POST /api/auth/*` (Better Auth) | ✅ |
| Profile | `GET/PUT /api/profile` | ✅ |
| Exercises | `GET /api/exercises` | ✅ |

Detailed API documentation is in [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) *(planned)*.

---

## 📚 Documentation

Project docs live in the `docs/` directory:

| Document | Description |
| --- | --- |
| [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Project vision and objectives |
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | Functional and non-functional requirements |
| [USER_STORIES.md](docs/USER_STORIES.md) | User stories with acceptance criteria |
| [TASK_LIST.md](docs/TASK_LIST.md) | Development tasks overview |
| [SPRINT-01.md](docs/TASKS/SPRINT-01.md) through [SPRINT-10.md](docs/TASKS/SPRINT-10.md) | Sprint plans |

---

## 🛣 Development Roadmap

### Phase 1 — Foundation ✅
- [x] Project setup (Vite + Express + TypeScript)
- [x] Database schema & Prisma setup
- [x] Auth system (Better Auth)
- [x] UI component library
- [x] Dashboard layout & routing

### Phase 2 — Core Features 🔄
- [x] Exercise Library (ExerciseDB API)
- [x] Profile management
- [ ] Workout Planner
- [ ] Workout Builder with exercise search

### Phase 3 — Training
- [ ] Live Workout Tracking
- [ ] Workout History
- [ ] Dashboard widgets

### Phase 4 — Analytics
- [ ] Progress charts & metrics
- [ ] Recovery tracking
- [ ] Smart Insights

### Phase 5 — Polish
- [ ] Progress Photos (Cloudinary)
- [ ] Achievements system
- [ ] Performance optimization
- [ ] Deployment

---

## 🧮 Core Algorithms *(Planned)*

- Estimated One Rep Max (Epley Formula)
- Training Volume Calculation
- Progressive Overload Detection
- Workout Streak Tracking
- Recovery Estimation
- Muscle Group Distribution

---

## 🔒 Security

- Better Auth for authentication & session management
- Protected API routes
- Input validation (Zod)
- CORS protection
- Helmet security headers
- Rate limiting
- Centralized error handling
- Environment-based configuration

---

## 📄 License

[MIT](LICENSE)

---

## 👨‍💻 Author

**Shivam Vishwakarma**

Built as a portfolio project demonstrating full-stack development with React, Express, TypeScript, PostgreSQL, and modern software engineering practices.
