# 🏋️ IronLog

> **A modern full-stack workout tracking platform that helps users plan workouts, log training sessions, analyze progress, and receive intelligent fitness insights.**

IronLog is a production-ready fitness application designed for gym enthusiasts who want more than a basic workout tracker. It combines workout planning, live workout logging, progress analytics, recovery tracking, and smart recommendations into a single platform.

This project is being built as a portfolio-quality application following modern software engineering practices, including structured documentation, sprint planning, scalable architecture, and clean code principles.

---

# 📖 Table of Contents

* Overview
* Features
* Tech Stack
* Project Structure
* System Architecture
* Getting Started
* Environment Variables
* Documentation
* Development Roadmap
* API Overview
* Core Algorithms
* Future Enhancements
* Contributing
* License

---

# 🎯 Project Goals

* Build a production-quality full-stack application.
* Learn scalable frontend and backend architecture.
* Practice modern React development.
* Implement efficient caching and API optimization.
* Demonstrate software engineering practices through documentation and sprint planning.
* Create a portfolio project suitable for technical interviews.

---

# ✨ Features

## 🔐 Authentication

* Secure user registration
* Login & logout
* Protected routes
* Session management
* User profile

---

## 📅 Workout Planner

* Create multiple workout plans
* Choose workout split
* Drag-and-drop exercise ordering
* Replace exercises
* Save personalized routines

---

## 💪 Exercise Library

Powered by the **ExerciseDB API**.

Features include:

* Search exercises
* Filter by body part
* Filter by equipment
* Exercise instructions
* Animated exercise demonstrations
* Alternative exercise suggestions

---

## 🏃 Live Workout Mode

* Start workout sessions
* Built-in rest timer
* Track sets, reps, and weight
* Workout notes
* Previous workout comparison
* Workout duration tracking

---

## 📈 Progress Tracking

* Workout history
* Body weight tracking
* Personal Records (PRs)
* Estimated One Rep Max (1RM)
* Training volume
* Weekly & monthly progress

---

## 📊 Analytics Dashboard

* Workout streak
* Weekly summary
* Volume charts
* Muscle distribution
* Recovery status
* Training frequency

---

## 🧠 Smart Insights

* Progressive overload recommendations
* Recovery estimation
* Muscle balance analysis
* Weekly performance reports

---

## 🖼 Progress Photos

* Upload physique progress images
* Timeline view
* Before & after comparison

---

## 🏆 Achievements

Earn achievements such as:

* First Workout
* 7-Day Streak
* 30-Day Streak
* New Personal Record
* 100 Workouts Completed

---

# 🛠 Tech Stack

## Frontend

* React
* Tailwind CSS
* React Router
* React Hooks
* Custom Hooks
* Axios
* TanStack Query (Server State Management & Data Caching)
* Zustand (Global Client State)
* React Hook Form
* Framer Motion
* DnD Kit
* Recharts

---

## Backend

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* Better Auth
* Express Middlewares
* Redis (Caching)

---

## External Services

* ExerciseDB API
* Cloudinary (Progress Photos)

---

# 📂 Project Structure

```text
IronLog/

├── client/
│
│   ├── src/
│   │
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── queries/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── types/
│
├── server/
│
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── cache/
│   ├── prisma/
│   ├── validations/
│   ├── lib/
│   └── utils/
│
├── docs/
│
│   ├── PROJECT_OVERVIEW.md
│   ├── REQUIREMENTS.md
│   ├── USER_STORIES.md
│   ├── SPRINT_PLAN.md
│   ├── TASK_LIST.md
│   ├── DATABASE_DESIGN.md
│   ├── API_SPECIFICATION.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── UI_UX_FLOW.md
│   ├── ALGORITHMS.md
│   ├── TESTING.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
│
├── README.md
└── LICENSE
```

---

# 🏗 System Architecture

```text
                   React Frontend

                          │

              React Router + Axios

                          │

          TanStack Query + Zustand

                          │

────────────────────────────────────────────

                 Express REST API

                          │

    Better Auth + Middlewares + Validation

                          │

             Prisma ORM + PostgreSQL

                          │

                   Redis Cache

          ┌───────────────┴───────────────┐

          ▼                               ▼

 ExerciseDB API                   Cloudinary
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/your-username/ironlog.git

cd ironlog
```

---

## Install Dependencies

### Frontend

```bash
cd client

npm install
```

### Backend

```bash
cd server

npm install
```

---

# ⚙ Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=

DATABASE_URL=

BETTER_AUTH_SECRET=

BETTER_AUTH_URL=

REDIS_URL=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EXERCISE_DB_API_KEY=
```

---

# ▶ Running the Project

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

# 📚 Documentation

Project documentation is organized inside the `docs/` directory.

| Document               | Description                                    |
| ---------------------- | ---------------------------------------------- |
| PROJECT_OVERVIEW.md    | Project vision and objectives                  |
| REQUIREMENTS.md        | Functional and non-functional requirements     |
| USER_STORIES.md        | Complete user stories with acceptance criteria |
| SPRINT_PLAN.md         | Sprint planning                                |
| TASK_LIST.md           | Development tasks                              |
| DATABASE_DESIGN.md     | Database schema and ERD                        |
| API_SPECIFICATION.md   | REST API documentation                         |
| SYSTEM_ARCHITECTURE.md | Application architecture                       |
| UI_UX_FLOW.md          | User flows and navigation                      |
| ALGORITHMS.md          | Business logic and calculations                |
| TESTING.md             | Testing strategy                               |
| SECURITY.md            | Authentication and security practices          |
| DEPLOYMENT.md          | Deployment guide                               |

---

# 🛣 Development Roadmap

## Phase 1

* Project setup
* Authentication
* Database
* Exercise Library

## Phase 2

* Workout Planner
* Workout Builder
* Exercise Search

## Phase 3

* Live Workout Tracking
* Workout History
* Dashboard

## Phase 4

* Analytics
* Recovery Tracking
* Smart Insights

## Phase 5

* Progress Photos
* Achievements
* Performance Optimization
* Deployment

---

# 📡 API Modules

* Authentication
* Users
* Exercise Library
* Workout Plans
* Workout Sessions
* Progress Tracking
* Analytics
* Recovery
* Achievements

Detailed endpoint documentation is available in **docs/API_SPECIFICATION.md**.

---

# 🧮 Core Algorithms

IronLog implements several fitness-related calculations:

* Estimated One Rep Max (Epley Formula)
* Training Volume Calculation
* Progressive Overload Detection
* Workout Streak Tracking
* Recovery Estimation
* Muscle Group Distribution
* Weekly Performance Summary

---

# ⚡ Performance Optimizations

* TanStack Query caching
* Redis server-side caching
* Lazy-loaded routes
* Code splitting
* Image optimization
* Request deduplication
* Optimistic UI updates
* Background data synchronization

---

# 🔒 Security

* Better Auth authentication
* Protected API routes
* Password hashing
* Input validation
* CORS protection
* Helmet security headers
* Rate limiting
* Secure environment variables
* Centralized error handling

---

# 🚀 Future Enhancements

* AI workout recommendations
* Nutrition tracking
* Wearable integration
* Offline workout logging
* Push notifications
* Social features
* Mobile application
* Admin dashboard

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Shivam Vishwakarma**

IronLog is being developed as a comprehensive portfolio project to demonstrate expertise in modern React development, backend architecture, REST APIs, PostgreSQL, Prisma ORM, caching strategies, authentication, and scalable software engineering practices.
