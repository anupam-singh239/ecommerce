const Offer = require("../../models/Offer");

// ==========================================
// GET ALL OFFERS
// ==========================================

const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({}).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.log("Get All Offers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get offers",
    });
  }
};

// ==========================================
// GET SINGLE OFFER
// ==========================================

const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.log("Get Offer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get offer",
    });
  }
};

// ==========================================
// CREATE OFFER
// ==========================================

const createOffer = async (req, res) => {
  try {
    const {
      code,
      title,
      discountType,
      discountValue,
      minimumOrderAmount,
      startDate,
      expiryDate,
      status,
      usageLimit,
    } = req.body;

    // ==========================================
    // REQUIRED VALIDATION
    // ==========================================

    if (
      !code ||
      !title ||
      !discountType ||
      discountValue === undefined ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ==========================================
    // DISCOUNT TYPE
    // ==========================================

    if (
      !["percentage", "fixed"].includes(
        discountType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    // ==========================================
    // DISCOUNT VALUE
    // ==========================================

    if (Number(discountValue) < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Discount value cannot be negative",
      });
    }

    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot exceed 100%",
      });
    }

    // ==========================================
    // MINIMUM ORDER
    // ==========================================

    const minimumAmount = Number(
      minimumOrderAmount || 0
    );

    if (minimumAmount < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum order amount cannot be negative",
      });
    }

    // ==========================================
    // USAGE LIMIT
    // ==========================================

    const limit = Number(
      usageLimit || 0
    );

    /*
      usageLimit = 0
      means unlimited.

      usageLimit > 0
      means coupon can be used only
      that many times.
    */

    if (limit < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Usage limit cannot be negative",
      });
    }

    // ==========================================
    // DATE VALIDATION
    // ==========================================

    if (
      new Date(expiryDate) <
      new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date cannot be before start date",
      });
    }

    // ==========================================
    // CHECK DUPLICATE CODE
    // ==========================================

    const normalizedCode =
      code.trim().toUpperCase();

    const existingOffer =
      await Offer.findOne({
        code: normalizedCode,
      });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code already exists",
      });
    }

    // ==========================================
    // CREATE OFFER
    // ==========================================

    const newOffer = new Offer({
      code: normalizedCode,

      title: title.trim(),

      discountType,

      discountValue:
        Number(discountValue),

      minimumOrderAmount:
        minimumAmount,

      startDate,

      expiryDate,

      status:
        status === "inactive"
          ? "inactive"
          : "active",

      // ======================================
      // USAGE LIMIT
      // ======================================

      usageLimit: limit,

      // Always start from zero
      usedCount: 0,
    });

    await newOffer.save();

    return res.status(201).json({
      success: true,
      message:
        "Offer created successfully",
      data: newOffer,
    });
  } catch (error) {
    console.log(
      "Create Offer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create offer",
    });
  }
};

// ==========================================
// UPDATE OFFER
// ==========================================

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      code,
      title,
      discountType,
      discountValue,
      minimumOrderAmount,
      startDate,
      expiryDate,
      status,
      usageLimit,
    } = req.body;

    const offer =
      await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // ==========================================
    // DISCOUNT TYPE
    // ==========================================

    if (
      discountType &&
      !["percentage", "fixed"].includes(
        discountType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    // ==========================================
    // DISCOUNT VALUE
    // ==========================================

    if (
      discountValue !== undefined &&
      Number(discountValue) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount value cannot be negative",
      });
    }

    const finalDiscountType =
      discountType ||
      offer.discountType;

    if (
      finalDiscountType === "percentage" &&
      discountValue !== undefined &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot exceed 100%",
      });
    }

    // ==========================================
    // MINIMUM ORDER
    // ==========================================

    if (
      minimumOrderAmount !== undefined &&
      Number(minimumOrderAmount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum order amount cannot be negative",
      });
    }

    // ==========================================
    // USAGE LIMIT
    // ==========================================

    if (
      usageLimit !== undefined
    ) {
      const newLimit =
        Number(usageLimit);

      if (newLimit < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Usage limit cannot be negative",
        });
      }

      /*
        Cannot set a limit lower than
        already used coupons.

        Example:
        usedCount = 5
        usageLimit cannot be 3 or 4.
      */

      if (
        newLimit > 0 &&
        newLimit < Number(offer.usedCount || 0)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Usage limit cannot be less than used count (${offer.usedCount || 0})`,
        });
      }

      offer.usageLimit =
        newLimit;
    }

    // ==========================================
    // DATE VALIDATION
    // ==========================================

    const finalStartDate =
      startDate ||
      offer.startDate;

    const finalExpiryDate =
      expiryDate ||
      offer.expiryDate;

    if (
      new Date(finalExpiryDate) <
      new Date(finalStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date cannot be before start date",
      });
    }

    // ==========================================
    // CODE
    // ==========================================

    if (code) {
      const normalizedCode =
        code.trim().toUpperCase();

      const existingOffer =
        await Offer.findOne({
          code: normalizedCode,
          _id: { $ne: id },
        });

      if (existingOffer) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code already exists",
        });
      }

      offer.code =
        normalizedCode;
    }

    // ==========================================
    // UPDATE FIELDS
    // ==========================================

    if (title !== undefined) {
      offer.title =
        title.trim();
    }

    if (
      discountType !== undefined
    ) {
      offer.discountType =
        discountType;
    }

    if (
      discountValue !== undefined
    ) {
      offer.discountValue =
        Number(discountValue);
    }

    if (
      minimumOrderAmount !== undefined
    ) {
      offer.minimumOrderAmount =
        Number(minimumOrderAmount);
    }

    if (
      startDate !== undefined
    ) {
      offer.startDate =
        startDate;
    }

    if (
      expiryDate !== undefined
    ) {
      offer.expiryDate =
        expiryDate;
    }

    if (
      status !== undefined
    ) {
      offer.status =
        status === "inactive"
          ? "inactive"
          : "active";
    }

    await offer.save();

    return res.status(200).json({
      success: true,
      message:
        "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.log(
      "Update Offer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update offer",
    });
  }
};

// ==========================================
// DELETE OFFER
// ==========================================

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer =
      await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await Offer.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Offer deleted successfully",
    });
  } catch (error) {
    console.log(
      "Delete Offer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete offer",
    });
  }
};

// ==========================================
// TOGGLE OFFER STATUS
// ==========================================

const toggleOfferStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const offer =
      await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.status =
      offer.status === "active"
        ? "inactive"
        : "active";

    await offer.save();

    return res.status(200).json({
      success: true,
      message: `Offer ${
        offer.status === "active"
          ? "activated"
          : "deactivated"
      } successfully`,
      data: offer,
    });
  } catch (error) {
    console.log(
      "Toggle Offer Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update offer status",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
};