# 📖 USER STORIES

## Document Information

| Property        | Value        |
| --------------- | ------------ |
| **Project**     | IronLog      |
| **Document**    | User Stories |
| **Version**     | 1.0          |
| **Methodology** | Agile Scrum  |
| **Status**      | Draft        |

---

# Purpose

This document captures the user-facing requirements for IronLog using Agile user stories.

Each story represents a user need and serves as the foundation for sprint planning, development, testing, and deployment.

Implementation details such as APIs, database schema, and technical tasks are maintained in their respective documentation and linked during development.

---

# Story Lifecycle

```text
Epic
    │
    ▼
Feature
    │
    ▼
User Story
    │
    ▼
Sprint
    │
    ▼
Development
    │
    ▼
Testing
    │
    ▼
Done
```

---

# Priority Scale

| Priority | Meaning                     |
| -------- | --------------------------- |
| Must     | Required for MVP            |
| Should   | Important but can wait      |
| Could    | Nice to have                |
| Won't    | Planned for future versions |

---

# Story Status

| Status      | Meaning                     |
| ----------- | --------------------------- |
| Backlog     | Not started                 |
| Ready       | Ready for development       |
| In Progress | Currently being implemented |
| Review      | Awaiting review             |
| Testing     | Under testing               |
| Done        | Completed                   |

---

# Story Points

Story points estimate development effort.

| Points | Complexity |
| ------ | ---------- |
| 1      | Very Small |
| 2      | Small      |
| 3      | Medium     |
| 5      | Large      |
| 8      | Very Large |
| 13     | Complex    |

---

# Epic EP-01 — Authentication

## Feature: User Authentication

---

### US-001 — Register Account

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 3       |
| Status       | Backlog |

**User Story**

> As a visitor, I want to create an account so that I can securely save and manage my workout data.

**Business Value**

Enables personalized experiences and secure access to user data.

**Acceptance Criteria**

**Scenario 1 — Successful Registration**

**Given** I am on the registration page

**When** I submit valid registration details

**Then** my account is created successfully

**And** I am redirected to the dashboard.

---

**Scenario 2 — Duplicate Email**

**Given** an account already exists with my email

**When** I submit the registration form

**Then** I receive an error indicating that the email is already registered.

**Dependencies**

- None

---

### US-002 — Login

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 2       |
| Status       | Backlog |

**User Story**

> As a registered user, I want to log into my account so that I can access my personal dashboard.

**Business Value**

Allows secure access to personal workout information.

**Acceptance Criteria**

**Given** I have a valid account

**When** I enter valid credentials

**Then** I am authenticated

**And** redirected to my dashboard.

---

### US-003 — Logout

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 1       |
| Status       | Backlog |

**User Story**

> As a logged-in user, I want to log out so that my account remains secure on shared devices.

**Acceptance Criteria**

- Active session is invalidated.
- Protected pages are no longer accessible.
- User returns to the login page.

---

# Epic EP-02 — Dashboard

## Feature: Dashboard Overview

---

### US-004 — Dashboard Summary

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 5       |
| Status       | Backlog |

**User Story**

> As a user, I want to see a summary of my workout activity so that I immediately know my current progress.

**Business Value**

Provides an overview of fitness progress without navigating through multiple pages.

**Acceptance Criteria**

The dashboard displays:

- Today's workout
- Workout streak
- Weekly progress
- Recovery status
- Recent workouts
- Personal Records

---

### US-005 — Dynamic Dashboard Updates

| Property     | Value   |
| ------------ | ------- |
| Priority     | Should  |
| Story Points | 3       |
| Status       | Backlog |

**User Story**

> As a user, I want dashboard statistics to refresh after every workout so that I always see accurate information.

---

# Epic EP-03 — Exercise Library

## Feature: Exercise Search

---

### US-006 — Search Exercises

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 3       |
| Status       | Backlog |

**User Story**

> As a user, I want to search exercises so that I can quickly find exercises relevant to my workout.

**Acceptance Criteria**

- Search results appear quickly.
- Partial search is supported.
- Empty states are handled gracefully.

---

### US-007 — Filter Exercises

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 3       |
| Status       | Backlog |

**User Story**

> As a user, I want to filter exercises by body part and equipment so that I only see exercises relevant to my needs.

---

### US-008 — Exercise Details

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 2       |
| Status       | Backlog |

