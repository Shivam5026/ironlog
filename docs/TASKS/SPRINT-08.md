# 🏆 Sprint 8 — Progress Photos & Achievements

## Sprint Information

| Property                   | Value                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sprint**                 | Sprint 8                                                                                                                                     |
| **Sprint Goal**            | Build a visual progress tracking system and gamification features that motivate users through achievements, milestones, and progress photos. |
| **Duration**               | 2 Weeks                                                                                                                                      |
| **Status**                 | Planned                                                                                                                                      |
| **Priority**               | Medium                                                                                                                                       |
| **Estimated Story Points** | 38                                                                                                                                           |

---

# 🎯 Sprint Goal

Increase user motivation and engagement by allowing users to visually track their body transformation and celebrate fitness milestones through an achievement system.

By the end of this sprint, users should not only see numerical progress but also visually appreciate their transformation and receive rewards for consistency and accomplishments.

---

# Sprint Objectives

- Upload progress photos
- Compare transformation over time
- Build achievement engine
- Unlock badges automatically
- Track milestones
- Create achievement gallery
- Optimize image storage
- Cache achievement progress

---

# 📖 Linked User Stories

| Story ID | Story               |
| -------- | ------------------- |
| US-018   | Progress Photos     |
| US-023   | Earn Achievements   |
| US-024   | Achievement Gallery |

---

# Epic 1 — Progress Photos

## Goal

Allow users to visually document their fitness journey.

---

## Feature 1.1 — Photo Upload

### Backend Tasks

- [ ] Configure Cloudinary integration
- [ ] Upload image API
- [ ] Delete image API
- [ ] Validate image uploads
- [ ] Optimize image sizes

---

### Frontend Tasks

- [ ] Upload interface
- [ ] Drag-and-drop upload
- [ ] Image preview
- [ ] Upload progress indicator
- [ ] Error handling

---

### Deliverables

Users can upload progress photos.

---

## Feature 1.2 — Progress Timeline

### Tasks

Display photos by:

- Date
- Month
- Year

---

### Deliverables

Timeline view of body transformation.

---

## Feature 1.3 — Before & After Comparison

### Tasks

- [ ] Image comparison slider
- [ ] Side-by-side comparison
- [ ] Full-screen viewer
- [ ] Zoom support

---

### Deliverables

Interactive transformation comparison.

---

# Epic 2 — Progress Management

## Goal

Organize progress images efficiently.

---

## Feature 2.1 — Progress Categories

Support

- Front
- Back
- Left Side
- Right Side
- Custom

---

## Feature 2.2 — Photo Metadata

Store

- Date
- Weight
- Notes

---

## Feature 2.3 — Progress Filtering

Filter by

- Date
- Category
- Month

---

### Deliverables

Well-organized photo management.

---

# Epic 3 — Achievement Engine

## Goal

Automatically unlock achievements.

---

## Feature 3.1 — Achievement Rules Engine

### Backend Tasks

- [ ] Achievement service
- [ ] Rule evaluator
- [ ] Unlock logic
- [ ] Progress tracker

---

### Deliverables

Automatic achievement processing.

---

## Feature 3.2 — Achievement Categories

Implement

### Workout

- First Workout
- 10 Workouts
- 50 Workouts
- 100 Workouts
- 500 Workouts

---

### Streak

- 3-Day Streak
- 7-Day Streak
- 30-Day Streak
- 100-Day Streak

---

### Strength

- First Personal Record
- 10 PRs
- Bench 100 kg
- Squat 140 kg
- Deadlift 180 kg

---

### Consistency

- Weekly Warrior
- Never Miss Monday
- Weekend Warrior

---

### Progress

- First Progress Photo
- 6-Month Journey
- One-Year Transformation

---

### Deliverables

Achievement catalog.

---

# Epic 4 — Achievement Gallery

## Goal

Display unlocked achievements.

---

## Feature 4.1 — Achievement Page

Display

- Earned badges
- Locked badges
- Progress percentage

---

## Feature 4.2 — Achievement Details

Display

- Description
- Unlock date
- Progress

---

### Deliverables

Achievement gallery.

---

# Epic 5 — Milestone Tracking

## Goal

Track long-term progress.

---

## Feature 5.1 — Milestones

Track

- Total Workouts
- Total Sets
- Total Reps
- Total Volume
- Total Training Hours

---

## Feature 5.2 — Body Transformation

Display

- Starting Weight
- Current Weight
- Weight Difference
- Progress Photos

---

### Deliverables

Milestone tracking.

---

# Epic 6 — Notifications & Rewards

## Goal

Celebrate achievements.

---

## Feature 6.1 — Achievement Notifications

Display

- Toast notification
- Celebration animation
- Badge earned

---

## Feature 6.2 — Progress Celebration

Celebrate

- New PR
- New Achievement
- Streak Milestone

---

### Deliverables

Reward feedback system.

---

# Epic 7 — Media Management

## Goal

Optimize image storage and delivery.

---

## Feature 7.1 — Cloudinary Optimization

### Tasks

