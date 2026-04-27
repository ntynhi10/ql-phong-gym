const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth.middleware");
const controller = require("../controllers/checkin.controller");

router.post("/", authenticate, controller.checkin);

module.exports = router;
