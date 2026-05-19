let currentPage = 1;
const pageSize = 10;
let currentType = "guest";
let currentData = [];
let isSearching = false;

let currentPriorityFilter = "all";
let currentTagFilter = "all";
let selectedRowId = null;

const guestHeader = [
  { label: "Tên", key: "name", width: "w-[220px] " },
  { label: "SDT", key: "phone", width: "w-[180px]  text-center" },
  {
    label: "Tần suất 30 ngày",
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
    const res = await fetch("/api/crm", {
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
  if (totalPages <= 1) return "";

  let pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  const btnBase =
    "width:32px;height:32px;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;";

  return `
    <div style="display:flex;align-items:center;gap:6px;">
      <button onclick="changePage(1)" ${currentPage === 1 ? "disabled" : ""}
        style="${btnBase}background:#f8fafc;color:#cbd5e1;${
    currentPage === 1 ? "cursor:default;" : "color:#64748b;"
  }">«</button>

      <button onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }
        style="${btnBase}background:#f8fafc;color:#cbd5e1;${
    currentPage === 1 ? "cursor:default;" : "color:#64748b;"
  }">‹</button>

      ${pages
        .map((p) => {
          if (p === "...") {
            return `<span style="height:32px;display:inline-flex;align-items:center;padding:0 4px;color:#94a3b8;font-size:13px;">...</span>`;
          }

          const active = currentPage === p;
          return `
            <button onclick="changePage(${p})"
              style="${btnBase}
                     background:${active ? "#2563eb" : "#f1f5f9"};
                     color:${active ? "#fff" : "#475569"};">
              ${p}
            </button>`;
        })
        .join("")}

      <button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }
        style="${btnBase}background:#f1f5f9;color:#64748b;${
    currentPage === totalPages ? "opacity:0.4;cursor:default;" : ""
  }">›</button>

      <button onclick="changePage(${totalPages})" ${
    currentPage === totalPages ? "disabled" : ""
  }
        style="${btnBase}background:#f1f5f9;color:#64748b;${
    currentPage === totalPages ? "opacity:0.4;cursor:default;" : ""
  }">»</button>
    </div>
  `;
}

function renderTableWithPaging(columns, data) {
  const pagedData = paginate(data);

  return `
    <div style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;
            box-shadow:0 1px 4px rgba(0,0,0,0.06);max-width:100%;
            position:relative;overflow:visible;">

      <div style="display:flex;align-items:center;padding:12px 20px;background:#eef3ff;
            border-bottom:1px solid #f3f4f6;border-radius:16px 16px 0 0;">
        ${columns
          .map((col) => {
            if (col.key === "tag") {
              return `
                <div style="${crmColStyle(
                  col
                )} position:relative;display:flex;align-items:center;justify-content:center;gap:6px;">
                  ${col.label}
                  <div style="position:relative;display:inline-flex;align-items:center;">
                  <button onclick="toggleTagDropdown(event)"
                    style="border:none;background:transparent;cursor:pointer;color:#64748b;padding:0;">
                    <i class="fa-solid fa-filter" style="font-size:11px;"></i>
                  </button>
                  ${renderTagDropdown()}
                </div>
                </div>`;
            }

            if (col.key === "priority") {
              return `
                <div style="${crmColStyle(
                  col
                )}font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">
                  ${col.label}
                  <div style="position:relative;display:inline-flex;align-items:center;">
                    <button onclick="togglePriorityDropdown(event)"
                      style="border:none;background:transparent;cursor:pointer;color:#64748b;padding:0;">
                      <i class="fa-solid fa-filter" style="font-size:11px;"></i>
                    </button>
                    ${renderPriorityDropdown()}
                  </div>
                </div>`;
            }

            return `<div style="${crmColStyle(
              col
            )}font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">${
              col.label
            }</div>`;
          })
          .join("")}
      </div>

      ${
        pagedData.length === 0
          ? `<div style="padding:42px;text-align:center;color:#94a3b8;font-size:13px;">Không có dữ liệu</div>`
          : pagedData
              .map(
                (item) => `
          <div onclick="selectRow('${item.id}')"
            style="display:flex;align-items:center;padding:12px 20px;border-bottom:1px solid #f9fafb;
                   cursor:pointer;background:${
                     selectedRowId == item.id ? "#eff6ff" : "#fff"
                   };"
            onmouseover="this.style.background='#f8fafc'"
            onmouseout="this.style.background='${
              selectedRowId == item.id ? "#eff6ff" : "#fff"
            }'">

            ${columns
              .map((col) => {
                let value = item[col.key] ?? "";

                if (col.label === "Ghi chú") {
                  value = `
                    <button onclick="event.stopPropagation();openEdit('${item.id}')"
                      style="width:30px;height:30px;border:none;border-radius:8px;background:#eff6ff;color:#1d4ed8;cursor:pointer;">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>`;
                } else if (col.label === "Chi tiết") {
                  value = `
                    <button onclick="event.stopPropagation();openDetail('${item.id}')"
                      style="width:30px;height:30px;border:none;border-radius:8px;background:#f1f5f9;color:#1e293b;cursor:pointer;">
                      <i class="fa-solid fa-circle-info"></i>
                    </button>`;
                } else if (col.key === "tag") {
                  value = renderTag(item.tag);
                } else if (col.key === "priority") {
                  value = renderPriority(item.priority);
                }

                return `
                  <div style="${crmColStyle(col)} ${
                  col.key === null ? "display:flex;justify-content:center;" : ""
                }">
                    ${value}
                  </div>`;
              })
              .join("")}
          </div>`
              )
              .join("")
      }

      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;">
        <span style="font-size:12px;color:#94a3b8;">
          ${
            data.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
          }-${Math.min(currentPage * pageSize, data.length)} / ${
    data.length
  } khách hàng
        </span>
        ${renderPagination(data.length)}
      </div>
    </div>
  `;
}

