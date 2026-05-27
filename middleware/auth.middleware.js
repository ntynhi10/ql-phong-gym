const jwt = require("jsonwebtoken");
const { findById } = require("../models/user.model");

// xác thực token
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Chưa đăng nhập"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    const user = await findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User không tồn tại"
      });
    }

    req.user = {
        id: user.id,
        username: user.username,
        role: user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token không hợp lệ"
    });
  }
};

// phân quyền
const authorize = (roles) => {
  return (req, res, next) => {
    console.log("ROLE HIỆN TẠI:", req.user.role);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Không có quyền"
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };