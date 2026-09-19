const express = require("express");

const {
  applyCoupon,
} = require("../../controllers/shop/coupon-controller");

const {
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Customer Apply Coupon
router.post(
  "/apply",
  authMiddleware,
  applyCoupon
);

module.exports = router;