function renderTag(tag) {
  if (!tag) return "";

  const map = {
    "Tiềm năng": {
      bg: "bg-[#EEFFEF]",
      text: "text-[#0D6220]",
    },
    "Hết hạn": {
      bg: "bg-[#FFE8E5]",
      text: "text-[#EA1F18]",
    },
    "Sắp hết hạn": {
      bg: "bg-[#FFEAD8]",
      text: "text-[#E63900]",
    },
    "Ổn định": {
      bg: "bg-[#EEFFEF]",
      text: "text-[#0D6220]",
    },
    "Cần chăm sóc": {
      bg: "bg-[#FFFEDF]",
      text: "text-[#F2911A]",
    },
    "Ít giá trị": {
      bg: "bg-[#F3F5F4]",
      text: "text-[#727272]",
    },
  };

  const style = map[tag] || {};

  return `
    <span class="px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}">
      ${tag}
    </span>
  `;
}

function renderPriority(priority) {
  const map = {
    very_high: {
      color: "bg-red-500",
      active: 4,
    },
    high: {
      color: "bg-orange-500",
      active: 3,
    },
    medium: {
      color: "bg-yellow-400",
      active: 2,
    },
    low: {
      color: "bg-green-500",
      active: 1,
    },
  };

  const p = map[priority] || { active: 0 };

  return `
    <div class="flex items-end gap-1 justify-center h-5">
      ${[1, 2, 3, 4]
        .map(
          (i) => `
        <span 
          class="w-1.5 rounded-sm ${i <= p.active ? p.color : "bg-gray-200"}"
          style="height:${i * 4}px"
        ></span>
      `
        )
        .join("")}
    </div>
  `;
}

