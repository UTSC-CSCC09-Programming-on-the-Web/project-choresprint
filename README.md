# Project Name

**ChoreSprint**

---

## Team Members

- Orhan Cangurel — `orhan.cangurel@mail.utoronto.ca`, utorid: _cangurel_
- John Cho — `johnlee.cho@mail.utoronto.ca`, utorid: _chojohn1_

---

## Brief Description of the Web Application

**ChoreSprint** is a chore management platform that gamifies task distribution and verification in shared households. Each week, users join a real-time **chore draft** to fairly claim tasks. After completing a chore, users upload a **photo as proof**, which is analyzed by an **external AI model** to verify whether the chore appears complete.

Chores are worth **points**, and users earn these points upon successful completion and approval. A **weekly/monthly leaderboard** highlights top contributors to encourage consistency and accountability.

The application requires users to sign in via **OAuth 2.0** (Google) and maintain an active **Stripe Checkout subscription**. It will be publicly accessible and containerized using **Docker**.

---

## Frontend Framework

- Vue 3

---

## Backend and Database

- **Express.js** backend
- **PostgreSQL** as main database
- **Prisma** ORM for database modeling and queries

---

## Additional Requirement of Choice: Task Queue

To enable asynchronous AI-based photo verification, the app will include a **task queue system**:

- When a user uploads a photo for a completed chore, the backend enqueues a job
- The job sends the photo to an external AI model (e.g., OpenAI or Gemini)
- Based on the response, the app either:
  - Auto-approves the chore
  - Flags it for manual review by housemates
- This allows photo verification to scale independently of user requests

---

## Milestones

### Alpha Version Milestone

_Goal: Core backend endpoints and static UI setup_

- Frontend scaffold with routing
- Express backend with PostgreSQL using Prisma ORM
- Database models for User, House, Chore with Prisma
- Implement basic backend REST endpoints: CRUD of User, House, Chore
- UI for dashboard, chore list, and draft lobby
- Google OAuth 2.0 login flow

---

### Beta Version Milestone

_Goal: Full app logic, authentication, real-time, AI photo verification, and payments_

- OAuth 2.0 login integration (Google)
- Create/join houses via invite links
- Add/view/complete chores in a house
- Real-time **chore draft lobby** using WebSockets
- Stripe Checkout sandbox integration and payment enforcement
- Upload photos for completed chores
- Send photos to **external AI model** for chore verification
- Flag or approve chores based on AI results
- Docker + Docker Compose setup (frontend, backend, Postgres)
- Task queue system for photo processing
- Implement **leaderboard** to track user points and completion stats

---

### Final Version

_Goal: Chore Court, UI polish, deployment, and documentation_

- Implement **Chore Court** UI for peer voting on flagged chores
- Weekly reset system + optional leaderboard/digest
- Mobile responsiveness and UI polish
- Final VM deployment with HTTPS and public access
- CI/CD setup and Docker image builds
- Submission documentation and code cleanup

---
