const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ================================================================
//  SEED CỐ ĐỊNH — 500 khách, 2024–2026
//  Kết hợp: behavior types + feedback + note + cố định không random
// ================================================================

// ================= STATIC DATA =================

const NAMES = [
  "Nguyễn Văn An",
  "Nguyễn Thị Bích",
  "Trần Minh Đức",
  "Trần Thị Hoa",
  "Lê Văn Khoa",
  "Lê Thị Lan",
  "Phạm Hữu Nghĩa",
  "Phạm Thị Ngọc",
  "Hoàng Văn Phúc",
  "Hoàng Thị Quỳnh",
  "Vũ Minh Sơn",
  "Vũ Thị Tâm",
  "Đặng Văn Tuấn",
  "Đặng Thị Uyên",
  "Bùi Hữu Vinh",
  "Bùi Thị Xuân",
  "Đỗ Văn Yên",
  "Lý Minh Anh",
  "Lý Thị Bảo",
  "Phan Văn Cường",
  "Phan Thị Dung",
  "Tô Minh Hiếu",
  "Tô Thị Khánh",
  "Cao Văn Long",
  "Cao Thị Mai",
  "Đinh Văn Nam",
  "Đinh Thị Oanh",
  "Hồ Văn Phong",
  "Hồ Thị Phương",
  "Lưu Minh Quân",
  "Lưu Thị Rạng",
  "Trịnh Văn Sang",
  "Trịnh Thị Thảo",
  "Ngô Minh Thiện",
  "Ngô Thị Thu",
  "Mai Văn Thức",
  "Mai Thị Thủy",
  "Dương Văn Tiến",
  "Dương Thị Trang",
  "Lâm Văn Trọng",
  "Lâm Thị Tuyết",
  "Tăng Minh Văn",
  "Tăng Thị Vân",
  "Châu Văn Việt",
  "Châu Thị Vy",
  "Kiều Minh Vũ",
  "Kiều Thị Yến",
  "Trương Văn Hùng",
  "Trương Thị Hương",
  "Võ Minh Khải",
  "John Smith",
  "Emily Johnson",
  "Michael Brown",
  "Sarah Davis",
  "James Wilson",
  "Jessica Moore",
  "David Taylor",
  "Ashley Anderson",
  "Chris Thomas",
  "Amanda Jackson",
  "Daniel White",
  "Megan Harris",
  "Matthew Martin",
  "Stephanie Thompson",
  "Joshua Garcia",
  "Nicole Martinez",
  "Andrew Robinson",
  "Elizabeth Clark",
  "Kevin Lewis",
  "Samantha Lee",
];

const PHONES = Array.from(
  { length: 500 },
  (_, i) => "09" + String(10000000 + i).padStart(8, "0")
);

const NOTE_SAMPLES = [
  "Đã gọi tư vấn, khách quan tâm gói dài hạn",
  "Hẹn tập thử vào cuối tuần",
  "Không nghe máy, gọi lại sau",
  "Khách đã từ chối, lý do: bận việc",
  "Khách hỏi về gói gia đình",
  "Đã gửi báo giá qua Zalo",
  "Khách cũ quay lại hỏi thăm",
  "Cần follow up sau 1 tuần",
  "Khách giới thiệu bạn bè",
  "Đang cân nhắc giữa 2 gói",
];

const FEEDBACK_BY_RATING = {
  5: [
    "Dịch vụ rất tốt, nhân viên nhiệt tình",
    "Rất hài lòng",
    "Nhân viên hướng dẫn tập rất tốt",
  ],
  4: [
    "Khá ổn, sẽ quay lại",
    "Dịch vụ tốt",
    "Rất hài lòng, sẽ tiếp tục gia hạn",
  ],
  3: ["Bình thường", "Tạm được", "Cần cải thiện giờ cao điểm, quá đông"],
  2: ["Chưa hài lòng", "Dịch vụ chưa tốt", "Bãi giữ xe hơi nhỏ"],
  1: ["Rất tệ", "Không hài lòng"],
};

function getName(i) {
  return NAMES[i % NAMES.length];
}
function getGender(i) {
  return i % 3 === 1 ? "female" : "male";
}

// Behavior xoay vòng cố định theo index
const BEHAVIORS = [
  "DEAD",
  "RISK",
  "ACTIVE",
  "ACTIVE",
  "LOYAL",
  "LOYAL",
  "LOYAL",
  "COMEBACK",
  "ACTIVE",
  "RISK",
];
function getBehavior(i) {
  return BEHAVIORS[i % BEHAVIORS.length];
}

