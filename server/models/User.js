const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // =====================================
    // USER NAME
    // =====================================

    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // =====================================
    // EMAIL
    // =====================================

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // =====================================
    // PHONE
    // =====================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================
    // PROFILE IMAGE
    // =====================================

    profileImage: {
      type: String,
      default: "",
    },

    // =====================================
    // PASSWORD
    // =====================================

    password: {
      type: String,
      required: true,
    },

    // =====================================
    // USER ROLE
    // =====================================

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    // =====================================
    // WISHLIST
    // =====================================

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    // Automatically creates:
    // createdAt
    // updatedAt
    timestamps: true,
  }
);

// =====================================
// USER MODEL
// =====================================

const User = mongoose.model("User", UserSchema);

module.exports = User;