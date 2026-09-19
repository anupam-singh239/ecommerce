const express = require("express");

const {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
} = require("../../controllers/admin/user-controller");

const {
  adminMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/get",
  adminMiddleware,
  getAllUsers
);

// ==========================================
// GET USER DETAILS
// ==========================================

router.get(
  "/details/:id",
  adminMiddleware,
  getUserDetails
);

// ==========================================
// UPDATE USER ROLE
// ==========================================

router.put(
  "/update-role/:id",
  adminMiddleware,
  updateUserRole
);

// ==========================================
// DELETE USER
// ==========================================

router.delete(
  "/delete/:id",
  adminMiddleware,
  deleteUser
);

module.exports = router;