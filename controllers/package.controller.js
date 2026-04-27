const prisma = require("../models/prisma");

// 📦 Lấy danh sách gói
const getPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { durationMonths: "asc" },
    });

    res.json({
      message: "Danh sách gói tập",
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// ➕ Tạo gói tập (admin)
const createPackage = async (req, res) => {
  try {
    const { durationMonths } = req.body;

    if (!durationMonths) {
      return res.status(400).json({
        message: "Thiếu durationMonths",
      });
    }

    // 🎯 mapping giá theo tháng
    const priceMap = {
      1: 300000,
      3: 800000,
      6: 1500000,
      12: 2500000,
      18: 3500000,
      24: 4500000,
    };

    if (!priceMap[durationMonths]) {
      return res.status(400).json({
        message: "Gói không hợp lệ",
      });
    }

    // ❌ tránh tạo trùng
    const existed = await prisma.package.findFirst({
      where: { durationMonths },
    });

    if (existed) {
      return res.status(400).json({
        message: "Gói đã tồn tại",
      });
    }

    const newPackage = await prisma.package.create({
      data: {
        packageName: `Gói ${durationMonths} tháng`,
        durationMonths,
        price: priceMap[durationMonths],
        description: `Gói tập ${durationMonths} tháng`,
      },
    });

    res.json({
      message: "Tạo gói tập thành công",
      data: newPackage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = { getPackages, createPackage };
