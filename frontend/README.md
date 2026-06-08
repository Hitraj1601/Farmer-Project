# FarmConnect Frontend (React + Vite)

## Setup

```bash
cd frontend
npm install
```

## Environment variables

Templates:
- `frontend/.env.example`

Required for production builds:
- `VITE_API_URL` (backend base URL including `/api`, e.g. `https://your-backend-domain.com/api`)
- `VITE_RAZORPAY_KEY_ID` (Razorpay public key)

Local development can also work without `VITE_API_URL` because `vite.config.js` proxies `/api` to `http://localhost:5000`.

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

For deployment notes (backend + frontend), see the repo root `DEPLOYMENT.md`.
