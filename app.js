const express = require("express");
const path = require("path");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static file
app.use(express.static(path.join(__dirname, "public")));

// routes API
const authRoutes = require("./routes/auth.route");
app.use("/api", authRoutes);

//route mở trang login
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// mặc định vào login
app.get("/", (req, res) => {
    res.redirect("/login");
});
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "customer.html"));
});

app.get("/package", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "package.html"));
});

app.get("/crm", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "crm.html"));
});
app.listen(3000, () => {
    console.log("http://localhost:3000");
});