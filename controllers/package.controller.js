const prisma = require("../models/prisma");

const getPackages = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "1";

    const packages = await prisma.package.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ durationMonths: "asc" }, { id: "asc" }],
    });

    return res.json({ data: packages });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const createPackage = async (req, res) => {
  try {
    const { packageName, durationMonths, price, description } = req.body;

    if (!packageName || !durationMonths || price === undefined) {
      return res.status(400).json({
        message: "Thiếu thông tin gói tập",
      });
    }

    const newPackage = await prisma.package.create({
      data: {
        packageName,
        durationMonths: Number(durationMonths),
        price: Number(price),
        description: description || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      message: "Tạo gói tập thành công",
      data: newPackage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const updatePackage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { packageName, durationMonths, price, description } = req.body;

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        packageName,
        durationMonths: Number(durationMonths),
        price: Number(price),
        description: description || null,
      },
    });

    return res.json({
      message: "Cập nhật gói tập thành công",
      data: updatedPackage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const togglePackageStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive } = req.body;

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        isActive: Boolean(isActive),
      },
    });

    return res.json({
      message: updatedPackage.isActive
        ? "Đã kích hoạt lại gói tập"
        : "Đã ngừng sử dụng gói tập",
      data: updatedPackage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  getPackages,
  createPackage,
  updatePackage,
  togglePackageStatus,
};
