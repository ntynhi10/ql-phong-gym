const getCRM = (req, res) => {
  res.json({
    guest: Array.from({ length: 35 }, (_, i) => ({
      id: "guest_" + i,
      name: "Khách " + (i + 1),
      phone: "012345678" + i,
      total: Math.floor(Math.random() * 10),
      lastDate: "01/01/2026",
      tag: "Tiềm năng",
      inactiveDays: Math.floor(Math.random() * 20),

      noteDate: "20/9/2026",
      staff: "NV A",
      lastNote: "Đã gọi tư vấn",
      note: "",
    })),
    member: Array.from({ length: 22 }, (_, i) => ({
      id: "member_" + i,
      name: "Member " + (i + 1),
      phone: "098765432" + i,
      package: "Gói tháng",
      tag: "VIP",
      priority: "high",

      noteDate: "20/9/2026",
      staff: "NV A",
      lastNote: "Đã gọi tư vấn",
      note: "",

      startDate: "01/01/2026",
      endDate: "30/01/2026",
      total: Math.floor(Math.random() * 10),
      lastDate: "01/01/2026",
      inactiveDays: Math.floor(Math.random() * 20),
      rating: "★★★",
      feedback: "Máy ổn",
      feedbackDate: "30/5/2025",
    })),
  });
};

module.exports = { getCRM };
