# 📊 Sprint 5 — Dashboard & History

## Sprint Information

| Property                   | Value                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Sprint**                 | Sprint 5                                                                                                                       |
| **Sprint Goal**            | Build the analytics foundation by creating a personalized dashboard, workout history, personal records, and progress tracking. |
| **Duration**               | 2 Weeks                                                                                                                        |
| **Status**                 | Planned                                                                                                                        |
| **Priority**               | High                                                                                                                           |
| **Estimated Story Points** | 39                                                                                                                             |

---

# 🎯 Sprint Goal

Provide users with meaningful insights into their training by transforming workout data into useful statistics, charts, history, and personal records.

By the end of this sprint, users should immediately understand their progress whenever they open IronLog.

---

# Sprint Objectives

- Build Dashboard
- Build Workout History
- Calculate Personal Records
- Track Body Weight
- Display Recent Activity
- Calculate Workout Streak
- Display Progress Charts
- Cache Dashboard Analytics

---

# 📖 Linked User Stories

| Story ID | Story                     |
| -------- | ------------------------- |
| US-004   | Dashboard Summary         |
| US-005   | Dynamic Dashboard Updates |
| US-016   | Workout History           |
| US-017   | Body Weight Tracking      |
| US-019   | Personal Records          |
| US-020   | Workout Analytics         |

---

# Epic 1 — Dashboard

## Goal

Provide users with an overview of their current fitness journey.

---

## Feature 1.1 — Dashboard Overview

### Backend Tasks

- [ ] Dashboard service
- [ ] Dashboard API
- [ ] Aggregate statistics
- [ ] Redis caching

### Frontend Tasks

- [ ] Dashboard page
- [ ] Dashboard cards
- [ ] Loading skeletons
- [ ] Empty state

---

### Dashboard Cards

Display

- Today's Workout
- Workout Streak
- Weekly Progress
- Total Workouts
- Current Body Weight
- Total Volume Lifted
- Last Workout

---

## Feature 1.2 — Quick Actions

Users can

- Start Workout
- Continue Workout
- Create Workout Plan
- View Exercise Library

---

### Deliverables

Complete Dashboard.

---

# Epic 2 — Workout History

## Goal

Allow users to browse every completed workout.

---

## Feature 2.1 — Workout History

### Backend Tasks

- [ ] Workout History API
- [ ] Pagination
- [ ] Sorting
- [ ] Filtering

### Frontend Tasks

- [ ] History page
- [ ] Infinite scrolling
- [ ] Search history
- [ ] Empty state

---

## Feature 2.2 — Workout Details

Display

- Workout duration
- Exercises performed
- Every set
- Notes
- Workout volume
- Personal records achieved

---

### Acceptance Criteria

Users can

- View history
- Search workouts
- Open workout details
- Filter workouts

---

# Epic 3 — Personal Records

## Goal

Automatically track personal best performances.

---

## Feature 3.1 — Exercise PRs

Calculate

- Highest Weight
- Highest Volume
- Best Set

---

## Feature 3.2 — Estimated One Rep Max

Calculate

Using Epley Formula

```text
1RM = Weight × (1 + Reps / 30)
```

---

## Feature 3.3 — PR Notifications

Display

🏆 New Personal Record

after workouts.

---

### Deliverables

Automatic PR tracking.

---

# Epic 4 — Body Weight Tracking

## Goal

Allow users to monitor body weight over time.

---

## Feature 4.1 — Weight Logging

### Backend Tasks

- [ ] Weight model
- [ ] CRUD APIs

### Frontend Tasks

- [ ] Add weight
- [ ] Edit weight
- [ ] Delete weight

---

## Feature 4.2 — Weight Chart

Display

- Weekly changes
- Monthly changes
- Overall trend

---

### Deliverables

Weight tracking page.

---

# Epic 5 — Workout Streaks

## Goal

Encourage consistency.

---

## Feature 5.1 — Streak Engine

Calculate

- Current streak
- Longest streak
- Total active days

---

## Feature 5.2 — Streak Dashboard

Display

🔥 Current Streak

🏆 Longest Streak

---

### Acceptance Criteria

Users immediately know their workout consistency.

---

# Epic 6 — Charts & Analytics

## Goal

Visualize workout progress.

---

## Feature 6.1 — Volume Chart

Display

- Weekly Volume
- Monthly Volume

---

## Feature 6.2 — Workout Frequency

Display

- Workouts per week
- Workouts per month

---

## Feature 6.3 — Exercise Distribution

