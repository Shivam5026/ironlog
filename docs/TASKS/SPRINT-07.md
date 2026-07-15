# 🧠 Sprint 7 — Recovery System

## Sprint Information

| Property                   | Value                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Sprint**                 | Sprint 7                                                                                                                                 |
| **Sprint Goal**            | Build a Recovery System that estimates muscle recovery, calculates training readiness, and provides intelligent workout recommendations. |
| **Duration**               | 2 Weeks                                                                                                                                  |
| **Status**                 | Planned                                                                                                                                  |
| **Priority**               | High                                                                                                                                     |
| **Estimated Story Points** | 46                                                                                                                                       |

---

# 🎯 Sprint Goal

Transform workout history into actionable recovery insights by estimating muscle fatigue, recovery status, and training readiness.

By the end of this sprint, users should know **what to train today** instead of only seeing what they trained previously.

---

# Sprint Objectives

- Build Recovery Engine
- Calculate muscle fatigue
- Estimate recovery percentages
- Generate readiness scores
- Recommend today's workout
- Detect overtraining
- Visualize recovery
- Cache recovery analytics

---

# 📖 Linked User Stories

| Story ID | Story                                       |
| -------- | ------------------------------------------- |
| US-021   | Recovery Analysis                           |
| US-022   | Progressive Overload _(Recovery influence)_ |

---

# Epic 1 — Recovery Engine

## Goal

Create a reusable recovery calculation engine.

---

## Feature 1.1 — Recovery Service

### Backend Tasks

- [ ] Create Recovery Service
- [ ] Aggregate ExerciseLogSet data
- [ ] Aggregate muscle workload
- [ ] Create recovery calculator
- [ ] Standardize recovery responses

---

## Feature 1.2 — Recovery Cache

### Tasks

- [ ] Redis cache
- [ ] Cache invalidation after workouts
- [ ] Background refresh

---

### Deliverables

Reusable recovery engine.

---

# Epic 2 — Muscle Fatigue Calculation

## Goal

Estimate fatigue for every muscle group.

---

## Feature 2.1 — Fatigue Model

Calculate fatigue using:

- Training volume
- Number of sets
- Exercise intensity
- Exercise frequency
- Target muscles
- Secondary muscles

---

## Feature 2.2 — Muscle Contribution

Assign workload

Example

Primary muscle

- 100%

Secondary muscle

- 40%

Stabilizer

- 20%

---

### Deliverables

Fatigue score for every muscle group.

---

# Epic 3 — Recovery Estimation

## Goal

Estimate recovery over time.

---

## Feature 3.1 — Recovery Percentage

Calculate

- Chest
- Back
- Legs
- Shoulders
- Biceps
- Triceps
- Forearms
- Core
- Glutes
- Hamstrings
- Calves

Recovery Scale

- 0–39% → Not Ready
- 40–69% → Recovering
- 70–89% → Nearly Ready
- 90–100% → Fully Recovered

---

## Feature 3.2 — Time-Based Recovery

Recovery increases gradually based on elapsed time since the last workout affecting each muscle group.

The recovery model should be configurable so it can evolve as the application improves.

---

### Deliverables

Recovery percentage for every muscle.

---

# Epic 4 — Readiness Score

## Goal

Determine whether the user is ready to train.

---

## Feature 4.1 — Daily Readiness

Generate a readiness score from:

- Recovery percentage
- Recent workout frequency
- Consecutive training days
- Workout duration trends

---

## Feature 4.2 — Readiness Levels

Display

- 🔴 Low Readiness
- 🟡 Moderate Readiness
- 🟢 High Readiness

---

### Deliverables

Overall readiness score.

---

# Epic 5 — Workout Recommendations

## Goal

Recommend what the user should train today.

---

## Feature 5.1 — Today's Recommendation

Examples

- Train Push
- Train Pull
- Train Legs
- Active Recovery
- Take a Rest Day

---

## Feature 5.2 — Exercise Recommendations

Recommend

- Alternative exercises
- Lower-fatigue options
- High-priority muscle groups

---

## Feature 5.3 — Overtraining Detection

Detect

- Excessive volume
- Consecutive heavy sessions
- Muscle groups receiving disproportionate workload

---

### Deliverables

Actionable daily workout recommendations.

---

# Epic 6 — Recovery Dashboard

## Goal

Visualize recovery information.

---

