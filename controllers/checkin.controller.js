const prisma = require("../models/prisma");

const checkin = async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Thiếu customerId" });
    }

    const id = Number(customerId);

    // 🔍 Kiểm tra khách có tồn tại không
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    // 🔍 Tìm subscription active
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: id, status: "active" },
    });

    // ========================================
    //  Logic checkin:
    //  - Hội viên (có sub active + isPaid)  → cho checkin
    //  - Hết hạn (không có sub active)      → báo lỗi
    //  - Vãng lai (không có sub nào)        → cho checkin không cần sub
    // ========================================

    const hasAnySubscription = await prisma.subscription.count({
      where: { customerId: id },
    });

    const isGuest = hasAnySubscription === 0; // không có sub nào → vãng lai

    if (!isGuest) {
      // Có subscription nhưng không có cái nào active → hết hạn
      if (!subscription) {
        return res
          .status(400)
          .json({ message: "Gói tập đã hết hạn, vui lòng gia hạn" });
      }

      // Có active nhưng chưa thanh toán
      if (!subscription.isPaid) {
        return res.status(400).json({ message: "Chưa thanh toán gói tập" });
      }

      // Double-check endDate
      if (subscription.endDate < new Date()) {
        return res.status(400).json({ message: "Gói tập đã hết hạn" });
      }
    }

    const now = new Date();

    // 🔥 Chống spam checkin (5 giây)
    const lastCheckin = await prisma.checkin.findFirst({
      where: { customerId: id },
      orderBy: { checkinTime: "desc" },
    });

    if (lastCheckin) {
      const diff = (now - lastCheckin.checkinTime) / 1000;
      if (diff < 5) {
        return res
          .status(400)
          .json({ message: "Check-in quá nhanh, vui lòng đợi vài giây" });
      }
    }

    // ✅ Tạo checkin
    const newCheckin = await prisma.checkin.create({
      data: {
        customerId: id,
        checkinTime: now,
        createdAt: now,
      },
    });

    const typeLabel = isGuest ? "vãng lai" : "hội viên";

    return res.json({
      message: `Check-in thành công (${typeLabel})`,
      data: newCheckin,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

const getCheckinsByCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    if (!customerId) {
      return res.status(400).json({
        message: "Thiếu customerId",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Không tìm thấy khách hàng",
      });
    }

    const data = await prisma.checkin.findMany({
      where: { customerId },
      orderBy: {
        checkinTime: "desc",
      },
    });

    return res.json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = { checkin, getCheckinsByCustomer };
