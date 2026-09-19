const express = require("express");

const {
  getDashboardStats,
} = require("../../controllers/admin/dashboard-controller");

const {
  adminMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.get("/stats", adminMiddleware, getDashboardStats);

module.exports = router;