## Feature 6.1 — Recovery Cards

Display

- Recovery Percentage
- Readiness Score
- Recommended Workout
- Fatigue Level

---

## Feature 6.2 — Muscle Recovery Grid

Display

- Chest
- Back
- Legs
- Shoulders
- Arms
- Core

Each muscle displays

- Recovery %
- Last Trained
- Status

---

## Feature 6.3 — Recovery Timeline

Display

- Last Workout
- Current Recovery
- Estimated Full Recovery

---

### Deliverables

Interactive recovery dashboard.

---

# Epic 7 — Recovery Analytics

## Goal

Provide long-term recovery insights.

---

## Feature 7.1 — Recovery Trends

Track

- Average recovery time
- Muscle recovery frequency
- Weekly fatigue

---

## Feature 7.2 — Recovery Reports

Display

- Most fatigued muscle
- Fastest recovering muscle
- Training balance
- Recovery consistency

---

### Deliverables

Historical recovery analytics.

---

# Epic 8 — Performance Optimization

## Goal

Keep recovery calculations fast.

---

## Feature 8.1 — Redis Optimization

Cache

- Recovery data
- Readiness score
- Workout recommendations

---

## Feature 8.2 — TanStack Query

Cache

- Recovery dashboard
- Recovery timeline
- Recommendations

---

### Deliverables

High-performance recovery calculations.

---

# API Deliverables

## Recovery

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/recovery`                 | Overall recovery summary |
| GET    | `/api/recovery/muscles`         | Recovery by muscle group |
| GET    | `/api/recovery/readiness`       | Readiness score          |
| GET    | `/api/recovery/recommendations` | Today's recommendations  |
| GET    | `/api/recovery/timeline`        | Recovery timeline        |

---

# Database Deliverables

No new tables are introduced.

Recovery calculations use:

- WorkoutSession
- ExerciseLog
- ExerciseLogSet
- WorkoutPlanExercise
- PersonalRecord
- BodyWeight
- Exercise metadata

---

# Frontend Deliverables

Pages

- Recovery Dashboard
- Recovery Details

Components

- Readiness Score Card
- Recovery Card
- Muscle Recovery Grid
- Recovery Timeline
- Recommendation Panel
- Recovery Trend Chart
- Fatigue Indicator

---

# Backend Deliverables

Controllers

- Recovery Controller

Services

- Recovery Service
- Fatigue Service
- Recommendation Service
- Readiness Service

Routes

- Recovery Routes

---

# State Management

## Zustand

Store

- Selected Muscle Group
- Recovery Preferences

---

## TanStack Query

Cache

- Recovery Summary
- Recovery Details
- Readiness Score
- Recommendations

---

# Non-Functional Requirements

- Recovery calculations should remain deterministic.
- Cached recovery endpoints should respond in under **500 ms**.
- Recommendations should update automatically after workout completion.
- Recovery views should remain responsive on all supported devices.

---

# Risks

| Risk                          | Mitigation                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Oversimplified recovery model | Keep the calculation strategy configurable and modular for future improvements.   |
| Frequent recalculations       | Cache computed recovery values in Redis.                                          |
| Misleading recommendations    | Clearly indicate that recovery estimates are guidance, not medical advice.        |
| Large workout history         | Use aggregated analytics instead of recalculating from raw logs on every request. |

---

# Dependencies

- Sprint 1 completed
- Sprint 2 completed
- Sprint 3 completed
- Sprint 4 completed
- Sprint 5 completed
- Sprint 6 completed
- Analytics Engine operational
- Exercise metadata available

---

# Definition of Done

Sprint 7 is complete when:

- Recovery Engine is implemented.
- Muscle fatigue calculations are available.
- Recovery percentages are generated.
- Readiness score is calculated.
- Workout recommendations are displayed.
- Recovery dashboard is functional.
- APIs are documented.
- Redis caching is configured.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 7, users will be able to:

- ✅ View recovery percentages for every major muscle group
- ✅ Check their daily training readiness
- ✅ Receive personalized workout recommendations
- ✅ Identify overtrained muscle groups
- ✅ Monitor recovery trends over time
- ✅ Explore a dedicated recovery dashboard
- ✅ Benefit from fast, cached recovery analytics

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 8

- Implement Progress Photos.
- Build Achievement System.
- Introduce milestone tracking.
- Add profile enhancements.
- Prepare the application for final UI polish and release.
