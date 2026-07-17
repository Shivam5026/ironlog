# 📈 Sprint 6 — Analytics Engine

## Sprint Information

| Property                   | Value                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Sprint**                 | Sprint 6                                                                                                         |
| **Sprint Goal**            | Build a centralized analytics engine that transforms workout data into actionable insights and reusable metrics. |
| **Duration**               | 2 Weeks                                                                                                          |
| **Status**                 | Planned                                                                                                          |
| **Priority**               | High                                                                                                             |
| **Estimated Story Points** | 44                                                                                                               |

---

# 🎯 Sprint Goal

Create an analytics platform that processes workout data to generate training insights, performance trends, recovery indicators, and intelligent recommendations.

By the end of this sprint, IronLog should provide meaningful analytics instead of simply displaying raw workout history.

---

# Sprint Objectives

- Build Analytics Service
- Calculate training volume
- Generate workout trends
- Analyze muscle distribution
- Track progressive overload
- Detect workout consistency
- Generate weekly & monthly reports
- Optimize analytics using Redis

---

# 📖 Linked User Stories

| Story ID | Story                |
| -------- | -------------------- |
| US-020   | Workout Analytics    |
| US-021   | Recovery Analysis    |
| US-022   | Progressive Overload |

---

# Epic 1 — Analytics Infrastructure

## Goal

Create a centralized analytics engine used throughout the application.

---

## Feature 1.1 — Analytics Service

### Backend Tasks

- [ ] Create Analytics Service
- [ ] Aggregate workout data
- [ ] Standardize analytics responses
- [ ] Add service-level caching

---

## Feature 1.2 — Analytics Repository

### Tasks

- [ ] Optimize Prisma queries
- [ ] Aggregate ExerciseLog data
- [ ] Aggregate ExerciseLogSet data
- [ ] Minimize database round trips

---

### Deliverables

Reusable analytics layer for the entire application.

---

# Epic 2 — Training Volume Analytics

## Goal

Measure overall training workload.

---

## Feature 2.1 — Workout Volume

Calculate

- Volume per workout
- Daily volume
- Weekly volume
- Monthly volume

Formula

```text id="j5l0jq"
Volume = Weight × Reps
```

Total workout volume is the sum of all completed ExerciseLogSets.

---

## Feature 2.2 — Exercise Volume

Display

- Volume per exercise
- Volume trends
- Highest-volume exercises

---

## Feature 2.3 — Muscle Group Volume

Calculate total volume for

- Chest
- Back
- Legs
- Shoulders
- Arms
- Core

---

### Deliverables

Accurate volume analytics across multiple time periods.

---

# Epic 3 — Performance Trends

## Goal

Visualize long-term training progress.

---

## Feature 3.1 — Progress Trends

Display

- Weekly improvement
- Monthly improvement
- Exercise progression
- Body weight progression

---

## Feature 3.2 — One Rep Max Trends

Track estimated 1RM over time.

Formula

```text id="gt7dgo"
Estimated 1RM = Weight × (1 + Reps / 30)
```

---

## Feature 3.3 — Exercise Progress

Display

- Best Weight
- Best Volume
- Average Reps
- Average Weight

---

### Deliverables

Historical performance tracking.

---

# Epic 4 — Progressive Overload Engine

## Goal

Identify whether users are improving over time.

---

## Feature 4.1 — Volume Comparison

Compare

- Current workout
- Previous workout
- Weekly average

---

## Feature 4.2 — Overload Detection

Detect improvements in

- Weight
- Repetitions
- Total Volume
- Estimated 1RM

---

## Feature 4.3 — Plateau Detection

Identify

- Stagnant exercises
- Declining performance
- Missed progression opportunities

---

### Deliverables

Automatic progressive overload analysis.

---

# Epic 5 — Muscle Distribution Analysis

## Goal

Measure training balance.

---

## Feature 5.1 — Muscle Frequency

Calculate

- Weekly training frequency
- Monthly training frequency

for each muscle group.

---

## Feature 5.2 — Muscle Balance

Display

- Overtrained muscles
- Undertrained muscles
- Balanced muscles

---

## Feature 5.3 — Training Heatmap

Generate muscle activity visualization based on completed workouts.

---

### Deliverables

Muscle balance analytics.

---

# Epic 6 — Consistency Analysis

## Goal

Measure training consistency.

---

## Feature 6.1 — Workout Frequency

Calculate

- Workouts per week
- Workouts per month

---

## Feature 6.2 — Workout Streak Analysis

Display

- Current streak
- Longest streak
- Active days
- Missed workout days

---

## Feature 6.3 — Workout Duration

Analyze

- Average duration
- Longest workout
- Shortest workout

