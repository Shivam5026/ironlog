# 🏋️ IronLog

> **A full-stack workout tracking platform — build workout plans, log sessions, track progress, and get smart fitness insights.**

IronLog is a modern fitness application built for gym enthusiasts who want more than a basic tracker. It combines workout planning, live session logging, analytics, and intelligent recommendations in one place.

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
| Workout planner | ✅ Done |
| Live workout mode | ✅ Done |
| Workout history | ✅ Done |
| Body weight tracking | ✅ Done |
| Personal records & 1RM estimation | ✅ Done |
| Analytics & charts | ✅ Done |
| Redis caching layer | ✅ Done |
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
- Filter by body part, target muscle, and equipment
- Full exercise details, instructions, and GIF demonstrations

**📋 Workout Planner**
- Create and manage multiple workout plans
- Add workout days with custom ordering
- Add exercises to days with sets, reps, and rest time configuration
- Duplicate plans and exercise templates
- Drag-and-drop reordering for days and exercises

**🏋️ Live Workout Mode**
- Start a workout session from any plan day
- Real-time workout timer with pause/resume
- Track sets with weight, reps, RPE, and failure markers
- Rest timer between sets
- Auto-save with local storage backup
- Complete workout with summary and volume calculation

**📜 Workout History**
- Infinite-scroll list of completed sessions
- Filter by date range, plan, and search term
- Detailed session view with all exercises and sets
- Compare current workout to previous sessions

**⚖️ Body Weight Tracking**
- Log daily body weight with timestamps
- Edit and delete entries
- Weight history with chart visualization (7d/30d/all)
- Dashboard integration showing current weight

**🏆 Personal Records & 1RM**
- Automatic PR detection on workout completion
- Best weight, best volume, and estimated 1RM per exercise
- Epley formula for 1RM estimation: `weight * (1 + reps / 30)`
- PR notifications when a new record is set
- Per-exercise PR history

**📊 Analytics & Charts**
- **Training Volume** — Line chart of total weight x reps over time
- **Workout Frequency** — Bar chart of workouts per week/month
- **Exercise Distribution** — Horizontal bar chart of most/least performed exercises
- **Muscle Distribution** — Donut chart of training distribution across Chest, Back, Legs, Shoulders, Arms, Core
- **Statistics** — Centralized aggregate stats (total volume, sets, reps, avg duration, avg weekly frequency)
- All charts support 7-day, 30-day, and all-time ranges

**⚡ Performance & Caching**
- Redis caching for dashboard and exercise lookups (24h TTL)
- TanStack Query for client-side state with consistent query keys
- Optimistic updates for live workout mutations
- Cache invalidation after workout completion, body-weight changes, and PR updates

### 🔜 Planned

