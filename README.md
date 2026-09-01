# FarmConnect - Smart Agriculture Supply Chain & Farmer Marketplace

A full-stack, enterprise-grade agricultural marketplace and direct supply chain platform connecting Indian farmers directly with conscious consumers, restaurants, and bulk buyers.

FarmConnect eliminates intermediaries to ensure fair revenue distribution for agricultural growers, complete price transparency, real-time logistics tracking, integrated digital payments, and instant buyer-seller chat.

---

## Table of Contents

- [Key Features](#key-features)
  - [For Farmers](#for-farmers)
  - [For Buyers](#for-buyers)
  - [For Admins](#for-admins)
  - [Platform & Real-Time Engine](#platform--real-time-engine)
- [Tech Stack](#tech-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Repository Architecture](#repository-architecture)
- [Getting Started](#getting-started)
  - [Automated Quickstart (Windows `start.bat`)](#1-automated-quickstart-windows-startbat)
  - [Manual Setup](#2-manual-setup)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
  - [Docker Setup](#3-docker-setup)
- [Environment Variables](#environment-variables)
  - [Backend `.env`](#backend-env)
  - [Frontend `.env`](#frontend-env)
- [Database Schema (Prisma + PostgreSQL)](#database-schema-prisma--postgresql)
- [API Reference](#api-reference)
- [Performance & Security Engineering](#performance--security-engineering)
- [Demo Credentials](#demo-credentials)
- [License](#license)

---

## Key Features

### For Farmers
- **Crop Catalog Management**: Easily list crops with images, harvest locations, unit pricing (per kg), stock quantities, and customizable stock alert thresholds.
- **Bulk Upload via Excel/XLSX**: Upload hundreds of crop listings simultaneously using standardized Excel spreadsheet templates.
- **Order Management & Fulfillment**: Process incoming buyer orders with full lifecycle control (`PENDING` → `ACCEPTED` → `SHIPPED` → `DELIVERED` or `REJECTED`/`CANCELLED`).
- **Revenue & Analytics Dashboard**: Visual charts powered by Recharts/Chart.js displaying total revenue, monthly sales velocity, top-performing crops, and market price trends.
- **Stock Alert System**: Automated banners and notifications when crop stock falls below set safety thresholds.

### For Buyers
- **Farm-Direct Marketplace**: Search and filter thousands of fresh crops by category (Vegetables, Grains, Fruits, Spices, Organic, Regional), location, and price ranges.
- **Multi-Item Shopping Cart**: Add items from multiple farms into a consolidated cart with real-time stock verification and one-click checkout.
- **Wishlist & Price Drop Alerts**: Save preferred crops and receive automated notifications when prices decrease.
- **Instant Order Tracking**: Real-time GPS-style tracking timeline showing harvest, dispatch, transit, and doorstep delivery milestones.
- **Downloadable PDF Invoices**: Auto-generate downloadable, tax-compliant PDF invoices using `jsPDF` and `jspdf-autotable`.
- **Verified Reviews & Ratings**: Submit star ratings, comments, and photos for verified delivered orders.

### For Admins
- **User Management**: Monitor, audit, search, and manage `FARMER`, `BUYER`, and `ADMIN` accounts.
- **Order & Payment Oversight**: View platform-wide transaction histories, order statuses, and payment verifications.
- **System Analytics**: Platform-wide metrics including GMV (Gross Merchandise Value), active user growth, and crop inventory analytics.

### Platform & Real-Time Engine
- **Instant Messaging (Socket.IO)**: Direct real-time chat between buyers and farmers linked to specific crop listings with unread message badges and typing indicators.
- **Elasticsearch Powered Search**: Lightning-fast, case-insensitive multi-field search (`cropName`, `category`, `location`, `farmerName`) with automatic fallback to PostgreSQL Prisma queries.
- **Integrated Payments**: Razorpay payment gateway integration with HMAC-SHA256 signature verification and simulated test mode fallback.

---

## Tech Stack

### Backend
- **Runtime Environment**: Node.js (v18+) & Express.js (v5)
- **Database & ORM**: PostgreSQL database powered by Prisma ORM 6
- **Search Engine**: Elasticsearch 9 for high-performance multi-field query matching
- **Real-Time Infrastructure**: Socket.IO 4 for web sockets & live notification delivery
- **Payment Processing**: Razorpay API & HMAC-SHA256 cryptographic verification
- **File Uploads**: Multer & Cloudinary / local static storage serving
- **Security & Middleware**: Helmet HTTP headers, CORS policies, Express-Rate-Limit, Compression (Gzip), Joi schema validation

### Frontend
- **Framework & Core**: React 19, React Router 7, Vite 7
- **Styling & UI**: Tailwind CSS 4 with custom glassmorphism, responsive dark mode, and custom animations
- **Data Visualization**: Recharts & Chart.js for analytics dashboards
- **Document Generation**: `jsPDF` & `jspdf-autotable`
- **Real-Time Client**: Socket.IO Client 4
- **Feedback & Toasts**: React Hot Toast
- **Iconography**: React Icons (`fi`, `gi`, `tb`)

---

## Repository Architecture

```text
Farmer Project/
├── start.bat                     # Windows automated startup script
├── docker-compose.yml            # Containerized full-stack deployment
├── ADMIN.md                      # Detailed Admin Control specification & API reference
├── DEPLOYMENT.md                 # Production deployment guidelines
├── IMPLEMENTATION_SUMMARY.md     # Feature roadmap & change records
│
├── Backend/                      # Node.js Express REST API
│   ├── app.js                    # Server entry point & Express configuration
│   ├── seed-data.js              # Database seeding script for development
│   ├── seed-admin.js             # Initial admin account bootstrap
│   ├── uploads/                  # Uploaded crop assets
│   └── src/
│       ├── config/               # Socket.IO, Razorpay, Elasticsearch, Multer configs
│       ├── controllers/          # Request handlers for auth, crops, orders, payments, etc.
│       ├── middleware/           # JWT auth guards, Joi validation, error handlers
│       ├── models/               # Prisma model exports
│       ├── prisma/               # schema.prisma database schema & migrations
│       ├── routes/               # Express API route declarations
│       ├── services/             # Core business logic & database interaction layer
│       └── utils/                # Standardized API response & JWT helpers
│
└── frontend/                     # React 19 + Vite Single Page Application
    ├── index.html                # Main entry HTML
    ├── vite.config.js            # Vite build & backend proxy configuration
    └── src/
        ├── App.jsx               # Application route tree & layout definitions
        ├── main.jsx              # Application bootstrap & global context providers
        ├── assets/               # Compressed WebP/JPG UI graphics & static assets
        ├── components/           # Reusable UI widgets (Loader, Modal, Pagination, etc.)
        ├── context/              # React Context (AuthContext, ThemeContext, CartContext, SocketContext)
        ├── layouts/              # MainLayout, DashboardLayout, AdminLayout, ProtectedRoute
        ├── pages/                # Page views (HomePage, Marketplace, CropDetail, Cart, Chat, etc.)
        │   ├── admin/            # Admin dashboard views
        │   └── farmer/           # Farmer dashboard views & crop management
        ├── services/             # Axios API service instances
        └── utils/                # Helpers, formatting, and calculation utilities
```

---

## Getting Started

### 1. Automated Quickstart (Windows `start.bat`)

If you are running on Windows, execute the included batch script in the project root:

```cmd
start.bat
```

This script automatically:
1. Launches the Node.js backend (`npm run dev` in `/Backend`).
2. Polls `http://localhost:5000/` until the backend is fully initialized.
3. Launches the Vite React frontend (`npm run dev` in `/frontend`).

---

### 2. Manual Setup

#### Backend Setup

1. Navigate to the `Backend` folder:
   ```bash
   cd Backend
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Ensure PostgreSQL is running, then apply database migrations and generate the Prisma Client:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. Seed the database with demo users, crops, orders, and market prices:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will start on **`http://localhost:5000`**.

---

#### Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The application will be available at **`http://localhost:3000`**.

---

### 3. Docker Setup

To run the full stack (PostgreSQL, Backend API, and Nginx-served Frontend) using Docker:

```bash
docker-compose up --build -d
```

---

## Environment Variables

### Backend `.env`

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/farmer_db?schema=public` |
| `PORT` | API HTTP server port | `5000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | `rzp_test_XXXXXX` |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | `XXXXXX` |
| `ELASTICSEARCH_NODE` | Elasticsearch node URL (optional) | `http://localhost:9200` |
| `CORS_ORIGIN` | Allowed cross-origin domains | `http://localhost:3000` |

### Frontend `.env`

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API endpoint URL | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key ID | `rzp_test_XXXXXX` |

---

## Database Schema (Prisma + PostgreSQL)

The database schema defines 15 interconnected relational models:

- **`User`**: Accounts for `FARMER`, `BUYER`, and `ADMIN` users with hashed passwords and phone numbers.
- **`FarmerProfile`**: Land location, bank details (account & IFSC), and serviceable delivery regions.
- **`BuyerProfile`**: Business name, business address, and default delivery coordinates.
- **`Crop`**: Crop listings with unit pricing, stock quantity, stock threshold, images, and category tags.
- **`Cart` & `CartItem`**: Persistent buyer cart items with quantity calculations.
- **`Order` & `OrderItem`**: Single & multi-item orders supporting full lifecycle status (`PENDING`, `ACCEPTED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **`Payment`**: Payment details tracking Razorpay order/payment IDs and status (`INITIATED`, `SUCCESS`, `FAILED`).
- **`OrderTracking`**: Audit timeline logging location and status changes during crop delivery.
- **`Review`**: Rating (1-5 stars) and comments linked to verified buyer-farmer-crop transactions.
- **`PriceHistory`**: Time-series log of crop price points for historical analytics and trend charts.
- **`Wishlist`**: Buyer saved items with target notification price tracking.
- **`Conversation` & `Message`**: Direct buyer-farmer chat threads and messages.

---

## API Reference

### Auth & User Profile (`/api/auth`, `/api/profile`)
- `POST /api/auth/register` — Register a new account (`FARMER` or `BUYER`).
- `POST /api/auth/login` — Authenticate and receive JWT access token.
- `GET /api/auth/profile` — Fetch currently authenticated user profile.
- `POST /api/profile/farmer` — Create or update farmer business profile.
- `POST /api/profile/buyer` — Create or update buyer delivery profile.

### Crops & Catalog (`/api/crops`)
- `GET /api/crops` — Fetch paginated crops with search, filter, and sorting.
- `GET /api/crops/:id` — Fetch single crop details with reviews and price history.
- `POST /api/crops` — Create new crop listing (Farmer access).
- `PUT /api/crops/:id` — Update owned crop details (Farmer access).
- `DELETE /api/crops/:id` — Delete crop listing (Farmer access).
- `POST /api/crops/bulk-upload` — Upload Excel spreadsheet for mass crop creation.

### Shopping Cart & Wishlist (`/api/cart`, `/api/wishlist`)
- `GET /api/cart` — Get active buyer cart.
- `POST /api/cart/items` — Add crop item to cart.
- `PUT /api/cart/items/:cropId` — Update item quantity in cart.
- `DELETE /api/cart/items/:cropId` — Remove item from cart.
- `GET /api/wishlist` — Get buyer saved wishlist.
- `POST /api/wishlist/:cropId` — Add crop to wishlist.

### Orders & Tracking (`/api/orders`)
- `POST /api/orders` — Place single crop order.
- `POST /api/cart/checkout` — Checkout entire cart into orders.
- `GET /api/orders/my` — Fetch current user orders.
- `PUT /api/orders/:id/status` — Update order status (`ACCEPTED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### Payments (`/api/payments`)
- `POST /api/payments/create-order` — Initialize Razorpay transaction.
- `POST /api/payments/verify` — Verify cryptographic Razorpay signature and settle payment.

### Admin Dashboard (`/api/admin`)
- `GET /api/admin/users` — Manage and search user accounts.
- `GET /api/admin/orders` — Platform order audit.
- `GET /api/admin/analytics` — Platform analytics overview.

---

## Performance & Security Engineering

- **Landing Page Performance**: Landing page graphics are compressed to high-performance JPEG assets (~430 KB total), root route `HomePage` is eagerly imported, and external payment SDKs are loaded with non-blocking `defer` attributes.
- **Multi-Level Caching & Indexing**: Database columns indexed on frequent search parameters (`farmerId`, `category`, `pricePerKg`, `status`). Elasticsearch indexes updated asynchronously.
- **Security & Authorization**: JWT token authorization with explicit role guards (`FARMER`, `BUYER`, `ADMIN`). Passwords hashed with `bcrypt` (12 rounds). Strict Joi schema validation on write endpoints. Rate limiting on sensitive `/api/auth` endpoints.

---

## Demo Credentials

Default demo accounts created after running `npm run seed`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@farmconnect.com` | `Test@1234` |
| **Farmer** | `rajesh@farmconnect.com` | `Test@1234` |
| **Buyer** | `amit@freshmart.com` | `Test@1234` |

---

## License

This project is licensed under the [ISC License](LICENSE).
