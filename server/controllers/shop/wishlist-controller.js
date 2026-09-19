const User = require("../../models/User");
const Product = require("../../models/Product");

// ==========================================
// ADD TO WISHLIST
// ==========================================

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Existing users ke liye wishlist initialize
    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    // Check whether product already exists
    const alreadyExists = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    user.wishlist.push(productId);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.log("Add Wishlist Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// ==========================================
// REMOVE FROM WISHLIST
// ==========================================

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.log("Remove Wishlist Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

// ==========================================
// GET WISHLIST
// ==========================================

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    console.log("Get Wishlist Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};