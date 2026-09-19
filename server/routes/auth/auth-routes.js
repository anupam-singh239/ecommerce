const express = require("express");

const User = require("../../models/User");

const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  adminMiddleware,
  updateUserProfile,
  updateProfileImage,
  changePassword,
} = require("../../controllers/auth/auth-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// ===============================
// User Authentication Routes
// ===============================

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/logout",
  logoutUser
);

// ===============================
// UPDATE USER PROFILE
// ===============================

router.put(
  "/profile",
  authMiddleware,
  updateUserProfile
);

// ===============================
// UPDATE PROFILE IMAGE
// ===============================

router.put(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  updateProfileImage
);

// ===============================
// CHANGE PASSWORD
// ===============================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// ===============================
// CHECK LOGGED-IN USER
// ===============================

router.get(
  "/check-auth",
  authMiddleware,
  async (req, res) => {
    try {
      // Get complete user data from MongoDB
      const user = await User.findById(
        req.user.id
      ).select("-password");

      // User not found
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Send complete user data
      res.status(200).json({
        success: true,
        message: "Authenticated user!",
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phone: user.phone || "",
          profileImage:
            user.profileImage || "",
          role: user.role,
        },
      });
    } catch (error) {
      console.log(
        "Check Auth Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to authenticate user",
      });
    }
  }
);

// ===============================
// CHECK ADMIN AUTHENTICATION
// ===============================

router.get(
  "/check-admin",
  adminMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Authenticated admin!",
      user: req.user,
    });
  }
);

// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;