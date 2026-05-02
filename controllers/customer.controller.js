const prisma = require("../models/prisma");

// 🔥 GET ALL
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          include: {
            package: true,
          },
        },
      },
    });

    res.json({
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// 🔥 GET BY ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Không tìm thấy khách",
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// 🔥 CREATE
const createCustomer = async (req, res) => {
  try {
    const { fullName, phone, gender } = req.body;

    // validate
    if (!fullName || !phone || !gender) {
      return res.status(400).json({
        message: "Thiếu thông tin",
      });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        gender,
      },
    });

    res.json({
      message: "Tạo khách hàng thành công",
      data: newCustomer,
    });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("phone")) {
      return res.status(400).json({
        message: "Số điện thoại đã tồn tại",
      });
    }

    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// 🔥 UPDATE
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, gender } = req.body;

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        fullName,
        phone,
        gender,
      },
    });

    res.json({
      message: "Cập nhật thành công",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// 🔥 DELETE
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    res.json({
      message: "Xoá thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const getCustomerDetail = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            package: true,
          },
          orderBy: {
            startDate: "desc",
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Không tìm thấy khách hàng",
      });
    }

    return res.json(customer);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerDetail,
};
