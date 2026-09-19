const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

const addProductReview = async (req, res) => {
  try {
    const {
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    } = req.body;

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Product and user information is required.",
      });
    }

    if (!reviewMessage || !reviewMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please write a review.",
      });
    }

    const rating = Number(reviewValue);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // -----------------------------
    // CHECK PRODUCT
    // -----------------------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // -----------------------------
    // CHECK PURCHASE
    // -----------------------------

    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message:
          "You need to purchase this product before reviewing it.",
      });
    }

    // -----------------------------
    // CHECK EXISTING REVIEW
    // -----------------------------

    const existingReview = await ProductReview.findOne({
      productId,
      userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product.",
      });
    }

    // -----------------------------
    // CREATE REVIEW
    // -----------------------------

    const newReview = new ProductReview({
      productId,
      userId,
      userName: userName || "User",
      reviewMessage: reviewMessage.trim(),
      reviewValue: rating,
    });

    await newReview.save();

    // -----------------------------
    // CALCULATE AVERAGE RATING
    // -----------------------------

    const reviews = await ProductReview.find({
      productId,
    });

    const totalReviews = reviews.length;

    const averageReview =
      totalReviews > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + Number(review.reviewValue || 0),
            0
          ) / totalReviews
        : 0;

    // -----------------------------
    // UPDATE PRODUCT RATING
    // -----------------------------

    await Product.findByIdAndUpdate(
      productId,
      {
        averageReview: Number(
          averageReview.toFixed(1)
        ),
      }
    );

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: "Review added successfully!",
      data: newReview,
      averageReview: Number(
        averageReview.toFixed(1)
      ),
    });
  } catch (e) {
    console.log(
      "ADD PRODUCT REVIEW ERROR:",
      e
    );

    return res.status(500).json({
      success: false,
      message:
        e?.message ||
        "Something went wrong while adding review.",
    });
  }
};


// =====================================================
// GET PRODUCT REVIEWS
// =====================================================

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const reviews = await ProductReview.find({
      productId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.log(
      "GET PRODUCT REVIEWS ERROR:",
      e
    );

    return res.status(500).json({
      success: false,
      message:
        e?.message ||
        "Something went wrong while fetching reviews.",
    });
  }
};

module.exports = {
  addProductReview,
  getProductReviews,
};