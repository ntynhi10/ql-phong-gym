

const prisma = require("../models/prisma");

const getCRM = async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 86400000);
    const next7Days = new Date(now.getTime() + 7 * 86400000);

    const customers = await prisma.customer.findMany({
      include: {
        subscriptions: { include: { package: true } },
        checkins: true,
        feedbacks: true,
        notes: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const guest = [];
    const member = [];

    for (const c of customers) {

      // ===== SUB MỚI NHẤT =====
      const sub = [...c.subscriptions]
        .filter(s => s.packageId != null)
        .sort(
          (a, b) =>
            new Date(b.endDate) - new Date(a.endDate) ||
            new Date(b.startDate) - new Date(a.startDate)
        )[0];

      const isMember = sub?.packageId != null;
      const isGuest = !isMember;

      // ===== CHECKIN (30 NGÀY) =====
      const totalCheckin = c.checkins.filter(
        ch => new Date(ch.checkinTime) >= last30Days
      ).length;

      const lastCheckin = c.checkins.length
        ? c.checkins.reduce((max, cur) =>
            cur.checkinTime > max ? cur.checkinTime : max,
            c.checkins[0].checkinTime
          )
        : c.createdAt;

      function toDateOnly(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }

      const inactiveDays = Math.floor(
        (toDateOnly(now) - toDateOnly(new Date(lastCheckin))) / 86400000
      );

      // ===== FEEDBACK =====
      const lastFeedback = [...c.feedbacks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      let TP2 = 0;
      let reasonTP2 = "Chưa có feedback";

      if (lastFeedback) {
        if (lastFeedback.rating === 5) {
          TP2 = 3;
          reasonTP2 = "Feedback 5★";
        } else if (lastFeedback.rating === 4) {
          TP2 = 2;
          reasonTP2 = "Feedback 4★";
        } else if (lastFeedback.rating === 3) {
          TP2 = 1;
          reasonTP2 = "Feedback 3★";
        }else if (lastFeedback.rating <= 2) {
          TP2 = -4;
          reasonTP2 = "Feedback thấp";
        }
      }

      // ===== TP3 =====
      let TP3 = 0;
      let reasonTP3 = "";

      if (inactiveDays >= 30) {
        TP3 = -4;
        reasonTP3 = `Không tập ${inactiveDays} ngày`;
      } else if (inactiveDays >= 15) {
        TP3 = -2;
        reasonTP3 = `Không tập ${inactiveDays} ngày`;
      } else if (totalCheckin >= 10) {
        TP3 = 2;
        reasonTP3 = "Tập tích cực";
      } else {
        reasonTP3 = "Bình thường";
      }

      const lastNote = c.notes[0];

      // ================= GUEST =================
  if (isGuest) {

    let tag = "";

    if (inactiveDays > 15) {
      tag = "";
    } else {
      if (totalCheckin >= 10) {
        tag = "Tiềm năng";
      }
    }

    guest.push({
      id: c.id,
      name: c.fullName,
      phone: c.phone,

      total: totalCheckin,
      lastDate: lastCheckin.toLocaleDateString(),
      inactiveDays,

      tag,

      noteDate: lastNote?.createdAt?.toLocaleDateString() || "",
      lastNote: lastNote?.note || "",
      note: ""
    });
  }

      // ================= MEMBER =================
      if (isMember) {

        // ===== TP1 =====
        let TP1 = 0;
        let reasonTP1 = "";
        let packageLabel = "";

        if (sub.package) {
          const m = sub.package.durationMonths;

          if (m >= 12) {
            TP1 = 4;
            reasonTP1 = "Gói dài hạn";
          } else if (m >= 6) {
            TP1 = 3;
            reasonTP1 = "Gói trung hạn";
          } else {
            TP1 = 2;
            reasonTP1 = "Gói ngắn hạn";
          }

          packageLabel = `${m} tháng`;
        }

        const TP = TP1 + TP2 + TP3;

        let tag = "";
        let priority = "";
        let reasonTag = "";

        let risk = "low";
        let reason = "";

        // ===== RULES =====

        // 1. Hết hạn (cao nhất)
        if (sub.endDate < now) {
          risk = "very_high";
          tag = "Hết hạn";
          reason = "Đã hết hạn";
        }

        // 2. Không tập >=30 (cũng very_high nhưng sau hết hạn)
        if (inactiveDays >= 30) {
          if (risk !== "very_high") {
            risk = "very_high";
            tag = "Cần chăm sóc";
            reason = "Không tập lâu";
          }
        }

        // 3. Không tập >=15 (ưu tiên hơn sắp hết hạn)
        if (inactiveDays >= 15) {
          if (risk === "low") {
            risk = "high";
            tag = "Cần chăm sóc";
            reason = "Giảm tần suất";
          }
        }

        // 4. Sắp hết hạn (đặt sau cùng)
        if (sub.endDate >= now && sub.endDate <= next7Days) {
          if (risk === "low") {
            risk = "high";
            tag = "Sắp hết hạn";
            reason = "Sắp hết hạn";
          }
        }

        // ===== FALLBACK =====
        if (risk === "low") {
          if (TP >= 8) {
            tag = "Ổn định";
            priority = "low";
            reason = "Khách tốt";
          } else if (TP >= 4) {
            tag = "Ổn định";
            priority = "medium";
            reason = "Theo dõi";
          } else {
            tag = "Ít giá trị";
            priority = TP < 0 ? "medium" : "low";
            reason = "Giá trị thấp";
          }
        }

        // ===== PRIORITY =====
        if (risk === "very_high") priority = "very_high";
        else if (risk === "high") priority = "high";

        reasonTag = reason;
        
        member.push({
          id: c.id,
          name: c.fullName,
          phone: c.phone,

          package: packageLabel,
          tag,
          priority,

          startDate: sub.startDate.toLocaleDateString(),
          endDate: sub.endDate.toLocaleDateString(),

          total: totalCheckin,
          lastDate: lastCheckin.toLocaleDateString(),
          inactiveDays,

          rating: lastFeedback ? "★".repeat(lastFeedback.rating) : "",
          feedback: lastFeedback?.content || "",
          feedbackDate: lastFeedback?.createdAt?.toLocaleDateString() || "",

          TP,
          reason: {
            TP1: reasonTP1,
            TP2: reasonTP2,
            TP3: reasonTP3,
            tag: reasonTag
          },

          noteDate: lastNote?.createdAt?.toLocaleDateString() || "",
          lastNote: lastNote?.note || "",
          note: ""
        });
      }
    }

    res.json({ guest, member });

  } catch (err) {
    res.status(500).json({
      message: "Lỗi CRM",
      error: err.message
    });
  }
};

module.exports = { getCRM };
