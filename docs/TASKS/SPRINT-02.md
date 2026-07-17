# 📚 Sprint 2 — Exercise Library

## Sprint Goal

Integrate the ExerciseDB API and build a comprehensive exercise library that allows users to discover, search, filter, and explore exercises for building workout plans.

---

# Sprint Summary

| Property                   | Value    |
| -------------------------- | -------- |
| **Sprint**                 | Sprint 2 |
| **Duration**               | 2 Weeks  |
| **Status**                 | Planned  |
| **Priority**               | High     |
| **Estimated Story Points** | 26       |

---

# Sprint Objectives

- Integrate the ExerciseDB API
- Build a searchable exercise library
- Implement filtering and pagination
- Cache ExerciseDB responses using Redis
- Display detailed exercise information
- Support exercise alternatives
- Optimize API performance

---

# Linked User Stories

| Story ID | User Story       |
| -------- | ---------------- |
| US-006   | Search Exercises |
| US-007   | Filter Exercises |
| US-008   | Exercise Details |

---

# Epic 1 — ExerciseDB Integration

## Goal

Integrate and manage exercise data from the ExerciseDB API through the backend.

---

## Feature 1.1 — ExerciseDB Service

### Backend Tasks

- [ ] Create ExerciseDB service
- [ ] Configure API client
- [ ] Secure API key using environment variables
- [ ] Handle API failures
- [ ] Standardize API response format

---

### Deliverables

- ExerciseDB service layer
- Configurable API client
- Error handling

---

## Feature 1.2 — Redis Caching

### Tasks

- [ ] Configure Redis
- [ ] Cache exercise list
- [ ] Cache exercise details
- [ ] Cache filter results
- [ ] Configure cache expiration
- [ ] Cache invalidation strategy

---

### Deliverables

- Redis integration
- Cached ExerciseDB responses

---

## Feature 1.3 — Data Transformation

### Tasks

- [ ] Normalize ExerciseDB response
- [ ] Remove unnecessary fields
- [ ] Standardize naming conventions
- [ ] Create DTOs

---

### Deliverables

- Consistent exercise objects across the application

---

# Epic 2 — Exercise Search

## Goal

Allow users to quickly find exercises.

---

## Feature 2.1 — Search API

### Backend Tasks

- [ ] Search endpoint
- [ ] Keyword search
- [ ] Partial matching
- [ ] Search validation

---

### Frontend Tasks

- [ ] Search input
- [ ] Debounced search
- [ ] Search suggestions
- [ ] Clear search
- [ ] Empty state

---

### Acceptance Criteria

**Scenario 1**

**Given**

The user enters an exercise name

**When**

Typing begins

**Then**

Matching exercises appear.

---

**Scenario 2**

**Given**

No exercise matches

**When**

Search completes

**Then**

An empty state message is displayed.

---

# Epic 3 — Exercise Filtering

## Goal

Allow users to narrow search results using multiple filters.

---

## Feature 3.1 — Filter by Body Part

### Tasks

- [ ] Body part filter API
- [ ] Body part dropdown
- [ ] Reset filters

---

## Feature 3.2 — Filter by Equipment

### Tasks

- [ ] Equipment endpoint
- [ ] Equipment selector

---

## Feature 3.3 — Filter by Target Muscle

### Tasks

- [ ] Target muscle endpoint
- [ ] Target muscle selector

---

## Feature 3.4 — Multiple Filters

### Tasks

- [ ] Combine filters
- [ ] Update URL query parameters
- [ ] Preserve filters after refresh

---

### Acceptance Criteria

Users can:

- Filter by body part
- Filter by equipment
- Filter by target muscle
- Combine multiple filters
- Clear filters

---

# Epic 4 — Exercise Listing

## Goal

Display exercises in an intuitive and responsive layout.

---

## Feature 4.1 — Exercise Cards

### Tasks

- [ ] Exercise card
- [ ] Exercise thumbnail
- [ ] Target muscle
- [ ] Equipment
- [ ] Body part
- [ ] Favorite button _(placeholder)_

---

## Feature 4.2 — Pagination

### Tasks

- [ ] Backend pagination
- [ ] Pagination controls
- [ ] Items per page
- [ ] Loading skeletons

---

