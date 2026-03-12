# Smart Agriculture Supply Chain & Farmer Marketplace - Backend

A production-ready backend for a farmer marketplace platform where farmers can list crops and buyers can purchase them, with integrated Razorpay payment processing, admin dashboard, and comprehensive security.

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Joi
- **Environment:** dotenv

## Project Structure

```
Backend/
├── app.js                          # Express server entry point
├── package.json
├── .env.example                    # Environment variable template
├── uploads/                        # Uploaded crop images
└── src/
    ├── config/
    │   ├── db.js                   # Prisma client instance
    │   ├── multer.js               # Multer upload config
    │   └── razorpay.js             # Razorpay instance
    ├── controllers/
    │   ├── admin.controller.js     # Admin dashboard logic
    │   ├── auth.controller.js      # Auth logic
    │   ├── crop.controller.js      # Crop CRUD logic
    │   ├── order.controller.js     # Order logic
    │   ├── payment.controller.js   # Payment logic
    │   ├── profile.controller.js   # Profile management
    │   └── review.controller.js    # Review logic
    ├── middleware/
    │   ├── auth.middleware.js       # JWT auth + role guard
    │   ├── error.middleware.js      # Global error handler
    │   ├── validate.middleware.js   # Request validation
    │   └── validate.schemas.js     # Joi validation schemas
    ├── models/
    │   ├── crop.model.js           # Prisma crop export
    │   ├── order.model.js          # Prisma order export
    │   ├── payment.model.js        # Prisma payment export
    │   └── user.model.js           # Prisma user export
    ├── prisma/
    │   └── schema.prisma           # Database schema
    ├── routes/
    │   ├── admin.routes.js         # Admin routes
    │   ├── auth.routes.js          # Auth routes
    │   ├── crop.routes.js          # Crop routes
    │   ├── order.routes.js         # Order routes
    │   ├── payment.routes.js       # Payment routes
    │   ├── profile.routes.js       # Profile routes
    │   └── review.routes.js        # Review routes
    ├── services/
    │   ├── admin.service.js        # Admin business logic
    │   ├── auth.service.js         # Auth business logic
    │   ├── crop.service.js         # Crop business logic
    │   ├── order.service.js        # Order business logic
    │   ├── payment.service.js      # Payment business logic
    │   ├── profile.service.js      # Profile business logic
    │   └── review.service.js       # Review business logic
    └── utils/
        ├── apiError.js             # Custom error class
        ├── apiResponse.js          # Standard response helper
        └── jwt.js                  # JWT sign/verify
```
    └── utils/
        ├── apiError.js
        ├── apiResponse.js
        └── jwt.js
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update these values in `.env`:
- `DATABASE_URL` — your MySQL connection string
- `JWT_SECRET` — a strong secret key for JWT signing
- `RAZORPAY_KEY_ID` — your Razorpay key ID
- `RAZORPAY_KEY_SECRET` — your Razorpay key secret

### 3. Setup Database

Make sure MySQL is running, then create the database:

```sql
CREATE DATABASE farmer_marketplace;
```

### 4. Run Prisma Migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 5. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint             | Access  | Description         |
|--------|----------------------|---------|---------------------|
| POST   | /api/auth/register   | Public  | Register new user   |
| POST   | /api/auth/login      | Public  | Login               |
| GET    | /api/auth/profile    | Auth    | Get current profile |

### Crops
| Method | Endpoint         | Access  | Description          |
|--------|------------------|---------|----------------------|
| POST   | /api/crops       | Farmer  | List a new crop      |
| GET    | /api/crops       | Public  | Get all crops        |
| GET    | /api/crops/:id   | Public  | Get crop by ID       |
| PUT    | /api/crops/:id   | Farmer  | Update own crop      |
| DELETE | /api/crops/:id   | Farmer  | Delete own crop      |

### Orders
| Method | Endpoint                | Access        | Description          |
|--------|-------------------------|---------------|----------------------|
| POST   | /api/orders             | Buyer         | Place an order       |
| GET    | /api/orders/my          | Auth          | Get my orders        |
| PUT    | /api/orders/:id/status  | Farmer/Admin  | Update order status  |

### Payments
| Method | Endpoint                    | Access | Description              |
|--------|-----------------------------|--------|--------------------------|
| POST   | /api/payments/create-order  | Buyer  | Create Razorpay order    |
| POST   | /api/payments/verify        | Auth   | Verify payment signature |

### Reviews
| Method | Endpoint                        | Access | Description          |
|--------|---------------------------------|--------|----------------------|
| POST   | /api/reviews                    | Buyer  | Submit a review      |
| GET    | /api/reviews/farmer/:farmerId   | Public | Get farmer's reviews |

### Profiles
| Method | Endpoint                     | Access  | Description               |
|--------|------------------------------|---------|---------------------------|
| POST   | /api/profile/farmer          | Farmer  | Create/update farmer profile |
| GET    | /api/profile/farmer          | Farmer  | Get own farmer profile    |
| GET    | /api/profile/farmer/:userId  | Public  | Get farmer profile by ID  |
| POST   | /api/profile/buyer           | Buyer   | Create/update buyer profile |
| GET    | /api/profile/buyer           | Buyer   | Get own buyer profile     |
| GET    | /api/profile/buyer/:userId   | Public  | Get buyer profile by ID   |

### Admin Dashboard
| Method | Endpoint              | Access | Description              |
|--------|-----------------------|--------|--------------------------|
| GET    | /api/admin/users      | Admin  | Get all users (paginated)|
| GET    | /api/admin/users/:id  | Admin  | Get user details         |
| DELETE | /api/admin/users/:id  | Admin  | Delete a user            |
| GET    | /api/admin/orders     | Admin  | Get all orders (paginated)|
| GET    | /api/admin/analytics  | Admin  | Platform analytics       |

