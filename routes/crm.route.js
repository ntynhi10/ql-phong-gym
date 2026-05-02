const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth.middleware");
const { getCRM } = require("../controllers/crm.controller");

router.get("/", authenticate, getCRM);
module.exports = router;