---

### Deliverables

Workout consistency metrics.

---

# Epic 7 — Reports

## Goal

Generate detailed performance reports.

---

## Feature 7.1 — Weekly Report

Include

- Total workouts
- Total volume
- Muscle distribution
- Personal Records
- Average duration

---

## Feature 7.2 — Monthly Report

Include

- Workout frequency
- Best-performing exercises
- Body weight trend
- Overall progress

---

## Feature 7.3 — Report Export _(Future Ready)_

Prepare report format for

- PDF
- CSV

---

### Deliverables

Automatically generated performance reports.

---

# Epic 8 — Performance Optimization

## Goal

Ensure analytics remain fast as data grows.

---

## Feature 8.1 — Redis Analytics Cache

### Tasks

- [ ] Cache dashboard analytics
- [ ] Cache weekly reports
- [ ] Cache monthly reports
- [ ] Configure cache invalidation

---

## Feature 8.2 — TanStack Query Optimization

### Tasks

- [ ] Configure stale time
- [ ] Background refetch
- [ ] Prefetch analytics
- [ ] Retry strategies

---

### Deliverables

High-performance analytics.

---

# API Deliverables

## Analytics

| Method | Endpoint                              | Description         |
| ------ | ------------------------------------- | ------------------- |
| GET    | `/api/analytics/dashboard`            | Dashboard metrics   |
| GET    | `/api/analytics/volume`               | Volume statistics   |
| GET    | `/api/analytics/trends`               | Progress trends     |
| GET    | `/api/analytics/muscles`              | Muscle distribution |
| GET    | `/api/analytics/consistency`          | Workout consistency |
| GET    | `/api/analytics/progressive-overload` | Overload analysis   |
| GET    | `/api/analytics/reports/weekly`       | Weekly report       |
| GET    | `/api/analytics/reports/monthly`      | Monthly report      |

---

# Database Deliverables

No new tables are introduced in this sprint.

Analytics are generated using data from:

- User
- WorkoutSession
- ExerciseLog
- ExerciseLogSet
- WorkoutPlan
- WorkoutPlanExercise
- BodyWeight
- PersonalRecord

---

# Frontend Deliverables

Pages

- Analytics Dashboard
- Performance Trends
- Training Reports

Components

- Volume Chart
- Muscle Distribution Chart
- Frequency Chart
- Progress Trend Chart
- Overload Card
- Weekly Report Card
- Monthly Report Card
- Analytics Filters

---

# Backend Deliverables

Controllers

- Analytics Controller
- Reports Controller

Services

- Analytics Service
- Statistics Service
- Progressive Overload Service
- Report Generation Service
- Cache Service

Routes

- Analytics Routes
- Report Routes

---

# State Management

## Zustand

Store

- Analytics Filters
- Selected Date Range
- Report Preferences

---

## TanStack Query

Cache

- Analytics
- Reports
- Trends
- Dashboard Metrics

---

# Non-Functional Requirements

- Analytics responses should be under **500 ms** when cached.
- Reports should generate within **2 seconds**.
- Charts should update without page refresh.
- Aggregations should scale to large workout histories.
- Calculations should remain deterministic and consistent.

---

# Risks

| Risk                      | Mitigation                                                     |
| ------------------------- | -------------------------------------------------------------- |
| Heavy aggregation queries | Cache results in Redis and optimize database queries.          |
| Large workout history     | Use indexed queries and aggregated calculations.               |
| Inconsistent analytics    | Centralize all calculations in Analytics Service.              |
| High API response time    | Use background cache warming for frequently requested metrics. |

---

# Dependencies

- Sprint 1 completed
- Sprint 2 completed
- Sprint 3 completed
- Sprint 4 completed
- Sprint 5 completed
- Workout history available
- Personal Records implemented
- Redis configured

---

# Definition of Done

Sprint 6 is complete when:

- Analytics Service is implemented.
- Volume calculations are accurate.
- Progressive overload detection works.
- Muscle distribution analytics are available.
- Weekly and monthly reports are generated.
- Analytics APIs are documented.
- Charts display correct data.
- Redis caching is operational.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 6, users will be able to:

- ✅ Analyze workout volume
- ✅ Track long-term performance trends
- ✅ Monitor muscle training distribution
- ✅ Detect progressive overload
- ✅ Identify workout plateaus
- ✅ Review weekly and monthly reports
- ✅ Explore interactive analytics dashboards
- ✅ Experience fast analytics through Redis caching

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 7

- Build the Recovery Engine.
- Implement muscle fatigue calculations.
- Add recovery recommendations.
- Generate readiness scores.
- Introduce intelligent workout recommendations based on recovery and analytics.
