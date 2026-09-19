const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

const {
  adminMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.get(
  "/get",
  adminMiddleware,
  getAllOrdersOfAllUsers
);

router.get(
  "/details/:id",
  adminMiddleware,
  getOrderDetailsForAdmin
);

router.put(
  "/update/:id",
  adminMiddleware,
  updateOrderStatus
);

module.exports = router;