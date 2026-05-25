// ================================================================
//  CUSTOMER DETAIL PAGE
//  - Xem thông tin chi tiết khách hàng
//  - Sửa thông tin (tên, SĐT, giới tính)
//  - Gia hạn gói tập (chọn gói → confirm popup)
//  - Lịch sử đăng ký
// ================================================================

let customerDetail = null; // cache data khách
let currentUser = null;
let confirmAction = "renew";
let confirmModalDrag = {
  active: false,
  offsetX: 0,
  offsetY: 0,
};
let packages = []; // cache danh sách gói
let customerId = null;
let isEditing = false;
let subCurrentPage = 1;
const subPageSize = 5;
let activeHistoryTab = "subscription";
let checkinHistory = [];
let checkinCurrentPage = 1;
const checkinPageSize = 3;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  currentUser = getCurrentUserFromToken();

  const params = new URLSearchParams(window.location.search);
  customerId = params.get("id");
  if (!customerId) {
    window.location.href = "/customer";
    return;
  }

  document.getElementById("app").innerHTML = renderLayout(renderDetailShell());
  document.getElementById("modal-root").innerHTML = renderConfirmModal();
  initMenuEvent();

  fetchDetail();
  fetchPackages();
  fetchCheckins();
});

// ================= FETCH =================
async function fetchDetail() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/customers/${customerId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();

    // API getCustomerById cần include subscriptions — nếu chưa có thì fetch riêng
    // Nếu data không có subscriptions, fetch lại từ endpoint có include
    if (!data.subscriptions) {
      const res2 = await fetch(`/api/customers/${customerId}/detail`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res2.ok) {
        customerDetail = await res2.json();
      } else {
        customerDetail = { ...data, subscriptions: [] };
      }
    } else {
      customerDetail = data;
    }
    subCurrentPage = 1;
    renderDetail();
  } catch (err) {
    console.error("Fetch detail lỗi:", err);
  }
}

async function fetchPackages() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/packages", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    packages = data.data || [];
  } catch (err) {
    console.error("Fetch packages lỗi:", err);
  }
}

