function evaluateCustomer({ endDate, inactiveDays, TP }) {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 86400000);

  let tag = "";
  let priority = "";
  let risk = "low";

  // 1. Hết hạn
  if (endDate < now) {
    risk = "very_high";
    tag = "Hết hạn";
  }

  // 2. Không tập >=30
  if (inactiveDays >= 30) {
    if (risk !== "very_high") {
      risk = "very_high";
      tag = "Cần chăm sóc";
    }
  }

  // 3. Không tập >=15
  if (inactiveDays >= 15) {
    if (risk === "low") {
      risk = "high";
      tag = "Cần chăm sóc";
    }
  }

  // 4. Sắp hết hạn
  if (endDate <= next7Days) {
    if (risk === "low") {
      risk = "high";
      tag = "Sắp hết hạn";
    }
  }

  // fallback
  if (risk === "low") {
    if (TP >= 8) {
      tag = "Ổn định";
      priority = "low";
    } else if (TP >= 4) {
      tag = "Ổn định";
      priority = "medium";
    } else {
      tag = "Ít giá trị";
      priority = TP < 0 ? "medium" : "low";
    }
  }

  if (risk === "very_high") priority = "very_high";
  else if (risk === "high") priority = "high";

  return { tag, priority };
}

module.exports = evaluateCustomer;