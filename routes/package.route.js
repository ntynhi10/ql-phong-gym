
const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth.middleware");

const {
  getPackages,
  createPackage,
  updatePackage,
  togglePackageStatus,
} = require("../controllers/package.controller");

// ai login cũng xem được
router.get("/", authenticate, getPackages);

// chỉ admin
router.post("/", authenticate, authorize(["admin"]), createPackage);
router.put("/:id", authenticate, authorize(["admin"]), updatePackage);
router.patch("/:id/status", authenticate, authorize(["admin"]), togglePackageStatus);

module.exports = router;