async function fetchCheckins() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/checkin/customer/${customerId}`, {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();
    checkinHistory = data.data || [];
    checkinCurrentPage = 1;

    if (customerDetail) renderDetail();
  } catch (err) {
    console.error("Fetch checkin history lỗi:", err);
  }
}

// ================= HELPERS =================
function formatGender(g) {
  if (g === "male") return "Nam";
  if (g === "female") return "Nữ";
  return "Khác";
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatPrice(p) {
  if (!p && p !== 0) return "—";
  return p.toLocaleString("vi-VN") + " vnđ";
}

function getType(c) {
  if (!c.subscriptions || c.subscriptions.length === 0) return "Vãng lai";
  const active = c.subscriptions.find((s) => s.status === "active");
  if (!active) return "Hết hạn";
  if (!active.package) return "Vãng lai";
  return "Hội viên";
}

function getActiveSub(c) {
  if (!c.subscriptions) return null;

  const now = new Date();

  const activeSubs = c.subscriptions
    .filter((s) => s.status === "active" && new Date(s.endDate) >= now)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  const unpaid = activeSubs.find((s) => s.isPaid === false);
  if (unpaid) return unpaid;

  return activeSubs[0] || null;
}

function typeBadge(type) {
  const map = {
    "Hội viên": "background:#d1fae5;color:#065f46;border:1px solid #6ee7b7",
    "Hết hạn": "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5",
    "Vãng lai": "background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db",
  };
  const s = map[type] || map["Vãng lai"];
  return `<span style="display:inline-flex;align-items:center;padding:3px 12px;border-radius:9999px;font-size:12px;font-weight:600;${s}">${type}</span>`;
}

function statusBadge(status, sub = null) {
  if (sub && sub.isPaid === false) {
    return `<span style="color:#dc2626;font-weight:600;font-size:13px;">Chưa thanh toán</span>`;
  }

  if (status === "active")
    return `<span style="color:#059669;font-weight:600;font-size:13px;">Còn hạn ✓</span>`;

  return `<span style="color:#dc2626;font-weight:600;font-size:13px;">Hết hạn</span>`;
}

function monthDiff(start, end) {
  const s = new Date(start);
  const e = new Date(end);

  let months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());

  if (e.getDate() >= s.getDate()) months += 0;

  return Math.max(months, 0);
}

function getRenewalSummary(sub) {
  if (!sub?.package || !sub.startDate || !sub.endDate) return null;

  const realMonths = monthDiff(sub.startDate, sub.endDate);
  const baseMonths = Number(sub.package.durationMonths || 0);
  const extraMonths = realMonths - baseMonths;

  if (extraMonths <= 0) return null;

  return `Đã gia hạn thêm ${extraMonths} tháng`;
}

function paginateSubs(data) {
  const start = (subCurrentPage - 1) * subPageSize;
  return data.slice(start, start + subPageSize);
}

function renderSubPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / subPageSize);
  if (totalPages <= 1) return "";

  const disabledStyle = "opacity:0.35;cursor:default;";
  let buttons = "";

  for (let page = 1; page <= totalPages; page++) {
    const active = page === subCurrentPage;

    buttons += `
      <button onclick="changeSubPage(${page})"
        style="width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;
               font-size:13px;font-weight:600;
               background:${active ? "#2563eb" : "#f3f4f6"};
               color:${active ? "#fff" : "#475569"};">
        ${page}
      </button>
    `;
  }

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:10px 20px;border-top:1px solid #f3f4f6;">
      <span style="font-size:12px;color:#9ca3af;">
        ${(subCurrentPage - 1) * subPageSize + 1}–${Math.min(
    subCurrentPage * subPageSize,
    totalItems
  )} / ${totalItems} đăng ký
      </span>

      <div style="display:flex;align-items:center;gap:4px;">
        <button onclick="changeSubPage(${subCurrentPage - 1})" ${
    subCurrentPage === 1 ? "disabled" : ""
  }
          style="width:30px;height:30px;border-radius:8px;border:none;background:#f3f4f6;
                 color:#64748b;cursor:pointer;font-size:14px;${
                   subCurrentPage === 1 ? disabledStyle : ""
                 }">
          ‹
        </button>

        ${buttons}

        <button onclick="changeSubPage(${subCurrentPage + 1})" ${
    subCurrentPage === totalPages ? "disabled" : ""
  }
          style="width:30px;height:30px;border-radius:8px;border:none;background:#f3f4f6;
                 color:#64748b;cursor:pointer;font-size:14px;${
                   subCurrentPage === totalPages ? disabledStyle : ""
                 }">
          ›
        </button>
      </div>
    </div>
  `;
}

function changeSubPage(page) {
  const totalItems = customerDetail?.subscriptions?.length || 0;
  const totalPages = Math.ceil(totalItems / subPageSize);

  if (page < 1 || page > totalPages) return;

  subCurrentPage = page;
  renderDetail();
}

