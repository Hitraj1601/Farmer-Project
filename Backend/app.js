require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./src/routes/auth.routes");
const cropRoutes = require("./src/routes/crop.routes");
const bulkCropRoutes = require("./src/routes/bulkCrop.routes");
const orderRoutes = require("./src/routes/order.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const reviewRoutes = require("./src/routes/review.routes");
const adminRoutes = require("./src/routes/admin.routes");
const profileRoutes = require("./src/routes/profile.routes");
const analyticsRoutes = require("./src/routes/analytics.routes");
const wishlistRoutes = require("./src/routes/wishlist.routes");
const errorHandler = require("./src/middleware/error.middleware");
const { initSocket } = require("./src/config/socket");

const app = express();
const httpServer = http.createServer(app);

// Fail fast on missing critical configuration
const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error("Missing required environment variables:", missingEnv.join(", "));
  console.error("Create Backend/.env from Backend/.env.example (or set env vars in your hosting provider).");
  process.exit(1);
}

// Render/most PaaS run behind a reverse proxy (needed for correct IP + rate limiting)
app.set("trust proxy", 1);

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS configuration
const corsOriginEnv = process.env.CORS_ORIGIN;
const corsOrigins = !corsOriginEnv
  ? "*"
  : corsOriginEnv
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Socket.io — shares the same port as Express
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins === "*" ? "*" : corsOrigins,
    methods: ["GET", "POST"],
  },
});
initSocket(io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Farmer Marketplace API Running" });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/crops/bulk-upload", bulkCropRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/wishlist", wishlistRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs: http://localhost:${PORT}`);
});