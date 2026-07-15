# 🏋️ Sprint 3 — Workout Planner

## Sprint Information

| Property                   | Value                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Sprint**                 | Sprint 3                                                                                                           |
| **Sprint Goal**            | Enable users to create, organize, and manage personalized workout plans using exercises from the Exercise Library. |
| **Duration**               | 2 Weeks                                                                                                            |
| **Status**                 | Planned                                                                                                            |
| **Priority**               | High                                                                                                               |
| **Estimated Story Points** | 34                                                                                                                 |

---

# 🎯 Sprint Goal

Build a complete Workout Planner that allows users to create workout plans, organize workout days, add exercises, reorder them with drag-and-drop, and manage their training routines.

By the end of this sprint, users should be able to create a complete weekly workout plan.

---

# 📌 Sprint Objectives

- Design workout planning database schema
- Create Workout Plan CRUD APIs
- Create Workout Day management
- Integrate Exercise Library
- Add drag-and-drop exercise ordering
- Implement workout duplication
- Add plan validation
- Optimize queries and caching

---

# 📖 Linked User Stories

| Story ID | Story               |
| -------- | ------------------- |
| US-009   | Create Workout Plan |
| US-010   | Edit Workout Plan   |
| US-011   | Reorder Exercises   |

---

# Epic 1 — Workout Plan Management

## Goal

Allow users to create and manage multiple workout plans.

---

## Feature 1.1 — Create Workout Plan

### Backend Tasks

- [ ] Create WorkoutPlan Prisma model
- [ ] Create validation schema
- [ ] Create Workout Plan service
- [ ] Create POST endpoint
- [ ] Authorization checks

### Frontend Tasks

- [ ] Create Workout Plan page
- [ ] Workout creation form
- [ ] Client-side validation
- [ ] Submit form
- [ ] Success notification

---

## Feature 1.2 — Edit Workout Plan

### Tasks

- [ ] Update API
- [ ] Edit page
- [ ] Prefill form
- [ ] Save changes

---

## Feature 1.3 — Delete Workout Plan

### Tasks

- [ ] Delete endpoint
- [ ] Confirmation modal
- [ ] Remove plan
- [ ] Refresh cached data

---

## Feature 1.4 — Duplicate Workout Plan

### Tasks

- [ ] Duplicate endpoint
- [ ] Copy workout days
- [ ] Copy exercises
- [ ] Rename duplicated plan

---

### Deliverables

Users can:

- Create plans
- Edit plans
- Delete plans
- Duplicate plans

---

# Epic 2 — Workout Day Management

## Goal

Allow users to organize workouts into multiple training days.

---

## Feature 2.1 — Create Workout Days

### Tasks

- [ ] Create WorkoutDay model
- [ ] Create API
- [ ] Add workout day
- [ ] Rename workout day
- [ ] Delete workout day

---

## Feature 2.2 — Day Ordering

### Tasks

- [ ] Reorder workout days
- [ ] Save order
- [ ] Update UI automatically

---

### Deliverables

Users can create:

- Push
- Pull
- Legs
- Upper
- Lower
- Custom workout days

---

# Epic 3 — Exercise Management

## Goal

Allow users to add and organize exercises inside workout days.

---

## Feature 3.1 — Add Exercises

### Backend Tasks

- [ ] WorkoutPlanExercise model
- [ ] Add Exercise API
- [ ] Validation

### Frontend Tasks

- [ ] Exercise picker modal
- [ ] Exercise search integration
- [ ] Add selected exercise

---

## Feature 3.2 — Remove Exercises

### Tasks

- [ ] Delete exercise endpoint
- [ ] Remove from workout
- [ ] Refresh UI

---

## Feature 3.3 — Replace Exercises

### Tasks

- [ ] Replace endpoint
- [ ] Exercise selector
- [ ] Preserve sets/reps/rest values

---

## Feature 3.4 — Exercise Configuration

### Tasks

Users can configure:

- Sets
- Reps
- Rest Time
- Notes

---

### Acceptance Criteria

Users can:

- Add exercises
- Remove exercises
- Replace exercises
- Configure workout parameters

---

# Epic 4 — Drag & Drop Builder

## Goal

Provide a smooth drag-and-drop workout building experience.

---

## Feature 4.1 — Exercise Ordering

### Tasks

- [ ] Integrate DnD Kit
- [ ] Drag exercise cards
- [ ] Persist order
- [ ] Keyboard accessibility

---

## Feature 4.2 — Workout Day Ordering

### Tasks

- [ ] Drag workout days
- [ ] Save ordering
- [ ] Update UI

---

### Deliverables

Drag-and-drop works for:

- Workout Days
- Exercises

---

# Epic 5 — Workout Templates

## Goal

Allow users to start from predefined workout templates.

---

## Feature 5.1 — Template Library

