const express = require("express");
const router = express.Router();

const controller = require("../controllers/customer.controller");
const { authorize } = require("../middleware/auth.middleware");

router.get("/", controller.getCustomers);
router.get("/:id/detail", controller.getCustomerDetail);
router.get("/:id", controller.getCustomerById);
router.post("/", controller.createCustomer);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", authorize(["admin"]), controller.deleteCustomer);

module.exports = router;
