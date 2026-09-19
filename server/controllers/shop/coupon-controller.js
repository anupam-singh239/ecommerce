const Offer = require("../../models/Offer");
const Order = require("../../models/Order");

// ==========================================
// APPLY COUPON
// ==========================================

const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code",
      });
    }

    if (
      orderAmount === undefined ||
      Number.isNaN(Number(orderAmount)) ||
      Number(orderAmount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const normalizedCode = code
      .trim()
      .toUpperCase();

    const amount = Number(orderAmount);

    // ==========================================
    // FIND COUPON
    // ==========================================

    const offer = await Offer.findOne({
      code: normalizedCode,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // ==========================================
    // CHECK MANUAL STATUS
    // ==========================================

    if (offer.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive",
      });
    }

    // ==========================================
    // CHECK START & EXPIRY DATE
    // ==========================================

    const currentDate = new Date();

    const startDate = new Date(
      offer.startDate
    );

    const expiryDate = new Date(
      offer.expiryDate
    );

    if (currentDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet",
      });
    }

    if (currentDate > expiryDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    // ==========================================
    // USAGE LIMIT
    // ==========================================

    const usageLimit = Number(
      offer.usageLimit || 0
    );

    // ==========================================
    // COUNT ACTUAL ORDERS
    // ==========================================

    /*
      We count actual successful orders using
      this coupon.

      This makes the usage limit reliable even
      if Offer.usedCount is incorrect.
    */

    let actualUsedCount = 0;

    if (usageLimit > 0) {
      actualUsedCount =
        await Order.countDocuments({
          couponCode: normalizedCode,
        });

      if (
        actualUsedCount >= usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon usage limit has been reached",
        });
      }
    }

    // ==========================================
    // SYNC USED COUNT
    // ==========================================

    /*
      Keep Offer.usedCount synchronized with
      actual successful orders.
    */

    if (
      usageLimit > 0 &&
      Number(offer.usedCount || 0) !==
        actualUsedCount
    ) {
      await Offer.updateOne(
        {
          _id: offer._id,
        },
        {
          $set: {
            usedCount: actualUsedCount,
          },
        }
      );
    }

    // ==========================================
    // CHECK MINIMUM ORDER
    // ==========================================

    const minimumOrderAmount = Number(
      offer.minimumOrderAmount || 0
    );

    if (
      amount < minimumOrderAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${minimumOrderAmount.toLocaleString(
          "en-IN"
        )}`,
      });
    }

    // ==========================================
    // CALCULATE DISCOUNT
    // ==========================================

    let discountAmount = 0;

    if (
      offer.discountType ===
      "percentage"
    ) {
      discountAmount =
        (amount *
          Number(
            offer.discountValue
          )) /
        100;
    } else if (
      offer.discountType === "fixed"
    ) {
      discountAmount = Number(
        offer.discountValue
      );
    }

    // ==========================================
    // DISCOUNT CANNOT EXCEED ORDER AMOUNT
    // ==========================================

    discountAmount = Math.min(
      discountAmount,
      amount
    );

    discountAmount =
      Math.round(
        discountAmount * 100
      ) / 100;

    const finalAmount =
      Math.round(
        (amount -
          discountAmount) *
          100
      ) / 100;

    // ==========================================
    // REMAINING USES
    // ==========================================

    let remainingUses = null;

    if (usageLimit > 0) {
      remainingUses = Math.max(
        usageLimit -
          actualUsedCount,
        0
      );
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(200).json({
      success: true,

      message:
        "Coupon applied successfully",

      data: {
        offerId: offer._id,

        code: offer.code,

        title: offer.title,

        discountType:
          offer.discountType,

        discountValue:
          offer.discountValue,

        orderAmount: amount,

        discountAmount,

        finalAmount,

        usageLimit,

        usedCount:
          actualUsedCount,

        remainingUses,
      },
    });
  } catch (error) {
    console.log(
      "Apply Coupon Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to apply coupon",
    });
  }
};

module.exports = {
  applyCoupon,
};