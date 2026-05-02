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
app.use("/api/auth", authRoutes);
const { authenticate, authorize } = require("./middleware/auth.middleware");
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

app.get("/package", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "package.html"));
});

app.get("/crm", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "crm.html"));
});
const dashboardRoutes = require("./routes/dashboard.route");
app.use("/api/dashboard", dashboardRoutes);

const packageRoutes = require("./routes/package.route");
app.use("/api/packages", authenticate, packageRoutes);

const crmRoutes = require("./routes/crm.route");
app.use("/api/crm", crmRoutes);

// API test xác thực
app.get("/test", authenticate, (req, res) => {
  res.json({
    message: "Qua authenticate",
    user: req.user,
  });
});

// API test phân quyền
app.get("/admin-test", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Admin vào được" });
});

app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "customer.html"));
});

// API customer
const customerRoutes = require("./routes/customer.routes");
app.use("/api/customers", customerRoutes);

// API subscription
const subscriptionRoutes = require("./routes/subscription.routes");
app.use("/api/subscriptions", subscriptionRoutes);

// API checkin
const checkinRoutes = require("./routes/checkin.routes");
app.use("/api/checkin", checkinRoutes);


const noteRouter = require("./routes/note");
app.use("/api/notes", noteRouter);

app.get("/customer-detail", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "customer-detail.html"));
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});