**User Story**

> As a user, I want to view detailed exercise information so that I perform exercises safely and correctly.

---

# Epic EP-04 — Workout Planner

## Feature: Workout Management

---

### US-009 — Create Workout Plan

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 5       |
| Status       | Backlog |

**User Story**

> As a user, I want to create workout plans so that I can organize my weekly training.

---

### US-010 — Edit Workout Plan

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 3       |
| Status       | Backlog |

**User Story**

> As a user, I want to edit workout plans so that I can improve them over time.

---

### US-011 — Reorder Exercises

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 5       |
| Status       | Backlog |

**User Story**

> As a user, I want to drag and reorder exercises so that they match my preferred workout sequence.

---

# Epic EP-05 — Workout Sessions

## Feature: Workout Logging

---

### US-012 — Start Workout

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 2       |
| Status       | Backlog |

**User Story**

> As a user, I want to start a workout session so that I can track my workout in real time.

---

### US-013 — Log Sets & Repetitions

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 8       |
| Status       | Backlog |

**User Story**

> As a user, I want to record sets, repetitions, and weights so that I can measure progressive overload.

---

### US-014 — Rest Timer

| Property     | Value   |
| ------------ | ------- |
| Priority     | Must    |
| Story Points | 3       |
| Status       | Backlog |

**User Story**

> As a user, I want a configurable rest timer so that I maintain consistent rest periods.

---

### US-015 — Previous Workout Comparison

| Property     | Value   |
| ------------ | ------- |
| Priority     | Should  |
| Story Points | 5       |
| Status       | Backlog |

**User Story**

> As a user, I want to compare today's workout with my previous workout so that I can evaluate improvement.

---

# Epic EP-06 — Progress Tracking

## Feature: Progress Management

---

### US-016 — Workout History

**Priority:** Must • **Story Points:** 3 • **Status:** Backlog

> As a user, I want to review previous workouts so that I can monitor long-term progress.

---

### US-017 — Body Weight Tracking

**Priority:** Must • **Story Points:** 2 • **Status:** Backlog

> As a user, I want to log my body weight so that I can monitor physical changes.

---

### US-018 — Progress Photos

**Priority:** Should • **Story Points:** 5 • **Status:** Backlog

> As a user, I want to upload progress photos so that I can visually compare my physique over time.

---

### US-019 — Personal Records

**Priority:** Must • **Story Points:** 3 • **Status:** Backlog

> As a user, I want to see my personal records so that I stay motivated and measure improvement.

---

# Epic EP-07 — Analytics & Insights

---

### US-020 — Workout Analytics

**Priority:** Must • **Story Points:** 5 • **Status:** Backlog

> As a user, I want charts and statistics about my workouts so that I can better understand my training habits.

---

### US-021 — Recovery Analysis

**Priority:** Should • **Story Points:** 5 • **Status:** Backlog

> As a user, I want recovery recommendations so that I avoid overtraining.

---

### US-022 — Progressive Overload

**Priority:** Should • **Story Points:** 5 • **Status:** Backlog

> As a user, I want suggestions for increasing weight or repetitions so that I continue making progress.

---

# Epic EP-08 — Achievements

---

### US-023 — Earn Achievements

**Priority:** Could • **Story Points:** 3 • **Status:** Backlog

> As a user, I want to unlock achievements for reaching milestones so that I stay motivated.

---

### US-024 — Achievement Gallery

**Priority:** Could • **Story Points:** 2 • **Status:** Backlog

> As a user, I want to view all earned achievements so that I can celebrate my accomplishments.

---

# User Story Summary

| Epic                 |             Stories |
| -------------------- | ------------------: |
| Authentication       |                   3 |
| Dashboard            |                   2 |
| Exercise Library     |                   3 |
| Workout Planner      |                   3 |
| Workout Sessions     |                   4 |
| Progress Tracking    |                   4 |
| Analytics & Insights |                   3 |
| Achievements         |                   2 |
| **Total**            | **24 User Stories** |

---

# Definition of Done

A user story is considered **Done** when:

- All acceptance criteria are satisfied.
- Code has been reviewed.
- Unit and integration tests pass.
- Documentation is updated.
- No critical defects remain.
- Feature is deployed to the development environment.
- Product Owner (or developer, for this solo project) accepts the implementation.
