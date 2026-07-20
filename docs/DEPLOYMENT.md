# Deployment Guide

This guide walks through deploying the AI Project Management Tool to free-tier hosting:
- **Database:** MongoDB Atlas
- **Backend:** Render (Railway steps included as an alternative)
- **Frontend:** Netlify (GitHub Pages steps included as an alternative)

---

## 1. MongoDB Atlas Setup

1. Sign up / log in at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new **free (M0) cluster**
3. **Database Access** → Add New Database User → note the username/password
4. **Network Access** → Add IP Address → choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render/Railway can connect
5. **Database → Connect → Drivers → Node.js** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Insert your database name before the `?`, e.g. `.../pmt_db?retryWrites=true...`

Keep this string handy — it's your `MONGO_URI`.

---

## 2. Backend Deployment (Render)

1. Push your code to a GitHub/GitLab repository (see main README's [Git Commands](../README.md#git-commands))
2. Sign up at [render.com](https://render.com) and connect your repository
3. **New → Web Service**, select your repo
4. Configure:
   | Setting | Value |
   |---|---|
   | Root Directory | `server` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |
5. Add environment variables (Render dashboard → Environment):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<a long random string>
   JWT_EXPIRE=7d
   CLIENT_URL=<your Netlify URL, added after step 3>
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=200
   ```
6. Click **Create Web Service**. Render will build and deploy; note your live backend URL, e.g. `https://pmt-api.onrender.com`

> **Free tier note:** Render's free web services spin down after inactivity and take 30-60s to wake on the next request. This is normal.

### Alternative: Railway

1. Sign up at [railway.app](https://railway.app), **New Project → Deploy from GitHub repo**
2. Set the root directory to `server` in the service settings
3. Add the same environment variables as above under **Variables**
4. Railway auto-detects `npm start`; deploy and copy the generated public URL

---

## 3. Frontend Deployment (Netlify)

1. Update `client/.env` (or set in Netlify dashboard) with your live backend URL:
   ```
   REACT_APP_API_URL=https://pmt-api.onrender.com/api
   ```
2. Sign up at [netlify.com](https://netlify.com), **Add new site → Import an existing project**
3. Connect your repository and configure:
   | Setting | Value |
   |---|---|
   | Base directory | `client` |
   | Build command | `npm run build` |
   | Publish directory | `client/build` |
4. Add environment variable in Netlify dashboard (**Site settings → Environment variables**):
   ```
   REACT_APP_API_URL=https://pmt-api.onrender.com/api
   ```
5. Because this is a single-page app using React Router, add a redirect rule so client-side routes don't 404 on refresh. Create `client/public/_redirects` with:
   ```
   /*    /index.html   200
   ```
6. Deploy. Note your live frontend URL, e.g. `https://pmt-app.netlify.app`

### Final step: close the CORS loop

Go back to your **Render** backend environment variables and set:
```
CLIENT_URL=https://pmt-app.netlify.app
```
Redeploy the backend so it accepts requests from your live frontend origin.

### Alternative: GitHub Pages

1. In `client/package.json`, add:
   ```json
   "homepage": "https://<your-username>.github.io/<repo-name>"
   ```
2. Install the deploy helper: `npm install --save-dev gh-pages`
3. Add scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
4. Run `npm run deploy`
5. Since GitHub Pages doesn't support SPA redirects natively, add a `404.html` that redirects to `index.html`, or use `HashRouter` instead of `BrowserRouter` in `App.js` to avoid the issue entirely.

---

## 4. Seed Production Data (optional)

To populate your live database with demo accounts, run the seeder locally pointed at your Atlas cluster:

```bash
cd server
# Ensure .env has your production MONGO_URI
npm run seed
```

⚠️ This clears existing Users/Projects/Tasks/Notifications collections first — only run this before real users sign up, or against a fresh database.

---

## 5. Post-Deployment Checklist

- [ ] Visit your Netlify URL and confirm the login page loads
- [ ] Register a new account or log in with seeded credentials
- [ ] Create a project and a task to confirm the full write path works
- [ ] Check the browser console/network tab for CORS errors (usually means `CLIENT_URL` on the backend doesn't match your frontend's actual URL)
- [ ] Confirm dark mode toggle persists on refresh
- [ ] Test on a mobile device or responsive view for layout issues
- [ ] Set up MongoDB Atlas alerts for storage/connection limits (free tier has caps)

---

## Environment Variable Summary

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | Render/Railway | Atlas connection string |
| `JWT_SECRET` | Render/Railway | Signs auth tokens — keep secret, never commit |
| `CLIENT_URL` | Render/Railway | Must match your live frontend origin exactly (for CORS) |
| `REACT_APP_API_URL` | Netlify | Must point to your live backend `/api` path |

Both platforms' free tiers are sufficient for a portfolio/college project. For production traffic, consider upgrading the Render instance type (to avoid cold starts) and the Atlas cluster tier (to avoid connection limits).
