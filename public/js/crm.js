let currentPage = 1;
const pageSize = 10;
let currentType = "guest";
let currentData = [];
let isSearching = false;

const guestHeader = [
  { label: "Tên", key: "name", width: "w-[220px] " },
  { label: "SDT", key: "phone", width: "w-[180px]  text-center" },
  {
    label: "Tổng số lần tập",
    key: "total",
    width: "min-w-[150px]  text-center",
  },
  {
    label: "Lần gần nhất",
    key: "lastDate",
    width: "min-w-[160px] text-center",
  },
  { label: "Nhãn", key: "tag", width: "min-w-[120px] text-center" },
  { label: "Ghi chú", key: null, width: "w-[80px] text-center" },
  { label: "Chi tiết", key: null, width: "w-[80px] text-center" },
];

const memberHeader = [
  { label: "Tên", key: "name", width: "w-[220px]" },
  { label: "SDT", key: "phone", width: "w-[180px]  text-center" },
  { label: "Loại gói", key: "package", width: "min-w-[150px]  text-center" },
  { label: "Nhãn", key: "tag", width: "min-w-[140px]  text-center" },
  {
    label: "Mức ưu tiên",
    key: "priority",
    width: "min-w-[110px]  text-center",
  },
  { label: "Ghi chú", key: null, width: "w-[80px] text-center" },
  { label: "Chi tiết", key: null, width: "w-[80px] text-center" },
];

let guestData = [];
let memberData = [];

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  document.getElementById("app").innerHTML = renderLayout(renderCRM());
  document.getElementById("modal-root").innerHTML = renderPopup();

  initMenuEvent();

  fetchCRM();
});

