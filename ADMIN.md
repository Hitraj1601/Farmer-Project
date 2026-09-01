# FarmConnect - Admin Control Documentation

This document provides a comprehensive specification of the **Admin Control Panel**, detailing the user governance, order oversight, payment tracking, analytics engine, security models, API endpoints, and codebase file architecture.

---

## Table of Contents

- [Overview & Capabilities](#overview--capabilities)
- [Admin Authentication & Security](#admin-authentication--security)
  - [Default Admin Credentials](#default-admin-credentials)
  - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Admin Panel Modules](#admin-panel-modules)
  - [1. Dashboard Overview (`/admin`)](#1-dashboard-overview-admin)
  - [2. User Management (`/admin/users`)](#2-user-management-adminusers)
  - [3. Order Oversight & Audit (`/admin/orders`)](#3-order-oversight--audit-adminorders)
  - [4. Payment Audit (`/admin/payments`)](#4-payment-audit-adminpayments)
- [API Reference for Admin Control](#api-reference-for-admin-control)
  - [Users API](#users-api)
  - [Orders API](#orders-api)
  - [Analytics API](#analytics-api)
- [Codebase Architecture & File Structure](#codebase-architecture--file-structure)
  - [Frontend Files](#frontend-files)
  - [Backend Files](#backend-files)
- [Database Models Supporting Admin Operations](#database-models-supporting-admin-operations)

---

## Overview & Capabilities

The Admin Control Panel gives platform operators complete administrative oversight over the FarmConnect marketplace. Key capabilities include:

1. **User Governance**: Search, audit, inspect, and delete any `FARMER`, `BUYER`, or `ADMIN` user account.
2. **Order Lifecycle Control**: Audit all orders platform-wide across all statuses (`PENDING`, `ACCEPTED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REJECTED`) and override order statuses during dispute resolution.
3. **Payment Monitoring**: Audit every Razorpay transaction, transaction ID, payment status (`INITIATED`, `SUCCESS`, `FAILED`), and payment method.
4. **GMV & Platform Analytics**: Real-time aggregation of total revenue (Gross Merchandise Value), active user growth, crop listing volumes, and regional distribution.

---

## Admin Authentication & Security

### Default Admin Credentials

Upon seeding the database via `npm run seed` (or `node seed-admin.js`), the following administrator account is bootstrapped:

| Attribute | Value |
| :--- | :--- |
| **Role** | `ADMIN` |
| **Email** | `admin@farmconnect.com` |
| **Password** | `Test@1234` |

---

### Role-Based Access Control (RBAC)

All admin HTTP endpoints are protected by double-layer middleware guards in Node.js Express:

```javascript
// Backend/src/routes/admin.routes.js
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Every route in admin.routes.js requires a valid JWT AND the ADMIN role
router.use(authenticate, authorize("ADMIN"));
```

If a user with a `FARMER` or `BUYER` token attempts to access any `/api/admin/*` endpoint, the API returns a `403 Forbidden` response:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Requires ADMIN role."
}
```

On the frontend, routes are protected by the `<ProtectedRoute roles={['ADMIN']} />` component in `App.jsx`. Non-admin users attempting to open `/admin` routes are automatically redirected to `/marketplace`.

---

## Admin Panel Modules

### 1. Dashboard Overview (`/admin`)

The central executive dashboard providing high-level metrics and visual charts:

- **Key Performance Indicators (KPI Cards)**:
  - **Total GMV / Platform Revenue**: Sum of all successful transactions.
  - **Total Registered Users**: Count of registered users with farmer/buyer breakdown.
  - **Active Crops Listed**: Total crop listings currently available.
  - **Total Orders Processed**: Cumulative orders placed across all statuses.
  - **Payment Success Rate**: Percentage of initiated orders successfully settled.
- **Data Visualizations**: Recharts / Chart.js charts displaying revenue trends and order distribution.

---

### 2. User Management (`/admin/users`)

Complete control over user accounts on the platform:

- **Paginated User Table**: Browse all registered users with server-side pagination (`page`, `limit`).
- **Real-Time Search**: Search users by full name or email address.
- **Role Filters**: Filter table to display `FARMER`, `BUYER`, or `ADMIN` accounts.
- **Detailed User View**: Modal/page view showing user details, registration date, phone number, linked `FarmerProfile` (farm location, bank details, IFSC) or `BuyerProfile` (business address, delivery location).
- **User Account Deletion**: Deletes a user account (`DELETE /api/admin/users/:id`). Deletion cascades safely in PostgreSQL/Prisma, removing or unlinking associated crops, orders, and reviews.

---

### 3. Order Oversight & Audit (`/admin/orders`)

Comprehensive monitoring of all marketplace orders:

- **Global Order Directory**: View every order placed across all farmers and buyers.
- **Status Filtering**: Filter by order lifecycle status:
  - `PENDING` — Order placed by buyer, awaiting farmer confirmation.
  - `ACCEPTED` — Order accepted by farmer.
  - `SHIPPED` — Order dispatched for transit.
  - `DELIVERED` — Order delivered to buyer.
  - `CANCELLED` / `REJECTED` — Order cancelled or rejected.
- **Order Detail Inspection**: Inspect buyer details, farmer details, ordered crops, quantities, total price, delivery address, and tracking history timeline.
- **Status Override**: Administrative power to modify an order's status when handling disputes.

---

### 4. Payment Audit (`/admin/payments`)

Financial audit log of all payment transactions:

- **Transaction Audit Log**: Review all payments logged in the database (`Payment` model).
- **Razorpay Tracking**: View `razorpayOrderId`, `transactionId`, and payment status (`INITIATED`, `SUCCESS`, `FAILED`).
- **Amount Breakdown**: Inspect exact amounts charged per order.

---

## API Reference for Admin Control

### Users API

#### `GET /api/admin/users`
Fetch a paginated list of platform users.

- **Access**: `ADMIN`
- **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `role` (string: `FARMER`, `BUYER`, `ADMIN`)
  - `search` (string: name or email search query)
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Users fetched successfully.",
    "data": {
      "users": [
        {
          "id": "u-uuid-1",
          "name": "Rajesh Kumar",
          "email": "rajesh@farmconnect.com",
          "phone": "9876543210",
          "role": "FARMER",
          "createdAt": "2026-01-15T08:30:00.000Z"
        }
      ],
      "pagination": { "total": 150, "page": 1, "totalPages": 15 }
    }
  }
  ```

#### `GET /api/admin/users/:id`
Fetch complete details for a specific user.

- **Access**: `ADMIN`
- **Path Parameter**: `:id` (User UUID)

#### `DELETE /api/admin/users/:id`
Delete a user account from the platform.

- **Access**: `ADMIN`
- **Path Parameter**: `:id` (User UUID)
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User deleted successfully."
  }
  ```

---

### Orders API

#### `GET /api/admin/orders`
Fetch a paginated list of all platform orders.

- **Access**: `ADMIN`
- **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `status` (string: `PENDING`, `ACCEPTED`, `SHIPPED`, `DELIVERED`, `CANCELLED`)

#### `PUT /api/orders/:id/status`
Update status of an order.

- **Access**: `FARMER` (for own orders) or `ADMIN` (for any order)
- **Body**: `{ "status": "SHIPPED" }`

---

### Analytics API

#### `GET /api/admin/analytics`
Fetch platform-wide aggregated analytics metrics.

- **Access**: `ADMIN`
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Analytics fetched successfully.",
    "data": {
      "users": { "total": 150, "farmers": 80, "buyers": 68, "admins": 2 },
      "crops": { "total": 245 },
      "orders": { "total": 520, "pending": 45, "accepted": 30, "shipped": 65, "delivered": 380 },
      "revenue": { "total": 2850000.50 },
      "payments": { "successful": 475 }
    }
  }
  ```

---

## Codebase Architecture & File Structure

### Frontend Files

```text
frontend/src/
├── layouts/
│   ├── AdminLayout.jsx         # Outer layout container with top Navbar & side drawer
│   └── AdminSidebar.jsx        # Navigation sidebar for Overview, Users, Orders, Payments
└── pages/admin/
    ├── AdminDashboard.jsx      # Overview dashboard with KPI cards and Recharts analytics
    ├── UsersPage.jsx           # User management page with search, role filters & delete actions
    ├── AdminOrdersPage.jsx     # Platform order oversight table & status filter
    └── PaymentsPage.jsx        # Payment audit table tracking Razorpay transactions
```

### Backend Files

```text
Backend/src/
├── routes/
│   └── admin.routes.js         # Router declaring /users, /orders, /analytics endpoints
├── controllers/
│   └── admin.controller.js    # Express controller forwarding requests to admin.service
├── services/
│   └── admin.service.js       # Business logic querying Prisma DB for user/order/analytics
└── middleware/
    └── auth.middleware.js      # authorize("ADMIN") middleware guard
```

---

## Database Models Supporting Admin Operations

The Admin Control system reads and manages data across these core Prisma models:

- **`User`**: Account identity and role (`FARMER`, `BUYER`, `ADMIN`).
- **`FarmerProfile` & `BuyerProfile`**: Linked profile details displayed in User Management.
- **`Order` & `OrderItem`**: Order data audited in Admin Orders.
- **`Payment`**: Payment status and Razorpay transaction IDs audited in Admin Payments.
- **`Crop`**: Crop inventory data aggregated in Analytics metrics.

---

## Link References
- Main Repository Overview: [`README.md`](README.md)
- Deployment Guidelines: [`DEPLOYMENT.md`](DEPLOYMENT.md)
