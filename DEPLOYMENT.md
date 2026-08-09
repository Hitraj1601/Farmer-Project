# Deployment Checklist (Frontend + Backend)

This repo is a monorepo:
- `Backend/` = Node.js/Express API + Prisma (PostgreSQL)
- `frontend/` = React + Vite

## 1) Credentials / Environment Variables

### Backend (set these in your hosting provider)
Required:
- `DATABASE_URL` (PostgreSQL connection string)
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

## 2) Database (PostgreSQL) + Prisma

1. Create a PostgreSQL database (managed service is recommended for production).
2. Set `DATABASE_URL` to the managed DB connection string.
3. Run migrations:
   - Production: `npm run prisma:migrate:deploy`
   - Dev/local: `npx prisma migrate dev` (generates new Postgres migrations)

Notes:
- Prisma schema is PostgreSQL-based (`provider = "postgresql"`).

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
- **Build command:** `npm ci && npm run prisma:generate && npm run prisma:db:push`
- **Start command:** `npm start`
- **Environment variables:** copy from `Backend/.env.example` (set `NODE_ENV=production`)

Important:
- You can host your PostgreSQL database on Supabase! Simply create a free project, copy the connection URL from database settings, and add it to Render's environment variables.

### Vercel (Frontend)
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:**
   - `VITE_API_URL=https://<your-render-service>.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>`

---

## 8) Containerized Deployment with Nginx + Docker Compose (Recommended)

To run the complete application stack (PostgreSQL, Node.js API, and Nginx Static Server) inside Docker containers:

### Prerequisites
Make sure **Docker** and **Docker Compose** are installed on the target machine.

### Instructions

1. **Environment Setup**:
   Copy and fill environment variables for the database and secrets. In production, edit the environment variables in `docker-compose.yml` to specify secure credentials:
   - `DATABASE_URL`: Ensure it connects to the `db` service container (default: `postgresql://postgres:postgres_password_1234@db:5432/farmer_marketplace?schema=public`).
   - `JWT_SECRET`: A long secure key.

2. **Build and Run**:
   In the project root, run the following command to compile the frontend, package the backend service, stand up the PostgreSQL container, apply database schemas, and start Nginx:
   ```bash
   docker-compose up --build -d
   ```

3. **Seeding the Database (Optional)**:
   To load the default demo users (farmers, buyers, products, and order data), run the seed script inside the running backend container:
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Accessing the Marketplace**:
   - Open your browser and go to `http://localhost`. The React app will load.
   - Nginx handles static file requests directly and automatically forwards `/api/` endpoints to the Express container, preventing CORS issues.
   - Uploaded files are saved to a shared persistent volume (`uploads-data`) and served directly by Nginx, reducing Node.js event-loop overhead.