function fixedDate(base, offsetDays) {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

// Lấy item cố định từ array theo index (không random)
function pick(arr, i) {
  return arr[i % arr.length];
}

// ================= PACKAGES =================

const PACKAGE_DATA = [
  { packageName: "1 tháng", durationMonths: 1, price: 300000 }, // idx 0
  { packageName: "3 tháng", durationMonths: 3, price: 800000 }, // idx 1
  { packageName: "6 tháng", durationMonths: 6, price: 1500000 }, // idx 2
  { packageName: "12 tháng", durationMonths: 12, price: 2800000 }, // idx 3
  { packageName: "18 tháng", durationMonths: 18, price: 4000000 }, // idx 4
  { packageName: "24 tháng", durationMonths: 24, price: 5000000 }, // idx 5
];

// ================= BATCHES =================
// pkgIndex: -1 = vãng lai
// hasFeedback / hasNote: tỉ lệ (0.0 - 1.0), dùng modulo để cố định

const BATCHES = [
  // ── 2024 (~150 khách) ──────────────────────────────────────────

  {
    count: 20,
    startBase: "2024-01-05",
    pkgIndex: 0,
    stepDays: 2,
    hasFeedback: 0.5,
    hasNote: 0.4,
  },
  {
    count: 15,
    startBase: "2024-01-15",
    pkgIndex: 1,
    stepDays: 3,
    hasFeedback: 0.6,
    hasNote: 0.5,
  },
  {
    count: 20,
    startBase: "2024-03-01",
    pkgIndex: 3,
    stepDays: 4,
    hasFeedback: 0.7,
    hasNote: 0.6,
  },
  {
    count: 10,
    startBase: "2024-04-10",
    pkgIndex: 4,
    stepDays: 5,
    hasFeedback: 0.8,
    hasNote: 0.7,
  },
  {
    count: 10,
    startBase: "2024-05-01",
    pkgIndex: 5,
    stepDays: 4,
    hasFeedback: 0.8,
    hasNote: 0.6,
  },
  {
    count: 25,
    startBase: "2024-07-01",
    pkgIndex: 0,
    stepDays: 2,
    hasFeedback: 0.4,
    hasNote: 0.3,
  },
  {
    count: 20,
    startBase: "2024-09-10",
    pkgIndex: 1,
    stepDays: 3,
    hasFeedback: 0.6,
    hasNote: 0.5,
  },
  {
    count: 15,
    startBase: "2024-11-01",
    pkgIndex: 2,
    stepDays: 4,
    hasFeedback: 0.7,
    hasNote: 0.6,
  },
  {
    count: 15,
    startBase: "2024-06-01",
    pkgIndex: -1,
    stepDays: 5,
    hasFeedback: 0.2,
    hasNote: 0.2,
  },

  // ── 2025 (~150 khách) ──────────────────────────────────────────

  {
    count: 20,
    startBase: "2025-01-03",
    pkgIndex: 1,
    stepDays: 3,
    hasFeedback: 0.6,
    hasNote: 0.5,
  },
  {
    count: 15,
    startBase: "2025-02-01",
    pkgIndex: 2,
    stepDays: 4,
    hasFeedback: 0.7,
    hasNote: 0.6,
  },
  {
    count: 20,
    startBase: "2025-03-15",
    pkgIndex: 3,
    stepDays: 3,
    hasFeedback: 0.8,
    hasNote: 0.7,
  },
  {
    count: 15,
    startBase: "2025-05-01",
    pkgIndex: 0,
    stepDays: 2,
    hasFeedback: 0.5,
    hasNote: 0.4,
  },
  {
    count: 10,
    startBase: "2025-06-10",
    pkgIndex: 4,
    stepDays: 5,
    hasFeedback: 0.8,
    hasNote: 0.7,
  },
  {
    count: 10,
    startBase: "2025-07-01",
    pkgIndex: 5,
    stepDays: 4,
    hasFeedback: 0.9,
    hasNote: 0.8,
  },
  {
    count: 20,
    startBase: "2025-08-01",
    pkgIndex: 1,
    stepDays: 3,
    hasFeedback: 0.6,
    hasNote: 0.5,
  },
  {
    count: 20,
    startBase: "2025-10-15",
    pkgIndex: 2,
    stepDays: 4,
    hasFeedback: 0.7,
    hasNote: 0.6,
  },
  {
    count: 20,
    startBase: "2025-04-01",
    pkgIndex: -1,
    stepDays: 6,
    hasFeedback: 0.2,
    hasNote: 0.3,
  },

  // ── 2026 (~200 khách) ──────────────────────────────────────────

  {
    count: 25,
    startBase: "2026-01-05",
    pkgIndex: 0,
    stepDays: 2,
    hasFeedback: 0.5,
    hasNote: 0.4,
  },
  {
    count: 20,
    startBase: "2026-01-20",
    pkgIndex: 1,
    stepDays: 3,
    hasFeedback: 0.6,
    hasNote: 0.5,
  },
  {
    count: 25,
    startBase: "2026-02-01",
    pkgIndex: 2,
    stepDays: 2,
    hasFeedback: 0.7,
    hasNote: 0.6,
  },
  {
    count: 20,
    startBase: "2026-02-15",
    pkgIndex: 3,
    stepDays: 3,
    hasFeedback: 0.8,
    hasNote: 0.7,
  },
  {
    count: 15,
    startBase: "2026-03-01",
    pkgIndex: 4,
    stepDays: 4,
    hasFeedback: 0.8,
    hasNote: 0.7,
  },
  {
    count: 30,
    startBase: "2026-04-01",
    pkgIndex: 0,
    stepDays: 1,
    hasFeedback: 0.4,
    hasNote: 0.3,
  },
  {
    count: 20,
    startBase: "2026-04-10",
    pkgIndex: 1,
    stepDays: 1,
    hasFeedback: 0.3,
    hasNote: 0.3,
  },
  {
    count: 15,
    startBase: "2026-04-20",
    pkgIndex: 2,
    stepDays: 1,
    hasFeedback: 0.2,
    hasNote: 0.2,
  },
  {
    count: 30,
    startBase: "2026-01-01",
    pkgIndex: -1,
    stepDays: 4,
    hasFeedback: 0.1,
    hasNote: 0.2,
  },
];

// ================= CHECKIN THEO BEHAVIOR =================

function buildCheckinDates(behavior, startDate, endDate, now, globalIdx) {
  const dates = [];
  const checkinEnd = endDate < now ? endDate : now;

  switch (behavior) {
    case "DEAD": {
      // Chỉ 1-2 lần, lần cuối cách đây >30 ngày
      const d = fixedDate(startDate, 5 + (globalIdx % 10));
      if (d <= checkinEnd) dates.push(d);
      break;
    }
    case "RISK": {
      // 2-3 lần, lần cuối cách đây 15-25 ngày
      for (let j = 0; j < 3; j++) {
        const d = fixedDate(startDate, 3 + j * 7 + (globalIdx % 5));
        if (d <= checkinEnd) dates.push(d);
      }
      break;
    }
    case "ACTIVE": {
      // 5-8 lần, đều đặn trong 1-2 tuần gần đây
      const total = 5 + (globalIdx % 4);
      const totalMs = checkinEnd.getTime() - startDate.getTime();
      const step = totalMs / (total - 1 || 1);
      for (let j = 0; j < total; j++) {
        const d = new Date(startDate.getTime() + step * j);
        if (d <= checkinEnd) dates.push(d);
      }
      break;
    }
    case "LOYAL": {
      // 12-20 lần, rất đều đặn suốt kỳ
      const total = 12 + (globalIdx % 9);
      const totalMs = checkinEnd.getTime() - startDate.getTime();
      const step = totalMs / (total - 1 || 1);
      for (let j = 0; j < total; j++) {
        const d = new Date(startDate.getTime() + step * j);
        if (d <= checkinEnd) dates.push(d);
      }
      break;
    }
    case "COMEBACK": {
      // Check-in đầu kỳ, nghỉ dài, rồi quay lại gần đây
      const early = fixedDate(startDate, 3 + (globalIdx % 5));
      if (early <= checkinEnd) dates.push(early);

      const recent = fixedDate(now, -2 - (globalIdx % 3));
      if (recent >= startDate && recent <= checkinEnd) dates.push(recent);
      break;
    }
  }

  return dates;
}

// ================= MAIN =================

async function main() {
  console.log("🌱 Seeding 500 khách cố định (2024–2026)...\n");

  // ── CLEAR DB ──
  await prisma.checkin.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  // ── PACKAGES ──
  await prisma.package.createMany({
    data: PACKAGE_DATA.map((p) => ({ ...p, isActive: true })),
  });
  const packages = await prisma.package.findMany({
    orderBy: { durationMonths: "asc" },
  });

  const now = new Date();
  let phoneIdx = 0;
  let nameIdx = 0;
  let globalIdx = 0; // dùng thay random

  // ── CUSTOMERS ──
  for (const batch of BATCHES) {
    const { count, startBase, pkgIndex, stepDays, hasFeedback, hasNote } =
      batch;
    const isGuest = pkgIndex === -1;

    for (let i = 0; i < count; i++, globalIdx++) {
      const behavior = getBehavior(globalIdx);
      const startDate = fixedDate(startBase, i * stepDays);

      const customer = await prisma.customer.create({
        data: {
          fullName: getName(nameIdx++),
          phone: PHONES[phoneIdx++],
          gender: getGender(globalIdx),
        },
      });

      // ── GUEST ──
      if (isGuest) {
        const checkins = buildCheckinDates(
          behavior,
          startDate,
          now,
          now,
          globalIdx
        );

        for (const t of checkins) {
          await prisma.checkin.create({
            data: { customerId: customer.id, checkinTime: t },
          });
        }

        continue;
      }

      // ── SUBSCRIPTION ──
      const pkg = packages[pkgIndex];
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + pkg.durationMonths);
      const status = endDate >= now ? "active" : "expired";

      await prisma.subscription.create({
        data: {
          customer: { connect: { id: customer.id } },
          package: { connect: { id: pkg.id } },
          startDate,
          endDate,
          status,
          isPaid: true,
          paidAt: startDate,
        },
      });

      // Gia hạn: cứ mỗi 5 khách thì 1 khách có sub cũ (renew)
      if (globalIdx % 5 === 0 && pkg.durationMonths <= 6) {
        const oldStart = new Date(startDate);
        oldStart.setMonth(oldStart.getMonth() - pkg.durationMonths);
        const oldEnd = new Date(oldStart);
        oldEnd.setMonth(oldEnd.getMonth() + pkg.durationMonths);

        await prisma.subscription.create({
          data: {
            customer: { connect: { id: customer.id } },
            package: { connect: { id: pkg.id } },
            startDate: oldStart,
            endDate: oldEnd,
            status: "expired",
            isPaid: true,
            paidAt: oldStart,
          },
        });
      }

      // ── CHECKIN theo behavior ──
      const checkinDates = buildCheckinDates(
        behavior,
        startDate,
        endDate,
        now,
        globalIdx
      );
      for (const t of checkinDates) {
        await prisma.checkin.create({
          data: { customerId: customer.id, checkinTime: t },
        });
      }

      // ── FEEDBACK (gắn theo behavior) ──
      const feedbackThreshold = Math.floor(hasFeedback * 10);

      if (globalIdx % 10 < feedbackThreshold) {
        let rating;

        switch (behavior) {
          case "LOYAL":
            rating = 4 + (globalIdx % 2);
            break;
          case "ACTIVE":
            rating = 3 + (globalIdx % 2);
            break;
          case "COMEBACK":
            rating = 3 + (globalIdx % 3);
            break;
          case "RISK":
            rating = 2 + (globalIdx % 2);
            break;
          case "DEAD":
            rating = 1 + (globalIdx % 2);
            break;
        }

        let fbDate = fixedDate(startDate, 10 + (globalIdx % 20));
        if (fbDate > now) fbDate = now;

        const contentList = FEEDBACK_BY_RATING[rating];
        const content = contentList[globalIdx % contentList.length];

        await prisma.feedback.create({
          data: {
            customerId: customer.id,
            rating,
            content,
            createdAt: fbDate,
          },
        });
      }
      // ── NOTE (cố định theo modulo) ──
      const noteThreshold = Math.floor(hasNote * 10);
      if (globalIdx % 10 < noteThreshold) {
        const noteCount = (globalIdx % 3) + 1; // 1-3 note
        for (let k = 0; k < noteCount; k++) {
          await prisma.customerNote.create({
            data: {
              customerId: customer.id,
              note: pick(NOTE_SAMPLES, globalIdx + k),
              createdAt: fixedDate(startDate, 5 + k * 7 + (globalIdx % 10)),
            },
          });
        }
      }
    }

    const pkgLabel =
      pkgIndex === -1 ? "vãng lai" : PACKAGE_DATA[pkgIndex].packageName;
    console.log(`  ✓ ${startBase}  [${pkgLabel}]  ${count} khách`);
  }

  // ── USERS (password thuần, không bcrypt) ──
  await prisma.user.createMany({
    data: [
      { username: "admin", password: "123", role: "admin" },
      { username: "staff", password: "123", role: "staff" },
    ],
  });

  // ── SUMMARY ──
  const totalC = await prisma.customer.count();
  const activeSub = await prisma.subscription.count({
    where: { status: "active" },
  });
  const expiredSub = await prisma.subscription.count({
    where: { status: "expired" },
  });
  const totalCk = await prisma.checkin.count();
  const totalFb = await prisma.feedback.count();
  const totalNote = await prisma.customerNote.count();
  const memberCount = await prisma.customer.count({
    where: {
      subscriptions: {
        some: { packageId: { not: null } },
      },
    },
  });

  const guests = totalC - memberCount;

  console.log("\n✅ Seed hoàn tất!");
  console.log(`   👥 Tổng khách    : ${totalC}`);
  console.log(`   🟢 Active        : ${activeSub}`);
  console.log(`   🔴 Hết hạn       : ${expiredSub}`);
  console.log(`   ⚪ Vãng lai      : ${guests}`);
  console.log(`   ✔  Check-in      : ${totalCk}`);
  console.log(`   ⭐ Feedback      : ${totalFb}`);
  console.log(`   📝 Note          : ${totalNote}`);
  console.log(`   👤 admin / 123`);
  console.log(`   👤 staff / 123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
