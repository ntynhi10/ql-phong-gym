const prisma = require("../models/prisma");
const evaluateCustomer = require("../utils/evaluateCustomer");

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

async function debugCRM() {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 86400000);

  const customers = await prisma.customer.findMany({
    include: {
      subscriptions: true,
      checkins: true
    }
  });

  let total = 0;
  let fail = 0;

  for (const c of customers) {
    const sub = [...c.subscriptions].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    )[0];

    if (!sub) continue;

    total++;

    // ===== tính inactiveDays giống CRM =====
    const lastCheckin = c.checkins.length
      ? c.checkins.reduce((max, cur) =>
          cur.checkinTime > max ? cur.checkinTime : max,
          c.checkins[0].checkinTime
        )
      : c.createdAt;

    const inactiveDays = Math.floor(
      (toDateOnly(now) - toDateOnly(new Date(lastCheckin))) / 86400000
    );

    // ===== chạy logic =====
    const res = evaluateCustomer({
      endDate: new Date(sub.endDate),
      inactiveDays,
      TP: 5
    });

    // ===== expected chuẩn theo RULE =====
    let expected = "";
    let reason = "";

    if (sub.endDate < now) {
      expected = "Hết hạn";
      reason = "Expired";
    } 
    else if (inactiveDays >= 30) {
      expected = "Cần chăm sóc";
      reason = "Inactive >=30";
    } 
    else if (inactiveDays >= 15) {
      expected = "Cần chăm sóc";
      reason = "Inactive >=15";
    } 
    else if (sub.endDate <= next7Days) {
      expected = "Sắp hết hạn";
      reason = "Expiring soon";
    } 
    else {
      expected = "Ổn định";
      reason = "Normal";
    }

    // ===== CHECK =====
    const isFail = res.tag !== expected;

    if (isFail) {
      fail++;

      console.log("\n❌ BUG FOUND");
      console.log("Name:", c.fullName);
      console.log("Phone:", c.phone);
      console.log("inactiveDays:", inactiveDays);
      console.log("endDate:", sub.endDate);

      console.log("👉 Expected:", expected, "|", reason);
      console.log("👉 Actual  :", res.tag);

      console.log("----------------------");
    }
  }

  console.log("\n=====================");
  console.log("TOTAL:", total);
  console.log("FAIL :", fail);
  console.log("PASS :", total - fail);
}

debugCRM();