# AI Project Management Tool

A complete, production-ready full-stack project management application built with the MERN stack (MongoDB, Express, React, Node.js). Features role-based authentication, Kanban boards, live dashboards, task tracking, and PDF reporting.

![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![React](https://img.shields.io/badge/react-18.3-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Running the App](#running-the-app)
8. [Sample / Seed Data](#sample--seed-data)
9. [API Documentation](#api-documentation)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Git Commands](#git-commands)
13. [Screenshots](#screenshots)
14. [Future Enhancements](#future-enhancements)
15. [License](#license)

---

## Overview

This application lets teams plan, assign, and track work across projects. Admins create projects, assign tasks to team members, and monitor progress through dashboards and reports. Team members manage their assigned tasks, update status via a drag-and-drop Kanban board, and collaborate through comments.

---

## Features

**Authentication & Authorization**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin / Team Member)
- Protected routes on both frontend and backend

**Project Management**
- Full CRUD for projects (title, description, dates, priority, status)
- Automatic progress % calculation based on completed tasks
- Team member assignment per project
- Search projects by name/description, filter by status & priority

**Task Management**
- Full CRUD for tasks with priority, status, deadlines, estimated/actual hours
- Kanban board with drag-and-drop status updates (To Do → In Progress → Review → Completed)
- Task comments/discussion thread
- File attachments per task

**Dashboard & Analytics**
- Live stats: total/completed/pending projects, today's & upcoming deadlines, overdue tasks
- Pie chart (tasks by status), bar charts (tasks by priority, projects by status)
- Recent activity feed

**Reports**
- Completed vs. pending task report
- Project progress report
- Employee performance report (completion rate, on-time %, hours)
- One-click PDF export for every report

**Notifications**
- In-app notification bell with unread count
- Triggers: task assignment, task completion (event-driven, instant)
- Triggers: upcoming deadlines (within 24h) and overdue tasks (background job, runs hourly via `node-cron`, deduplicated so the same task doesn't re-notify within 24h)

**UI/UX**
- Fully responsive layout (desktop, tablet, mobile)
- Dark mode / light mode toggle
- Toast notifications for all actions
- Confirmation dialogs for destructive actions
- Pagination on all list views
- Collapsible sidebar navigation

**Security**
- Helmet for secure HTTP headers
- express-mongo-sanitize (NoSQL injection protection)
- xss-clean (XSS protection)
- express-rate-limit (brute-force / DoS mitigation)
- express-validator on every write endpoint

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Axios, Chart.js, React Icons, React Toastify, jsPDF |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT, bcryptjs |
| Security | Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean |
| Testing | Jest, Supertest |

---

## Folder Structure

```
project-management-tool/
├── client/                      # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Spinner, Modal, Badge, Pagination, EmptyState, ConfirmDialog
│   │   │   ├── layout/          # Sidebar, Topbar, DashboardLayout, ProtectedRoute
│   │   │   ├── dashboard/       # StatCard, Charts
│   │   │   ├── projects/        # ProjectForm
│   │   │   ├── tasks/           # TaskFormModal, TaskDetailModal
│   │   │   └── kanban/          # KanbanCard
│   │   ├── pages/                # Home, Login, Register, Dashboard, Projects,
│   │   │                          # ProjectDetails, CreateProject, EditProject,
│   │   │                          # Tasks, KanbanBoard, Users, Reports, Profile,
│   │   │                          # Settings, NotFound
│   │   ├── context/               # AuthContext, ThemeContext
│   │   ├── services/              # api.js (axios instance) + per-resource services
│   │   ├── hooks/                 # useAuth, useTheme, useDebounce
│   │   ├── utils/                 # helpers.js, validation.js, pdfExport.js
│   │   ├── tests/                 # Component + utility unit tests (Jest/RTL)
│   │   ├── assets/                # styles.css (global theme)
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── server/                       # Node/Express backend
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/               # Route handler logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   ├── dashboardController.js
│   │   ├── notificationController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + role authorize
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   ├── validators.js         # express-validator rule sets
│   │   └── upload.js             # multer config
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Notification.js
│   ├── routes/                   # Express routers
│   ├── utils/
│   │   └── seeder.js             # Sample data seed script
│   ├── tests/
│   │   └── api.test.js
│   ├── uploads/                  # Uploaded file storage (gitignored)
│   ├── .env.example
│   ├── server.js                 # App entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier is enough) — or a local MongoDB instance
- [Git](https://git-scm.com/)

### 1. Clone / extract the project

```bash
# If you received this as a zip, extract it, then:
cd project-management-tool
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Environment Variables

### Backend — `server/.env`

Copy the example file and fill in your values:

```bash
cd server
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API server runs on | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.mongodb.net/pmt_db` |
| `JWT_SECRET` | Long random string used to sign JWTs | *(generate your own)* |
| `JWT_EXPIRE` | Token expiry duration | `7d` |
| `CLIENT_URL` | Frontend origin, for CORS | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `200` |

> Generate a strong `JWT_SECRET` with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Getting a MongoDB Atlas connection string

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Under **Database Access**, create a user with a password
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) for development, or your specific deploy IPs for production
4. Click **Connect → Drivers**, copy the connection string, and replace `<username>`, `<password>`, and add your database name before the `?`

### Frontend — `client/.env`

```bash
cd client
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## Running the App

### Development (two terminals)

**Terminal 1 — backend:**
```bash
cd server
npm run dev      # starts with nodemon on http://localhost:5000
```

**Terminal 2 — frontend:**
```bash
cd client
npm start        # starts on http://localhost:3000
```

The React dev server proxies API calls to `REACT_APP_API_URL` from your `.env`.

### Production build

```bash
cd client
npm run build     # outputs static files to client/build

cd ../server
npm start          # runs node server.js (no nodemon)
```

---

## Sample / Seed Data

To populate the database with demo users, projects, and tasks:

```bash
cd server
npm run seed
```

This **clears** the Users, Projects, Tasks, and Notifications collections and inserts fresh sample data, including these login credentials:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pmt.com` | `admin123` |
| Member | `alice@pmt.com` | `member123` |
| Member | `bob@pmt.com` | `member123` |
| Member | `carol@pmt.com` | `member123` |

⚠️ Do not run `npm run seed` against a production database — it deletes existing data in those collections first.

---

## API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require a header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login, returns JWT + user |
| GET | `/auth/profile` | Private | Get current user profile |
| PUT | `/auth/profile` | Private | Update name/avatar |
| POST | `/auth/logout` | Private | Logout |

### Projects

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/projects` | Private | List projects (supports `search`, `status`, `priority`, `page`, `limit`) |
| GET | `/projects/:id` | Private | Get one project + its tasks |
| POST | `/projects` | Admin | Create a project |
| PUT | `/projects/:id` | Admin | Update a project |
| DELETE | `/projects/:id` | Admin | Delete a project (cascades to its tasks) |
| PUT | `/projects/:id/recalculate-progress` | Private | Force progress % recalculation |

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/tasks` | Private | List tasks (supports `search`, `status`, `priority`, `projectId`, `assignedTo`, `page`, `limit`) |
| GET | `/tasks/:id` | Private | Get one task |
| POST | `/tasks` | Admin | Create a task |
| PUT | `/tasks/:id` | Private* | Update a task (*members can only update status/actualHours on their own tasks) |
| DELETE | `/tasks/:id` | Admin | Delete a task |
| POST | `/tasks/:id/comments` | Private | Add a comment |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Private | List users (supports `search`, `role`) |
| GET | `/users/:id` | Private | Get one user |
| PUT | `/users/:id` | Admin | Update role / active status |
| DELETE | `/users/:id` | Admin | Delete a user |

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Private | Aggregated stats + chart data + recent activity |

### Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Private | List notifications + unread count |
| PUT | `/notifications/:id/read` | Private | Mark one as read |
| PUT | `/notifications/read-all` | Private | Mark all as read |
| DELETE | `/notifications/:id` | Private | Delete a notification |

### Reports (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/tasks` | Completed vs pending task breakdown |
| GET | `/reports/projects` | Project progress overview |
| GET | `/reports/performance` | Per-employee performance metrics |

### Uploads

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/upload/task/:taskId` | Private | Attach a file to a task (`multipart/form-data`, field `file`) |
| POST | `/upload/avatar` | Private | Upload profile avatar (field `avatar`) |

### Example request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pmt.com","password":"admin123"}'
```

### Example response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f1b2c...",
    "name": "Admin User",
    "email": "admin@pmt.com",
    "role": "admin"
  }
}
```

---

## Testing

### Backend API tests (Jest + Supertest)

```bash
cd server
npm test
```

Requires `MONGO_URI` in `server/.env` to point to a reachable MongoDB instance (Atlas or local). Tests cover registration, login, authentication guards, and project access control.

### Frontend

```bash
cd client
npm test
```

Uses React Testing Library via Create React App's built-in test runner.

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full step-by-step instructions covering:
- MongoDB Atlas setup
- Backend deployment to Render or Railway
- Frontend deployment to Netlify or GitHub Pages
- Environment variable configuration for production
- Post-deployment checklist

---

## Git Commands

Suggested commit sequence for a clean history:

```bash
git init
git add .
git commit -m "Initial Commit"

# ... after building auth ...
git commit -am "Authentication Module: JWT login, register, protected routes"

# ... after building project CRUD ...
git commit -am "Project CRUD: create, read, update, delete with role-based access"

# ... after building task CRUD + Kanban ...
git commit -am "Task CRUD: task management, Kanban board with drag-and-drop"

# ... after building dashboard ...
git commit -am "Dashboard: stats, charts, recent activity"

# ... after deployment ...
git commit -am "Deployment: production configs for Render/Netlify"

git remote add origin <your-repository-url>
git branch -M main
git push -u origin main
```

---

## Screenshots

> Add screenshots here after running the app locally. Suggested shots:
> `docs/screenshots/login.png`, `dashboard.png`, `kanban.png`, `projects.png`, `reports.png`, `dark-mode.png`

---

## Troubleshooting

**`npm run build` fails with a `@typescript-eslint` / "Environment key is unknown" error**

This is a known dependency-drift issue in Create React App's bundled `eslint-config-react-app` (react-scripts hasn't seen a major update in some time, and its transitive `@typescript-eslint` dependencies can resolve to incompatible versions on a fresh install — unrelated to this being a JavaScript, not TypeScript, project). It's already worked around in `client/.env` via `DISABLE_ESLINT_PLUGIN=true`, which only disables react-scripts' build-time ESLint webpack plugin — your editor's own ESLint extension still works normally. If you ever recreate `client/.env` from scratch, re-add that line (see `client/.env.example`).

**CORS errors in the browser console**

Make sure `CLIENT_URL` in `server/.env` exactly matches the origin your frontend is served from (including protocol and port), and restart the backend after changing it.

**"MongoServerError: bad auth" or connection timeouts**

Double-check your `MONGO_URI` credentials and that your current IP is allowlisted under Atlas's Network Access settings.

---

## Future Enhancements

- Real-time updates via WebSockets/Socket.io (live Kanban sync across users)
- Email notifications for deadlines (Nodemailer is scaffolded but not wired to a cron job)
- Google/GitHub OAuth login
- Subtasks and task dependencies
- Time tracking with start/stop timers
- Excel export (in addition to existing PDF export)
- Project templates
- Audit log / activity history per project
- Mobile app (React Native)

---

## License

MIT License. Free to use for personal projects, portfolios, and college major projects.
