const menus = [
  { link: "dashboard", label: "Dashboard" },
  { link: "customer", label: "Quản lý khách hàng" },
  { link: "package", label: "Quản lý gói tập" },
  { link: "crm", label: "CRM" },
];
function renderSidebar() {
  const path = window.location.pathname;

  return `
    <div class="hidden md:flex w-[260px] h-screen bg-[#143F76] text-white flex-col">

      <!-- LOGO -->
      <div class="px-6 py-5">
        <img src="/img/logo.png" 
            alt="logo"
            class="w-56">
      </div>

      <!-- AVATAR -->
      <div class="flex flex-col items-center mt-4">
        <div class="w-24 h-24 bg-white rounded-full"></div>
        <p class="mt-4 text-sm font-medium">Tên nhân viên/Admin</p>
      </div>

      <!-- MENU -->
      <div class="mt-8 flex flex-col gap-2 px-3">
        ${menus.map(m => menuItem(m.link, m.label, path)).join("")}

      </div>

      <!-- LOGOUT -->
      <div class="mt-auto pb-6 flex justify-center">
        <button
          id="logoutBtn"
          class="w-[70%] max-w-[150px] bg-primaryBtn hover:bg-primaryHover text-white 
                       px-3 py-3 rounded-xl text-base md:text-lg font-semibold items-center
                       shadow-[0px_4px_10px_rgba(0,0,0,0.25)] transition duration-300">
          Đăng xuất
        </button>
      </div>

    </div>
  `;
}

// helper tạo menu item
function menuItem(link, label, path, isMobile = false) {
  const currentPage = path.split("/").pop();
  const isActive = currentPage === link;

  return `
    <a href="/${link}"
      class="
        block px-4 py-3 rounded-l-full text-sm font-medium transition
       ${
        isMobile
            ? "hover:bg-gray-100 rounded-md"
            :isActive 
            ? "bg-[#F4F7FC] text-[#143F76] rounded-l-full ml-3" 
            : "hover:bg-primaryBtn rounded-xl"
          }
      ">
      ${label}
    </a>
  `;
}

// logout tạm (frontend)
function handleLogout() {
  window.location.href = "/login";
}