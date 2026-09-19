const express = require("express");

const {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
} = require("../../controllers/admin/offer-controller");

const { adminMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Get all offers
router.get("/get", adminMiddleware, getAllOffers);

// Get single offer
router.get("/details/:id", adminMiddleware, getOfferById);

// Create offer
router.post("/create", adminMiddleware, createOffer);

// Update offer
router.put("/update/:id", adminMiddleware, updateOffer);

// Delete offer
router.delete("/delete/:id", adminMiddleware, deleteOffer);

// Toggle active/inactive
router.put("/toggle-status/:id", adminMiddleware, toggleOfferStatus);

module.exports = router;