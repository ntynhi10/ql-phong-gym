const prisma = require("../models/prisma");

const checkin = async (req, res) => {
  try {
    const { customerId } = req.body;

    // ❌ thiếu id
    if (!customerId) {
      return res.status(400).json({
        message: "Thiếu customerId",
      });
    }

    const id = Number(customerId);

    // 🔍 tìm subscription active
    const subscription = await prisma.subscription.findFirst({
      where: {
        customerId: id,
        status: "active",
      },
    });

    if (!subscription) {
      return res.status(400).json({
        message: "Không có gói active",
      });
    }

    // ❌ chưa thanh toán
    if (!subscription.isPaid) {
      return res.status(400).json({
        message: "Chưa thanh toán",
      });
    }

    // ❌ hết hạn
    if (subscription.endDate < new Date()) {
      return res.status(400).json({
        message: "Gói đã hết hạn",
      });
    }

    // 🔥 chống spam (5 giây)
    const lastCheckin = await prisma.checkin.findFirst({
      where: { customerId: id },
      orderBy: { checkinTime: "desc" },
    });

    if (lastCheckin) {
      const now = new Date();
      const diff = (now - lastCheckin.checkinTime) / 1000;

      if (diff < 5) {
        return res.status(400).json({
          message: "Check-in quá nhanh, vui lòng đợi vài giây",
        });
      }
    }

    // ✅ tạo checkin
    const newCheckin = await prisma.checkin.create({
      data: {
        customerId: id,
      },
    });

    return res.json({
      message: "Check-in thành công",
      data: newCheckin,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = { checkin };
