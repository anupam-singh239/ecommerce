const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { imageUploadUtil } = require("../../helpers/cloudinary");

// ===============================
// Register User
// ===============================
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.json({
        success: false,
        message:
          "User Already exists with the same email! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      role: "user",
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// ===============================
// Login User / Admin
// ===============================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );

    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60m",
      }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id,
          userName: checkUser.userName,
          phone: checkUser.phone || "",
          profileImage: checkUser.profileImage || "",
        },
      });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// ===============================
// Logout
// ===============================
const logoutUser = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged out successfully!",
    });
};

// ===============================
// Authentication Middleware
// ===============================
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.log(
      "JWT verification error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

// ===============================
// Admin Middleware
// ===============================
const adminMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required!",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied! Admin only.",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.log(
      "Admin authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Unauthorised admin!",
    });
  }
};

// =====================================================
// UPDATE USER PROFILE
// =====================================================
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      userName,
      email,
      phone,
    } = req.body;

    if (!userName || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: {
        $ne: userId,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already registered with another account",
      });
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          userName: userName.trim(),
          email: email
            .toLowerCase()
            .trim(),
          phone: phone
            ? phone.trim()
            : "",
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newToken = jwt.sign(
      {
        id: updatedUser._id,
        role: updatedUser.role,
        email: updatedUser.email,
        userName: updatedUser.userName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60m",
      }
    );

    res
      .cookie("token", newToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        message:
          "Profile updated successfully",
        user: {
          id: updatedUser._id,
          userName:
            updatedUser.userName,
          email: updatedUser.email,
          phone:
            updatedUser.phone || "",
          profileImage:
            updatedUser.profileImage ||
            "",
          role: updatedUser.role,
        },
      });
  } catch (error) {
    console.log(
      "Update Profile Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating profile",
    });
  }
};

// =====================================================
// UPDATE PROFILE IMAGE
// =====================================================
const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Profile image is required",
      });
    }

    // Convert image buffer to Base64
    const b64 = Buffer.from(
      req.file.buffer
    ).toString("base64");

    const imageData =
      `data:${req.file.mimetype};base64,${b64}`;

    // Upload image to Cloudinary
    const result =
      await imageUploadUtil(
        imageData
      );

    // Save Cloudinary URL in MongoDB
    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          profileImage:
            result.secure_url,
        },
        {
          new: true,
        }
      ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send updated user data
    res.status(200).json({
      success: true,
      message:
        "Profile image updated successfully",
      user: {
        id: updatedUser._id,
        userName:
          updatedUser.userName,
        email: updatedUser.email,
        phone:
          updatedUser.phone || "",
        profileImage:
          updatedUser.profileImage || "",
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.log(
      "Profile Image Upload Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to upload profile image",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================
const changePassword = async (req, res) => {
  try {
    // Logged-in user ID
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // ===============================
    // VALIDATION
    // ===============================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All password fields are required",
      });
    }

    // ===============================
    // NEW PASSWORD MATCH
    // ===============================

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    // ===============================
    // PASSWORD LENGTH
    // ===============================

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // ===============================
    // GET USER
    // ===============================

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ===============================
    // CHECK CURRENT PASSWORD
    // ===============================

    const isCurrentPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // ===============================
    // PREVENT SAME PASSWORD
    // ===============================

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // ===============================
    // HASH NEW PASSWORD
    // ===============================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ===============================
    // SAVE NEW PASSWORD
    // ===============================

    user.password =
      hashedPassword;

    await user.save();

    // ===============================
    // SUCCESS
    // ===============================

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.log(
      "Change Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing password",
    });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  adminMiddleware,
  updateUserProfile,
  updateProfileImage,
  changePassword,
};