const Order = require("../../models/Order");


// ==========================================
// GET ALL ORDERS
// ==========================================

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {

    console.log("Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};


// ==========================================
// GET ORDER DETAILS
// ==========================================

const getOrderDetailsForAdmin = async (req, res) => {
  try {

    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {

    console.log("Get Order Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get order details",
    });
  }
};


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;
    order.orderUpdateDate = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });

  } catch (error) {

    console.log("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};


module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};