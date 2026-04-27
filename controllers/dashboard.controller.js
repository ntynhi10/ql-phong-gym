const prisma = require("../models/prisma");

const getDashboard = async (req, res) => {
  try {
    const now = new Date();

    // 🥧 PIE DATA
    const expired = await prisma.subscription.count({
      where: { endDate: { lt: now } },
    });

    const expiringSoon = await prisma.subscription.count({
      where: {
        endDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const newMembers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const total = await prisma.customer.count();

    const loyal = total - expired - newMembers;

    // 📊 BAR DATA (checkin theo tháng năm hiện tại)
    const year = now.getFullYear();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const start = new Date(year, i, 1);
      const end = new Date(year, i + 1, 1);

      const count = await prisma.checkin.count({
        where: {
          checkinTime: {
            gte: start,
            lt: end,
          },
        },
      });

      months.push(count);
    }

    res.json({
      pie: {
        counts: [expired, expiringSoon, newMembers, loyal],
        total,
      },
      bar: {
        [year]: months,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = { getDashboard };
