# Deployment Checklist (Frontend + Backend)

This repo is a monorepo:
- `Backend/` = Node.js/Express API + Prisma (MySQL)
- `frontend/` = React + Vite

## 1) Credentials / Environment Variables

### Backend (set these in your hosting provider)
Required:
- `DATABASE_URL` (MySQL connection string)
- `JWT_SECRET` (long random string)

Optional (but required if you want Razorpay payments):
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Recommended:
- `NODE_ENV=production`
- `PORT` (your host usually sets this automatically)
- `CORS_ORIGIN` (your frontend URL, e.g. `https://your-frontend-domain.com`)

Template: `Backend/.env.example`

### Frontend (set before `vite build`)
- `VITE_API_URL` (your backend base URL **including** `/api`, e.g. `https://your-backend-domain.com/api`)
- `VITE_RAZORPAY_KEY_ID` (Razorpay public key)

Template: `frontend/.env.example`

## 2) Database (MySQL) + Prisma

1. Create a MySQL database (managed service is recommended for production).
2. Set `DATABASE_URL` to the managed DB connection string.
3. Run migrations:
   - Production: `npm run prisma:migrate:deploy`
   - Dev/local: `npm run prisma:migrate`

Notes:
- Prisma schema is MySQL-based (`provider = "mysql"`). If your host only provides Postgres, you must switch the Prisma provider and run a migration plan.

## 3) Build & Start Commands

### Backend
From `Backend/`:
- Install: `npm ci` (or `npm install`)
- Generate Prisma client: `npm run prisma:generate`
- Migrate (prod): `npm run prisma:migrate:deploy`
- Start: `npm start`

### Frontend
From `frontend/`:
- Install: `npm ci` (or `npm install`)
- Build: `npm run build`
- Serve: use your hosting provider’s static hosting (or `npm run preview` for local testing)

## 4) CORS and API URL (most common deployment errors)

If frontend and backend are on different domains:
- Backend: set `CORS_ORIGIN` to the exact frontend origin.
- Frontend: set `VITE_API_URL` to the backend URL (including `/api`).

Vercel preview deployments have different URLs; backend supports comma-separated origins, e.g.
`CORS_ORIGIN=https://yourapp.vercel.app,https://yourapp-git-branch.vercel.app`

If you see `CORS` errors in the browser console:
- Verify `CORS_ORIGIN` matches exactly (scheme + domain + port).
- Ensure the backend is reachable from the public internet.

## 5) Uploads (production storage note)

Backend saves uploaded images to `Backend/uploads/` and serves them at `/uploads/...`.
- If your hosting has **ephemeral disk** (many serverless/container hosts), uploaded files may disappear on redeploy.
- For production durability, use persistent disk or move uploads to object storage (S3-compatible) and store URLs.

## 6) Seeding (do not use demo credentials in production)

- `Backend/seed-data.js` and `Backend/seed-admin.js` create demo users with known passwords.
- Only run seed scripts for local testing.

If you *must* create an admin user in a controlled environment, `Backend/seed-admin.js` supports:
- `ADMIN_EMAIL`
- `ADMIN_PHONE`
- `ADMIN_PASSWORD`

## 7) Quick sanity checks after deploy

- Backend health: `GET /` should return `{ success: true, message: "Farmer Marketplace API Running" }`
- Frontend loads without console errors
- Login/register works (JWT working)
- Create crop + image upload works (uploads path working)
- Razorpay flow works (only if keys set)

## Vercel (frontend) + Render (backend)

### Render (Backend Web Service)
- **Root directory:** `Backend`
- **Build command:** `npm ci && npm run prisma:generate && npm run prisma:migrate:deploy`
- **Start command:** `npm start`
- **Environment variables:** copy from `Backend/.env.example` (set `NODE_ENV=production`)

Important:
- Render does not provide managed MySQL by default; you’ll need an external MySQL provider (or switch Prisma to Postgres).

### Vercel (Frontend)
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:**
   - `VITE_API_URL=https://<your-render-service>.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>`