## Security Features

- **Helmet** — HTTP security headers
- **CORS** — Configurable cross-origin resource sharing
- **Rate Limiting** — 100 req/15min general, 20 req/15min for auth
- **JWT Authentication** — Stateless token-based auth
- **bcrypt** — Password hashing (12 salt rounds)
- **Role-based Authorization** — FARMER, BUYER, ADMIN role guards
- **Joi Validation** — Request body validation on all write endpoints
- **Razorpay Signature Verification** — HMAC-SHA256 payment verification
- **File Upload Validation** — MIME type + file size limits (5MB, images only)

## Example API Requests & Responses

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "email": "rajesh@example.com",
  "password": "SecurePass123",
  "role": "FARMER"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "email": "rajesh@example.com",
      "role": "FARMER",
      "createdAt": "2026-03-07T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "rajesh@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Rajesh Kumar",
      "role": "FARMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Create Crop (Farmer)
```bash
POST /api/crops
Authorization: Bearer <token>
Content-Type: multipart/form-data

cropName=Organic Wheat
quantity=500
pricePerKg=35.50
location=Punjab
image=<file>
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Crop listed successfully.",
  "data": {
    "id": "crop-uuid-...",
    "cropName": "Organic Wheat",
    "quantity": 500,
    "pricePerKg": 35.50,
    "location": "Punjab",
    "imageUrl": "/uploads/image-1709812345-123456789.jpg",
    "farmerId": "a1b2c3d4-...",
    "createdAt": "2026-03-07T10:05:00.000Z"
  }
}
```

### Place Order (Buyer)
```bash
POST /api/orders
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "cropId": "crop-uuid-...",
  "quantity": 50
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order placed successfully.",
  "data": {
    "id": "order-uuid-...",
    "buyerId": "buyer-uuid-...",
    "cropId": "crop-uuid-...",
    "quantity": 50,
    "totalPrice": 1775.00,
    "status": "PENDING",
    "crop": {
      "cropName": "Organic Wheat",
      "pricePerKg": 35.50,
      "location": "Punjab"
    }
  }
}
```

### Create Payment Order
```bash
POST /api/payments/create-order
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "orderId": "order-uuid-..."
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Razorpay order created successfully.",
  "data": {
    "razorpayOrderId": "order_XXXXXXX",
    "amount": 177500,
    "currency": "INR",
    "paymentId": "payment-uuid-..."
  }
}
```

## User Roles & Permissions

| Action                           | FARMER | BUYER | ADMIN |
|----------------------------------|--------|-------|-------|
| Register/Login                   | ✅     | ✅    | ✅    |
| Create/Edit/Delete Crops         | ✅     | ❌    | ❌    |
| View Crops                       | ✅     | ✅    | ✅    |
| Place Orders                     | ❌     | ✅    | ❌    |
| Accept/Reject/Ship Orders        | ✅     | ❌    | ✅    |
| Make Payments                    | ❌     | ✅    | ❌    |
| Submit Reviews                   | ❌     | ✅    | ❌    |
| Manage Farmer Profile            | ✅     | ❌    | ❌    |
| Manage Buyer Profile             | ❌     | ✅    | ❌    |
| View Admin Dashboard/Analytics   | ❌     | ❌    | ✅    |
| Delete Users                     | ❌     | ❌    | ✅    |

## Prisma Studio

To visually browse your database:

```bash
npm run prisma:studio
```

## Order Flow

```
Buyer selects crop → Places order (PENDING)
    → Farmer accepts → Order ACCEPTED → Buyer makes payment → Payment SUCCESS
    → Farmer ships → Order SHIPPED
    → Farmer marks delivered → Order DELIVERED
    → Buyer can now leave a review for the farmer
```

## Payment Flow

```
1. Buyer places order (status: PENDING)
2. Buyer calls POST /api/payments/create-order with orderId
3. Backend creates Razorpay order, returns razorpayOrderId
4. Frontend opens Razorpay payment popup using razorpayOrderId
5. On success, frontend calls POST /api/payments/verify with:
   - razorpay_order_id
   - razorpay_payment_id
   - razorpay_signature
6. Backend verifies HMAC-SHA256 signature
7. Payment marked SUCCESS, order status updated
```

## Additional API Examples

### Submit Review (Buyer)
```bash
POST /api/reviews
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "farmerId": "farmer-uuid-...",
  "rating": 5,
  "comment": "Excellent quality organic wheat!"
}
```

### Create Farmer Profile
```bash
POST /api/profile/farmer
Authorization: Bearer <farmer-token>
Content-Type: application/json

{
  "farmLocation": "Village Rampura, District Amritsar, Punjab",
  "bankAccount": "1234567890123456",
  "ifscCode": "SBIN0001234"
}
```

### Create Buyer Profile
```bash
POST /api/profile/buyer
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "businessName": "Fresh Foods Pvt Ltd",
  "businessAddress": "123 Market Street, New Delhi"
}
```

### Admin Analytics
```bash
GET /api/admin/analytics
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Analytics fetched successfully.",
  "data": {
    "users": { "total": 150, "farmers": 80, "buyers": 68 },
    "crops": { "total": 245 },
    "orders": { "total": 520, "pending": 45, "delivered": 380 },
    "revenue": { "total": 2850000.50 },
    "payments": { "successful": 475 },
    "reviews": { "total": 310 }
  }
}
```

### Admin Get All Users
```bash
GET /api/admin/users?page=1&limit=10&role=FARMER&search=rajesh
Authorization: Bearer <admin-token>
```

### Verify Payment
```bash
POST /api/payments/verify
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "razorpay_order_id": "order_XXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXX",
  "razorpay_signature": "signature_hash_here"
}
```

