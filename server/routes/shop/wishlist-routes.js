const express = require("express");

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../../controllers/shop/wishlist-controller");

const {
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// =====================================
// GET USER WISHLIST
// =====================================

router.get(
  "/get",
  authMiddleware,
  getWishlist
);

// =====================================
// ADD PRODUCT TO WISHLIST
// =====================================

router.post(
  "/add",
  authMiddleware,
  addToWishlist
);

// =====================================
// REMOVE PRODUCT FROM WISHLIST
// =====================================

router.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromWishlist
);

module.exports = router;