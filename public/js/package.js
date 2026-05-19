let packages = [];
let selectedPackageId = null;
let isCreating = false;
let isEditingPackage = false;
let descriptionTouched = false;
let confirmCallback = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  document.getElementById("app").innerHTML = renderLayout(renderPackagePage());
  document.getElementById("modal-root").innerHTML = renderConfirmModal();
  initMenuEvent();
  fetchPackages();
});

async function fetchPackages() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/packages?includeInactive=1", {
      headers: { Authorization: "Bearer " + token },
    });

    const result = await res.json();
    packages = sortPackages(result.data || []);

    if (!selectedPackageId && packages.length > 0 && !isCreating) {
      selectedPackageId = packages[0].id;
    }

    renderPackageManager();
  } catch (err) {
    console.error("Fetch packages lỗi:", err);
  }
}

function sortPackages(list) {
  return [...list].sort((a, b) => {
    const monthA = Number(a.durationMonths || 0);
    const monthB = Number(b.durationMonths || 0);

    if (monthA !== monthB) return monthA - monthB;
    return Number(a.id || 0) - Number(b.id || 0);
  });
}

function renderPackagePage() {
  return `
    <div style="padding:32px 48px;width:100%;">
      <div style="margin-bottom:22px;">
        <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;">Quản lý gói tập</h1>
        <p style="font-size:13px;color:#94a3b8;margin:4px 0 0;">
          Thiết lập giá, thời hạn và trạng thái các gói tập
        </p>
      </div>

      <div id="packageManager"></div>
    </div>
  `;
}

function getSelectedPackage() {
  if (isCreating) {
    return {
      id: null,
      packageName: "",
      durationMonths: "",
      price: "",
      description: "",
      isActive: true,
    };
  }

  return packages.find((p) => p.id === selectedPackageId) || null;
}

function packageCode(pkg) {
  if (!pkg?.id) return "Mới";
  return `PM${String(pkg.id).padStart(2, "0")}`;
}

function defaultDescription(months) {
  const n = Number(months || 0);
  if (!n) return "";
  return `Gói tập gồm ${n * 30} ngày`;
}

function packageDescription(pkg) {
  return pkg.description || defaultDescription(pkg.durationMonths);
}

function renderPackageManager() {
  const selected = getSelectedPackage();

  document.getElementById("packageManager").innerHTML = `
    <div style="display:grid;grid-template-columns:240px minmax(420px,1fr);gap:22px;max-width:900px;">
      <div style="background:#eef4fb;border-radius:16px;padding:20px;min-height:460px;">
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${renderPackageButtons()}
        </div>

        <button onclick="startCreatePackage()"
          style="margin:18px auto 0;width:44px;height:44px;border-radius:50%;border:none;
                 display:flex;align-items:center;justify-content:center;background:#60a5fa;color:#fff;
                 cursor:pointer;box-shadow:0 4px 12px rgba(96,165,250,0.35);font-size:28px;line-height:1;"
          title="Thêm gói tập">
          +
        </button>
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:4px;
                  padding:28px 26px;box-shadow:0 2px 6px rgba(0,0,0,0.08);min-height:460px;">
        ${
          selected
            ? renderPackageForm(selected)
            : `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:14px;">
                Chưa có gói tập
              </div>`
        }
      </div>
    </div>
  `;
}

