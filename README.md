# Farmer Marketplace

A full-stack smart agriculture marketplace where farmers can list crops, buyers can place orders, and admins can manage the platform from a dashboard.

This repository contains two apps:

- [Backend](Backend/README.md) - Node.js + Express API with Prisma, PostgreSQL, authentication, payments, and admin APIs.
- [Frontend](frontend/README.md) - React + Vite client for buyers, farmers, and admins.

## What The Platform Does

- Farmer crop listing with images, categories, stock thresholds, and bulk crop support.
- Buyer shopping flow with cart, wishlist, order placement, and order tracking.
- Authentication and role-based access for FARMER, BUYER, and ADMIN users.
- Razorpay payment flow with a free-payment fallback for supported order flows.
- Reviews, profile management, chat, analytics, and admin user/order management.
- Upload handling for crop images and other media.

## Tech Stack

### Backend

- Node.js
- Express.js
- Prisma
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Razorpay payments
- Multer file uploads
- Socket.IO for real-time features
- Joi validation
- Helmet, CORS, and rate limiting

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Socket.IO client
- Chart.js / Recharts for analytics views
- React Hot Toast for notifications

## Project Structure

```text
Backend/    -> API server, Prisma schema, controllers, services, routes, uploads
frontend/   -> React application, pages, components, context, and UI assets
docker-compose.yml -> Local full-stack deployment with PostgreSQL, backend, and Nginx
```

## Local Setup

### 1. Backend

```bash
cd Backend
npm install
```

Create `Backend/.env` from your local environment variables. Common values include:

- `DATABASE_URL`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NODE_ENV`
- `PORT`

Run migrations and generate Prisma client:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Start the API:

```bash
npm run dev
```

The backend typically runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` with the frontend runtime values:

- `VITE_API_URL` - backend base URL including `/api`
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

Start the client:

```bash
npm run dev
```

## Docker Setup

The repository includes a `docker-compose.yml` file that starts:

- PostgreSQL database
- Backend API container
- Nginx container serving the frontend and proxying API requests

Run the full stack from the repository root:

```bash
docker-compose up --build -d
```

## Useful Scripts

### Backend

- `npm run dev` - start the API with auto reload
- `npm start` - start the API in production mode
- `npm run seed` - load demo data
- `npm run seed:reset` - clear and reseed demo data
- `npm run prisma:studio` - open Prisma Studio

### Frontend

- `npm run dev` - start the Vite dev server
- `npm run build` - build the production bundle
- `npm run lint` - run ESLint

## Deployment Notes

- Use the backend and frontend README files for detailed setup instructions.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for environment, Docker, and hosting guidance.
