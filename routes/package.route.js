const express = require("express");
const router = express.Router();

const {
  getPackages,
  createPackage,
  updatePackage,
  togglePackageStatus,
} = require("../controllers/package.controller");

router.get("/", getPackages);
router.post("/", createPackage);
router.put("/:id", updatePackage);
router.patch("/:id/status", togglePackageStatus);

module.exports = router;
