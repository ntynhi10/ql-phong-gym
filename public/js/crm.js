let currentPage = 1;
const pageSize = 10;
let currentType = "guest";

const guestHeader = [
  { label: "Tên", key: "name", width: "w-[220px]" },
  { label: "SDT", key: "phone", width: "w-[180px]" },
  { label: "Tổng số lần tập", key: "total", width: "min-w-[150px]" },
  { label: "Lần gần nhất", key: "lastDate", width: "min-w-[160px]" },
  { label: "Nhãn", key: "tag", width: "min-w-[120px]" },
  { label: "Ghi chú", key: null, width: "w-[80px] text-center" },
  { label: "Chi tiết", key: null, width: "w-[80px] text-center" }
];

const memberHeader = [
  { label: "Tên", key: "name", width: "w-[220px]" },
  { label: "SDT", key: "phone", width: "w-[180px]" },
  { label: "Loại gói", key: "package", width: "min-w-[150px]" },
  { label: "Nhãn", key: "tag", width: "min-w-[140px]" },
  { label: "Mức ưu tiên", key: "priority", width: "min-w-[110px]" },
  { label: "Ghi chú", key: null, width: "w-[80px] text-center" },
  { label: "Chi tiết", key: null, width: "w-[80px] text-center" }
];
const guestData = new Array(35).fill({});
const memberData = new Array(22).fill({});

function paginate(data) {
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return `
    <div class="flex justify-center items-center gap-2 mt-4">

      <button onclick="changePage(1)" class="px-2">«</button>
      <button onclick="changePage(${currentPage - 1})" class="px-2">‹</button>

      ${Array.from({ length: totalPages }, (_, i) => `
        <button 
          onclick="changePage(${i + 1})"
          class="px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-[#1E4E8C] text-white' : 'bg-gray-200'}">
          ${i + 1}
        </button>
      `).join("")}

      <button onclick="changePage(${currentPage + 1})" class="px-2">›</button>
      <button onclick="changePage(${totalPages})" class="px-2">»</button>

    </div>
  `;
}

function renderTableWithPaging(columns, data) {
  const pagedData = paginate(data);

  return `
    <div class="bg-white shadow p-4">

      <!-- HEADER -->
      <div class="bg-[#E4EEFC] px-4 py-3 flex gap-4 font-medium rounded-xl">
        ${columns.map(col => `
          <div class="${col.width}">
            ${col.label}
          </div>
        `).join("")}
      </div>

      <!-- ROW -->
      <div>
        ${pagedData.map((item, index) => `
          <div class="flex items-center gap-4 border-b border-[#B8D3F8] h-12 px-4">

            ${columns.map(col => `
              <div class="${col.width} ${col.key === null ? "flex justify-center items-center" : ""}">
                
                ${
                  col.label === "Ghi chú"
                  ? `<img src="img/note-icon.png" 
                          class="w-5 h-5 cursor-pointer"
                          onclick="openEdit(${index})">`

                : col.label === "Chi tiết"
                  ? `<img src="img/detail-icon.png" 
                          class="w-6 h-6 cursor-pointer"
                          onclick="openDetail(${index})">`
                  : (item[col.key] || "")
                }
              </div>
          
            `).join("")}
          </div>
        `).join("")}
      </div>         
      <!-- PAGINATION -->
      ${renderPagination(data.length)}

    </div>
  `;
}

function switchTab(type) {
  currentType = type;
  currentPage = 1;

  // đổi màu tab
  const tabGuest = document.getElementById("tab-guest");
  const tabMember = document.getElementById("tab-member");

  if (type === "guest") {
    tabGuest.classList.add("bg-white", "text-black");
    tabGuest.classList.remove("bg-gray-200", "text-gray-600");

    tabMember.classList.remove("bg-white", "text-black");
    tabMember.classList.add("bg-gray-200", "text-gray-600");
  } else {
    tabMember.classList.add("bg-white", "text-black");
    tabMember.classList.remove("bg-gray-200", "text-gray-600");

    tabGuest.classList.remove("bg-white", "text-black");
    tabGuest.classList.add("bg-gray-200", "text-gray-600");
  }

  // render lại table
  renderTable();
}

function changePage(page) {
  const data = currentType === "guest" ? guestData : memberData;
  const totalPages = Math.ceil(data.length / pageSize);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderTable();
}

function renderCRM() {
  return `

    <div class="p-2">

      <!-- TOP BAR -->
      <div class="flex justify-between items-center">

        <!-- TAB -->
        <div class="flex relative ml-4 -mb-[12px]">

          <button id="tab-guest" onclick="switchTab('guest')"
            class="px-5 py-2 rounded-t-xl bg-white text-black font-semibold">
            Khách vãng lai
          </button>

          <button id="tab-member" onclick="switchTab('member')"
            class="px-5 py-2 rounded-t-xl -ml-[1px] bg-gray-200 text-gray-600 font-semibold">
            Hội viên
          </button>

        </div>

        <!-- SEARCH -->
        <div class="mr-4">
          <div class="flex w-[320px] h-[36px] border border-black rounded-full overflow-hidden">

            <input 
              type="text"
              id="searchInput"
              placeholder="Tìm kiếm khách hàng"
              class="flex-1 px-4 outline-none italic text-gray-400 text-sm"
              onkeydown="handleEnter(event)"
            />

            <div 
              class="w-[50px] bg-[#B8D3F8] flex items-center justify-end pr-3 cursor-pointer"
              onclick="handleSearch()"
            >
              <img 
                src="img/search-icon.png" 
                alt="search"
                class="w-8 h-8 object-contain"
              >
            </div>
          </div>
        </div>

      </div>

      <!-- TABLE -->
      <div class="bg-[#F4F7FC] px-4 py-2 rounded-xl">
        <div id="tableContainer">
          ${renderTableWithPaging(guestHeader, guestData)}
        </div>
      </div>

    </div>

    <div id="popup" class="fixed inset-0 bg-black/30 hidden flex items-center justify-center z-50">

      <div class="bg-white rounded-2xl w-[500px] p-6 relative">

        <!-- CLOSE -->
        <span onclick="closePopup()" 
          class="absolute top-3 right-4 text-red-600 text-2xl cursor-pointer">✕</span>

        <!-- CONTENT -->
        <div id="popupContent"></div>

      </div>

    </div>
  `;
}

