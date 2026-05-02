const evaluateCustomer = require("../utils/evaluateCustomer");

function plusDays(d) {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date;
}

const endDates = [
  { label: "Hết hạn", value: plusDays(-1) },
  { label: "Sắp hết hạn", value: plusDays(3) },
  { label: "Còn xa", value: plusDays(20) }
];

const inactiveCases = [
  { label: "Active", value: 2 },
  { label: "15-29", value: 20 },
  { label: ">=30", value: 35 }
];

const TPcases = [
  { label: "Thấp", value: -2 },
  { label: "Trung", value: 5 },
  { label: "Cao", value: 9 }
];

function getExpected(endDate, inactiveDays, TP) {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 86400000);

  if (endDate < now) {
    return { tag: "Hết hạn", priority: "very_high" };
  }

  if (inactiveDays >= 30) {
    return { tag: "Cần chăm sóc", priority: "very_high" };
  }

  if (inactiveDays >= 15) {
    return { tag: "Cần chăm sóc", priority: "high" };
  }

  if (endDate <= next7Days) {
    return { tag: "Sắp hết hạn", priority: "high" };
  }

  if (TP >= 8) {
    return { tag: "Ổn định", priority: "low" };
  }

  if (TP >= 4) {
    return { tag: "Ổn định", priority: "medium" };
  }

  return {
    tag: "Ít giá trị",
    priority: TP < 0 ? "medium" : "low"
  };
}

let total = 0;
let fail = 0;

console.log("\n===== FULL 27 CASE TEST =====");

endDates.forEach(e => {
  inactiveCases.forEach(i => {
    TPcases.forEach(t => {
      total++;

      const input = {
        endDate: e.value,
        inactiveDays: i.value,
        TP: t.value
      };

      const res = evaluateCustomer(input);
      const expected = getExpected(e.value, i.value, t.value);

      const pass =
        res.tag === expected.tag &&
        res.priority === expected.priority;

      if (!pass) {
        fail++;

        console.log("\n❌ BUG");
        console.log(`Case: ${e.label} | ${i.label} | TP ${t.label}`);
        console.log("Expected:", expected);
        console.log("Actual  :", res);
      }
    });
  });
});

console.log("\n======================");
console.log("TOTAL:", total);
console.log("FAIL :", fail);
console.log("PASS :", total - fail);
console.log(
  "PASS RATE:",
  ((total - fail) / total * 100).toFixed(2) + "%"
);