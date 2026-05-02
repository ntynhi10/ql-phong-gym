const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");

router.post("/", async (req, res) => {
  try {
    const { customerId, note } = req.body;

    console.log("BODY:", req.body);

    const newNote = await prisma.customerNote.create({
      data: {
        customerId,
        note,
      }
    });

    res.json(newNote);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Lỗi lưu note" });
  }
});

module.exports = router;