### Tasks

Create templates for:

- Push Pull Legs
- Upper Lower
- Arnold Split
- Bro Split
- Full Body

---

## Feature 5.2 — Apply Template

### Tasks

- [ ] Load template
- [ ] Save as user's workout
- [ ] Allow customization

---

### Deliverables

Users can generate a workout instantly from templates.

---

# Epic 6 — Planner Dashboard

## Goal

Provide an overview of all workout plans.

---

## Feature 6.1 — Workout Plan List

### Tasks

Display:

- Plan Name
- Number of Workout Days
- Number of Exercises
- Last Updated

---

## Feature 6.2 — Quick Actions

### Tasks

- [ ] Edit
- [ ] Duplicate
- [ ] Delete
- [ ] Start Workout _(disabled until Sprint 4)_

---

# API Deliverables

## Workout Plans

| Method | Endpoint                           | Description            |
| ------ | ---------------------------------- | ---------------------- |
| GET    | `/api/workout-plans`               | Get all workout plans  |
| POST   | `/api/workout-plans`               | Create workout plan    |
| GET    | `/api/workout-plans/:id`           | Get workout plan       |
| PUT    | `/api/workout-plans/:id`           | Update workout plan    |
| DELETE | `/api/workout-plans/:id`           | Delete workout plan    |
| POST   | `/api/workout-plans/:id/duplicate` | Duplicate workout plan |

---

## Workout Days

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/api/workout-days`     |
| PUT    | `/api/workout-days/:id` |
| DELETE | `/api/workout-days/:id` |

---

## Workout Exercises

| Method | Endpoint                         |
| ------ | -------------------------------- |
| POST   | `/api/workout-exercises`         |
| PUT    | `/api/workout-exercises/:id`     |
| DELETE | `/api/workout-exercises/:id`     |
| PUT    | `/api/workout-exercises/reorder` |

---

# Database Deliverables

## WorkoutPlan

- id
- userId
- name
- description
- createdAt
- updatedAt

---

## WorkoutDay

- id
- workoutPlanId
- name
- order

---

## WorkoutPlanExercise

- id
- workoutDayId
- exerciseId
- order
- sets
- reps
- restTime
- notes

---

# Frontend Deliverables

Pages

- Workout Planner
- Workout Builder
- Workout Templates

Components

- Workout Plan Card
- Workout Day Card
- Exercise Card
- Exercise Picker
- Drag Handle
- Workout Settings Panel
- Confirmation Dialog

---

# Backend Deliverables

Controllers

- WorkoutPlan Controller
- WorkoutDay Controller
- WorkoutPlanExercise Controller

Services

- Workout Planner Service
- Template Service

Routes

- Workout Plan Routes
- Workout Day Routes
- Workout Exercise Routes

---

# State Management

## Zustand

Store:

- Active Workout Plan
- Selected Workout Day
- Planner UI State

---

## TanStack Query

Cache:

- Workout Plans
- Workout Days
- Workout Exercises
- Templates

---

# Non-Functional Requirements

- Drag-and-drop interactions should feel smooth.
- Changes should be persisted immediately.
- Planner should support responsive layouts.
- All forms should provide validation feedback.
- Queries should be cached where appropriate.

---

# Risks

| Risk                                      | Mitigation                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Complex drag-and-drop interactions        | Use DnD Kit with sortable contexts and test thoroughly across devices. |
| Large workout plans affecting performance | Cache data with TanStack Query and paginate exercise searches.         |
| Accidental deletions                      | Require confirmation dialogs before destructive actions.               |
| Data inconsistency during reordering      | Wrap reorder operations in database transactions.                      |

---

# Dependencies

- Sprint 1 completed
- Sprint 2 completed
- Exercise Library available
- Authentication configured
- PostgreSQL and Prisma configured
- Redis caching operational

---

# Definition of Done

Sprint 3 is complete when:

- Users can create, edit, duplicate, and delete workout plans.
- Workout days can be managed and reordered.
- Exercises can be added, removed, replaced, and reordered.
- Workout templates are available and customizable.
- Drag-and-drop ordering persists after refresh.
- APIs are documented.
- Validation and authorization are implemented.
- Responsive layouts are complete.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 3, users will be able to:

- ✅ Create unlimited workout plans
- ✅ Organize plans into workout days
- ✅ Add exercises from the Exercise Library
- ✅ Configure sets, reps, rest time, and notes
- ✅ Reorder exercises and workout days using drag-and-drop
- ✅ Duplicate workout plans
- ✅ Start from predefined workout templates
- ✅ Manage workouts through a responsive planner interface

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 4

- Implement Live Workout Sessions.
- Create Workout Session and Exercise Log models.
- Add rest timer and workout timer.
- Enable workout logging and history.
- Connect the **Start Workout** action from the planner to the Live Workout flow.
