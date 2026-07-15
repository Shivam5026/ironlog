# 🏃 Sprint 4 — Live Workout Engine

## Sprint Information

| Property                   | Value                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sprint**                 | Sprint 4                                                                                                                                      |
| **Sprint Goal**            | Build the Live Workout Engine that enables users to execute workout plans, log workout performance in real time, and persist workout history. |
| **Duration**               | 2 Weeks                                                                                                                                       |
| **Status**                 | Planned                                                                                                                                       |
| **Priority**               | Critical                                                                                                                                      |
| **Estimated Story Points** | 45                                                                                                                                            |

---

# 🎯 Sprint Goal

Transform IronLog from a workout planner into a complete workout companion by allowing users to execute workout plans, track every exercise and set in real time, and save comprehensive workout history.

By the end of this sprint, users should be able to complete an entire workout using IronLog.

---

# Sprint Objectives

- Start workouts from saved workout plans
- Build Live Workout screen
- Log every exercise
- Log individual sets
- Implement workout timer
- Implement rest timer
- Auto-save workout progress
- Resume interrupted sessions
- Generate workout summary
- Store workout history

---

# 📖 Linked User Stories

| Story ID | Story                       |
| -------- | --------------------------- |
| US-012   | Start Workout               |
| US-013   | Log Sets & Repetitions      |
| US-014   | Rest Timer                  |
| US-015   | Previous Workout Comparison |
| US-016   | Workout History             |

---

# Epic 1 — Workout Session Lifecycle

## Goal

Manage the lifecycle of an active workout.

---

## Feature 1.1 — Start Workout

### Backend Tasks

- [ ] Create WorkoutSession model
- [ ] Start Workout API
- [ ] Generate WorkoutSession
- [ ] Associate selected WorkoutPlan
- [ ] Load WorkoutPlanExercises

### Frontend Tasks

- [ ] Start Workout button
- [ ] Initialize session
- [ ] Redirect to Live Workout page

---

## Feature 1.2 — Pause & Resume

### Tasks

- [ ] Pause session
- [ ] Resume session
- [ ] Persist session state
- [ ] Restore session after refresh

---

## Feature 1.3 — Finish Workout

### Tasks

- [ ] Finish Workout API
- [ ] Calculate duration
- [ ] Calculate workout volume
- [ ] Generate workout summary
- [ ] Save completed session

---

### Deliverables

Users can

- Start workouts
- Pause workouts
- Resume workouts
- Finish workouts

---

# Epic 2 — Exercise Logging

## Goal

Record every exercise performed during the workout.

---

## Feature 2.1 — ExerciseLog

Each ExerciseLog represents **one exercise** completed during a workout.

Example

```text
Bench Press

↓

Set 1

↓

Set 2

↓

Set 3
```

---

### Backend Tasks

- [ ] Create ExerciseLog model
- [ ] Create ExerciseLog CRUD APIs
- [ ] Link ExerciseLog to WorkoutSession
- [ ] Preserve exercise order

---

### Frontend Tasks

- [ ] Exercise Progress Card
- [ ] Exercise Logger
- [ ] Notes section
- [ ] Completed indicator

---

### Deliverables

One ExerciseLog exists for every exercise performed.

---

# Epic 3 — Set Logging Engine

## Goal

Track every individual set separately.

---

## Feature 3.1 — ExerciseLogSet

Each ExerciseLog contains multiple ExerciseLogSets.

Example

```text
ExerciseLog

Bench Press

↓

ExerciseLogSet

80 × 8

↓

ExerciseLogSet

80 × 8

↓

ExerciseLogSet

82.5 × 6
```

---

### Backend Tasks

- [ ] Create ExerciseLogSet model
- [ ] Create CRUD APIs
- [ ] Validation
- [ ] Calculate exercise volume

---

### Frontend Tasks

- [ ] Add Set
- [ ] Edit Set
- [ ] Delete Set
- [ ] Complete Set
- [ ] Duplicate Set _(optional)_

