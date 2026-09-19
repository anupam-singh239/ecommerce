const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
  {
    // ==========================================
    // COUPON CODE
    // ==========================================

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ==========================================
    // OFFER TITLE
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // DISCOUNT TYPE
    // ==========================================

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    // ==========================================
    // DISCOUNT VALUE
    // ==========================================

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // MINIMUM ORDER AMOUNT
    // ==========================================

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // COUPON USAGE LIMIT
    // 0 = UNLIMITED
    // ==========================================

    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // COUPON USED COUNT
    // ==========================================

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // START DATE
    // ==========================================

    startDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // EXPIRY DATE
    // ==========================================

    expiryDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;