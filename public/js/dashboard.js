
let pieChartInstance = null;
let barChartInstance = null;
let intervalId;

function renderDashboard() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-14">

      <!-- PIE -->
      <div class="w-full max-w-[500px] bg-white rounded-2xl p-4 mt-12
            shadow-lg hover:shadow-xl
            border border-gray-100
            transition duration-200 
            hover:-translate-y-1">
        <h3 class="font-semibold mb-4 text-[#16B010]">Biểu đồ hội viên</h3>
        <div class="flex justify-center">
          <div class="w-[310px] h-[310px]">
            <canvas id="pieChart"></canvas>
          </div>
        </div>
        ${renderLegend()}
        
      </div>

      <!-- BAR -->
      <div class="w-[780px] bg-white rounded-2xl p-4 mt-12
            shadow-lg hover:shadow-xl
            border border-gray-100
            transition duration-200 
            hover:-translate-y-1">

        <!-- HEADER -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-[#16B010]">
            Biểu đồ khách vãng lai
          </h3>

          <select id="yearFilter" class="border rounded px-2 py-1 text-sm">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026" selected>2026</option>
          </select>
        </div>

        <!-- CHART -->
        <div class="w-[700px] h-[450px]">
          <canvas id="barChart"></canvas>
        </div>

      </div>
  `;
}


const pieData = {
  labels: [
    "Hội viên hết hạn",
    "Hội viên sắp hết hạn",
    "Hội viên mới",
    "Hội viên thân thiết"
  ],
  counts: [18, 37, 40, 80],
  total: 185
};
function convertToPercent(counts, total) {
  let sum = 0;

  const result = counts.map((c, i) => {
    if (i === counts.length - 1) {
      return 100 - sum; 
    }
    const percent = Math.round((c / total) * 100);
    sum += percent;
    return percent;
  });

  return result;
}


const barData = {
  labels: [
    'T1','T2','T3','T4','T5','T6',
    'T7','T8','T9','T10','T11','T12'
  ],
  dataByYear: {
    2024: [20,30,40,50,60,70,80,90,20,30,40,50],
    2025: [10,20,30,40,50,60,70,80,90,20,10,30],
    2026: [80, 79, 180, 200, null, null, null, null, null, null, null, null]
  }
};
function fakeFetchData() {
  const now = new Date();
  const currentYear = now.getFullYear();   
  const currentMonth = now.getMonth();    

  const newBar = { ...barData.dataByYear };

  if (newBar[currentYear]) {
    newBar[currentYear] = newBar[currentYear].map((v, i) => {
      
      if (i > currentMonth) return null;

      if (i < currentMonth) return v;

      return Math.round((v || 0) + Math.random() * 3);
    });
  }

  return {
    pie: {
      counts: pieData.counts.map(c => c + Math.floor(Math.random() * 3))
    },
    bar: newBar
  };
}

function updateCharts() {

  if (!pieChartInstance || !barChartInstance) return;
  const newPercent = convertToPercent(pieData.counts, pieData.total);
  pieChartInstance.data.datasets[0].data = newPercent;
  pieChartInstance.update();


  const currentYear  = Number(document.getElementById("yearFilter").value);
  barChartInstance.data.datasets[0].data = barData.dataByYear[currentYear ];
  barChartInstance.update();
}


function initDashboard() {
  const currentYear  = Number(document.getElementById("yearFilter").value);

  renderPieChart(pieData);

  renderBarChart({
    labels: barData.labels,
    values: barData.dataByYear[currentYear ] 
  });
}


function renderPieChart(data) {
  const ctx = document.getElementById("pieChart");
  if (pieChartInstance) return;
  
   pieChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.labels,
      datasets: [{
        data: convertToPercent(pieData.counts, pieData.total),
        backgroundColor: [
          "#EF4444", 
          "#F97316", 
          "#692cf8", 
          "#3B82F6"  
        ],
        borderWidth: 0,
        spacing: 6, 
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      cutout: "30%",
      plugins: {
        legend: {
          display: false
      },
      tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const count = pieData.counts[index];
              const percent = convertToPercent(pieData.counts, pieData.total)[index];
              return `${context.label}: ${count} (${percent}%)`;
            }
          }
        }
      }
    },
    plugins: [{
      id: "centerText",
      beforeDraw(chart) {
        const { width, height, ctx } = chart;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#232323";
        ctx.fillText(pieData.total, width / 2, height / 2 - 8);

        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("Hội viên", width / 2, height / 2 + 12);

        ctx.restore();
      }
    }]
  });
}

function renderLegend() {
  const items = [
    { color: "#ef4444", label: "Hội viên hết hạn" },
    { color: "#f97316", label: "Hội viên sắp hết hạn" },
    { color: "#692cf8", label: "Hội viên mới" },
    { color: "#3b82f6", label: "Hội viên thân thiết" }
  ];

  return items.map(item => `
    <div class="flex items-center gap-2 w-full justify-start px-4 py-1">
      <div class="w-14 h-4 rounded-sm" style="background:${item.color}"></div>
      <span>${item.label}</span>
    </div>
  `).join("");
}


function renderBarChart(data) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChartInstance) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "#2467d2");
  gradient.addColorStop(1, "#a9c9fd");
  barChartInstance =new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Khách vãng lai",
        data: data.values,
        backgroundColor: gradient,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
  const data = fakeFetchData();

  pieData.counts = data.pie.counts;
  pieData.total = pieData.counts.reduce((a, b) => a + b, 0);


  barData.dataByYear = data.bar;

  updateCharts();
    }, 5000);

  document.getElementById("yearFilter").addEventListener("change", (e) => {
    const currentYear  = Number(e.target.value);

    barChartInstance.data.datasets[0].data = barData.dataByYear[currentYear ];
    barChartInstance.update();
  });
});