function formatDateTime(d) {
  if (!d) return "—";

  const date = new Date(d);

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function paginateCheckins(data) {
  const start = (checkinCurrentPage - 1) * checkinPageSize;
  return data.slice(start, start + checkinPageSize);
}

function renderCheckinPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / checkinPageSize);
  if (totalPages <= 1) return "";

  let buttons = "";
  const disabledStyle = "opacity:0.35;cursor:default;";

  for (let page = 1; page <= totalPages; page++) {
    const active = page === checkinCurrentPage;

    buttons += `
      <button onclick="changeCheckinPage(${page})"
        style="width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;
               font-size:13px;font-weight:600;
               background:${active ? "#2563eb" : "#f3f4f6"};
               color:${active ? "#fff" : "#475569"};">
        ${page}
      </button>
    `;
  }

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:10px 20px;border-top:1px solid #f3f4f6;">
      <span style="font-size:12px;color:#9ca3af;">
        ${(checkinCurrentPage - 1) * checkinPageSize + 1}–${Math.min(
    checkinCurrentPage * checkinPageSize,
    totalItems
  )} / ${totalItems} lượt check-in
      </span>

      <div style="display:flex;align-items:center;gap:4px;">
        <button onclick="changeCheckinPage(${checkinCurrentPage - 1})" ${
    checkinCurrentPage === 1 ? "disabled" : ""
  }
          style="width:30px;height:30px;border-radius:8px;border:none;background:#f3f4f6;
                 color:#64748b;cursor:pointer;font-size:14px;${
                   checkinCurrentPage === 1 ? disabledStyle : ""
                 }">
          ‹
        </button>

        ${buttons}

        <button onclick="changeCheckinPage(${checkinCurrentPage + 1})" ${
    checkinCurrentPage === totalPages ? "disabled" : ""
  }
          style="width:30px;height:30px;border-radius:8px;border:none;background:#f3f4f6;
                 color:#64748b;cursor:pointer;font-size:14px;${
                   checkinCurrentPage === totalPages ? disabledStyle : ""
                 }">
          ›
        </button>
      </div>
    </div>
  `;
}

function changeCheckinPage(page) {
  const totalPages = Math.ceil(checkinHistory.length / checkinPageSize);
  if (page < 1 || page > totalPages) return;

  checkinCurrentPage = page;
  renderDetail();
}

function setHistoryTab(tab) {
  activeHistoryTab = tab;
  subCurrentPage = 1;
  checkinCurrentPage = 1;
  renderDetail();
}

function getCurrentUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    return null;
  }
}

function isAdmin() {
  return currentUser?.role === "admin";
}

// ================= SHELL =================
function renderDetailShell() {
  return `
    <div style="padding:24px;width:100%;max-width:900px;">

      <!-- BACK -->
      <button onclick="window.location.href='/customer'"
        style="display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;
               height:34px;padding:0 14px;background:#f1f5f9;color:#475569;
               font-size:13px;font-weight:500;border:none;border-radius:10px;cursor:pointer;"
        onmouseover="this.style.background='#e2e8f0'"
        onmouseout="this.style.background='#f1f5f9'">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Quay lại danh sách
      </button>

      <div id="detailContent"></div>
    </div>`;
}

// ================= RENDER DETAIL =================
function renderDetail() {
  const c = customerDetail;
  const type = getType(c);
  const active = getActiveSub(c);
  const subs = (c.subscriptions || []).sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );
  const pagedSubs = paginateSubs(subs);

  document.getElementById("detailContent").innerHTML = `

    <!-- TOP ROW: thông tin + gói hiện tại -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

      <!-- THÔNG TIN CƠ BẢN -->
      <div style="background:#fff;border-radius:16px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.06);padding:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">Thông tin cơ bản</h3>
          ${typeBadge(type)}
        </div>

        <div id="infoView">
          ${renderInfoView(c)}
        </div>
      </div>

      <!-- GÓI TẬP HIỆN TẠI -->
      <div style="background:#fff;border-radius:16px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.06);padding:20px;">
        <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 16px;">Gói tập hiện tại</h3>

        ${
          active
            ? `
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${infoRow("Loại gói", active.package?.packageName || "—")}
                ${infoRow("Giá", formatPrice(active.package?.price))}
                ${infoRow("Ngày bắt đầu", formatDate(active.startDate))}
                ${infoRow("Ngày hết hạn", formatDate(active.endDate))}
                ${
                  getRenewalSummary(active)
                    ? infoRow("Gia hạn", getRenewalSummary(active))
                    : ""
                }
                ${infoRow("Trạng thái", statusBadge(active.status, active))}
${
  active.isPaid === false
    ? `<button onclick="payActiveSubscription(${active.id})"
        style="margin-top:8px;height:36px;width:100%;border:none;border-radius:10px;
               background:#2563eb;color:#fff;font-size:13px;font-weight:700;cursor:pointer;
               box-shadow:0 2px 8px rgba(37,99,235,0.25);">
        Xác nhận thanh toán
      </button>`
    : ""
}
            </div>
            `
            : `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                      height:120px;color:#d1d5db;gap:8px;">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span style="font-size:13px;">Không có gói active</span>
          </div>
        `
        }
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">

      <!-- NÚT SỬA -->
      <button id="editBtn" onclick="startEdit()"
        style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;
               background:#f8fafc;color:#374151;font-size:13px;font-weight:600;
               border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;"
        onmouseover="this.style.background='#f1f5f9'"
        onmouseout="this.style.background='#f8fafc'">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Sửa thông tin
      </button>

      <!-- NÚT GIA HẠN + DROPDOWN -->
      <div style="position:relative;" id="renewWrapper">
        <button onclick="toggleRenewMenu()"
          style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;
                 background:#2563eb;color:#fff;font-size:13px;font-weight:600;
                 border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.3);"
          onmouseover="this.style.background='#1d4ed8'"
          onmouseout="this.style.background='#2563eb'">
          <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Gia hạn
          <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- DROPDOWN GÓI -->
        <div id="renewMenu"
          style="display:none;position:absolute;top:42px;left:0;z-index:100;
                 background:#fff;border-radius:12px;border:1px solid #e2e8f0;
                 box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:200px;overflow:hidden;">
          ${
            packages.length === 0
              ? `<div style="padding:12px 16px;font-size:13px;color:#9ca3af;">Đang tải...</div>`
              : packages
                  .map(
                    (p) => `
              <button onclick="selectRenewPackage(${p.id}, '${
                      p.packageName
                    }', ${p.durationMonths}, ${p.price})"
                style="display:flex;align-items:center;justify-content:space-between;
                       width:100%;padding:10px 16px;background:transparent;border:none;
                       cursor:pointer;font-size:13px;text-align:left;gap:16px;"
                onmouseover="this.style.background='#f8fafc'"
                onmouseout="this.style.background='transparent'">
                <span style="font-weight:500;color:#1e293b;">${
                  p.packageName
                }</span>
                <span style="color:#6b7280;font-size:12px;">${p.price.toLocaleString(
                  "vi-VN"
                )}đ</span>
              </button>`
                  )
                  .join("")
          }
        </div>
      </div>

      ${renderDeleteButton()}

    </div>

    ${renderHistorySection(subs, pagedSubs)}
  `;

  // Đóng dropdown khi click ngoài
  document.removeEventListener("click", closeRenewMenuOnOutside);
  document.addEventListener("click", closeRenewMenuOnOutside);
}

function renderDeleteButton() {
  if (!isAdmin()) return "";

  return `
    <button onclick="openDeleteCustomerModal()"
      style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;
             background:#fee2e2;color:#991b1b;font-size:13px;font-weight:700;
             border:1px solid #fecaca;border-radius:10px;cursor:pointer;"
      onmouseover="this.style.background='#fecaca'"
      onmouseout="this.style.background='#fee2e2'">
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-8 0h10"/>
      </svg>
      Xoá
    </button>
  `;
}

function historyTabButton(tab, label, count) {
  const active = activeHistoryTab === tab;

  return `
    <button onclick="setHistoryTab('${tab}')"
      style="height:34px;padding:0 14px;border-radius:10px;cursor:pointer;
             display:inline-flex;align-items:center;gap:6px;
             font-size:13px;font-weight:700;border:1px solid ${
               active ? "#2563eb" : "#e2e8f0"
             };
             background:${active ? "#2563eb" : "#f8fafc"};
             color:${active ? "#fff" : "#475569"};">
      ${label}
      <span style="font-size:11px;font-weight:700;padding:1px 6px;border-radius:9999px;
                   background:${active ? "rgba(255,255,255,0.25)" : "#e5e7eb"};
                   color:${active ? "#fff" : "#64748b"};">
        ${count}
      </span>
    </button>
  `;
}

function renderHistorySection(subs, pagedSubs) {
  return `
    <div style="background:#fff;border-radius:16px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f3f4f6;">
        <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">Lịch sử</h3>
        <div style="display:flex;align-items:center;gap:8px;">
          ${historyTabButton("subscription", "Đăng ký", subs.length)}
          ${historyTabButton("checkin", "Check-in", checkinHistory.length)}
        </div>
      </div>

      ${
        activeHistoryTab === "subscription"
          ? renderSubscriptionHistory(subs, pagedSubs)
          : renderCheckinHistory()
      }
    </div>
  `;
}

function renderSubscriptionHistory(subs, pagedSubs) {
  return `
    <div style="display:flex;padding:10px 20px;background:#f8fafc;border-bottom:1px solid #f3f4f6;">
      <div style="width:25%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Gói</div>
      <div style="width:25%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Ngày bắt đầu</div>
      <div style="width:25%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Ngày hết hạn</div>
      <div style="width:25%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Trạng thái</div>
    </div>

    ${
      subs.length === 0
        ? `<div style="padding:40px;text-align:center;color:#d1d5db;font-size:13px;">Chưa có lịch sử đăng ký</div>`
        : pagedSubs
            .map(
              (s) => `
        <div style="display:flex;align-items:center;padding:12px 20px;border-bottom:1px solid #f9fafb;">
          <div style="width:25%;font-size:13px;font-weight:500;color:#1e293b;">
            ${s.package?.packageName || "Vé ngày"}
          </div>
          <div style="width:25%;font-size:13px;color:#6b7280;">${formatDate(
            s.startDate
          )}</div>
          <div style="width:25%;font-size:13px;color:#6b7280;">${formatDate(
            s.endDate
          )}</div>
            <div style="width:25%;display:flex;align-items:center;gap:8px;">
                ${statusBadge(s.status, s)}
                ${
                  s.isPaid === false
                    ? `<button onclick="payActiveSubscription(${s.id})"
                        style="height:28px;padding:0 10px;border:none;border-radius:8px;
                                background:#2563eb;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">
                        Thanh toán
                        </button>`
                    : ""
                }
            </div>
        </div>`
            )
            .join("")
    }

    ${renderSubPagination(subs.length)}
  `;
}

function renderCheckinHistory() {
  const pagedCheckins = paginateCheckins(checkinHistory);

  return `
    <div style="display:flex;padding:10px 20px;background:#f8fafc;border-bottom:1px solid #f3f4f6;">
      <div style="width:35%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Mã</div>
      <div style="width:35%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Thời gian</div>
      <div style="width:30%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Trạng thái</div>
    </div>

    ${
      checkinHistory.length === 0
        ? `<div style="padding:40px;text-align:center;color:#d1d5db;font-size:13px;">Chưa có lịch sử check-in</div>`
        : pagedCheckins
            .map(
              (c) => `
        <div style="display:flex;align-items:center;padding:12px 20px;border-bottom:1px solid #f9fafb;">
          <div style="width:35%;font-size:13px;font-weight:500;color:#1e293b;">#${
            c.id
          }</div>
          <div style="width:35%;font-size:13px;color:#6b7280;">${formatDateTime(
            c.checkinTime
          )}</div>
          <div style="width:30%;">
            <span style="font-size:13px;font-weight:600;color:#059669;">Thành công ✓</span>
          </div>
        </div>`
            )
            .join("")
    }

    ${renderCheckinPagination(checkinHistory.length)}
  `;
}

// ================= INFO VIEW / EDIT =================
function infoRow(label, value) {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:6px 0;border-bottom:1px solid #f9fafb;">
      <span style="font-size:12px;color:#94a3b8;font-weight:500;">${label}</span>
      <span style="font-size:13px;color:#1e293b;font-weight:500;">${value}</span>
    </div>`;
}

