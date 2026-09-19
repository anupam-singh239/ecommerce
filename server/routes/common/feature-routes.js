const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

// Add banner
router.post("/add", addFeatureImage);

// Get all banners
router.get("/get", getFeatureImages);

// Delete banner
router.delete("/delete/:id", deleteFeatureImage);

module.exports = router;