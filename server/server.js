const dns = require("dns");

// MongoDB Atlas SRV DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth/auth-routes");

// ===============================
// Admin Routes
// ===============================

const adminDashboardRouter = require("./routes/admin/dashboard-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminUserRouter = require("./routes/admin/user-routes");
const adminOfferRouter = require("./routes/admin/offer-routes");

const aiRouter = require("./routes/ai/ai-routes");

// ===============================
// Shop Routes
// ===============================

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopWishlistRouter = require("./routes/shop/wishlist-routes");
const shopCouponRouter = require("./routes/shop/coupon-routes");

// ===============================
// Common Routes
// ===============================

const commonFeatureRouter = require("./routes/common/feature-routes");

// ===============================
// Express App
// ===============================

const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: "https://ecommerce-1-a4jj.onrender.com",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

// ===============================
// Health Check / Root Route
// ===============================

app.get("/", (req, res) => {
  res.status(200).send("Ecommerce Backend is running successfully!");
});

// ===============================
// Authentication Routes
// ===============================

app.use("/api/auth", authRouter);

// ===============================
// Admin Routes
// ===============================

// Dashboard
app.use(
  "/api/admin/dashboard",
  adminDashboardRouter
);

// Products
app.use(
  "/api/admin/products",
  adminProductsRouter
);

// Orders
app.use(
  "/api/admin/orders",
  adminOrderRouter
);

// Users
app.use(
  "/api/admin/users",
  adminUserRouter
);

// Offers & Coupons
app.use(
  "/api/admin/offers",
  adminOfferRouter
);

// ===============================
// AI Routes
// ===============================

app.use(
  "/api/ai",
  aiRouter
);

// ===============================
// Shop Routes
// ===============================

// Products
app.use(
  "/api/shop/products",
  shopProductsRouter
);

// Cart
app.use(
  "/api/shop/cart",
  shopCartRouter
);

// Address
app.use(
  "/api/shop/address",
  shopAddressRouter
);

// Orders
app.use(
  "/api/shop/order",
  shopOrderRouter
);

// Search
app.use(
  "/api/shop/search",
  shopSearchRouter
);

// Reviews
app.use(
  "/api/shop/review",
  shopReviewRouter
);

// Wishlist
app.use(
  "/api/shop/wishlist",
  shopWishlistRouter
);

// Customer Coupon
app.use(
  "/api/shop/coupon",
  shopCouponRouter
);

// ===============================
// Common Routes
// ===============================

app.use(
  "/api/common/feature",
  commonFeatureRouter
);

// ===============================
// MongoDB Connection + Start Server
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `Server is now running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );

    console.error(
      "Server was NOT started because MongoDB connection failed."
    );
  });