## Feature 4.3 — Responsive Grid

### Tasks

- [ ] Mobile layout
- [ ] Tablet layout
- [ ] Desktop grid
- [ ] Empty state

---

### Deliverables

Responsive Exercise Library page.

---

# Epic 5 — Exercise Details

## Goal

Provide complete information about each exercise.

---

## Feature 5.1 — Exercise Detail Page

### Backend Tasks

- [ ] Exercise detail endpoint

---

### Frontend Tasks

- [ ] Detail page
- [ ] GIF animation
- [ ] Instructions
- [ ] Equipment
- [ ] Body part
- [ ] Target muscle
- [ ] Secondary muscles

---

## Feature 5.2 — Alternative Exercises

### Tasks

- [ ] Fetch related exercises
- [ ] Show alternatives
- [ ] Navigate to selected alternative

---

### Acceptance Criteria

Exercise page displays:

- Exercise name
- Animation
- Instructions
- Equipment
- Body part
- Target muscle
- Secondary muscles
- Alternative exercises

---

# Epic 6 — Performance Optimization

## Goal

Deliver a fast browsing experience.

---

## Feature 6.1 — TanStack Query

### Tasks

- [ ] Configure exercise queries
- [ ] Background refetching
- [ ] Query invalidation
- [ ] Stale time
- [ ] Cache time

---

## Feature 6.2 — Lazy Loading

### Tasks

- [ ] Lazy routes
- [ ] Suspense
- [ ] Code splitting

---

## Feature 6.3 — Image Optimization

### Tasks

- [ ] Lazy load GIFs
- [ ] Placeholder images
- [ ] Fallback images

---

# API Deliverables

## Exercise Endpoints

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| GET    | `/api/exercises`                  | Get paginated exercises   |
| GET    | `/api/exercises/search`           | Search exercises          |
| GET    | `/api/exercises/:id`              | Get exercise details      |
| GET    | `/api/exercises/body-part/:name`  | Filter by body part       |
| GET    | `/api/exercises/equipment/:name`  | Filter by equipment       |
| GET    | `/api/exercises/target/:name`     | Filter by target muscle   |
| GET    | `/api/exercises/:id/alternatives` | Get alternative exercises |

---

# Frontend Deliverables

Pages

- Exercise Library
- Exercise Detail

Components

- Search Bar
- Filter Panel
- Exercise Card
- Pagination
- Skeleton Loader
- Empty State
- Exercise Detail Card
- Alternative Exercise Card

---

# Backend Deliverables

Services

- ExerciseDB Service
- Redis Cache Service

Controllers

- Exercise Controller

Routes

- Exercise Routes

Utilities

- Response Formatter
- Cache Helpers

---

# Non-Functional Requirements

- Exercise search should respond in under **500 ms** when cached.
- Filters should update without full page refresh.
- Pagination should not reload the application.
- Responsive layout for desktop, tablet, and mobile.
- Graceful handling of API failures.

---

# Risks

| Risk                    | Mitigation                                 |
| ----------------------- | ------------------------------------------ |
| ExerciseDB API downtime | Serve cached Redis data whenever possible. |
| Slow API responses      | Use Redis caching and TanStack Query.      |
| Large payload size      | Implement pagination and lazy loading.     |
| Broken GIF URLs         | Display fallback placeholders.             |

---

# Dependencies

- Sprint 1 completed
- Better Auth configured
- PostgreSQL connected
- Redis running
- ExerciseDB API key configured

---

# Definition of Done

Sprint 2 is complete when:

- ExerciseDB integration is functional.
- Search works correctly.
- Filters work independently and together.
- Pagination is implemented.
- Exercise detail page is complete.
- Redis caching is operational.
- TanStack Query caching is configured.
- Responsive design is complete.
- APIs are documented.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 2, users will be able to:

- ✅ Browse all exercises
- ✅ Search exercises instantly
- ✅ Filter by body part, equipment, and target muscle
- ✅ View detailed exercise information
- ✅ Discover alternative exercises
- ✅ Experience fast loading through Redis and TanStack Query caching
- ✅ Navigate a fully responsive Exercise Library

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 3

- Finalize Workout Planner data model.
- Begin Workout Builder implementation.
- Integrate Exercise Library with Workout Planner.