function renderInfoView(c) {
  return `
    <div style="display:flex;flex-direction:column;gap:2px;">
      ${infoRow("Họ và tên", c.fullName || "—")}
      ${infoRow("Số điện thoại", c.phone || "—")}
      ${infoRow("Giới tính", formatGender(c.gender))}
    </div>`;
}

const inputStyle = `width:100%;height:38px;padding:0 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;color:#374151;outline:none;box-sizing:border-box;`;
const labelStyle = `display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px;`;

function startEdit() {
  if (isEditing) return;
  isEditing = true;

  const c = customerDetail;

  document.getElementById("infoView").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div>
        <label style="${labelStyle}">Họ và tên <span style="color:#f87171;">*</span></label>
        <input id="edit-name" value="${c.fullName || ""}" style="${inputStyle}"
          onfocus="this.style.borderColor='#93c5fd';this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)'"
          onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"/>
      </div>
      <div>
        <label style="${labelStyle}">Số điện thoại <span style="color:#f87171;">*</span></label>
        <input id="edit-phone" value="${
          c.phone || ""
        }" type="tel" style="${inputStyle}"
          onfocus="this.style.borderColor='#93c5fd';this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)'"
          onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"/>
      </div>
      <div>
        <label style="${labelStyle}">Giới tính</label>
        <select id="edit-gender" style="${inputStyle}cursor:pointer;">
          <option value="male"   ${
            c.gender === "male" ? "selected" : ""
          }>Nam</option>
          <option value="female" ${
            c.gender === "female" ? "selected" : ""
          }>Nữ</option>
          <option value="other"  ${
            c.gender === "other" ? "selected" : ""
          }>Khác</option>
        </select>
      </div>

      <!-- Nút hành động edit -->
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button onclick="cancelEdit()"
          style="flex:1;height:36px;background:#f1f5f9;color:#475569;font-size:13px;font-weight:500;
                 border:none;border-radius:10px;cursor:pointer;"
          onmouseover="this.style.background='#e2e8f0'"
          onmouseout="this.style.background='#f1f5f9'">Hủy</button>
        <button onclick="confirmEdit()"
          style="flex:1;height:36px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;
                 border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.25);"
          onmouseover="this.style.background='#1d4ed8'"
          onmouseout="this.style.background='#2563eb'">Xác nhận</button>
      </div>
    </div>`;

  // Ẩn nút Sửa thông tin khi đang edit
  document.getElementById("editBtn").style.display = "none";
}

function cancelEdit() {
  isEditing = false;
  document.getElementById("infoView").innerHTML =
    renderInfoView(customerDetail);
  document.getElementById("editBtn").style.display = "inline-flex";
}

async function confirmEdit() {
  const nameVal = document.getElementById("edit-name")?.value.trim();
  const phoneVal = document.getElementById("edit-phone")?.value.trim();
  const genderVal = document.getElementById("edit-gender")?.value;

  if (!nameVal || !phoneVal) {
    showToast("Vui lòng điền đầy đủ họ tên và số điện thoại", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/customers/${customerId}`, {
      method: "PUT",
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
      showToast(result.message || "Cập nhật thất bại", "error");
      return;
    }

    // Cập nhật cache
    customerDetail.fullName = nameVal;
    customerDetail.phone = phoneVal;
    customerDetail.gender = genderVal;

    isEditing = false;
    document.getElementById("infoView").innerHTML =
      renderInfoView(customerDetail);
    document.getElementById("editBtn").style.display = "inline-flex";
    showToast("Cập nhật thông tin thành công!");
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
  }
}

