const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPayPalOrder,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// ==========================================
// NORMAL / COD ORDER
// ==========================================

router.post("/create", createOrder);

// ==========================================
// RAZORPAY PAYMENT
// ==========================================

router.post("/razorpay/create", createRazorpayOrder);

router.post("/razorpay/verify", verifyRazorpayPayment);

// ==========================================
// PAYPAL PAYMENT
// ==========================================

// Create PayPal order
router.post("/paypal/create", createPayPalOrder);

// Capture PayPal payment
router.post("/capture", capturePayment);

// ==========================================
// USER ORDERS
// ==========================================

router.get("/list/:userId", getAllOrdersByUser);

// ==========================================
// ORDER DETAILS
// ==========================================

router.get("/details/:id", getOrderDetails);

module.exports = router;
