const jwt = require("jsonwebtoken");
const { findUser } = require("../models/user.model");

const login = (req, res) => {
    const { username, password } = req.body;

    const user = findUser(username, password);

    if (!user) {
        return res.status(401).json({
            message: "Sai tài khoản hoặc mật khẩu"
        });
    }

    const token = jwt.sign(
        {
        id: user.id,
        role: user.role
        },
        "SECRET_KEY",
        { expiresIn: "1h" }
    );
    
    res.json({
        message: "Đăng nhập thành công",
        token,
        user: {
            username: user.username,
            role: user.role
        }
    });
};

module.exports = { login };