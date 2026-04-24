const getDashboard = (req, res) => {
  res.json({
    pie: {
      counts: [18, 37, 40, 80],
      total: 175
    },
    bar: {
      2024: [20,30,40,50,60,70,80,90,20,30,40,50],
      2025: [10,20,30,40,50,60,70,80,90,20,10,30],
      2026: [80,79,180,200,null,null,null,null,null,null,null,null]
    }
  });
};

module.exports = { getDashboard };