function renderPackageButtons() {
  if (packages.length === 0 && !isCreating) {
    return `<div style="text-align:center;color:#94a3b8;font-size:13px;padding:28px 0;">Chưa có gói tập</div>`;
  }

  const buttons = packages
    .map((p) => {
      const active = !isCreating && selectedPackageId === p.id;
      const disabled = p.isActive === false;

      return `
        <button onclick="selectPackage(${p.id})"
          style="height:42px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:700;
                 background:${
                   active ? "#60a5fa" : disabled ? "#e5e7eb" : "#bfdbfe"
                 };
                 color:${disabled ? "#6b7280" : "#0f172a"};
                 text-decoration:${disabled ? "line-through" : "none"};
                 box-shadow:${
                   active ? "0 2px 8px rgba(37,99,235,0.25)" : "none"
                 };">
          ${p.packageName}
        </button>
      `;
    })
    .join("");

  const createButton = isCreating
    ? `
      <button
        style="height:42px;border:none;border-radius:8px;font-size:14px;font-weight:700;
               background:#60a5fa;color:#0f172a;box-shadow:0 2px 8px rgba(37,99,235,0.25);">
        Gói mới
      </button>
    `
    : "";

  return buttons + createButton;
}

function renderPackageForm(pkg) {
  const readonly = !isEditingPackage;

  return `
    <div style="display:flex;flex-direction:column;gap:22px;">
      ${formRow("Mã", "package-code", packageCode(pkg), "text", true)}
      ${formRow(
        "Loại gói",
        "package-name",
        pkg.packageName || "",
        "text",
        readonly,
        "handlePackageNameInput()"
      )}
      ${formRow(
        "Số tháng",
        "package-months",
        pkg.durationMonths ?? "",
        "number",
        readonly,
        "handleMonthsInput()"
      )}
      ${formRow(
        "Giá tiền",
        "package-price",
        pkg.price ?? "",
        "number",
        readonly
      )}
      ${formRow(
        "Mô tả",
        "package-description",
        packageDescription(pkg),
        "text",
        readonly,
        "descriptionTouched = true"
      )}
      ${statusRow(pkg)}

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:30px;">
        ${
          isEditingPackage
            ? `
              <button onclick="cancelPackageEdit()"
                style="height:36px;padding:0 16px;border:none;border-radius:8px;background:#f1f5f9;
                       color:#475569;font-size:13px;font-weight:600;cursor:pointer;">
                Hủy
              </button>

              <button onclick="savePackage()"
                style="height:36px;padding:0 20px;border:none;border-radius:8px;background:#bfdbfe;
                       color:#0f172a;font-size:13px;font-weight:700;cursor:pointer;">
                Xác nhận
              </button>
            `
            : `
              <button onclick="startEditPackage()"
                style="height:36px;padding:0 20px;border:none;border-radius:8px;background:#2563eb;
                       color:#fff;font-size:13px;font-weight:700;cursor:pointer;
                       box-shadow:0 2px 8px rgba(37,99,235,0.25);">
                Sửa
              </button>

              <button onclick="togglePackageActive(${pkg.id}, ${
                pkg.isActive !== false ? "false" : "true"
              })"
                style="height:36px;padding:0 20px;border:none;border-radius:8px;
                       background:${
                         pkg.isActive !== false ? "#fee2e2" : "#d1fae5"
                       };
                       color:${pkg.isActive !== false ? "#991b1b" : "#065f46"};
                       font-size:13px;font-weight:700;cursor:pointer;">
                ${pkg.isActive !== false ? "Ngừng sử dụng" : "Kích hoạt lại"}
              </button>
            `
        }
      </div>
    </div>
  `;
}

