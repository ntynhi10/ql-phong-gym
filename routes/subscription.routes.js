const express = require("express");
const router = express.Router();

const controller = require("../controllers/subscription.controller");

router.get("/", controller.getSubscriptions);
router.post("/", controller.createSubscription);
router.put("/:id/pay", controller.paySubscription);

module.exports = router;