// ================= RENEW DROPDOWN =================
function toggleRenewMenu() {
  const menu = document.getElementById("renewMenu");
  const isOpen = menu.style.display === "block";

  // Nếu packages chưa load xong thì load lại
  if (packages.length > 0) {
    menu.innerHTML = packages
      .map(
        (p) => `
      <button onclick="selectRenewPackage(${p.id}, '${p.packageName}', ${
          p.durationMonths
        }, ${p.price})"
        style="display:flex;align-items:center;justify-content:space-between;
               width:100%;padding:10px 16px;background:transparent;border:none;
               cursor:pointer;font-size:13px;text-align:left;gap:16px;"
        onmouseover="this.style.background='#f8fafc'"
        onmouseout="this.style.background='transparent'">
        <span style="font-weight:500;color:#1e293b;">${p.packageName}</span>
        <span style="color:#6b7280;font-size:12px;">${p.price.toLocaleString(
          "vi-VN"
        )}đ</span>
      </button>`
      )
      .join("");
  }

  menu.style.display = isOpen ? "none" : "block";
}

function closeRenewMenuOnOutside(e) {
  const wrapper = document.getElementById("renewWrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    const menu = document.getElementById("renewMenu");
    if (menu) menu.style.display = "none";
  }
}

// Lưu gói đang chọn để dùng khi confirm
let selectedPkg = null;