---

## Feature 3.2 — Set Configuration

Users can configure

- Weight
- Reps
- Rest Time
- Notes

---

## Feature 3.3 — Advanced Set Types

Support

- Warm-up Sets
- Working Sets
- Failure Sets

Future-ready fields

- RPE
- RIR
- Tempo

---

### Acceptance Criteria

Users can

- Add unlimited sets
- Edit sets
- Delete sets
- Complete sets
- Auto-number sets

---

# Epic 4 — Live Workout Experience

## Goal

Provide an intuitive workout interface.

---

## Feature 4.1 — Workout Timer

### Tasks

- [ ] Auto-start timer
- [ ] Pause timer
- [ ] Resume timer
- [ ] Display elapsed time

---

## Feature 4.2 — Rest Timer

### Tasks

- [ ] Auto-start after completed set
- [ ] Skip rest
- [ ] Custom rest duration
- [ ] Sound/Vibration notification _(future mobile support)_

---

## Feature 4.3 — Workout Progress

Display

- Current exercise
- Current set
- Completed exercises
- Remaining exercises
- Overall workout progress

---

# Epic 5 — Previous Performance

## Goal

Help users apply progressive overload.

---

## Feature 5.1 — Previous Workout Comparison

Display previous

- Weight
- Reps
- Sets
- Total Volume

for the same exercise.

---

## Feature 5.2 — Personal Records

Display

- Current PR
- Best Weight
- Estimated 1RM
- Best Volume

---

### Deliverables

Users always know their previous performance before lifting.

---

# Epic 6 — Auto Save & Recovery

## Goal

Prevent workout progress from being lost.

---

## Feature 6.1 — Auto Save

### Tasks

- [ ] Auto-save every completed set
- [ ] Save session every 30 seconds
- [ ] Save before closing page

---

## Feature 6.2 — Session Recovery

### Tasks

- [ ] Detect unfinished workout
- [ ] Restore workout
- [ ] Restore timers
- [ ] Restore active exercise

---

# Epic 7 — Workout Summary

## Goal

Generate workout statistics.

---

## Feature 7.1 — Workout Summary

Display

- Duration
- Exercises Completed
- Sets Completed
- Total Reps
- Total Volume

---

## Feature 7.2 — Performance Highlights

Display

- New PRs
- Volume Increase
- Workout Consistency
- Longest Streak

---

# Epic 8 — Workout History

## Goal

Store every completed workout.

---

## Feature 8.1 — Workout History

Display

- Workout Name
- Date
- Duration
- Volume

---

## Feature 8.2 — Workout Details

Display

- Exercises
- Every Set
- Notes
- Workout Summary

---

# API Deliverables

## Workout Sessions

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| POST   | `/api/workout-sessions/start`      |
| PUT    | `/api/workout-sessions/:id/pause`  |
| PUT    | `/api/workout-sessions/:id/resume` |
| POST   | `/api/workout-sessions/:id/finish` |
| GET    | `/api/workout-sessions/history`    |
| GET    | `/api/workout-sessions/:id`        |

---

## Exercise Logs

| Method | Endpoint                 |
| ------ | ------------------------ |
| POST   | `/api/exercise-logs`     |
| GET    | `/api/exercise-logs/:id` |
| PUT    | `/api/exercise-logs/:id` |
| DELETE | `/api/exercise-logs/:id` |

---

## Exercise Log Sets

| Method | Endpoint                                |
| ------ | --------------------------------------- |
| POST   | `/api/exercise-log-sets`                |
| GET    | `/api/exercise-log-sets/:exerciseLogId` |
| PUT    | `/api/exercise-log-sets/:id`            |
| DELETE | `/api/exercise-log-sets/:id`            |

---

# Database Deliverables