function switchTab(type) {
  currentType = type;
  currentPage = 1;
  currentData = [];
  isSearching = false;

  const input = document.getElementById("searchInput");
  if (input) input.value = "";

  const tabGuest = document.getElementById("tab-guest");
  const tabMember = document.getElementById("tab-member");

  const activeStyle =
    "height:34px;padding:0 16px;border-radius:10px;border:1px solid #2563eb;background:#2563eb;color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.25);";
  const inactiveStyle =
    "height:34px;padding:0 16px;border-radius:10px;border:1px solid #e2e8f0;background:#f8fafc;color:#475569;font-size:13px;font-weight:700;cursor:pointer;";

  tabGuest.style.cssText = type === "guest" ? activeStyle : inactiveStyle;
  tabMember.style.cssText = type === "member" ? activeStyle : inactiveStyle;

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
    <div style="padding:24px 38px;width:100%;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;">
        <div>
          <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;">CRM</h1>
          <p style="font-size:13px;color:#94a3b8;margin:4px 0 0;">
            Theo dõi khách cần chăm sóc và mức độ ưu tiên
          </p>
        </div>

        <div style="position:relative;">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;"
            width="16" height="16" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>

          <input type="text" id="searchInput"
            placeholder="Tìm tên hoặc SĐT..."
            onkeydown="handleEnter(event)"
            oninput="handleSearch()"
            style="padding:0 16px 0 38px;height:36px;width:240px;background:#f8fafc;
                   border:1px solid #e2e8f0;border-radius:10px;font-size:13px;color:#374151;
                   outline:none;box-sizing:border-box;"
            onfocus="this.style.borderColor='#93c5fd';this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)'"
            onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"/>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        <button id="tab-guest" onclick="switchTab('guest')"
          style="height:34px;padding:0 16px;border-radius:10px;border:1px solid #2563eb;
                 background:#2563eb;color:#fff;font-size:13px;font-weight:700;cursor:pointer;
                 box-shadow:0 2px 8px rgba(37,99,235,0.25);">
          Khách vãng lai
        </button>

        <button id="tab-member" onclick="switchTab('member')"
          style="height:34px;padding:0 16px;border-radius:10px;border:1px solid #e2e8f0;
                 background:#f8fafc;color:#475569;font-size:13px;font-weight:700;cursor:pointer;">
          Hội viên
        </button>
      </div>

      <div id="tableContainer">
        ${renderTableWithPaging(guestHeader, guestData)}
      </div>
    </div>
  `;
}

function renderTable() {
  const tableContainer = document.getElementById("tableContainer");

  let data = isSearching
    ? currentData
    : currentType === "guest"
    ? guestData
    : memberData;

  if (currentTagFilter !== "all") {
    data = data.filter((item) => item.tag === currentTagFilter);
  }

  if (currentPriorityFilter !== "all" && currentType === "member") {
    data = data.filter((item) => item.priority === currentPriorityFilter);
  }

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
      ${item.noteDate || ""}<br/>
      ${item.lastNote || "Chưa có ghi chú"}
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
async function saveNote(id) {
  try {
    const token = localStorage.getItem("token");
    const note = document.getElementById("noteInput").value;

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        customerId: Number(id),
        note,
      }),
    });

    if (!res.ok) throw new Error();

    closePopup();
    showToast("Lưu thành công", "success");

    // reload lại từ DB
    await fetchCRM();
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
    <!-- TOUCHPOINT -->
    <h2 class="text-[#1E40AF] font-semibold text-[14px] mt-4 mb-2 tracking-wide">
      Phân tích
    </h2>

    <div class="grid grid-cols-2 gap-y-2 text-[14px] text-gray-600">

      <div>TouchPoint</div>
      <div class="text-right font-medium text-gray-800">
        ${item.TP ?? ""}
      </div>

      <div>TP1 (gói)</div>
      <div class="text-right font-medium text-gray-800">
        ${item.reason?.TP1 || ""}
      </div>

      <div>TP2 (feedback)</div>
      <div class="text-right font-medium text-gray-800">
        ${item.reason?.TP2 || ""}
      </div>

      <div>TP3 (hành vi)</div>
      <div class="text-right font-medium text-gray-800">
        ${item.reason?.TP3 || ""}
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

function crmColStyle(col) {
  const width = col.width || "";
  const base =
    "font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;";
  const body =
    "font-size:13px;color:#0f172a;font-weight:500;text-transform:none;letter-spacing:0;";

  // Dùng chung cho header và body hơi khó vì function này đang dùng cả 2 nơi.
  // Nên ưu tiên width trước, còn màu body sẽ được row override nhẹ.
  if (width.includes("220")) return `width:26%;${body}`;
  if (width.includes("180")) return `width:16%;${body}text-align:center;`;
  if (width.includes("150")) return `width:16%;${body}text-align:center;`;
  if (width.includes("160")) return `width:16%;${body}text-align:center;`;
  if (width.includes("140")) return `width:14%;${body}text-align:center;`;
  if (width.includes("120")) return `width:13%;${body}text-align:center;`;
  if (width.includes("110")) return `width:12%;${body}text-align:center;`;
  return `width:8%;${body}text-align:center;`;
}

function renderTagDropdown() {
  const tags = [
    { label: "Tất cả", value: "all" },
    { label: "Tiềm năng", value: "Tiềm năng" },
    { label: "Hết hạn", value: "Hết hạn" },
    { label: "Cần chăm sóc", value: "Cần chăm sóc" },
    { label: "Sắp hết hạn", value: "Sắp hết hạn" },
    { label: "Ổn định", value: "Ổn định" },
    { label: "Ít giá trị", value: "Ít giá trị" },
  ];

  return `
    <div id="tagDropdown"
      style="display:none;position:absolute;top:30px;left:50%;transform:translateX(-50%);background:#fff;border:1px solid #e2e8f0;
             box-shadow:0 12px 30px rgba(15,23,42,0.16);border-radius:10px;padding:6px;width:150px;
             z-index:999;max-height:260px;overflow:auto;text-transform:none;letter-spacing:0;text-align:left;">
      ${tags
        .map(
          (tag) => `
        <button onclick="event.stopPropagation();setTagFilter('${tag.value}')"
          style="display:block;width:100%;text-align:left;padding:8px 10px;border:none;border-radius:8px;
                 background:${
                   currentTagFilter === tag.value ? "#eff6ff" : "transparent"
                 };
                 color:${
                   currentTagFilter === tag.value ? "#2563eb" : "#334155"
                 };
                 font-size:13px;font-weight:${
                   currentTagFilter === tag.value ? "700" : "500"
                 };
                 line-height:1.3;cursor:pointer;">
          ${tag.label}
        </button>`
        )
        .join("")}
    </div>`;
}

function renderPriorityDropdown() {
  const options = [
    { label: "Tất cả", value: "all" },
    { label: "Very High", value: "very_high" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];

  return `
    <div id="priorityDropdown"
      style="display:none;position:absolute;top:30px;left:50%;transform:translateX(-50%);
             background:#fff;border:1px solid #e2e8f0;
             box-shadow:0 12px 30px rgba(15,23,42,0.16);border-radius:10px;
             padding:6px;width:135px;z-index:999;max-height:240px;overflow:auto;
             text-transform:none;letter-spacing:0;text-align:left;">
      ${options
        .map(
          (opt) => `
        <button onclick="event.stopPropagation();setPriorityFilter('${
          opt.value
        }')"
          style="display:block;width:100%;text-align:left;padding:8px 10px;border:none;border-radius:8px;
                 background:${
                   currentPriorityFilter === opt.value
                     ? "#eff6ff"
                     : "transparent"
                 };
                 color:${
                   currentPriorityFilter === opt.value ? "#2563eb" : "#334155"
                 };
                 font-size:13px;font-weight:${
                   currentPriorityFilter === opt.value ? "700" : "500"
                 };
                 text-transform:none;letter-spacing:0;line-height:1.3;cursor:pointer;">
          ${opt.label}
        </button>`
        )
        .join("")}
    </div>`;
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

// ===== TAG =====
function toggleTagDropdown(e) {
  e.stopPropagation();

  const tag = document.getElementById("tagDropdown");
  const priority = document.getElementById("priorityDropdown");

  if (priority) priority.style.display = "none";
  if (tag) tag.style.display = tag.style.display === "block" ? "none" : "block";
}

function setTagFilter(value) {
  currentTagFilter = value;
  currentPage = 1;

  const el = document.getElementById("tagDropdown");
  if (el) el.style.display = "none";

  renderTable();
}

// ===== PRIORITY =====
function togglePriorityDropdown(e) {
  e.stopPropagation();

  const tag = document.getElementById("tagDropdown");
  const priority = document.getElementById("priorityDropdown");

  if (tag) tag.style.display = "none";
  if (priority) {
    priority.style.display =
      priority.style.display === "block" ? "none" : "block";
  }
}

function setPriorityFilter(value) {
  currentPriorityFilter = value;
  currentPage = 1;

  const el = document.getElementById("priorityDropdown");
  if (el) el.style.display = "none";

  renderTable();
}

// click ngoài đóng dropdown
document.addEventListener("click", () => {
  const t = document.getElementById("tagDropdown");
  const p = document.getElementById("priorityDropdown");
  if (t) t.style.display = "none";
  if (p) p.style.display = "none";
});

function selectRow(id) {
  selectedRowId = id;
  renderTable();
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}