function selectRenewPackage(id, name, months, price) {
  document.getElementById("renewMenu").style.display = "none";
  confirmAction = "renew";
  selectedPkg = { id, name, months, price };

  // Hiển thị confirm modal
  const modal = document.getElementById("confirmModal");
  const modalBody = document.getElementById("confirmModalBody");

  const activeSub = getActiveSub(customerDetail);
  const newStart = activeSub ? new Date(activeSub.endDate) : new Date();
  const newEnd = new Date(newStart);
  newEnd.setMonth(newEnd.getMonth() + months);

  modalBody.innerHTML = `
    <p style="font-size:15px;color:#1e293b;font-weight:500;margin:0 0 12px;">
      Xác nhận gia hạn thêm <strong>${name}</strong> (${months} tháng)?
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:12px 16px;display:flex;flex-direction:column;gap:6px;margin-bottom:4px;">
      ${infoRow("Gói gia hạn", name)}
      ${infoRow("Thời hạn", `${months} tháng`)}
      ${infoRow("Giá", price.toLocaleString("vi-VN") + "đ")}
      ${infoRow("Bắt đầu từ", formatDate(newStart))}
      ${infoRow("Hết hạn vào", formatDate(newEnd))}
    </div>`;

  document.getElementById("confirmModalTitle").innerText = "Xác nhận gia hạn";
  document.getElementById("confirmModalDesc").innerText =
    "Vui lòng kiểm tra thông tin trước khi xác nhận";
  document.getElementById("confirmModalIcon").innerHTML = `
  <svg width="22" height="22" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>`;
  document.getElementById("confirmModalIcon").style.background = "#eff6ff";
  document.getElementById("confirmModalConfirmBtn").innerText =
    "Xác nhận gia hạn";
  document.getElementById("confirmModalConfirmBtn").style.background =
    "#2563eb";

  openConfirmModal();
}

