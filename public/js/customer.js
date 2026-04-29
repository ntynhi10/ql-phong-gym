// ================= STATE =================
let currentPage = 1;
const pageSize = 11;
let customerData = [];
let currentData = [];
let isSearching = false;
let activeFilter = "all"; // "all" | "Hội viên" | "Hết hạn" | "Vãng lai"

// ================= COLUMNS =================
const columns = [
  { label: "Tên", key: "name", pct: "22%" },
  { label: "SDT", key: "phone", pct: "15%", center: true },
  { label: "Giới tính", key: "gender", pct: "11%", center: true },
  { label: "Loại", key: "type", pct: "14%", center: true },
  { label: "Gói", key: "package", pct: "14%", center: true },
  { label: "Chi tiết", key: null, pct: "12%", center: true },
  { label: "Check-in", key: null, pct: "12%", center: true },
];

// ================= HELPERS =================
function formatGender(g) {
  if (g === "male") return "Nam";
  if (g === "female") return "Nữ";
  return "Khác";
}

function getType(c) {
  if (!c.subscriptions || c.subscriptions.length === 0) return "Vãng lai";
  const active = c.subscriptions.find((s) => s.status === "active");
  if (!active) return "Hết hạn";
  if (!active.package) return "Vãng lai";
  return "Hội viên";
}

function getPackage(c) {
  if (!c.subscriptions) return "-";
  const active = c.subscriptions.find((s) => s.status === "active");
  if (!active || !active.package) return "-";
  return active.package.packageName;
}

// ================= FILTER =================
function getFilteredData() {
  let base = isSearching ? currentData : customerData;
  if (activeFilter === "all") return base;
  return base.filter((item) => item.type === activeFilter);
}

function setFilter(filter) {
  activeFilter = filter;
  currentPage = 1;
  renderTable();
  renderFilterButtons();
}

function renderFilterButtons() {
  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "Hội viên", label: "Hội viên" },
    { key: "Hết hạn", label: "Hết hạn" },
    { key: "Vãng lai", label: "Vãng lai" },
  ];

  const colors = {
    all: { active: "#2563eb", text: "#fff", bg: "#eff6ff", border: "#bfdbfe" },
    "Hội viên": {
      active: "#059669",
      text: "#fff",
      bg: "#f0fdf4",
      border: "#6ee7b7",
    },
    "Hết hạn": {
      active: "#dc2626",
      text: "#fff",
      bg: "#fef2f2",
      border: "#fca5a5",
    },
    "Vãng lai": {
      active: "#6b7280",
      text: "#fff",
      bg: "#f9fafb",
      border: "#d1d5db",
    },
  };

  // Đếm số lượng mỗi loại
  const counts = { all: customerData.length };
  customerData.forEach((c) => {
    counts[c.type] = (counts[c.type] || 0) + 1;
  });

  const el = document.getElementById("filterButtons");
  if (!el) return;

  el.innerHTML = filters
    .map(({ key, label }) => {
      const isActive = activeFilter === key;
      const c = colors[key];
      const count = counts[key] || 0;

      return `
      <button onclick="setFilter('${key}')"
        style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;
               border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;
               transition:all 0.15s;
               background:${isActive ? c.active : c.bg};
               color:${isActive ? c.text : "#374151"};
               border:1px solid ${isActive ? c.active : c.border};"
        onmouseover="if('${key}'!=='${activeFilter}')this.style.borderColor='${
        c.active
      }'"
        onmouseout="if('${key}'!=='${activeFilter}')this.style.borderColor='${
        c.border
      }'">
        ${label}
        <span style="background:${
          isActive ? "rgba(255,255,255,0.25)" : "#e5e7eb"
        };
                     color:${isActive ? "#fff" : "#6b7280"};
                     font-size:11px;font-weight:600;
                     padding:1px 6px;border-radius:9999px;">
          ${count}
        </span>
      </button>`;
    })
    .join("");
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  document.getElementById("app").innerHTML = renderLayout(renderCustomer());
  document.getElementById("modal-root").innerHTML = renderPopup();
  initMenuEvent();
  fetchCustomers();
});

// ================= FETCH =================
async function fetchCustomers() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/customers", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (!data.data) {
      console.error("Sai format API");
      return;
    }

    customerData = data.data.map((c) => ({
      id: c.id,
      name: c.fullName,
      phone: c.phone,
      gender: formatGender(c.gender),
      type: getType(c),
      package: getPackage(c),
    }));

    renderFilterButtons();
    renderTable();
  } catch (err) {
    console.error("Fetch lỗi:", err);
  }
}

// ================= BADGES =================
function typeBadge(type) {
  const styles = {
    "Hội viên": "background:#d1fae5;color:#065f46;border:1px solid #6ee7b7",
    "Hết hạn": "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5",
    "Vãng lai": "background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db",
  };
  const s = styles[type] || styles["Vãng lai"];
  return `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:500;${s}">${type}</span>`;
}

