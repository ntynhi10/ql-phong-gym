# WebApp Quản Lý Dịch Vụ Gym Kết Hợp CRM Chăm Sóc Khách Hàng

## Giới thiệu

Đây là đồ án học phần **Thực tập cơ sở** với mục tiêu xây dựng một hệ thống WebApp quản lý phòng Gym kết hợp CRM mini chăm sóc khách hàng.

Hệ thống hỗ trợ:
- Quản lý khách hàng và hội viên
- Quản lý gói tập
- Đăng ký/gia hạn gói tập
- Ghi nhận check-in
- Dashboard thống kê
- CRM mini với TouchPoint và phân loại khách hàng

Điểm nổi bật của đề tài là:
- Kết hợp dữ liệu vận hành và chăm sóc khách hàng
- Tính điểm TouchPoint động
- Phân loại khách hàng theo Risk Override + Value Layer
- Dashboard trực quan bằng Chart.js

---

# Công nghệ sử dụng

## Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Frontend
- HTML
- Tailwind CSS
- JavaScript
- Chart.js

---

# Kiến trúc hệ thống

Hệ thống được tổ chức theo mô hình MVC:

```txt
src/
├── controllers/
├── routes/
├── middlewares/
├── prisma/
├── public/
└── utils/
```

---

# Chức năng chính

## Quản lý khách hàng
- Thêm/sửa/xóa khách hàng
- Tìm kiếm theo tên/số điện thoại
- Phân biệt khách vãng lai và hội viên

## Quản lý gói tập
- Tạo gói tập
- Cập nhật gói tập
- Bật/tắt trạng thái hoạt động

## Đăng ký/gia hạn
- Tạo subscription
- Tính ngày hết hạn
- Quản lý trạng thái thanh toán

## Check-in
- Ghi nhận lịch sử tập luyện
- Theo dõi tần suất hoạt động

## CRM mini
- Tính TouchPoint
- Phân loại khách hàng
- Xác định mức độ ưu tiên chăm sóc

## Dashboard
- Thống kê tổng quan
- Biểu đồ trực quan bằng Chart.js

---

# Logic CRM

Hệ thống CRM hoạt động theo mô hình:

```txt
Input
↓
Phân loại khách
↓
Risk Layer
- Hết hạn
- Không tập
- Sắp hết hạn
↓
Nếu không có risk
→ xét TouchPoint
↓
Phân loại CRM
```

## Risk Override

Risk luôn được ưu tiên trước TouchPoint:

```txt
Urgency > Value
```

Ví dụ:
- Hết hạn
- Không tập lâu
- Sắp hết hạn

sẽ được xử lý trước khi xét điểm tích cực.

---

# TouchPoint

## TP1 - Giá trị gói
- Gói dài hạn → điểm cao hơn

## TP2 - Feedback
- Rating cao → cộng điểm
- Rating thấp → trừ điểm

## TP3 - Hành vi
- Check-in đều → cộng điểm
- Inactive lâu → trừ điểm

---

# Phân loại khách hàng

| Tag | Priority |
|---|---|
| Hết hạn | very_high |
| Cần chăm sóc >=30 ngày | very_high |
| Cần chăm sóc 15-29 ngày | high |
| Sắp hết hạn | high |
| Ổn định TP >=8 | low |
| Ổn định TP >=4 | medium |
| Ít giá trị TP <4 | low |
| TP âm | medium |
| Khách vãng lai tiềm năng |  |

---

# Cài đặt dự án

## 1. Clone project

```bash
git clone <repository-url>
```

---

## 2. Cài dependencies

```bash
npm install
```

---

## 3. Cấu hình môi trường

Tạo file `.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ql_phong_gym"
```

---

## 4. Prisma migrate

```bash
npx prisma migrate dev
```

---

## 5. Seed dữ liệu mẫu

```bash
npx prisma db seed
```

---

## 6. Chạy project

```bash
npm run dev
```

---

# Tài khoản demo

## Admin

```txt
username: admin
password: 123
```

## Staff

```txt
username: staff
password: 123
```

---

# Dữ liệu demo CRM

Hệ thống có dữ liệu mẫu cho:
- Hội viên mới
- Hội viên ổn định
- Hội viên sắp hết hạn
- Hội viên hết hạn
- Hội viên cần chăm sóc
- Khách vãng lai tiềm năng

---

# Hướng phát triển

- Nhắc hạn tự động
- Dashboard nâng cao
- Báo cáo theo tuần/tháng
- Chăm sóc khách hàng tự động
- Tích hợp notification/email
- Quản lý huấn luyện viên
- Đặt lịch lớp học

---

# Thành viên thực hiện

- Nguyễn Thị Yến Nhi
- Lương Thị Như Huỳnh

---

# Học phần

Thực tập cơ sở  
Học viện Công nghệ Bưu chính Viễn thông