// ================= CONFIRM MODAL =================
function renderConfirmModal() {
  return `
    <div id="confirmModal"
      style="display:none;position:fixed;inset:0;z-index:200;">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"
           onclick="closeConfirmModal()"></div>

      <div id="confirmModalBox"
        style="position:fixed;left:50%;top:50%;z-index:201;background:#fff;border-radius:16px;
               width:100%;max-width:420px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15);
               transform:translate(-50%, -50%) scale(0.98);opacity:0;transition:opacity 0.18s, transform 0.18s;">

        <!-- Close -->
        <button onclick="closeConfirmModal()"
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

        <!-- Drag handle -->
        <div onmousedown="startConfirmModalDrag(event)"
          style="cursor:move;user-select:none;padding-right:36px;margin:-4px -4px 16px -4px;padding:4px 36px 0 4px;">
          <div id="confirmModalIcon" style="width:44px;height:44px;background:#eff6ff;border-radius:12px;
                      display:flex;align-items:center;justify-content:center;margin-bottom:14px;">
            <svg width="22" height="22" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>

          <h3 id="confirmModalTitle" style="font-size:16px;font-weight:700;color:#1e293b;margin:0 0 4px;">Xác nhận gia hạn</h3>
          <p id="confirmModalDesc" style="font-size:12px;color:#94a3b8;margin:0;">Vui lòng kiểm tra thông tin trước khi xác nhận</p>
        </div>

        <div id="confirmModalBody"></div>

        <div style="display:flex;gap:8px;margin-top:20px;">
          <button onclick="closeConfirmModal()"
            style="flex:1;height:38px;background:#f1f5f9;color:#475569;font-size:13px;font-weight:500;
                   border:none;border-radius:10px;cursor:pointer;"
            onmouseover="this.style.background='#e2e8f0'"
            onmouseout="this.style.background='#f1f5f9'">Hủy</button>
          <button id="confirmModalConfirmBtn" onclick="submitConfirmModal()"
            style="flex:1;height:38px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;
                   border:none;border-radius:10px;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.3);"
            onmouseover="this.style.filter='brightness(0.92)'"
            onmouseout="this.style.filter='none'">Xác nhận gia hạn</button>
        </div>

      </div>
    </div>`;
}

function openConfirmModal() {
  const modal = document.getElementById("confirmModal");
  const box = document.getElementById("confirmModalBox");

  modal.style.display = "block";

  box.style.left = "50%";
  box.style.top = "50%";
  box.style.transform = "translate(-50%, -50%) scale(0.98)";
  box.style.opacity = "0";

  requestAnimationFrame(() => {
    box.style.transform = "translate(-50%, -50%) scale(1)";
    box.style.opacity = "1";
  });
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  const box = document.getElementById("confirmModalBox");

  box.style.transform = "translate(-50%, -50%) scale(0.98)";
  box.style.opacity = "0";

  setTimeout(() => {
    modal.style.display = "none";
  }, 180);
}

function startConfirmModalDrag(e) {
  const box = document.getElementById("confirmModalBox");
  const rect = box.getBoundingClientRect();

  confirmModalDrag.active = true;
  confirmModalDrag.offsetX = e.clientX - rect.left;
  confirmModalDrag.offsetY = e.clientY - rect.top;

  box.style.transition = "none";
  box.style.transform = "none";
  box.style.left = rect.left + "px";
  box.style.top = rect.top + "px";

  document.addEventListener("mousemove", dragConfirmModal);
  document.addEventListener("mouseup", stopConfirmModalDrag);
}