async function fetchCRM() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:3000/api/crm", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    guestData = data.guest;
    memberData = data.member;

    renderTable();
  } catch (err) {
    console.error("Lỗi CRM:", err);
  }
}

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

      ${Array.from(
        { length: totalPages },
        (_, i) => `
        <button 
          onclick="changePage(${i + 1})"
          class="px-3 py-1 rounded ${
            currentPage === i + 1 ? "bg-[#1E4E8C] text-white" : "bg-gray-200"
          }">
          ${i + 1}
        </button>
      `
      ).join("")}

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
      <div class="bg-[#E4EEFC] px-4 py-3 flex gap-4 text-[14px] font-semibold rounded-xl">
        ${columns
          .map(
            (col) => `
          <div class="${col.width}">
            ${col.label}
          </div>
        `
          )
          .join("")}
      </div>

      <!-- ROW -->
      <div>
        ${pagedData
          .map((item, index) => {
            return `
            <div class="flex items-center gap-4 border-b border-[#B8D3F8] h-12 px-4 text-[14px]">

              ${columns
                .map(
                  (col) => `
                <div class="${col.width} ${
                    col.key === null ? "flex justify-center items-center" : ""
                  }">
                  
                  ${
                    col.label === "Ghi chú"
                      ? `<img src="img/note-icon.png" 
                              class="w-5 h-5 cursor-pointer"
                              onclick="openEdit('${item.id}')">`
                      : col.label === "Chi tiết"
                      ? `<img src="img/detail-icon.png" 
                              class="w-6 h-6 cursor-pointer"
                              onclick="openDetail('${item.id}')">`
                      : item[col.key] || ""
                  }
                </div>
              `
                )
                .join("")}

            </div>
          `;
          })
          .join("")}
      <!-- PAGINATION -->
      ${renderPagination(data.length)}

    </div>
  `;
}

function switchTab(type) {
  currentType = type;
  currentPage = 1;
  currentData = [];
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
  isSearching = false;
  // render lại table
  renderTable();
}

function changePage(page) {
  const data = isSearching
    ? currentData
    : currentType === "guest"
    ? guestData
    : memberData;

  const totalPages = Math.ceil(data.length / pageSize);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderTable();
}

function renderCRM() {
  return `

    <div class="p-2 ">

      <!-- TOP BAR -->
      <div class="flex justify-between items-center">

        <!-- TAB -->
        <div class="flex relative ml-4 -mb-[12px]">

          <button id="tab-guest" onclick="switchTab('guest')"
            class="px-4 py-1.5 rounded-t-xl bg-white text-black text-[16px] font-medium">
            Khách vãng lai
          </button>

          <button id="tab-member" onclick="switchTab('member')"
            class="px-4 py-2 rounded-t-xl -ml-[1px] bg-gray-200 text-gray-500 text-[16px] font-medium">
            Hội viên
          </button>

        </div>

        <!-- SEARCH -->
        <div class="mr-4">
          <div class="flex w-[320px] h-[36px] border border-[#2B6DD9] rounded-full overflow-hidden">

            <input 
              type="text"
              id="searchInput"
              placeholder="Tìm kiếm khách hàng"
              class="flex-1 px-4 outline-none text-gray-600 text-sm placeholder:text-gray-400"
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

  `;
}

function renderTable() {
  const tableContainer = document.getElementById("tableContainer");

  const data = isSearching
    ? currentData
    : currentType === "guest"
    ? guestData
    : memberData;

  tableContainer.innerHTML = renderTableWithPaging(
    currentType === "guest" ? guestHeader : memberHeader,
    data
  );
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const data = currentType === "guest" ? guestData : memberData;
  if (!keyword) {
    isSearching = false;
    currentData = [];
  } else {
    currentData = data.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(keyword) ||
        (item.phone || "").includes(keyword)
    );
    isSearching = true;
  }
  currentPage = 1;

  renderTable();
}

function handleEnter(e) {
  if (e.key === "Enter") {
    handleSearch();
  }
}

function openEdit(id) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popupContent");

  popup.classList.remove("hidden");

  // lấy data theo tab
  const data = isSearching
    ? currentData
    : currentType === "guest"
    ? guestData
    : memberData;

  const item = data.find((x) => x.id == id);

  if (!item) {
    showToast("Không tìm thấy khách hàng", "error");
    return;
  }

  content.innerHTML = `
    <h2 class="text-[#1E40AF] font-semibold text-[14px] mb-2 tracking-wide">Ghi chú gần nhất:</h2>

    <p class="mb-4 text-[14px] text-gray-800 leading-relaxed ">
      ${item.noteDate || "20/9/2026"} - ${item.staff || "NV A"} <br/>
      ${item.lastNote || "Đã gọi tư vấn gói"}
    </p>

    <h3 class="text-[#1E40AF] font-semibold text-[14px] mb-2 tracking-wide">Ghi chú</h3>

    <textarea 
      id="noteInput"
      class="w-full border border-gray-200 rounded-xl p-3 h-[120px] mb-4 outline-none text-[14px] focus:ring-2 focus:ring-blue-400"
      placeholder="Nhập ghi chú..."
    >${item.note || ""}</textarea>

    <div class="flex justify-end gap-3">
      <button onclick="closePopup()" 
        class="px-5 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 text-[13px]">
        Hủy
      </button>

      <button onclick="saveNote('${item.id}')"
        class="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-[13px] font-medium">
        Lưu
      </button>
    </div>
  `;
}
function saveNote(id) {
  try {
    const note = document.getElementById("noteInput").value;

    const data = currentType === "guest" ? guestData : memberData;

    const item = data.find((x) => x.id == id);

    if (!item) {
      showToast("Không tìm thấy khách hàng", "error");
      return;
    }

    // cập nhật
    item.note = note;
    item.noteDate = new Date().toLocaleDateString();
    item.staff = "Bạn";

    closePopup();
    showToast("Lưu thành công", "success");

    renderTable();
  } catch (err) {
    showToast("Có lỗi xảy ra", "error");
  }
}

function openDetail(id) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popupContent");

  popup.classList.remove("hidden");

  // lấy data theo tab
  const data = isSearching
    ? currentData
    : currentType === "guest"
    ? guestData
    : memberData;

  const item = data.find((x) => x.id == id);

  if (!item) {
    showToast("Không tìm thấy khách hàng", "error");
    return;
  }

  // ================== GUEST ==================
  if (currentType === "guest") {
    content.innerHTML = `
    <h2 class="text-[#1E40AF] font-semibold text-[14px] mb-4 tracking-wide">
      Hoạt động gần đây
    </h2>

    <div class="grid grid-cols-2 gap-y-3 text-[14px] text-gray-600">

      <div>Tổng số lần tập trong 30 ngày gần nhất</div>
      <div class="text-right font-medium text-gray-800">
        ${item.total || ""}
      </div>

      <div>Lần tập gần nhất</div>
      <div class="text-right font-medium text-gray-800">
        ${item.lastDate || ""}
      </div>

      <div>Số ngày không hoạt động</div>
      <div class="text-right font-medium text-gray-800">
        ${item.inactiveDays || ""}
      </div>

    </div>
  `;
  }

  // ================== MEMBER ==================
  else {
    content.innerHTML = `
    <!-- GÓI -->
    <h2 class="text-[#1E40AF] font-semibold text-[14px] mb-2 tracking-wide">
      Thông tin gói hiện tại
    </h2>

    <div class="grid grid-cols-2 gap-y-2 mb-4 text-[14px] text-gray-600 border-b border-gray-200 pb-3">
      <div>Loại gói</div>
      <div class="text-right font-medium text-gray-800">
        ${item.package || ""}
      </div>

      <div>Ngày bắt đầu</div>
      <div class="text-right font-medium text-gray-800">
        ${item.startDate || ""}
      </div>

      <div>Ngày hết hạn</div>
      <div class="text-right font-medium text-gray-800">
        ${item.endDate || ""}
      </div>
    </div>

    <!-- HOẠT ĐỘNG -->
    <h2 class="text-[#1E40AF] font-semibold text-[14px] mb-2 tracking-wide">
      Hoạt động gần đây
    </h2>

    <div class="grid grid-cols-2 gap-y-2 mb-4 text-[14px] text-gray-600 border-b border-gray-200 pb-3">
      <div>Tổng số lần tập</div>
      <div class="text-right font-medium text-gray-800">
        ${item.total || ""}
      </div>

      <div>Lần gần nhất</div>
      <div class="text-right font-medium text-gray-800">
        ${item.lastDate || ""}
      </div>

      <div>Không hoạt động</div>
      <div class="text-right font-medium text-gray-800">
        ${item.inactiveDays || ""}
      </div>
    </div>

    <!-- FEEDBACK -->
    <h2 class="text-[#1E40AF] font-semibold text-[14px] mb-2 tracking-wide">
      Feedback gần nhất
    </h2>

    <div class="grid grid-cols-2 gap-y-2 text-[14px] text-gray-600">
      <div>Rating</div>
      <div class="text-right text-yellow-400 font-medium">
        ${item.rating || ""}
      </div>

      <div>Nội dung</div>
      <div class="text-right font-medium text-gray-800">
        ${item.feedback || ""}
      </div>

      <div>Ngày</div>
      <div class="text-right font-medium text-gray-800">
        ${item.feedbackDate || ""}
      </div>
    </div>
  `;
  }
}

function renderPopup() {
  return `
    <div id="popup" class="fixed inset-0 z-50 hidden">

      <!-- OVERLAY -->
      <div class="absolute inset-0 bg-black/40"
        onclick="closePopup()"></div>

      <!-- CENTER -->
      <div class="flex items-center justify-center h-full pointer-events-none">

        <div class="bg-white rounded-2xl w-[500px] p-6 relative shadow-xl pointer-events-auto">

          <span onclick="closePopup()" 
            class="absolute top-3 right-4 text-red-600 text-2xl cursor-pointer">
            ×
          </span>

          <div id="popupContent"></div>

        </div>

      </div>
    </div>
  `;
}
function showToast(message, type = "success") {
  const toast = document.createElement("div");

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  toast.className = `
    fixed top-5 right-5 z-50
    px-5 py-3 rounded-xl shadow text-white
    ${bgColor}
  `;

  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}
