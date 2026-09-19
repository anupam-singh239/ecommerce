const User = require("../../models/User");
const Product = require("../../models/Product");
const Order = require("../../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    // Total products
    const totalProducts = await Product.countDocuments();

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    // Recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "_id userId cartItems addressInfo orderStatus paymentStatus totalAmount createdAt"
      );

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    console.log("Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};