function formRow(
  label,
  id,
  value,
  type = "text",
  readonly = false,
  oninput = ""
) {
  return `
    <div style="display:grid;grid-template-columns:86px 1fr;align-items:center;gap:14px;">
      <label for="${id}" style="font-size:14px;color:#111827;">${label}</label>
      <input id="${id}" type="${type}" value="${escapeAttr(value ?? "")}" ${
    readonly ? "readonly" : ""
  }
        ${oninput ? `oninput="${oninput}"` : ""}
        style="height:34px;width:100%;border:none;border-radius:7px;
               background:${readonly ? "#eef4fb" : "#e8f1ff"};
               padding:0 12px;font-size:14px;color:#111827;outline:none;box-sizing:border-box;
               cursor:${readonly ? "default" : "text"};"
        onfocus="${
          readonly
            ? ""
            : "this.style.boxShadow='0 0 0 3px rgba(96,165,250,0.25)'"
        }"
        onblur="this.style.boxShadow='none'" />
    </div>
  `;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function statusRow(pkg) {
  const active = pkg.isActive !== false;

  return `
    <div style="display:grid;grid-template-columns:86px 1fr;align-items:center;gap:14px;">
      <span style="font-size:14px;color:#111827;">Trạng thái</span>
      <span style="font-size:13px;font-weight:700;color:${
        active ? "#059669" : "#dc2626"
      };">
        ${active ? "Đang sử dụng" : "Ngừng sử dụng"}
      </span>
    </div>
  `;
}

function extractMonthsFromName(name) {
  const match = String(name || "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function handlePackageNameInput() {
  const nameInput = document.getElementById("package-name");
  const monthsInput = document.getElementById("package-months");

  const months = extractMonthsFromName(nameInput?.value);
  if (!months || !monthsInput) return;

  monthsInput.value = months;
  updateDescriptionPreview();
}

function handleMonthsInput() {
  updateDescriptionPreview();
}

function updateDescriptionPreview() {
  if (descriptionTouched) return;

  const months = Number(document.getElementById("package-months")?.value || 0);
  const desc = document.getElementById("package-description");
  if (desc) desc.value = defaultDescription(months);
}

function selectPackage(id) {
  selectedPackageId = id;
  isCreating = false;
  isEditingPackage = false;
  descriptionTouched = false;
  renderPackageManager();
}

function startCreatePackage() {
  isCreating = true;
  isEditingPackage = true;
  selectedPackageId = null;
  descriptionTouched = false;
  renderPackageManager();
}

function startEditPackage() {
  isEditingPackage = true;
  descriptionTouched = false;
  renderPackageManager();
}

function cancelPackageEdit() {
  isCreating = false;
  isEditingPackage = false;
  descriptionTouched = false;
  selectedPackageId = selectedPackageId || packages[0]?.id || null;
  renderPackageManager();
}

async function savePackage() {
  const wasCreating = isCreating;
  const packageName = document.getElementById("package-name").value.trim();
  const durationMonths = Number(
    document.getElementById("package-months").value
  );
  const price = Number(document.getElementById("package-price").value);
  const description = document
    .getElementById("package-description")
    .value.trim();

  if (
    !packageName ||
    !durationMonths ||
    price === undefined ||
    Number.isNaN(price)
  ) {
    showToast("Vui lòng nhập đầy đủ loại gói, số tháng và giá tiền.", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const url = isCreating
      ? "/api/packages"
      : `/api/packages/${selectedPackageId}`;
    const method = isCreating ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        packageName,
        durationMonths,
        price,
        description,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Lưu gói tập thất bại", "error");
      return;
    }

    isCreating = false;
    isEditingPackage = false;
    descriptionTouched = false;
    selectedPackageId = result.data?.id || selectedPackageId;

    showToast(
      wasCreating ? "Thêm gói tập thành công!" : "Cập nhật gói tập thành công!"
    );

    await fetchPackages();
  } catch (err) {
    console.error("Save package lỗi:", err);
    showToast("Lỗi kết nối server", "error");
  }
}

function togglePackageActive(id, isActive) {
  openConfirm(
    isActive ? "Kích hoạt lại gói tập này?" : "Ngừng sử dụng gói tập này?",
    isActive
      ? "Gói này sẽ hiển thị lại khi thêm khách hàng hoặc gia hạn."
      : "Khách mới sẽ không chọn được gói này nữa, nhưng lịch sử đăng ký cũ vẫn được giữ.",
    async () => {
      await submitTogglePackageActive(id, isActive);
    },
    isActive ? "Kích hoạt lại" : "Ngừng sử dụng",
    isActive ? "#059669" : "#dc2626"
  );
}

async function submitTogglePackageActive(id, isActive) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/packages/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ isActive }),
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || "Cập nhật trạng thái thất bại", "error");
      return;
    }

    showToast(result.message || "Cập nhật trạng thái thành công!");
    await fetchPackages();
  } catch (err) {
    console.error("Toggle package lỗi:", err);
    showToast("Lỗi kết nối server", "error");
  }
}

