const prisma = require("../models/prisma");

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months));
  return d;
}

// GET ALL
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

// CREATE OR RENEW
const createSubscription = async (req, res) => {
  try {
    const { customerId, packageId } = req.body;

    if (!customerId || !packageId) {
      return res.status(400).json({
        message: "Thiếu dữ liệu",
      });
    }

    const idCustomer = Number(customerId);
    const idPackage = Number(packageId);

    const pkg = await prisma.package.findUnique({
      where: { id: idPackage },
    });

    if (!pkg || pkg.isActive === false) {
      return res.status(404).json({
        message: "Không tìm thấy gói hoặc gói đã ngừng sử dụng",
      });
    }

    const now = new Date();

    const unpaidActiveSub = await prisma.subscription.findFirst({
      where: {
        customerId: idCustomer,
        status: "active",
        isPaid: false,
        endDate: {
          gte: now,
        },
      },
      include: {
        package: true,
      },
      orderBy: {
        endDate: "desc",
      },
    });

    if (unpaidActiveSub) {
      return res.status(400).json({
        message: `Khách còn gói ${
          unpaidActiveSub.package?.packageName || ""
        } chưa thanh toán. Vui lòng thanh toán trước khi gia hạn.`,
      });
    }

    const activeSub = await prisma.subscription.findFirst({
      where: {
        customerId: idCustomer,
        status: "active",
        endDate: {
          gte: now,
        },
      },
      include: {
        package: true,
      },
      orderBy: {
        endDate: "desc",
      },
    });

    // Nếu đang có gói còn hạn: tạo subscription mới nối tiếp từ ngày hết hạn xa nhất
    const startDate = activeSub ? activeSub.endDate : now;
    const endDate = addMonths(startDate, pkg.durationMonths);

    const subscription = await prisma.subscription.create({
      data: {
        customerId: idCustomer,
        packageId: idPackage,
        startDate,
        endDate,
        status: "active",
        isPaid: false,
      },
      include: {
        package: true,
      },
    });

    res.json({
      message: activeSub
        ? "Gia hạn gói tập thành công"
        : "Tạo subscription thành công",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PAY
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
