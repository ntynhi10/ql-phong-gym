const jwt = require("jsonwebtoken");
const { findUser } = require("../models/user.model");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔥 validate
    if (!username || !password) {
      return res.status(400).json({
        message: "Thiếu username hoặc password",
      });
    }

    const user = await findUser(username, password);

    if (!user) {
      return res.status(401).json({
        message: "Sai tài khoản hoặc mật khẩu",
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "SECRET_KEY", {
      expiresIn: "1h",
    });

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

module.exports = { login };
