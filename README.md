# Zentra

> Plan, track, and collaborate — workspaces with projects, a kanban task board, and role-based membership.

<div align="center">

[![Node](https://img.shields.io/badge/Node-22-43853d?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-13aa52?logo=mongodb)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-5-43853d?logo=express)](https://expressjs.com)

[GitHub](https://github.com/ayushbag/zentra) · 📄 [Frontend Interview Guide](./docs/FRONTEND_INTERVIEW_GUIDE.md) · 🗺️ [Implementation Plan](./docs/FRONTEND_IMPLEMENTATION_PLAN.md)

</div>

---

## Overview

**Zentra** is a workspace-based project management app with a kanban task board, role-based membership, and Google / email auth. It's a full-stack MERN + TypeScript app:

- **Workspaces** group related projects, members, and tasks.
- Each workspace has **projects**, and each project has a **kanban board** of tasks (Backlog → To Do → In Progress → In Review → Done).
- **Roles** (Owner / Admin / Member) gate UI elements on the frontend and are enforced by `roleGuard` on every protected route server-side.
- Auth is **cookie-based** (Passport.js, local + Google OAuth 2.0) — no tokens in localStorage.

---

## Features

- 🔐 Authentication — email/local login (Passport local) and Sign in with Google (OAuth 2.0)
- 👥 Team management — workspaces with users, roles, role change, and invite-by-code joining
- 📂 Project management — CRUD within a workspace, paginated lists, emoji picker, analytics
- ✅ Task tracking — kanban board, create/edit modal, filters (status, priority, assignee, keyword, due date), board + task analytics
- 🎨 Modern UI — Tailwind CSS v4, hand-rolled UI primitives, Sonner toasts, loading skeletons, empty states
- 🌐 Same-origin dev proxy — Vite proxies `/api` to the backend so auth cookies never cross origin in dev

---

## Tech Stack

| Area | Choices |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4, TanStack Query v5, React Router v7 |
| Forms | React Hook Form + Zod (shared validation shape with the backend) |
| HTTP | Axios — `withCredentials`, global 401 interceptor, typed API wrappers |
| UI | Hand-rolled components (button, field, select, modal, dropdown, badge/avatar, skeleton, confirm-dialog), Lucide icons, Sonner toasts |
| Backend | Node.js, Express 5, TypeScript, MongoDB + Mongoose |
| Auth / sessions | cookie-session + Passport.js (local strategy + Google OAuth 2.0) |
| Validation | Zod schemas per route |
| Permissions | Server-side `roleGuard` on every protected controller |
| CI / Infra | GitHub, Docker (optional) |

---

## Architecture

```
User (browser :3000)
   │
   ▼
React SPA  ← Vite dev proxy forwards /api → http://localhost:5000
   │  (withCredentials → session cookie auto-sent)
   │
   ▼
Express API  :5000
   ├── Passport initializes session
   ├── cookie-session stores the session in a cookie (httpOnly, sameSite=lax)
   ├── isAuthenticated middleware → guards /user, /workspace, /project, /task, /member
   └── roleGuard checks membership + permission on each protected route
   │
   ▼
MongoDB  (Mongoose models: User, Workspace, Project, Task, Member, Role, Account)
```

**Why the same-origin proxy matters:** in dev the frontend runs on `:3000` and the backend on `:5000`. The Vite config proxies `"/api"` → `http://localhost:5000`, so every API call is same-origin from the browser's point of view and the auth cookie is sent automatically.

**Why cookies over JWT in localStorage:** `httpOnly` cookies can't be read by injected scripts (XSS can't steal the session). No refresh-token, expiry, or silent-refresh logic in the frontend. The trade-off is CSRF risk, mitigated by `sameSite=lax`, CORS pinned to one origin, and `credentials: true` on the client.

---

## Screenshots

> Add 2–4 screenshots or GIFs here later — one per key screen:
> - Login / Register
> - Workspaces list or workspace switcher
> - Dashboard / project list
> - Kanban task board

Until then, the app is live locally once both servers start (see below).

---

## Getting Started

### Prerequisites

- **Node.js 18+** (and npm)
- **MongoDB** — either a local instance or a MongoDB Atlas cluster URI
- **Google OAuth credentials** (optional, for "Sign in with Google"): a Google Cloud Console project with an OAuth 2.0 Client ID (`Web application`) whose **Authorized redirect URIs** include `http://localhost:3000/api/auth/google/callback`

### Installation

```bash
# ---------- Backend ----------
cd backend
npm install

# ---------- Frontend ----------
cd ../frontend
npm install
```

### Environment variables

Copy `.env.example` to `.env` in the `backend/` folder and fill the real values.

**Backend `.env` (required):**

```env
PORT=5000
NODE_ENV=development

# MongoDB URI — Atlas or local
MONGO_URI=mongodb://<user>:<pass>@cluster0.xxx.mongodb.net/dbname

# Session cookie secret — set a real random string in production
SESSION_SECRET=
SESSION_EXPIRES_IN=1d

# Google OAuth (optional — Sign in with Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Same-origin overrides so cookies & redirects land on the React app
FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

> The backend's `getEnv()` throws on missing required vars. In dev `SESSION_SECRET` is left empty only if you intend to test without sessions — for a working app, set it. `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are optional; without them, only email/local login works.

### Running locally

```bash
# Terminal 1 — backend
cd backend
npm run seed      # seed roles (OWNER, ADMIN, MEMBER) — idempotent when the DB is empty
npm run dev       # Express on :5000 (tsc-watch recompiles on src changes)

# Terminal 2 — frontend
cd frontend
npm run dev       # Vite on :3000, /api proxied to :5000 automatically
```

Then open **http://localhost:3000**. Create an account, log in, or use Sign in with Google.

---

## API

Base path: `/api` (same-origin via Vite proxy in dev).

| Area | Method | Endpoint | Notes |
|---|---|---|---|
| Auth | POST | `/auth/register` | `{ name, email, password }` → 201 |
| Auth | POST | `/auth/login` | `{ email, password }` → sets cookie, returns user |
| Auth | POST | `/auth/logout` | clears session cookie |
| Auth | GET | `/auth/google` | kicks off Google OAuth (redirect to Google) |
| Auth | GET | `/auth/google/callback` | Passport callback → redirect to frontend on success |
| User | GET | `/user/current` | protected — current user (populated currentWorkspace) |
| Workspace | POST | `/workspace/create/new` | `{ name, description? }` → 201 |
| Workspace | GET | `/workspace/all` | all workspaces the logged-in user is a member of |
| Workspace | GET | `/workspace/:id` | title + members (populated) |
| Workspace | PUT | `/workspace/update/:id` | `{ name, description? }` |
| Workspace | PUT | `/workspace/change/member/role/:id` | `{ memberId, roleId }` — role change |
| Workspace | GET | `/workspace/members/:id` | members + roles (populated) |
| Workspace | GET | `/workspace/analytics/:id` | `{ totalTasks, overdueTasks, completedTasks }` |
| Workspace | DELETE | `/workspace/delete/:id` | cascade-deletes projects/tasks, clears member records |
| Project | POST | `/project/workspace/:workspaceId/create` | `{ name, description?, emoji? }` |
| Project | GET | `/project/workspace/:workspaceId/all` | paginated — `?pageSize=10&pageNumber=1` |
| Project | GET | `/project/:id/workspace/:workspaceId` | single project |
| Project | PUT | `/project/:id/workspace/:workspaceId/update` | `{ name, description?, emoji? }` |
| Project | DELETE | `/project/:id/workspace/:workspaceId/delete` | cascade-deletes tasks |
| Project | GET | `/project/:id/workspace/:workspaceId/analytics` | task analytics by aggregation |
| Task | POST | `/task/projects/:projectId/workspace/:workspaceId/create` | `{ title, description?, status, priority, assignedTo?, dueDate? }` |
| Task | GET | `/task/workspace/:workspaceId/all` | filtered/paginated — status, priority, assignee, keyword, dueDate |
| Task | GET | `/task/:id/project/:projectId/workspace/:workspaceId` | single task (populated assignee) |
| Task | PUT | `/task/:id/projects/:projectId/workspace/:workspaceId/update` | same shape as create |
| Task | DELETE | `/task/:id/workspace/:workspaceId/delete` | |
| Member | GET | `/member/workspace/:inviteCode/join` | user joins workspace by invite code |

For a faithful TypeScript mirror of every payload and response, see the implementation plan:

> 📄 [Frontend Implementation Plan](./docs/FRONTEND_IMPLEMENTATION_PLAN.md)

---

## Project Structure

```
.
├── backend/               # Express API + Mongoose (port 5000)
│   ├── src/
│   │   ├── controllers/   # route handlers (auth, user, workspace, project, task, member)
│   │   ├── routes/        # Express routers
│   │   ├── models/        # Mongoose models (User, Workspace, Project, Task, Member, Role, Account)
│   │   ├── enums/         # Roles, Permissions, TaskStatus, TaskPriority
│   │   ├── middlewares/   # isAuthenticated, error handler
│   │   ├── validation/    # Zod schemas per route
│   │   ├── services/      # business logic (create workspace, member role, analytics, etc.)
│   │   ├── utils/         # rules-permission, bcrypt, app-error, uuid, get-env
│   │   ├── config/        # app, http, db, passport
│   │   └── seeders/       # role.seeder.ts
│   ├── .env / .env.example
│   └── package.json
│
├── frontend/              # React 19 + Vite 8 (port 3000)
│   ├── src/
│   │   ├── api/           # axios instance + typed API functions (auth, user, workspace, project, task, member)
│   │   ├── components/
│   │   │   ├── ui/        # primitives: button, field, select, modal, dropdown, badge/avatar, skeleton, confirm-dialog
│   │   │   ├── layout/    # app-layout, sidebar, header, auth-layout
│   │   │   ├── workspace/ # switcher, create/edit modal, invite modal
│   │   │   ├── project/   # project-card, create/edit modal
│   │   │   └── task/      # task-card, task-modal, task-filter-bar
│   │   ├── hooks/         # use-auth, use-workspaces, use-projects, use-tasks
│   │   ├── context/       # auth-context, workspace-context
│   │   ├── pages/         # login, register, google-callback, root-redirect, workspaces-home, workspace-dashboard, workspace-members, projects-page, project-detail-page, join-workspace, not-found
│   │   ├── routes/        # index (route table), protected-route, guest-route
│   │   ├── lib/           # query-keys (factory), constants (roles/status/priority maps), utils (cn, hasPermission, ref resolvers)
│   │   ├── types/         # all shared TypeScript types (mirror of backend models/payloads)
│   │   ├── App.tsx        # providers + router + Toaster
│   │   └── main.tsx       # entry
│   ├── docs/
│   │   ├── FRONTEND_IMPLEMENTATION_PLAN.md
│   │   └── FRONTEND_INTERVIEW_GUIDE.md
│   └── package.json
│
├── README.md
└── .gitignore
```

**Data flow rule (frontend):** `api/*.api.ts` → `hooks/` (TanStack queries + mutations) → `pages/` (composition) → `components/` (presentation). Components never call axios directly.