function genderColor(gender) {
  if (gender === "Nam") return "#3b82f6";
  if (gender === "Nữ") return "#ec4899";
  return "#9ca3af";
}

// ================= PAGINATION =================
function paginate(data) {
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return "";

  let btns = "";
  for (let page = 1; page <= totalPages; page++) {
    const show =
      page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
    const isDot = page === currentPage - 2 || page === currentPage + 2;
    if (isDot) {
      btns += `<span style="padding:0 4px;color:#d1d5db">…</span>`;
      continue;
    }
    if (!show) continue;
    const isAct = currentPage === page;
    btns += `<button onclick="changePage(${page})"
      style="width:32px;height:32px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;
             background:${isAct ? "#2563eb" : "#f3f4f6"};color:${
      isAct ? "#fff" : "#374151"
    };">
      ${page}</button>`;
  }

  const dis = "opacity:0.35;cursor:default;";
  const btn = (label, page, disabled) =>
    `<button onclick="changePage(${page})" ${disabled ? "disabled" : ""}
      style="width:32px;height:32px;border-radius:8px;border:none;background:#f3f4f6;
             color:#6b7280;cursor:pointer;font-size:14px;${
               disabled ? dis : ""
             }">
      ${label}</button>`;

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 0;border-top:1px solid #f3f4f6;margin-top:2px">
      <span style="font-size:12px;color:#9ca3af">
        ${(currentPage - 1) * pageSize + 1}–${Math.min(
    currentPage * pageSize,
    totalItems
  )} / ${totalItems} khách hàng
      </span>
      <div style="display:flex;align-items:center;gap:4px">
        ${btn("«", 1, currentPage === 1)}
        ${btn("‹", currentPage - 1, currentPage === 1)}
        ${btns}
        ${btn("›", currentPage + 1, currentPage === totalPages)}
        ${btn("»", totalPages, currentPage === totalPages)}
      </div>
    </div>`;
}

function changePage(page) {
  const data = getFilteredData();
  const totalPages = Math.ceil(data.length / pageSize);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}

// ================= TABLE =================
function colStyle(col, isHeader) {
  return `width:${col.pct};min-width:0;flex-shrink:0;text-align:${
    col.center ? "center" : "left"
  };font-size:${isHeader ? "12px" : "13px"};`;
}

function renderTableWithPaging(columns, data) {
  const pagedData = paginate(data);

  const header = `
    <div style="display:flex;align-items:center;background:#EEF2FF;padding:10px 20px;border-radius:12px 12px 0 0;">
      ${columns
        .map(
          (col) => `
        <div style="${colStyle(
          col,
          true
        )}font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">
          ${col.label}
        </div>`
        )
        .join("")}
    </div>`;

  const rows =
    pagedData.length === 0
      ? `<div style="text-align:center;padding:60px 0;color:#d1d5db;font-size:14px;">Không tìm thấy khách hàng</div>`
      : pagedData
          .map((item, rowIdx) => {
            const cells = columns
              .map((col) => {
                if (col.label === "Chi tiết")
                  return `
            <div style="${colStyle(col, false)}">
              <a onclick="goDetail(${item.id})" href="#"
                style="color:#2563eb;font-size:13px;font-weight:500;text-decoration:underline;">Xem</a>
            </div>`;

                if (col.label === "Check-in")
                  return `
            <div style="${colStyle(col, false)}">
              <button onclick="openCheckin(${rowIdx})"
                style="width:32px;height:32px;border-radius:8px;border:1px solid #6ee7b7;
                       background:#d1fae5;color:#065f46;cursor:pointer;font-size:16px;line-height:1;">
                ✔
              </button>
            </div>`;

                if (col.key === "name") {
                  const initial = (item.name || "?")[0].toUpperCase();
                  return `
              <div style="${colStyle(
                col,
                false
              )}display:flex;align-items:center;gap:10px;">
                <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#2563eb);
                            display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;
                            font-weight:700;flex-shrink:0;">${initial}</div>
                <span style="font-weight:500;color:#1f2937;">${
                  item.name || "-"
                }</span>
              </div>`;
                }
                if (col.key === "type")
                  return `<div style="${colStyle(col, false)}">${typeBadge(
                    item.type
                  )}</div>`;
                if (col.key === "gender")
                  return `<div style="${colStyle(
                    col,
                    false
                  )}font-weight:500;color:${genderColor(item.gender)};">${
                    item.gender
                  }</div>`;
                if (col.key === "package") {
                  const val =
                    item.package && item.package !== "-" ? item.package : null;
                  return `<div style="${colStyle(col, false)}">
              ${
                val
                  ? `<span style="background:#f3f4f6;color:#374151;font-size:12px;font-weight:500;padding:3px 10px;border-radius:9999px;">${val}</span>`
                  : `<span style="color:#d1d5db;">—</span>`
              }
            </div>`;
                }
                return `<div style="${colStyle(col, false)}color:#4b5563;">${
                  item[col.key] || "-"
                }</div>`;
              })
              .join("");

            return `
          <div style="display:flex;align-items:center;padding:0 20px;height:56px;border-bottom:1px solid #f9fafb;"
               onmouseover="this.style.background='#f0f7ff'"
               onmouseout="this.style.background=''">
            ${cells}
          </div>`;
          })
          .join("");

  return `
    <div style="background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08);border:1px solid #f0f0f0;overflow:hidden;">
      ${header}${rows}
      <div style="padding:0 20px 4px;">${renderPagination(data.length)}</div>
    </div>`;
}

function renderTable() {
  const data = getFilteredData();
  document.getElementById("tableContainer").innerHTML = renderTableWithPaging(
    columns,
    data
  );
}

// ================= SEARCH =================
function handleSearch() {
  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  if (!keyword) {
    isSearching = false;
    currentData = [];
  } else {
    currentData = customerData.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.phone.includes(keyword)
    );
    isSearching = true;
  }
  currentPage = 1;
  renderTable();
}

function handleEnter(e) {
  if (e.key === "Enter") handleSearch();
}

// ================= LAYOUT =================
function renderCustomer() {
  return `
    <div style="padding:24px;width:100%;">

      <!-- TOP BAR -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div>
          <h1 style="font-size:20px;font-weight:700;color:#1e293b;margin:0;">Quản lý khách hàng</h1>
          <p style="font-size:12px;color:#94a3b8;margin:2px 0 0;">Danh sách tất cả khách hàng trong hệ thống</p>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <!-- Search -->
          <div style="position:relative;">
            <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;"
              width="16" height="16" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input type="text" id="searchInput" placeholder="Tìm tên hoặc SĐT..."
              onkeydown="handleEnter(event)" oninput="handleSearch()"
              style="padding:0 16px 0 34px;height:36px;width:240px;background:#f8fafc;
                     border:1px solid #e2e8f0;border-radius:10px;font-size:13px;
                     color:#374151;outline:none;box-sizing:border-box;"
              onfocus="this.style.borderColor='#93c5fd';this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"/>
          </div>
          <!-- Add button -->
          <button onclick="openAdd()"
            style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;
                   background:#2563eb;color:#fff;font-size:13px;font-weight:600;
                   border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.3);"
            onmouseover="this.style.background='#1d4ed8'"
            onmouseout="this.style.background='#2563eb'">
            <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Thêm khách hàng
          </button>
        </div>
      </div>

      <!-- FILTER BUTTONS -->
      <div id="filterButtons" style="display:flex;align-items:center;gap:8px;margin-bottom:16px;"></div>

      <!-- TABLE -->
      <div id="tableContainer"></div>
    </div>`;
}

// ================= POPUP =================
function renderPopup() {
  return `
    <div id="popup" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/40" onclick="closePopup()"></div>
      <div class="flex items-center justify-center h-full p-4">
        <div id="popupBox" class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl translate-y-4 opacity-0 transition-all duration-200">
          <button onclick="closePopup()"
              style="position:absolute;top:16px;right:16px;width:32px;height:32px;
                    display:flex;align-items:center;justify-content:center;
                    border-radius:50%;border:none;background:transparent;
                    color:#9ca3af;cursor:pointer;"
              onmouseover="this.style.background='#f3f4f6'"
              onmouseout="this.style.background='transparent'">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div id="popupContent" class="p-6"></div>
        </div>
      </div>
    </div>`;
}

function openPopup() {
  const popup = document.getElementById("popup");
  const box = document.getElementById("popupBox");
  popup.classList.remove("hidden");
  requestAnimationFrame(() => {
    box.classList.remove("translate-y-4", "opacity-0");
    box.classList.add("translate-y-0", "opacity-100");
  });
}

function closePopup() {
  const popup = document.getElementById("popup");
  const box = document.getElementById("popupBox");
  box.classList.add("translate-y-4", "opacity-0");
  box.classList.remove("translate-y-0", "opacity-100");
  setTimeout(() => popup.classList.add("hidden"), 180);
}

// ================= ADD =================
const inputStyle = `width:100%;height:40px;padding:0 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;color:#374151;outline:none;box-sizing:border-box;`;
const labelStyle = `display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px;`;