function renderConfirmModal() {
  return `
    <div id="confirmModal" style="display:none;position:fixed;inset:0;z-index:300;">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"
           onclick="closeConfirm()"></div>

      <div id="confirmBox"
        style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(0.98);
               width:100%;max-width:390px;background:#fff;border-radius:16px;padding:22px;
               box-shadow:0 20px 60px rgba(0,0,0,0.18);opacity:0;transition:all .18s;">
        <h3 id="confirmTitle" style="font-size:16px;font-weight:800;color:#0f172a;margin:0 0 8px;">
          Xác nhận
        </h3>
        <p id="confirmMessage" style="font-size:13px;color:#64748b;line-height:1.5;margin:0;">
          Bạn có chắc chắn muốn thực hiện thao tác này?
        </p>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:22px;">
          <button onclick="closeConfirm()"
            style="height:38px;padding:0 16px;border:none;border-radius:10px;background:#f1f5f9;
                   color:#475569;font-size:13px;font-weight:700;cursor:pointer;">
            Hủy
          </button>
          <button id="confirmActionBtn" onclick="submitConfirmAction()"
            style="height:38px;padding:0 18px;border:none;border-radius:10px;background:#dc2626;
                   color:#fff;font-size:13px;font-weight:800;cursor:pointer;
                   box-shadow:0 2px 8px rgba(220,38,38,0.25);">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  `;
}

function openConfirm(
  title,
  message,
  callback,
  confirmText = "Xác nhận",
  color = "#2563eb"
) {
  confirmCallback = callback;

  document.getElementById("confirmTitle").innerText = title;
  document.getElementById("confirmMessage").innerText = message;

  const btn = document.getElementById("confirmActionBtn");
  btn.innerText = confirmText;
  btn.style.background = color;
  btn.disabled = false;
  btn.style.opacity = "1";

  const modal = document.getElementById("confirmModal");
  const box = document.getElementById("confirmBox");

  modal.style.display = "block";
  box.style.opacity = "0";
  box.style.transform = "translate(-50%,-50%) scale(0.98)";

  requestAnimationFrame(() => {
    box.style.opacity = "1";
    box.style.transform = "translate(-50%,-50%) scale(1)";
  });
}

function closeConfirm() {
  const modal = document.getElementById("confirmModal");
  const box = document.getElementById("confirmBox");

  box.style.opacity = "0";
  box.style.transform = "translate(-50%,-50%) scale(0.98)";

  setTimeout(() => {
    modal.style.display = "none";
    confirmCallback = null;
  }, 180);
}

async function submitConfirmAction() {
  if (!confirmCallback) return;

  const btn = document.getElementById("confirmActionBtn");
  const callback = confirmCallback;

  btn.disabled = true;
  btn.style.opacity = "0.65";

  try {
    await callback();
    closeConfirm();
  } catch (err) {
    console.error("Confirm action lỗi:", err);

    if (typeof showToast === "function") {
      showToast("Thao tác thất bại", "error");
    } else {
      alert("Thao tác thất bại");
    }

    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

function showToast(message, type = "success") {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const bg =
    {
      success: "#059669",
      error: "#dc2626",
      info: "#2563eb",
    }[type] || "#059669";

  const icon =
    type === "error"
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>`;

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    display:flex;align-items:center;gap:10px;
    background:${bg};color:#fff;font-size:13px;font-weight:600;
    padding:12px 18px;border-radius:14px;
    box-shadow:0 4px 20px rgba(0,0,0,0.15);
    transition:all 0.2s;opacity:0;transform:translateY(8px);
  `;

  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
      ${icon}
    </svg>
    <span>${message}</span>
  `;

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
