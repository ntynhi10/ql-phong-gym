const { findUser } = require("../models/user.model");

const login = (req, res) => {
    const { username, password } = req.body;

    const user = findUser(username, password);

    if (!user) {
        return res.status(401).json({
            message: "Sai tài khoản hoặc mật khẩu"
        });
    }

    res.json({
        message: "Đăng nhập thành công",
        user: {
            username: user.username,
            role: user.role
        }
    });
};

module.exports = { login };