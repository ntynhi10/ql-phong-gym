function renderCustomer() {
  return `
    <div>
  
        <!-- TITLE -->
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          Quản lý khách hàng
        </h2>
  
        <!-- ACTION BAR -->
        <div class="flex justify-between items-center mb-4">
  
          <!-- LEFT BUTTONS -->
          <div class="flex gap-3">
  
            <button id="btnAddCustomer" class="group flex items-center justify-center gap-2 
               bg-checkinBg hover:bg-checkinHover
               px-4 py-2 rounded-xl text-sm font-medium transition leading-none">

                <!-- ICON -->
                <svg viewBox="-20 0 542 512"
                    class="w-6 h-6 text-[#143F76] group-hover:text-white shrink-0 block">

                    <!-- USER -->
                    <path fill="none" stroke="currentColor" stroke-width="24" d="M 205.5,-0.5 C 216.167,-0.5 226.833,-0.5 237.5,-0.5C 291.354,8.52334 328.854,38.19 350,88.5C 368.288,147.019 355.455,197.352 311.5,239.5C 319.626,243.397 327.626,247.563 335.5,252C 342.273,258.122 341.939,263.789 334.5,269C 332.5,269.667 330.5,269.667 328.5,269C 317.456,262.562 305.956,257.062 294,252.5C 245.665,280.499 197.332,280.499 149,252.5C 72.5385,284.717 28.8718,342.05 18,424.5C 17.6667,450.833 17.3333,477.167 17,503.5C 16.5494,506.778 15.0494,509.444 12.5,511.5C 9.5,511.5 6.5,511.5 3.5,511.5C 2.5,509.833 1.16667,508.5 -0.5,507.5C -0.5,479.5 -0.5,451.5 -0.5,423.5C 10.5366,338.471 54.5366,277.138 131.5,239.5C 91.8998,202.819 77.3998,157.819 88,104.5C 105.303,44.9461 144.47,9.94609 205.5,-0.5 Z"/>

                    <!-- CIRCLE -->
                    <path fill="none" stroke="currentColor" stroke-width="24" d="M 511.5,377.5 C 511.5,387.167 511.5,396.833 511.5,406.5C 503.229,456.826 474.896,490.326 426.5,507C 419.741,508.715 413.075,510.215 406.5,511.5C 396.833,511.5 387.167,511.5 377.5,511.5C 330.022,503.531 297.189,477.198 279,432.5C 263.452,380.849 275.286,336.682 314.5,300C 353.801,269.958 396.468,264.291 442.5,283C 481.526,302.851 504.526,334.351 511.5,377.5 Z"/>

                    <!-- PLUS -->
                    <path fill="none" stroke="currentColor" stroke-width="20" d="M 388.5,323.5 C 395.295,322.303 399.462,324.97 401,331.5C 401.5,348.83 401.667,366.163 401.5,383.5C 419.503,383.333 437.503,383.5 455.5,384C 460.609,387.366 461.776,391.866 459,397.5C 457.442,399.768 455.276,400.934 452.5,401C 435.503,401.5 418.503,401.667 401.5,401.5C 401.667,418.503 401.5,435.503 401,452.5C 398.781,460.19 393.948,462.356 386.5,459C 385.299,458.097 384.465,456.931 384,455.5C 383.5,437.503 383.333,419.503 383.5,401.5C 366.163,401.667 348.83,401.5 331.5,401C 323.81,398.781 321.644,393.948 325,386.5C 325.903,385.299 327.069,384.465 328.5,384C 346.83,383.5 365.164,383.333 383.5,383.5C 383.333,365.164 383.5,346.83 384,328.5C 385.025,326.313 386.525,324.646 388.5,323.5 Z"/>

                </svg>

                <span class="text-black group-hover:text-white whitespace-nowrap">
                    Thêm
                </span>

            </button>
  
            <button id="btnCheckin" class="group flex items-center gap-2 bg-checkinBg hover:bg-checkinHover
               px-4 py-2 rounded-xl text-sm font-medium">

                <!-- ICON -->
                <svg viewBox="0 0 512 512"
                    class="w-6 h-6 text-[#143F76] group-hover:text-white shrink-0">

                    <path fill="currentColor" d="M 246.5,47.5 C 309.168,47.3333 371.834,47.5 434.5,48C 449.667,51.8333 459.167,61.3333 463,76.5C 463.667,195.833 463.667,315.167 463,434.5C 459.167,449.667 449.667,459.167 434.5,463C 371.833,463.667 309.167,463.667 246.5,463C 230.359,458.525 220.859,448.025 218,431.5C 217.333,414.167 217.333,396.833 218,379.5C 221.868,368.862 229.368,365.028 240.5,368C 245.4,369.902 248.567,373.402 250,378.5C 250.333,394.833 
                    250.667,411.167 251,427.5C 251.652,429.723 253.152,430.89 255.5,431C 312.5,431.667 369.5,431.667 426.5,431C 429.102,430.065 430.602,428.232 431,425.5C 431.994,311.111 431.661,196.777 430,82.5C 429.097,81.2986 427.931,80.4652 426.5,80C 369.5,79.3333 312.5,79.3333 255.5,80C 253.152,80.1102 251.652,81.2769 251,83.5C 250.667,99.8333 250.333,116.167 250,132.5C 246.016,142.241 238.85,145.741 228.5,143C 223.243,140.744 219.743,136.91 218,131.5C 
                    217.333,114.167 217.333,96.8333 218,79.5C 221.02,62.984 230.52,52.3173 246.5,47.5 Z"/>

                    <path fill="currentColor" d="M 292.5,175.5 C 298.675,174.643 304.342,175.81 309.5,179C 331.333,200.833 353.167,222.667 375,244.5C 379.667,251.833 379.667,259.167 375,266.5C 353.167,288.333 331.333,310.167 309.5,332C 303.1,336.406 296.433,337.073 289.5,334C 281.311,327.649 279.477,319.816 284,310.5C 296.833,297.667 309.667,284.833 322.5,272C 234.167,271.667 145.833,271.333 57.5,271C 48.5178,266.527 45.3511,259.36 48,249.5C 49.8333,245 
                    53,241.833 57.5,240C 145.833,239.667 234.167,239.333 322.5,239C 308.971,225.805 295.804,212.305 283,198.5C 279.642,188.063 282.809,180.396 292.5,175.5 Z"/>

                </svg>

                <span class="group-hover:text-white">Check-in</span>

            </button>
  
        </div>
  
        <!-- SEARCH -->
        <div class="relative">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng"
              class="w-64 px-4 py-2 rounded-full border outline-none text-sm"
            />
            <span class="absolute right-3 top-2 text-gray-500">🔍</span>
        </div>
  
        </div>
  
        <!-- TABLE -->
        <div class="bg-white rounded-2xl shadow p-4">
  
          <!-- HEADER -->
          <div class="grid grid-cols-6 bg-[#E6EDF7] px-4 py-3 rounded-xl text-sm font-medium text-gray-700">
            <div>Tên</div>
            <div>SĐT</div>
            <div>Giới tính</div>
            <div>Loại</div>
            <div>Gói</div>
            <div class="text-center">Chi tiết</div>
          </div>
  
          <!-- ROW -->
          ${renderRow(
            "Nguyễn Văn A",
            "0205862400",
            "Nam",
            "Hội viên",
            "3 tháng"
          )}
          ${renderRow("Nguyễn Thị B", "0205862401", "Nữ", "Khách vãng lai", "")}
  
          <!-- EMPTY LINES (fake giống UI bạn) -->
          ${Array(6)
            .fill(
              `
            <div class="border-b h-10"></div>
          `
            )
            .join("")}
  
        </div>
  
    </div>
    

    `;
}

