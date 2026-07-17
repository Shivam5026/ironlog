# 📄 REQUIREMENTS

## Document Information

| Property     | Value                      |
| ------------ | -------------------------- |
| **Project**  | IronLog                    |
| **Document** | Requirements Specification |
| **Version**  | 1.0                        |
| **Status**   | Draft                      |
| **Author**   | Shivam Vishwakarma         |

---

# 1. Introduction

This document defines the functional and non-functional requirements for **IronLog**, a full-stack workout tracking platform.

The purpose of this document is to establish a clear understanding of what the application must do before implementation begins. These requirements serve as the foundation for user stories, sprint planning, API design, database modeling, testing, and future enhancements.

---

# 2. Project Goals

The system shall:

- Allow users to securely manage accounts.
- Help users create and manage workout plans.
- Allow users to search and learn exercises.
- Enable live workout logging.
- Track workout history and performance.
- Provide insightful workout analytics.
- Encourage progressive overload.
- Promote workout consistency through streaks and achievements.

---

# 3. User Roles

## 3.1 Guest

A guest user can:

- View the landing page.
- Register.
- Login.

Guests cannot access workout data.

---

## 3.2 Registered User

A registered user can:

- Manage profile information.
- Create workout plans.
- Search exercises.
- Perform workout sessions.
- View analytics.
- Track progress.
- Upload progress photos.
- Earn achievements.

---

# 4. Functional Requirements

## 4.1 Authentication

### FR-001

The system shall allow users to register using:

- Name
- Email
- Password

---

### FR-002

The system shall allow users to securely log in.

---

### FR-003

The system shall maintain authenticated sessions.

---

### FR-004

The system shall allow users to log out.

---

### FR-005

The system shall protect authenticated routes.

---

## 4.2 User Profile

### FR-006

The system shall allow users to update:

- Name
- Height
- Weight
- Fitness Goal
- Experience Level

---

### FR-007

The system shall display user statistics.

---

## 4.3 Dashboard

### FR-008

The dashboard shall display:

- Today's workout
- Workout streak
- Weekly progress
- Recovery status
- Recent activity
- Personal records

---

### FR-009

The dashboard shall update dynamically after workouts.

---

## 4.4 Exercise Library

### FR-010

The system shall retrieve exercises from ExerciseDB.

---

### FR-011

Users shall be able to search exercises.

---

### FR-012

Users shall filter exercises by:

- Body Part
- Target Muscle
- Equipment

---

### FR-013

The system shall display:

- Exercise GIF
- Instructions
- Equipment
- Target Muscle
- Secondary Muscles

---

### FR-014

The system shall suggest alternative exercises.

---

## 4.5 Workout Planner

### FR-015

Users shall create workout plans.

---

### FR-016

Users shall edit workout plans.

---

### FR-017

Users shall delete workout plans.

---

### FR-018

Users shall reorder exercises using drag-and-drop.

---

### FR-019

Users shall replace exercises.

---

### FR-020

Users shall create multiple workout plans.

---

## 4.6 Workout Session

### FR-021

Users shall start a workout session.

---

### FR-022

Users shall log:

- Sets
- Repetitions
- Weight

---

### FR-023

Users shall pause and resume workout sessions.

---

### FR-024

The system shall include a configurable rest timer.

---

### FR-025

The system shall display previous workout performance.

---

### FR-026

Users shall complete and save workout sessions.

---

## 4.7 Progress Tracking

### FR-027

Users shall track body weight.

---

### FR-028

Users shall upload progress photos.

---

### FR-029

Users shall view workout history.

---

### FR-030

Users shall view personal records.

---

### FR-031

Users shall view estimated One Rep Max.

---

## 4.8 Analytics

### FR-032

The system shall calculate training volume.

---

### FR-033

The system shall display workout frequency.

---

### FR-034

The system shall display muscle distribution.

---

### FR-035

The system shall generate weekly summaries.

---

### FR-036

The system shall display workout duration trends.

---

## 4.9 Recovery Tracking

### FR-037

The system shall estimate muscle recovery.

---

### FR-038