- [ ] Automatic resizing
- [ ] Image compression
- [ ] Thumbnail generation
- [ ] Secure URLs

---

## Feature 7.2 — Lazy Loading

### Tasks

- [ ] Lazy images
- [ ] Progressive loading
- [ ] Skeleton placeholders

---

### Deliverables

Optimized image delivery.

---

# Epic 8 — Performance Optimization

## Goal

Improve responsiveness.

---

## Feature 8.1 — Redis Cache

Cache

- Achievement progress
- Achievement gallery

---

## Feature 8.2 — TanStack Query

Cache

- Progress photos
- Achievements
- Milestones

---

### Deliverables

Fast page loads.

---

# API Deliverables

## Progress Photos

| Method | Endpoint                   | Description    |
| ------ | -------------------------- | -------------- |
| GET    | `/api/progress-photos`     | Get all photos |
| POST   | `/api/progress-photos`     | Upload photo   |
| GET    | `/api/progress-photos/:id` | Get photo      |
| DELETE | `/api/progress-photos/:id` | Delete photo   |

---

## Achievements

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| GET    | `/api/achievements`          | Get achievements     |
| GET    | `/api/achievements/:id`      | Achievement details  |
| GET    | `/api/achievements/progress` | Achievement progress |

---

# Database Deliverables

## ProgressPhoto

| Field              | Type               |
| ------------------ | ------------------ |
| id                 | UUID               |
| userId             | UUID               |
| imageUrl           | String             |
| cloudinaryPublicId | String             |
| category           | ENUM               |
| weight             | Decimal (nullable) |
| notes              | Text (nullable)    |
| recordedAt         | Timestamp          |
| createdAt          | Timestamp          |

---

## Achievement

> **Seed Table (Static Data)**

| Field       | Type            |
| ----------- | --------------- |
| id          | UUID            |
| code        | String (Unique) |
| title       | String          |
| description | Text            |
| category    | ENUM            |
| icon        | String          |
| points      | Integer         |
| createdAt   | Timestamp       |

---

## UserAchievement

> **Junction Table**

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| userId        | UUID      |
| achievementId | UUID      |
| unlockedAt    | Timestamp |
| progress      | Decimal   |
| completed     | Boolean   |

---

# Frontend Deliverables

Pages

- Progress Photos
- Achievement Gallery
- Achievement Details

Components

- Photo Upload Card
- Timeline Gallery
- Before & After Slider
- Achievement Badge
- Achievement Card
- Milestone Card
- Celebration Modal
- Unlock Toast

---

# Backend Deliverables

Controllers

- ProgressPhoto Controller
- Achievement Controller

Services

- ProgressPhoto Service
- Achievement Service
- Milestone Service
- Notification Service

Routes

- Progress Photo Routes
- Achievement Routes

---

# State Management

## Zustand

Store

- Selected Photo
- Comparison Images
- Gallery Filters

---

## TanStack Query

Cache

- Progress Photos
- Achievements
- Achievement Progress
- Milestones

---

# Non-Functional Requirements

- Image uploads should complete reliably with progress feedback.
- Thumbnails should load before full-resolution images.
- Achievement unlocking should occur automatically after qualifying events.
- Gallery and achievements should remain responsive on desktop and mobile.

---

# Risks

| Risk                          | Mitigation                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Large image uploads           | Compress and resize images before upload and use Cloudinary transformations. |
| Duplicate achievement unlocks | Enforce unique user-achievement constraints and idempotent reward logic.     |
| Slow gallery loading          | Lazy load images and cache metadata.                                         |
| Excessive Cloudinary usage    | Generate optimized thumbnails and avoid unnecessary transformations.         |

---

# Dependencies

- Sprint 1 completed
- Sprint 2 completed
- Sprint 3 completed
- Sprint 4 completed
- Sprint 5 completed
- Sprint 6 completed
- Sprint 7 completed
- Cloudinary configured
- Analytics Engine operational

---

# Definition of Done

Sprint 8 is complete when:

- Users can upload and manage progress photos.
- Before & after comparison works.
- Achievement engine unlocks badges automatically.
- Achievement gallery displays earned and locked badges.
- Milestones are tracked accurately.
- Image optimization is implemented.
- APIs are documented.
- Responsive layouts are complete.
- Tests pass.
- No critical defects remain.

---

# Sprint Deliverables

At the end of Sprint 8, users will be able to:

- ✅ Upload and organize progress photos
- ✅ Compare body transformations over time
- ✅ Unlock achievements automatically
- ✅ Browse an achievement gallery
- ✅ Track long-term milestones
- ✅ Receive celebration notifications for accomplishments
- ✅ Enjoy optimized image loading and fast gallery performance

---

# Sprint Retrospective _(To be completed after Sprint completion)_

## What went well?

- _(To be completed.)_

## What could be improved?

- _(To be completed.)_

## Action Items for Sprint 9

- Improve accessibility across the application.
- Optimize frontend and backend performance.
- Add comprehensive error handling.
- Implement end-to-end testing.
- Polish UI/UX and prepare for production deployment.