- **Smart Insights** — Progressive overload recommendations, recovery estimation, weekly reports
- **Recovery Tracking** — Muscle group recovery status and fatigue scores
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
| [Zustand](https://zustand-demo.pmnd.rs) | Global client state (workout timer) |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form validation |
| [Axios](https://axios-http.com) | HTTP client |
| [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) | Component primitives |
| [Recharts](https://recharts.org) (3) | Charts (volume, frequency, distribution) |
| [Lucide](https://lucide.dev) | Icons |
| [DnD Kit](https://dndkit.com) | Drag & drop reordering |
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
| [Redis](https://redis.io) | Caching layer (dashboard, exercises) |
| [Helmet](https://helmetjs.github.io) | Security headers |
| [express-rate-limit](https://express-rate-limit.mintlify.app) | Rate limiting |
| [Morgan](https://github.com/expressjs/morgan) | HTTP logging |
| [Compression](https://github.com/expressjs/compression) | Response compression |
| [Zod](https://zod.dev) | Request validation |
| [tsx](https://tsx.is) | TypeScript execution & watch mode |

### External Services

- [ExerciseDB API](https://exercisedb.p.rapidapi.com) — Exercise library data (cached in Redis for 24h)

---

## 📂 Project Structure

```text
ironlog/
├── client/                          # React frontend
│   └── src/
│       ├── app/
│       │   ├── providers/           # Auth, Query, Router providers
│       │   └── router/              # Route definitions
│       ├── features/                # Feature-based modules
│       │   ├── analytics/           # Volume, frequency, exercise & muscle charts
│       │   │   ├── api/
│       │   │   ├── components/      # VolumeChart, WorkoutFrequencyChart, etc.
│       │   │   ├── hooks/
│       │   │   ├── pages/
│       │   │   └── types/
│       │   ├── auth/                # Login, register, logout
│       │   ├── body-weight/         # Weight logging, history, chart
│       │   ├── dashboard/           # Dashboard page & widgets
│       │   ├── exercise/            # Exercise library, filters, details
│       │   ├── streak/              # Streak summary & page
│       │   ├── workout-exercises/   # Exercise CRUD within plan days
│       │   ├── workout-history/     # Session list, details, filters
│       │   ├── workout-plans/       # Plan CRUD, exercise picker
│       │   ├── workout-session/     # Live workout, sets, timer, completion
│       │   ├── workout-days/        # Day CRUD within plans
│       │   ├── templates/           # Workout templates
│       │   └── profile/             # Profile management
│       ├── shared/                  # Shared UI & utilities
│       │   ├── components/ui/       # shadcn-style primitives
│       │   ├── config/              # Navigation, query keys
│       │   ├── lib/                 # Axios, auth client, query client, cache
│       │   └── types/
│       └── layouts/                 # Root, Auth, Dashboard layouts
│
├── server/                          # Express backend
│   └── src/
│       ├── config/                  # Env, Prisma, Redis config
│       ├── lib/                     # Cache utilities (withCache, getCache, setCache)
│       ├── middlewares/             # auth, validate, rateLimiter, errorHandler
│       ├── modules/                 # Feature-based modules
│       │   ├── analytics/           # Volume, frequency, exercise/muscle distribution, statistics
│       │   │   ├── controllers/
│       │   │   ├── routes/
│       │   │   ├── services/
│       │   │   ├── types/
│       │   │   └── validations/
│       │   ├── auth/                # Better Auth setup
│       │   ├── body-weight/         # Weight CRUD with dashboard cache invalidation
│       │   ├── dashboard/           # Dashboard aggregation with Redis caching
│       │   ├── exercise/            # ExerciseDB API integration with Redis caching
│       │   ├── personal-record/     # PR computation, 1RM estimation, sync
│       │   ├── profile/             # Profile CRUD
│       │   ├── streak/              # Streak calculation (current, longest, active days)
│       │   ├── workout-day/         # Workout day CRUD
│       │   ├── workout-exercise/    # Exercise CRUD within days
│       │   ├── workout-plan/        # Workout plan CRUD
│       │   ├── workout-session/     # Session lifecycle, sets, completion, recovery
│       │   └── workout-template/    # Template CRUD
│       ├── utils/                   # ApiError, ApiResponse, asyncHandler, workoutStats
│       └── types/                   # Express type extensions
│
├── docs/                            # Project documentation
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [PostgreSQL](https://www.postgresql.org) database
- [Redis](https://redis.io) instance
- An [ExerciseDB API](https://rapidapi.com/justin-WFnsXH_t5/api/exercisedb) key (free tier)

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

# Run migrations
npx prisma migrate dev

# (Or push schema to database)
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

REDIS_URL=redis://localhost:6379
```

---

## 📡 API Overview

| Module | Endpoints | Status |
| --- | --- | --- |
| Auth | `POST /api/auth/*` (Better Auth) | ✅ |
| Profile | `GET/PUT /api/profile` | ✅ |
| Exercises | `GET /api/exercises`, body-parts, target-muscles, equipments, `/:id` | ✅ |
| Workout Plans | `GET/POST /api/workout-plans`, `GET/PUT/DELETE /:id`, `/:id/duplicate` | ✅ |
| Workout Days | `GET/POST /api/workout-days?planId=`, `PUT/DELETE /:id`, `/reorder` | ✅ |
| Workout Exercises | `GET/POST /api/workout-exercises?dayId=`, `PUT/DELETE /:id`, `/reorder`, `/:id/replace` | ✅ |
| Templates | `GET/POST /api/templates`, `PUT/DELETE /:id`, `/:id/use` | ✅ |
| Workout Sessions | `POST /start`, `GET /:id`, `PUT /:id/pause`, `/resume`, `/finish` | ✅ |
| Workout Summary | `GET /:id/summary`, `POST /:id/complete` | ✅ |
| Sets | `POST /:id/sets`, `PUT/DELETE /sets/:setId`, `/:id/sets/reorder` | ✅ |
| Exercise Logs | `POST /:id/exercise-logs`, `PUT/DELETE /exercise-logs/:logId` | ✅ |
| Body Weight | `GET/POST /api/body-weight`, `PUT/DELETE /:id` | ✅ |
| Personal Records | `GET /api/personal-records`, `GET /:exerciseId` | ✅ |
| Streak | `GET /api/streak` | ✅ |
| Dashboard | `GET /api/dashboard`, `/stats`, `/recent-plans`, `/recent-templates` | ✅ |
| Analytics | `GET /api/analytics/statistics`, `/volume`, `/frequency`, `/exercise-distribution`, `/muscle-distribution` | ✅ |

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

### Phase 2 — Core Features ✅
- [x] Exercise Library (ExerciseDB API with Redis caching)
- [x] Profile management
- [x] Workout Planner (plans, days, exercises, templates)
- [x] Workout Builder with exercise search & drag-and-drop

### Phase 3 — Training ✅
- [x] Live Workout Tracking (timer, sets, rest timer, auto-save)
- [x] Workout History (infinite scroll, filters, session details)
- [x] Dashboard widgets (streak, weekly progress, last workout)

### Phase 4 — Analytics ✅
- [x] Training volume charts (line chart, 7d/30d/all)
- [x] Workout frequency charts (bar chart, weekly/monthly)
- [x] Exercise distribution (horizontal bar chart, most/least performed)
- [x] Muscle distribution (donut chart, 6 categories)
- [x] Statistics service (total volume, sets, reps, avg duration, avg frequency)
- [x] Body weight tracking & chart
- [x] Personal records & 1RM estimation
- [x] Redis caching layer for dashboard & exercises
- [x] TanStack Query integration with consistent query keys & invalidation

### Phase 5 — Polish 🔜
- [ ] Smart Insights — Progressive overload recommendations
- [ ] Recovery Tracking — Muscle group recovery status
- [ ] Progress Photos (Cloudinary)
- [ ] Achievements system
- [ ] Performance optimization
- [ ] Deployment

---

## 🧮 Core Algorithms

- [x] **Estimated One Rep Max (Epley Formula)** — `1RM = weight * (1 + reps / 30)`
- [x] **Training Volume Calculation** — Sum of `weight * reps` across all completed sets
- [x] **Workout Streak Tracking** — Consecutive calendar days with completed sessions
- [x] **Muscle Group Distribution** — Exercise metadata mapped to 6 categories (Chest, Back, Legs, Shoulders, Arms, Core)
- [ ] Progressive Overload Detection — Planned
- [ ] Recovery Estimation — Planned

---

## 🔒 Security

- Better Auth for authentication & session management
- Protected API routes with ownership validation
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
