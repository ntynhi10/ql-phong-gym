const evaluateCustomer = require("../utils/evaluateCustomer");

function plusDays(d) {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date;
}

const cases = [
  {
    desc: "1. Sắp hết hạn + không tập 20 ngày",
    input: { endDate: plusDays(3), inactiveDays: 20, TP: 5 },
    expected: { tag: "Cần chăm sóc", priority: "high" }
  },
  {
    desc: "2. Hết hạn + vẫn tập đều",
    input: { endDate: plusDays(-1), inactiveDays: 2, TP: 9 },
    expected: { tag: "Hết hạn", priority: "very_high" }
  },
  {
    desc: "3. Không tập >=30 + còn hạn",
    input: { endDate: plusDays(20), inactiveDays: 35, TP: 9 },
    expected: { tag: "Cần chăm sóc", priority: "very_high" }
  },
  {
    desc: "4. Sắp hết hạn + TP cao",
    input: { endDate: plusDays(2), inactiveDays: 2, TP: 9 },
    expected: { tag: "Sắp hết hạn", priority: "high" }
  }
];

console.log("\n===== EDGE CASE TEST =====");

cases.forEach(c => {
  const res = evaluateCustomer(c.input);

  const pass =
    res.tag === c.expected.tag &&
    res.priority === c.expected.priority;

  console.log("\n----------------------");
  console.log(c.desc);
  console.log("Expected:", c.expected);
  console.log("Actual  :", res);
  console.log("PASS?   :", pass ? "✅" : "❌");
});