function renderTable() {
  const tableContainer = document.getElementById("tableContainer");

  if (currentType === "guest") {
    tableContainer.innerHTML = renderTableWithPaging(guestHeader, guestData);
  } else {
    tableContainer.innerHTML = renderTableWithPaging(memberHeader, memberData);
  }
}

function handleSearch() {
  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase();

  const data = currentType === "guest" ? guestData : memberData;

  const filtered = data.filter(item =>
    (item.name || "").toLowerCase().includes(keyword) ||
    (item.phone || "").includes(keyword)
  );

  document.getElementById("tableContainer").innerHTML =
    renderTableWithPaging(
      currentType === "guest" ? guestHeader : memberHeader,
      filtered
    );
}
function handleEnter(e) {
  if (e.key === "Enter") {
    handleSearch();
  }
}

function openEdit(index) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popupContent");

  popup.classList.remove("hidden");

  // lấy data theo tab
  const data = currentType === "guest" ? guestData : memberData;
  const item = data[index] || {};

  content.innerHTML = `
    <h2 class="text-[#2B74D1] font-semibold mb-2">Ghi chú gần nhất:</h2>

    <p class="mb-4 text-sm">
      ${item.noteDate || "20/9/2026"} - ${item.staff || "NV A"} <br/>
      ${item.lastNote || "Đã gọi tư vấn gói"}
    </p>

    <h3 class="text-[#2B74D1] font-semibold mb-2">Ghi chú</h3>

    <textarea 
      id="noteInput"
      class="w-full border rounded-xl p-3 h-[120px] mb-4 outline-none focus:ring-2 focus:ring-blue-300"
      placeholder="Nhập ghi chú..."
    >${item.note || ""}</textarea>

    <div class="flex justify-end gap-3">
      <button onclick="closePopup()" 
        class="px-6 py-2 bg-[#AEB9CB] text-white rounded-xl hover:bg-gray-500">
        Hủy
      </button>

      <button onclick="saveNote(${index})"
        class="px-6 py-2 bg-[#37C01B] text-white rounded-xl hover:bg-green-700">
        Lưu
      </button>
    </div>
  `;
}

function openDetail(index) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popupContent");

  popup.classList.remove("hidden");

  // lấy data theo tab
  const data = currentType === "guest" ? guestData : memberData;
  const item = data[index] || {};

  // ================== GUEST ==================
  if (currentType === "guest") {
    content.innerHTML = `
      <h2 class="text-[#2B74D1] font-semibold mb-4">Hoạt động gần đây</h2>

      <div class="grid grid-cols-2 gap-y-3 text-sm">

        <div>Tổng số lần tập trong 30 ngày gần nhất</div>
        <div class="text-right font-medium">${item.total || "7 ngày"}</div>

        <div>Lần tập gần nhất</div>
        <div class="text-right font-medium">${item.lastDate || "01/01/2026"}</div>

        <div>Số ngày không hoạt động</div>
        <div class="text-right font-medium">${item.inactiveDays || "15 ngày"}</div>

      </div>
    `;
  }

  // ================== MEMBER ==================
  else {
    content.innerHTML = `
      <!-- GÓI -->
      <h2 class="text-[#2B74D1] font-semibold mb-4">Thông tin gói hiện tại</h2>

      <div class="grid grid-cols-2 gap-y-2 mb-4 text-sm border-b pb-3">
        <div>Loại gói</div>
        <div class="text-right font-medium">${item.package || "Gói tháng"}</div>

        <div>Ngày bắt đầu</div>
        <div class="text-right font-medium">${item.startDate || "01/01/2026"}</div>

        <div>Ngày hết hạn</div>
        <div class="text-right font-medium">${item.endDate || "30/01/2026"}</div>
      </div>

      <!-- HOẠT ĐỘNG -->
      <h2 class="text-[#2B74D1] font-semibold mb-2">Hoạt động gần đây</h2>

      <div class="grid grid-cols-2 gap-y-2 mb-4 text-sm border-b pb-3">
        <div>Tổng số lần tập</div>
        <div class="text-right font-medium">${item.total || "7 ngày"}</div>

        <div>Lần gần nhất</div>
        <div class="text-right font-medium">${item.lastDate || "01/01/2026"}</div>

        <div>Không hoạt động</div>
        <div class="text-right font-medium">${item.inactiveDays || "15 ngày"}</div>
      </div>

      <!-- FEEDBACK -->
      <h2 class="text-[#2B74D1] font-semibold mb-2">Feedback gần nhất</h2>

      <div class="grid grid-cols-2 gap-y-2 text-sm">
        <div>Rating</div>
        <div class="text-right text-[#FED81C]">${item.rating || "★★"}</div>

        <div>Nội dung</div>
        <div class="text-right font-semibold">${item.feedback || "Máy tập bị hỏng"}</div>

        <div>Ngày</div>
        <div class="text-right font-semibold">${item.feedbackDate || "30/5/2025"}</div>
      </div>
    `;
  }
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}