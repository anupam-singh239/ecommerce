const Product = require("../../models/Product");

// ==========================================
// GET FILTERED PRODUCTS
// ==========================================

const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = "",
      brand = "",
      sortBy = "price-lowtohigh",
    } = req.query;

    let filters = {};

    // ========================================
    // CATEGORY FILTER
    // Case-insensitive + trim
    // ========================================

    if (category) {
      const categories = category
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (categories.length > 0) {
        filters.category = {
          $in: categories.map(
            (item) => new RegExp(`^${escapeRegex(item)}$`, "i")
          ),
        };
      }
    }

    // ========================================
    // BRAND FILTER
    // Case-insensitive + trim
    // ========================================

    if (brand) {
      const brands = brand
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (brands.length > 0) {
        filters.brand = {
          $in: brands.map(
            (item) => new RegExp(`^${escapeRegex(item)}$`, "i")
          ),
        };
      }
    }

    // ========================================
    // SORT
    // ========================================

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;

      case "price-hightolow":
        sort.price = -1;
        break;

      case "title-atoz":
        sort.title = 1;
        break;

      case "title-ztoa":
        sort.title = -1;
        break;

      default:
        sort.price = 1;
        break;
    }

    // ========================================
    // GET PRODUCTS
    // ========================================

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log("Get filtered products error:", e);

    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// ==========================================
// ESCAPE REGEX
// ==========================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ==========================================
// GET PRODUCT DETAILS
// ==========================================

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log("Get product details error:", e);

    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getFilteredProducts,
  getProductDetails,
};