function openAdd() {
  document.getElementById("popupContent").innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:17px;font-weight:700;color:#1e293b;margin:0;">Thêm khách hàng</h3>
      <p style="font-size:12px;color:#94a3b8;margin:2px 0 0;">Điền đầy đủ thông tin bên dưới</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div>
        <label style="${labelStyle}">Họ và tên <span style="color:#f87171;">*</span></label>
        <input id="name" placeholder="Nguyễn Văn A" style="${inputStyle}"
          onfocus="this.style.borderColor='#93c5fd';this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)'"
          onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"/>
      </div>
      <div>
        <label style="${labelStyle}">Số điện thoại <span style="color:#f87171;">*</span></label>
        <input id="phone" placeholder="0901 234 567" type="tel" style="${inputStyle}"
          onfocus="this.style.borderColor='#93c5fd';this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)'"
          onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"/>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="${labelStyle}">Giới tính</label>
          <select id="gender" style="${inputStyle}cursor:pointer;">
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div>
          <label style="${labelStyle}">Loại khách hàng</label>
          <select id="type" onchange="handleTypeChange()" style="${inputStyle}cursor:pointer;">
            <option value="member">Hội viên</option>
            <option value="guest">Vãng lai</option>
          </select>
        </div>
      </div>
      <div id="packageWrapper">
        <label style="${labelStyle}">Gói tập</label>
        <select id="package" style="${inputStyle}cursor:pointer;">
          <option>Đang tải gói...</option>
        </select>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;">
      <button onclick="closePopup()"
        style="height:36px;padding:0 16px;background:#f1f5f9;color:#475569;font-size:13px;font-weight:500;border:none;border-radius:10px;cursor:pointer;"
        onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Hủy</button>
      <button onclick="saveCustomer()"
        style="height:36px;padding:0 20px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.3);"
        onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">Lưu khách hàng</button>
    </div>`;
  openPopup();
  loadPackages();
}

function handleTypeChange() {
  const type = document.getElementById("type").value;
  const wrapper = document.getElementById("packageWrapper");
  wrapper.style.display = type === "guest" ? "none" : "block";
}

async function saveCustomer() {
  const token = localStorage.getItem("token");
  const type = document.getElementById("type").value;
  const packageId = document.getElementById("package")?.value;
  const nameVal = document.getElementById("name").value.trim();
  const phoneVal = document.getElementById("phone").value.trim();
  const genderVal = document.getElementById("gender").value;

  if (!nameVal || !phoneVal) {
    showToast("Vui lòng điền đầy đủ họ tên và số điện thoại.", "error");
    return;
  }

  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        fullName: nameVal,
        phone: phoneVal,
        gender: genderVal,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Thêm khách hàng thất bại", "error");
      return;
    }

    if (type === "member") {
      if (!packageId || packageId === "Không có gói tập") {
        showToast("Vui lòng chọn gói tập hợp lệ.", "error");
        return;
      }

      const subRes = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          customerId: result.data.id,
          packageId: Number(packageId),
        }),
      });

      const subResult = await subRes.json();

      if (!subRes.ok) {
        showToast(subResult.message || "Tạo gói cho khách thất bại", "error");
        return;
      }
    }

    closePopup();
    await fetchCustomers();
    showToast("Thêm khách hàng thành công!");
  } catch (err) {
    console.error("Save customer lỗi:", err);
    showToast("Lỗi kết nối server", "error");
  }
}

// ================= PACKAGES =================
async function loadPackages() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/packages", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    const select = document.getElementById("package");
    if (!select) return;
    if (!data.data || data.data.length === 0) {
      select.innerHTML = `<option>Không có gói tập</option>`;
      return;
    }
    select.innerHTML = data.data
      .map(
        (p) =>
          `<option value="${p.id}">${p.packageName} — ${p.price.toLocaleString(
            "vi-VN"
          )}đ</option>`
      )
      .join("");
  } catch (err) {
    console.error("Load package lỗi", err);
  }
}

// ================= DETAIL =================
function goDetail(id) {
  window.location.href = `/customer-detail?id=${id}`;
}

// ================= CHECK-IN =================
async function openCheckin(rowIdx) {
  const data = getFilteredData();
  const item = paginate(data)[rowIdx];
  const token = localStorage.getItem("token");
  const res = await fetch("/api/checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ customerId: item.id }),
  });
  const result = await res.json();
  if (res.ok) {
    showToast(result.message || "Check-in thành công!");
  } else {
    showToast(result.message || "Check-in thất bại", "error");
  }
}

// ================= TOAST =================
function showToast(message, type = "success") {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();
  const bg =
    { success: "#059669", error: "#dc2626", info: "#2563eb" }[type] ||
    "#059669";
  const icon =
    type === "error"
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>`;
  const toast = document.createElement("div");
  toast.id = "toast";
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:10px;background:${bg};color:#fff;font-size:13px;font-weight:500;padding:12px 18px;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,0.15);transition:all 0.2s;opacity:0;transform:translateY(8px);`;
  toast.innerHTML = `<svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">${icon}</svg>${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}
