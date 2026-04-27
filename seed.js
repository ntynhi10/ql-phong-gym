const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ================== DATA ==================

const lastNames = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Võ",
  "Phan",
  "Huỳnh",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Hồ",
  "Ngô",
  "Dương",
  "Lý",
  "Đinh",
];

const middleNamesMale = [
  "Văn",
  "Hữu",
  "Đức",
  "Minh",
  "Quang",
  "Thanh",
  "Công",
  "Xuân",
  "Trọng",
];

const middleNamesFemale = [
  "Thị",
  "Ngọc",
  "Thu",
  "Kim",
  "Thanh",
  "Diệu",
  "Mai",
  "Phương",
  "Ánh",
];

const firstNamesMale = [
  "Anh",
  "Bảo",
  "Cường",
  "Dũng",
  "Huy",
  "Nam",
  "Khang",
  "Phúc",
  "Tài",
  "Long",
  "Sơn",
  "Tuấn",
  "Đạt",
  "Khánh",
  "Hoàng",
  "Thiên",
];

const firstNamesFemale = [
  "Linh",
  "Trang",
  "Lan",
  "Hà",
  "Hương",
  "Mai",
  "Vy",
  "Yến",
  "Thảo",
  "Ngân",
  "Phương",
  "Nhi",
  "Quỳnh",
  "Ánh",
  "Chi",
  "Diễm",
];

const foreignNames = [
  "John Smith",
  "Emma Brown",
  "Michael Johnson",
  "Sophia Davis",
  "James Wilson",
  "Olivia Taylor",
  "Daniel Anderson",
  "Isabella Thomas",
];

const feedbackSamples = [
  "Phòng tập sạch sẽ, máy móc ổn.",
  "Nhân viên thân thiện, dịch vụ tốt.",
  "Giá hợp lý, sẽ quay lại.",
  "Không gian thoáng, tập rất thoải mái.",
  "Ổn áp, không có gì phàn nàn.",
  "Cũng tạm, giờ cao điểm hơi đông.",
  "Thiết bị mới, tập rất thích.",
  "Dịch vụ ok, nhân viên dễ thương.",
];

// ================== HELPERS ==================

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomGender() {
  return Math.random() < 0.5 ? "male" : "female";
}

function randomVietnameseName(gender) {
  const last = randomItem(lastNames);

  if (gender === "male") {
    return `${last} ${randomItem(middleNamesMale)} ${randomItem(
      firstNamesMale
    )}${Math.random() < 0.3 ? " " + randomItem(firstNamesMale) : ""}`;
  } else {
    return `${last} ${randomItem(middleNamesFemale)} ${randomItem(
      firstNamesFemale
    )}${Math.random() < 0.3 ? " " + randomItem(firstNamesFemale) : ""}`;
  }
}

function randomName(gender) {
  return Math.random() < 0.75
    ? randomVietnameseName(gender)
    : randomItem(foreignNames);
}

function randomPhone(i) {
  return "09" + String(10000000 + i);
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// ================== MAIN ==================

async function main() {
  console.log("🌱 Seeding realistic data...");

  // clear DB
  await prisma.checkin.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  // packages
  await prisma.package.createMany({
    data: [
      { packageName: "1 Month", durationMonths: 1, price: 300000 },
      { packageName: "3 Months", durationMonths: 3, price: 800000 },
      { packageName: "6 Months", durationMonths: 6, price: 1500000 },
      { packageName: "12 Months", durationMonths: 12, price: 2800000 },
      { packageName: "18 Months", durationMonths: 18, price: 4000000 },
      { packageName: "24 Months", durationMonths: 24, price: 5000000 },
    ],
  });

  const packages = await prisma.package.findMany();

  // customers
  for (let i = 1; i <= 200; i++) {
    const gender = randomGender();

    const customer = await prisma.customer.create({
      data: {
        fullName: randomName(gender),
        phone: randomPhone(i),
        gender: gender,
      },
    });

    // 80% có subscription
    if (Math.random() < 0.8) {
      const pkg = randomItem(packages);

      const startDate = randomDate(new Date(2024, 0, 1), new Date());
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + pkg.durationMonths);

      const isPaid = true;

      const subscription = await prisma.subscription.create({
        data: {
          customerId: customer.id,
          packageId: pkg.id,
          startDate,
          endDate,
          status: endDate < new Date() ? "expired" : "active",
          isPaid,
          paidAt: startDate,
        },
      });

      // checkin realistic
      if (subscription.status === "active" && subscription.isPaid) {
        const habit = Math.random();

        let checkinCount;
        if (habit < 0.3) checkinCount = 2; // lười
        else if (habit < 0.7) checkinCount = 6; // bình thường
        else checkinCount = 12; // chăm

        for (let j = 0; j < checkinCount; j++) {
          await prisma.checkin.create({
            data: {
              customerId: customer.id,
              checkinTime: randomDate(startDate, new Date()),
            },
          });
        }
      }
    }

    // feedback (40%)
    if (Math.random() < 0.4) {
      await prisma.feedback.create({
        data: {
          customerId: customer.id,
          rating: Math.floor(Math.random() * 3) + 3, // 3-5 sao
          content: randomItem(feedbackSamples),
        },
      });
    }

    // note (25%)
    if (Math.random() < 0.25) {
      await prisma.customerNote.create({
        data: {
          customerId: customer.id,
          note: "Khách quen, thái độ tốt",
        },
      });
    }
  }

  // user
  await prisma.user.createMany({
    data: [
      { username: "admin", password: "123", role: "admin" },
      { username: "staff", password: "123", role: "staff" },
    ],
  });

  console.log("✅ Seed hoàn tất - dữ liệu realistic!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
