const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth.middleware");
const { getPackages, createPackage } = require("../controllers/package.controller");

// ai cũng xem được
router.get("/", authenticate, getPackages);

// chỉ admin
router.post("/", authenticate, authorize(["admin"]), createPackage);

module.exports = router;