function renderRow(name, phone, gender, type, pack) {
  return `
    <div class="grid grid-cols-6 px-4 py-3 border-b text-sm items-center">
  
        <div>${name}</div>
        <div>${phone}</div>
        <div>${gender}</div>
        <div>${type}</div>
        <div>${pack}</div>
  
        <div class="flex justify-center">
          <button class="w-6 h-6 bg-[#143F76] text-white rounded-full text-xs flex items-center justify-center">
            i
          </button>
        </div>
  
    </div>
    `;
}

function initCustomerEvent() {
  const modal = document.getElementById("modalAddCustomer");

  document.addEventListener("click", (e) => {
    // ===== MỞ MODAL =====
    if (e.target.closest("#btnAddCustomer")) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    // ===== ĐÓNG MODAL =====
    if (e.target.id === "modalAddCustomer") {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  // ===== DOM ELEMENT =====
  const type = document.getElementById("type");
  const packageField = document.getElementById("packageField");

  const btnSave = document.getElementById("btnSave");
  const btnSaveCheckin = document.getElementById("btnSaveCheckin");
  const btnOnlyCheckin = document.getElementById("btnOnlyCheckin");

  // ===== TYPE CHANGE =====
  type?.addEventListener("change", () => {
    if (type.value === "member") {
      packageField.classList.remove("hidden");

      btnSave.classList.remove("hidden");
      btnSaveCheckin.classList.remove("hidden");
      btnOnlyCheckin.classList.add("hidden");
    } else {
      packageField.classList.add("hidden");

      btnSave.classList.add("hidden");
      btnSaveCheckin.classList.add("hidden");
      btnOnlyCheckin.classList.remove("hidden");
    }
  });

  // ===== GET DATA =====
  function getData() {
    return {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      type: document.getElementById("type").value,
      package: document.getElementById("package")?.value,
    };
  }

  // ===== API =====
  btnSave?.addEventListener("click", async () => {
    const data = getData();

    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert("Đã lưu!");
  });

  btnSaveCheckin?.addEventListener("click", async () => {
    const data = getData();

    await fetch("/api/customers/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert("Đã lưu + checkin!");
  });

  btnOnlyCheckin?.addEventListener("click", async () => {
    const data = getData();

    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert("Checkin thành công!");
  });
}

function initCheckinEvent() {
  const modal = document.getElementById("modalCheckin");
  const timeInput = document.getElementById("checkinTime");

  document.addEventListener("click", (e) => {
    // 👉 mở modal
    if (e.target.closest("#btnCheckin")) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      // set thời gian hiện tại
      const now = new Date();

      const timeStr = now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const dateStr = now.toLocaleDateString("vi-VN");

      timeInput.value = `${timeStr} - ${dateStr}`;
    }

    // 👉 đóng modal
    if (e.target.id === "modalCheckin") {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });
}
