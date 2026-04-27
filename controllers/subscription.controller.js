const prisma = require("../models/prisma");

// 🔥 GET ALL
const getSubscriptions = async (req, res) => {
  try {
    const data = await prisma.subscription.findMany({
      include: {
        customer: true,
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 CREATE
const createSubscription = async (req, res) => {
  try {
    const { customerId, packageId } = req.body;

    if (!customerId || !packageId) {
      return res.status(400).json({
        message: "Thiếu dữ liệu",
      });
    }

    // lấy package để tính thời hạn
    const pkg = await prisma.package.findUnique({
      where: { id: Number(packageId) },
    });

    if (!pkg) {
      return res.status(404).json({
        message: "Không tìm thấy gói",
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + pkg.durationMonths);

    const subscription = await prisma.subscription.create({
      data: {
        customerId: Number(customerId),
        packageId: Number(packageId),
        startDate,
        endDate,
        status: "active",
        isPaid: false,
      },
    });

    res.json({
      message: "Tạo subscription thành công",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 PAY (cực quan trọng)
const paySubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.subscription.update({
      where: { id: Number(id) },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    res.json({
      message: "Thanh toán thành công",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  paySubscription,
};
