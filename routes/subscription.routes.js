const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth.middleware");
const controller = require("../controllers/subscription.controller");

router.get("/", authenticate, controller.getSubscriptions);
router.post("/", authenticate, controller.createSubscription);
router.patch("/:id/pay", authenticate, controller.paySubscription);

module.exports = router;