The system shall indicate recovery status for trained muscle groups.

---

### FR-039

The system shall recommend rest or training based on recovery.

---

## 4.10 Smart Insights

### FR-040

The system shall recommend progressive overload.

---

### FR-041

The system shall detect workout plateaus.

---

### FR-042

The system shall identify muscle imbalances.

---

## 4.11 Achievements

### FR-043

The system shall reward achievements.

Examples include:

- First Workout
- 7-Day Streak
- New PR
- 100 Workouts

---

### FR-044

Users shall view earned achievements.

---

# 5. Non-Functional Requirements

## Performance

### NFR-001

The application shall load major pages within **2 seconds** under normal network conditions.

---

### NFR-002

API responses should average under **500 milliseconds** for cached requests.

---

### NFR-003

Exercise search results should appear quickly with cached data where applicable.

---

## Scalability

### NFR-004

The architecture shall support future feature expansion without major redesign.

---

### NFR-005

The backend shall support thousands of workout records per user.

---

## Security

### NFR-006

Passwords shall never be stored in plain text.

---

### NFR-007

Protected routes shall require authentication.

---

### NFR-008

All user input shall be validated.

---

### NFR-009

Sensitive configuration values shall be stored in environment variables.

---

### NFR-010

The API shall implement rate limiting to reduce abuse.

---

## Reliability

### NFR-011

Workout data shall persist even after page refreshes.

---

### NFR-012

Unexpected server errors shall return standardized error responses.

---

## Usability

### NFR-013

The interface shall be responsive across desktop, tablet, and mobile devices.

---

### NFR-014

The application shall provide meaningful loading and error states.

---

### NFR-015

Navigation shall remain intuitive and consistent throughout the application.

---

## Maintainability

### NFR-016

The project shall follow a modular folder structure.

---

### NFR-017

Business logic shall be separated from controllers.

---

### NFR-018

Reusable functionality shall be extracted into custom hooks, services, and utility modules.

---

## Compatibility

### NFR-019

The latest versions of Chrome, Firefox, Edge, and Safari should be fully supported.

---

# 6. External Dependencies

The project depends on:

- ExerciseDB API
- Cloudinary
- PostgreSQL
- Redis
- Better Auth

---

# 7. Assumptions

The following assumptions are made:

- Users have internet access.
- ExerciseDB API remains available.
- PostgreSQL database is accessible.
- Redis is configured correctly.
- Cloudinary credentials are valid.

---

# 8. Constraints

Current project constraints include:

- Single-user accounts only.
- English language interface.
- Web platform only.
- No wearable device integration in Version 1.
- No nutrition tracking in Version 1.

---

# 9. Future Requirements

The following features are intentionally excluded from Version 1 but planned for future releases:

- AI workout coach
- Nutrition tracking
- Meal planning
- Mobile application
- Push notifications
- Google Fit integration
- Apple Health integration
- Garmin integration
- Smartwatch synchronization
- Coach dashboard
- Social features
- Workout sharing
- Team training
- Offline mode
- Progressive Web App (PWA)

---

# 10. Requirement Traceability

| Module            | Requirement IDs |
| ----------------- | --------------- |
| Authentication    | FR-001 → FR-005 |
| User Profile      | FR-006 → FR-007 |
| Dashboard         | FR-008 → FR-009 |
| Exercise Library  | FR-010 → FR-014 |
| Workout Planner   | FR-015 → FR-020 |
| Workout Session   | FR-021 → FR-026 |
| Progress Tracking | FR-027 → FR-031 |
| Analytics         | FR-032 → FR-036 |
| Recovery          | FR-037 → FR-039 |
| Smart Insights    | FR-040 → FR-042 |
| Achievements      | FR-043 → FR-044 |

---

# 11. Definition of Done

A feature is considered complete when:

- Functional requirements are implemented.
- Validation is complete.
- APIs return expected responses.
- Database operations succeed.
- Error handling is implemented.
- UI is responsive.
- Loading and empty states are handled.
- Tests pass.
- Documentation is updated.
- Code has been reviewed and refactored where necessary.
