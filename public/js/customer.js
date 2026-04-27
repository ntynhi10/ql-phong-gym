// ================= STATE =================
let currentPage = 1;
const pageSize = 5;

let customerData = [];
let currentData = [];
let isSearching = false;

// ================= HEADER =================
const columns = [
  { label: "Tên", key: "name", width: "w-[200px]" },
  { label: "SDT", key: "phone", width: "w-[150px] text-center" },
  { label: "Giới tính", key: "gender", width: "w-[120px] text-center" },
  { label: "Loại", key: "type", width: "w-[150px] text-center" },
  { label: "Gói", key: "package", width: "w-[120px] text-center" },
  { label: "Chi tiết", key: null, width: "w-[100px] text-center" },
  { label: "Check-in", key: null, width: "w-[100px] text-center" },
];

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

// ================= FAKE DATA =================
async function fetchCustomers() {
  // 👉 sau này đổi thành API
  customerData = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0205862400",
      gender: "Nam",
      type: "Hội viên",
      package: "3 tháng",
    },
    {
      id: 2,
      name: "Nguyễn Thị B",
      phone: "0205862401",
      gender: "Nữ",
      type: "Khách vãng lai",
      package: "",
    },
  ];

  renderTable();
}

// ================= PAGINATION =================
function paginate(data) {
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return `
    <div class="flex justify-center gap-2 mt-4">
      ${Array.from(
        { length: totalPages },
        (_, i) => `
        <button onclick="changePage(${i + 1})"
          class="px-3 py-1 rounded ${
            currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
          }">
          ${i + 1}
        </button>
      `
      ).join("")}
    </div>
  `;
}

function changePage(page) {
  const data = isSearching ? currentData : customerData;
  const totalPages = Math.ceil(data.length / pageSize);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderTable();
}

// ================= TABLE =================
function renderTableWithPaging(columns, data) {
  const pagedData = paginate(data);

  return `
    <div class="bg-white shadow p-4 rounded-xl">

      <!-- HEADER -->
      <div class="bg-[#E5ECF6] px-4 py-3 flex gap-4 text-sm font-semibold rounded-xl">
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
      ${pagedData
        .map(
          (item, index) => `
        <div class="flex items-center gap-4 border-b h-12 px-4 text-sm">

          ${columns
            .map(
              (col) => `
            <div class="${col.width} ${
                col.key === null ? "flex justify-center" : ""
              }">

              ${
                col.label === "Chi tiết"
                  ? `<button onclick="goDetail(${item.id})"
                       class="text-blue-600 underline">Xem</button>`
                  : col.label === "Check-in"
                  ? `<button onclick="openCheckin(${index})"
                       class="text-green-500 text-lg">✔</button>`
                  : item[col.key] || "-"
              }

            </div>
          `
            )
            .join("")}

        </div>
      `
        )
        .join("")}

      ${renderPagination(data.length)}
    </div>
  `;
}

function renderTable() {
  const data = isSearching ? currentData : customerData;

  document.getElementById("tableContainer").innerHTML = renderTableWithPaging(
    columns,
    data
  );
}

// ================= SEARCH =================
function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

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

// ================= VIEW =================
function renderCustomer() {
  return `
    <div class="p-2">

      <!-- TOP -->
      <div class="flex justify-between items-center mb-3">

        <button onclick="openAdd()"
          class="bg-[#9DB8DA] px-4 py-2 rounded-xl text-white">
          Thêm
        </button>

        <div class="flex border rounded-full overflow-hidden">
          <input id="searchInput"
            class="px-4 py-2 outline-none"
            placeholder="Tìm kiếm khách hàng"
            onkeydown="handleEnter(event)" />

          <button onclick="handleSearch()" class="px-3">🔍</button>
        </div>

      </div>

      <div id="tableContainer"></div>

    </div>

  `;
}

// ================= DETAIL PAGE =================
function goDetail(id) {
  window.location.href = `/customer-detail?id=${id}`;
}

// ================= CHECKIN POPUP =================
function openCheckin(index) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popupContent");

  const data = isSearching ? currentData : customerData;
  const item = paginate(data)[index];

  const now = new Date().toLocaleString();

  popup.classList.remove("hidden");

  content.innerHTML = `
    <h3 class="font-semibold mb-3">Check-in</h3>

    <p><b>Tên:</b> ${item.name}</p>
    <p><b>SDT:</b> ${item.phone}</p>
    <p><b>Giới tính:</b> ${item.gender}</p>
    <p><b>Thời gian:</b> ${now}</p>

    <button onclick="closePopup()"
      class="mt-4 px-3 py-1 bg-blue-600 text-white rounded">
      OK
    </button>
  `;
}

// ================= ADD POPUP =================
function openAdd() {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popupContent");

  popup.classList.remove("hidden");

  content.innerHTML = `
    <h3 class="font-semibold mb-3">Thêm khách hàng</h3>

    <input id="name" placeholder="Tên" class="w-full border p-2 mb-2 rounded"/>
    <input id="phone" placeholder="SDT" class="w-full border p-2 mb-2 rounded"/>

    <select id="gender" class="w-full border p-2 mb-2 rounded">
      <option>Nam</option>
      <option>Nữ</option>
    </select>

    <select id="type" class="w-full border p-2 mb-2 rounded">
      <option>Hội viên</option>
      <option>Khách vãng lai</option>
    </select>

    <input id="package" placeholder="Gói" class="w-full border p-2 mb-4 rounded"/>

    <div class="flex justify-end gap-2">
      <button onclick="closePopup()" class="px-3 py-1 bg-gray-300 rounded">
        Hủy
      </button>

      <button onclick="saveCustomer()" 
        class="px-3 py-1 bg-blue-600 text-white rounded">
        Lưu
      </button>
    </div>
  `;
}

function saveCustomer() {
  const newCustomer = {
    id: Date.now(),
    name: name.value,
    phone: phone.value,
    gender: gender.value,
    type: type.value,
    package: package.value,
  };
  customerData.push(newCustomer);
  closePopup();
  renderTable();
}
function renderPopup() {
  return `
    <div id="popup" class="fixed inset-0 z-50 hidden">

      <!-- overlay -->
      <div class="absolute inset-0 bg-black/40"
        onclick="closePopup()"></div>

      <!-- center -->
      <div class="flex items-center justify-center h-full">

        <div class="bg-white rounded-2xl w-[450px] p-6 relative shadow-xl">

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
// ================= CLOSE =================
function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}