Display

- Most performed exercises
- Least performed exercises

---

## Feature 6.4 — Muscle Distribution

Display

Training distribution by

- Chest
- Back
- Legs
- Shoulders
- Arms
- Core

---

### Deliverables

Interactive charts using Recharts.

---

# Epic 7 — Analytics Engine

## Goal

Generate reusable analytics for the application.

---

## Feature 7.1 — Statistics Service

Calculate

- Total Volume
- Total Sets
- Total Reps
- Average Workout Duration
- Average Weekly Frequency

---

## Feature 7.2 — Dashboard Cache

### Tasks

- [ ] Redis caching
- [ ] Cache invalidation
- [ ] Background refresh

---

## Feature 7.3 — TanStack Query

Cache

- Dashboard
- Workout History
- Personal Records
- Weight History

---

# API Deliverables

## Dashboard

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/api/dashboard` |

---

## Workout History

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/api/workout-history`     |
| GET    | `/api/workout-history/:id` |

---

## Personal Records

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | `/api/personal-records`             |
| GET    | `/api/personal-records/:exerciseId` |

---

## Body Weight

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | `/api/body-weight`     |
| POST   | `/api/body-weight`     |
| PUT    | `/api/body-weight/:id` |
| DELETE | `/api/body-weight/:id` |

---

# Database Deliverables

## BodyWeight

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| userId     | UUID      |
| weight     | Decimal   |
| recordedAt | Timestamp |

---

## PersonalRecord _(Recommended)_

| Field              | Type      |
| ------------------ | --------- |
| id                 | UUID      |
| userId             | UUID      |
| exerciseId         | String    |
| bestWeight         | Decimal   |
| bestVolume         | Decimal   |
| estimatedOneRepMax | Decimal   |
| achievedAt         | Timestamp |

---

# Frontend Deliverables

Pages

- Dashboard
- Workout History
- Workout Details
- Body Weight
- Personal Records

Components

- Statistic Card
- Dashboard Cards
- Workout Timeline
- PR Card
- Weight Chart
- Volume Chart
- Workout Frequency Chart
- Muscle Distribution Chart
- Recent Activity List

---

# Backend Deliverables

Controllers

- Dashboard Controller
- Workout History Controller
- Personal Record Controller
- Body Weight Controller

Services

- Dashboard Service
- Statistics Service
- Personal Record Service
- Body Weight Service

Routes

- Dashboard Routes
- Workout History Routes
- Body Weight Routes
- Personal Record Routes

---

# State Management

## Zustand

Store

- Dashboard Preferences
- Selected Date Range

---

## TanStack Query

Cache

- Dashboard
- History
- Weight
- Personal Records
- Charts

---

# Non-Functional Requirements

- Dashboard loads within 2 seconds.
- Cached dashboard responses under 500 ms.
- Charts remain interactive on all screen sizes.
- History supports pagination without full page reloads.
- Analytics remain consistent after new workout completion.

---

# Risks

| Risk                         | Mitigation                                                                  |
| ---------------------------- | --------------------------------------------------------------------------- |
| Expensive analytics queries  | Pre-compute common metrics and cache them in Redis.                         |
| Large workout history        | Use cursor-based pagination or infinite scrolling.                          |
| Frequent dashboard refreshes | Configure appropriate TanStack Query stale times and background refetching. |
| Inconsistent PR calculations | Centralize PR logic in a dedicated service used by all consumers.           |

---

# Dependencies

- Sprint 1 completed
- Sprint 2 completed
- Sprint 3 completed
- Sprint 4 completed
- Live Workout Engine operational
- ExerciseLog and ExerciseLogSet populated

---

# Definition of Done

Sprint 5 is complete when:

- Dashboard displays personalized statistics.
- Workout history is searchable and paginated.
- Personal Records are automatically calculated.
- Body weight can be logged and visualized.
- Charts update automatically after workouts.
- Redis caching is implemented for dashboard analytics.
- APIs are documented.
- Responsive design is complete.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 5, users will be able to:

- ✅ View a personalized dashboard
- ✅ Monitor workout streaks
- ✅ Browse complete workout history
- ✅ Review detailed workout summaries
- ✅ Track body weight over time
- ✅ View automatically calculated Personal Records
- ✅ Analyze workout volume and frequency
- ✅ Explore interactive progress charts

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 6

- Build the Recovery Engine.
- Implement muscle fatigue calculations.
- Add recovery recommendations.
- Develop weekly and monthly insight generation.
- Build muscle balance analysis.