## WorkoutSession

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| userId        | UUID      |
| workoutPlanId | UUID      |
| status        | ENUM      |
| startedAt     | Timestamp |
| endedAt       | Timestamp |
| duration      | Integer   |
| totalVolume   | Decimal   |
| createdAt     | Timestamp |
| updatedAt     | Timestamp |

---

## ExerciseLog

Represents one exercise performed.

| Field            | Type      |
| ---------------- | --------- |
| id               | UUID      |
| workoutSessionId | UUID      |
| exerciseId       | String    |
| exerciseOrder    | Integer   |
| notes            | Text      |
| createdAt        | Timestamp |

---

## ExerciseLogSet

Represents one set performed.

| Field         | Type               |
| ------------- | ------------------ |
| id            | UUID               |
| exerciseLogId | UUID               |
| setNumber     | Integer            |
| weight        | Decimal            |
| reps          | Integer            |
| restTime      | Integer            |
| completed     | Boolean            |
| isWarmup      | Boolean            |
| isFailure     | Boolean            |
| rpe           | Decimal (nullable) |
| rir           | Integer (nullable) |
| tempo         | String (nullable)  |
| createdAt     | Timestamp          |

---

# Frontend Deliverables

Pages

- Live Workout
- Workout Summary
- Workout History
- Workout Details

Components

- Workout Timer
- Rest Timer
- Exercise Progress
- Exercise Logger
- Set Card
- Set Editor
- Previous Performance Card
- Workout Progress Indicator
- Workout Summary Card

---

# Backend Deliverables

Controllers

- WorkoutSession Controller
- ExerciseLog Controller
- ExerciseLogSet Controller

Services

- WorkoutSession Service
- ExerciseLog Service
- ExerciseLogSet Service
- WorkoutSummary Service

Routes

- WorkoutSession Routes
- ExerciseLog Routes
- ExerciseLogSet Routes

---

# State Management

## Zustand

Store

- Active Workout Session
- Active Exercise
- Active Set
- Workout Timer
- Rest Timer
- Session Recovery State

---

## TanStack Query

Cache

- Workout History
- Workout Summary
- Previous Performance
- Active Session

---

# Non-Functional Requirements

- Workout data auto-saves.
- Timers remain accurate after refresh.
- Session recovery works after browser refresh.
- Optimistic UI updates for set logging.
- Responsive on desktop and mobile.
- Minimal API requests during workouts.

---

# Risks

| Risk                           | Mitigation                                                                  |
| ------------------------------ | --------------------------------------------------------------------------- |
| Browser refresh during workout | Persist active session and recover automatically.                           |
| Timer drift                    | Calculate timers from timestamps rather than intervals.                     |
| Lost workout data              | Auto-save every completed set and periodically synchronize with the server. |
| Slow network                   | Use optimistic updates and background synchronization.                      |

---

# Dependencies

- Sprint 1 completed
- Sprint 2 completed
- Sprint 3 completed
- Workout Planner operational
- Exercise Library operational
- Authentication configured
- PostgreSQL connected
- Redis operational

---

# Definition of Done

Sprint 4 is complete when:

- Users can execute workouts from saved plans.
- Every exercise creates an ExerciseLog.
- Every set creates an ExerciseLogSet.
- Workout and rest timers work correctly.
- Auto-save functions correctly.
- Interrupted workouts can be resumed.
- Previous workout performance is displayed.
- Workout summaries are generated.
- Workout history is stored.
- APIs are documented.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 4, users will be able to:

- ✅ Start workouts from any saved workout plan
- ✅ Log every exercise performed
- ✅ Log every individual set
- ✅ Track weight, reps, and rest
- ✅ Compare current performance with previous workouts
- ✅ Auto-save workout progress
- ✅ Resume interrupted workouts
- ✅ View workout summaries
- ✅ Access complete workout history

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 5

- Build the Analytics Dashboard.
- Implement body weight tracking.
- Calculate Personal Records (PRs).
- Add training volume analytics.
- Generate weekly and monthly performance summaries.
