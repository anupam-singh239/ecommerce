const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const {
  adminMiddleware,
} = require("../../controllers/auth/auth-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// ===============================
// Admin Product Routes
// ===============================

// Upload product image
router.post(
  "/upload-image",
  adminMiddleware,
  upload.single("my_file"),
  handleImageUpload
);

// Add product
router.post("/add", adminMiddleware, addProduct);

// Edit product
router.put("/edit/:id", adminMiddleware, editProduct);

// Delete product
router.delete("/delete/:id", adminMiddleware, deleteProduct);

// Get all products
router.get("/get", adminMiddleware, fetchAllProducts);

module.exports = router;