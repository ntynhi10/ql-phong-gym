const prisma = require("../models/prisma");

const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ===== PIE: CHỈ LẤY 1 SUB MỚI NHẤT CỦA MỖI KHÁCH (tránh đếm trùng khi gia hạn) =====
    // Lấy tất cả customer có ít nhất 1 subscription có packageId
    const customers = await prisma.customer.findMany({
      where: {
        subscriptions: {
          some: { packageId: { not: null } },
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            subscriptions: {
              where: { packageId: { not: null } },
            },
          },
        },
        subscriptions: {
          where: { packageId: { not: null } },
          orderBy: [{ endDate: "desc" }, { startDate: "desc" }],
          take: 1,
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    let expired = 0;
    let expiringSoon = 0;
    let newMembers = 0;
    let loyal = 0;

    for (const c of customers) {
      const sub = c.subscriptions[0];
      if (!sub) continue;

      if (sub.endDate < now) {
        expired++;
      } else if (sub.endDate <= next7Days) {
        expiringSoon++;
      } else if (sub.startDate >= last30Days && c._count.subscriptions === 1) {
        newMembers++;
      } else {
        loyal++;
      }
    }

    // total = số khách HỘI VIÊN thực tế (không tính vãng lai, không đếm trùng)
    const total = customers.length;

    // ===== BAR: CHECKIN CỦA KHÁCH VÃNG LAI THEO THÁNG =====
    const year = now.getFullYear();
    const bar = {};

    // Hỗ trợ lọc theo nhiều năm để frontend dùng yearFilter
    for (const y of [2024, 2025, 2026]) {
      const months = [];

      for (let i = 0; i < 12; i++) {
        const start = new Date(y, i, 1);
        const end = new Date(y, i + 1, 1);

        const count = await prisma.checkin.count({
          where: {
            checkinTime: { gte: start, lt: end },
            customer: {
              // Vãng lai = không có subscription nào có packageId
              subscriptions: {
                none: { packageId: { not: null } },
              },
            },
          },
        });

        months.push(count);
      }

      bar[y] = months;
    }

    // ===== RESPONSE =====
    res.json({
      pie: {
        counts: [expired, expiringSoon, newMembers, loyal],
        total,
      },
      bar,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { getDashboard };