function dragConfirmModal(e) {
  if (!confirmModalDrag.active) return;

  const box = document.getElementById("confirmModalBox");
  const rect = box.getBoundingClientRect();

  let left = e.clientX - confirmModalDrag.offsetX;
  let top = e.clientY - confirmModalDrag.offsetY;

  left = Math.max(8, Math.min(left, window.innerWidth - rect.width - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - rect.height - 8));

  box.style.left = left + "px";
  box.style.top = top + "px";
}

function stopConfirmModalDrag() {
  confirmModalDrag.active = false;

  const box = document.getElementById("confirmModalBox");
  box.style.transition = "opacity 0.18s, transform 0.18s";

  document.removeEventListener("mousemove", dragConfirmModal);
  document.removeEventListener("mouseup", stopConfirmModalDrag);
}

function openDeleteCustomerModal() {
  if (!isAdmin()) {
    showToast("Bạn không có quyền xoá khách hàng", "error");
    return;
  }

  confirmAction = "delete";

  const c = customerDetail;
  const modalBody = document.getElementById("confirmModalBody");

  document.getElementById("confirmModalTitle").innerText =
    "Xác nhận xoá khách hàng";
  document.getElementById("confirmModalDesc").innerText =
    "Thao tác này sẽ xoá khách hàng và dữ liệu liên quan";

  document.getElementById("confirmModalIcon").innerHTML = `
    <svg width="22" height="22" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-8 0h10"/>
    </svg>`;
  document.getElementById("confirmModalIcon").style.background = "#fee2e2";

  document.getElementById("confirmModalConfirmBtn").innerText = "Xác nhận xoá";
  document.getElementById("confirmModalConfirmBtn").style.background =
    "#dc2626";

  modalBody.innerHTML = `
    <p style="font-size:15px;color:#1e293b;font-weight:500;margin:0 0 12px;">
      Bạn có chắc chắn muốn xoá khách hàng <strong>${
        c.fullName || "—"
      }</strong>?
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;display:flex;flex-direction:column;gap:6px;">
      ${infoRow("Họ và tên", c.fullName || "—")}
      ${infoRow("Số điện thoại", c.phone || "—")}
      ${infoRow("Giới tính", formatGender(c.gender))}
      ${infoRow("Loại khách", getType(c))}
    </div>

    <p style="font-size:12px;color:#dc2626;margin:10px 0 0;">
      Lưu ý: dữ liệu đăng ký, check-in, ghi chú và phản hồi liên quan cũng sẽ bị xoá.
    </p>`;

  openConfirmModal();
}

function submitConfirmModal() {
  if (confirmAction === "delete") {
    return submitDeleteCustomer();
  }

  return submitRenew();
}

async function submitDeleteCustomer() {
  if (!isAdmin()) {
    showToast("Bạn không có quyền xoá khách hàng", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/customers/${customerId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Xoá khách hàng thất bại", "error");
      return;
    }

    closeConfirmModal();
    showToast("Xoá khách hàng thành công!");

    setTimeout(() => {
      window.location.href = "/customer";
    }, 700);
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
  }
}

async function submitRenew() {
  if (!selectedPkg) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        customerId: Number(customerId),
        packageId: selectedPkg.id,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      showToast(result.message || "Gia hạn thất bại", "error");
      return;
    }

    closeConfirmModal();
    showToast(`Gia hạn ${selectedPkg.name} thành công!`);

    // Reload lại data để cập nhật UI
    await fetchDetail();
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
  }
}

async function payActiveSubscription(subscriptionId) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/subscriptions/${subscriptionId}/pay`, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Thanh toán thất bại", "error");
      return;
    }

    showToast("Xác nhận thanh toán thành công!");
    await fetchDetail();
  } catch (err) {
    showToast("Lỗi kết nối server", "error");
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
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;
    gap:10px;background:${bg};color:#fff;font-size:13px;font-weight:500;padding:12px 18px;
    border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,0.15);transition:all 0.2s;
    opacity:0;transform:translateY(8px);`;
  toast.innerHTML = `<svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
    ${icon}</svg>${message}`;

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
