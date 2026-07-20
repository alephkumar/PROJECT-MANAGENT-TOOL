# Testing Instructions

## Backend API Tests

```bash
cd server
cp .env.example .env   # fill in a real MONGO_URI (Atlas or local)
npm install
npm test
```

Covers: registration, duplicate-email rejection, login (success/failure), profile fetch with/without token, project creation role-guard, project listing, and the health check endpoint. Uses Jest + Supertest against your live `server.js` app instance.

## Manual QA Checklist

**Auth**
- [ ] Register as a Team Member, then log out and log back in
- [ ] Register as an Admin, confirm admin-only nav items (Users, Reports, New Project) appear
- [ ] Attempt to visit `/users` or `/reports` while logged in as a member — should redirect to `/dashboard`
- [ ] Refresh the page while logged in — session should persist (JWT restored from localStorage)

**Projects**
- [ ] Create a project as Admin, assign 2+ members
- [ ] Search projects by title substring
- [ ] Filter by status and priority independently and combined
- [ ] Edit a project, delete a project (confirm cascade-deletes its tasks)

**Tasks**
- [ ] Create a task from the Tasks page and from within a Project's detail page
- [ ] Drag a task across Kanban columns as Admin
- [ ] Log in as the assigned member, drag their own task — should succeed
- [ ] Log in as a different member, attempt to drag a task not assigned to them — should be blocked with a toast
- [ ] Add a comment to a task, confirm it appears with correct author/timestamp
- [ ] Update actual hours on a task

**Dashboard**
- [ ] Confirm stat cards match actual DB counts
- [ ] Confirm charts render for tasks-by-status, tasks-by-priority, projects-by-status
- [ ] Confirm recent activity table shows latest updated tasks

**Reports**
- [ ] Generate each of the 3 report tabs
- [ ] Export each as PDF, confirm the downloaded file opens and contains correct data

**Notifications**
- [ ] Assign a task to a member, confirm they receive an "assignment" notification
- [ ] Mark a task Completed, confirm the task creator receives a "completed" notification
- [ ] Mark all notifications as read, confirm the unread badge clears

**UI**
- [ ] Toggle dark mode, refresh, confirm it persists
- [ ] Collapse the sidebar, confirm layout adjusts
- [ ] Resize to mobile width, confirm responsive layout holds up
- [ ] Trigger a validation error (e.g. empty project title) and confirm inline error messages appear
- [ ] Trigger a delete confirmation dialog and cancel it, then confirm it again

## Sample cURL Commands

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pmt.com","password":"admin123"}'

# Get projects (replace TOKEN)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN"

# Create a project (Admin token required)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Project","description":"Testing","startDate":"2026-08-01","endDate":"2026-09-01"}'
```
