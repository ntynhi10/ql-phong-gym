// xem gói tập (ai login cũng được)
const getPackages = (req, res) => {
  res.json({
    message: "Danh sách gói tập",
    role: req.user.role
  });
};

// tạo gói tập (chỉ admin)
const createPackage = (req, res) => {
  res.json({
    message: "Tạo gói tập thành công",
    role: req.user.role
  });
};

module.exports = { getPackages, createPackage };