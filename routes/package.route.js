const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/auth.middleware");

const {
  getPackages,
  createPackage,
  updatePackage,
  togglePackageStatus,
} = require("../controllers/package.controller");

router.get("/", getPackages);
router.post("/", authorize(["admin"]), createPackage);
router.put("/:id", authorize(["admin"]), updatePackage);
router.patch("/:id/status", authorize(["admin"]), togglePackageStatus);

module.exports = router;
