const menus = [
  { link: "dashboard", label: "Dashboard", icon: "fa-border-all" },
  { link: "customer", label: "Quản lý khách hàng", icon: "fa-user-group" },
  { link: "package", label: "Quản lý gói tập", icon: "fa-box-open" },
  { link: "crm", label: "CRM", icon: "fa-user" },
];
function renderSidebar() {
  const path = window.location.pathname;
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // chọn ảnh theo role
  let avatar = "/img/default.png";
  if (user?.role === "admin") {
    avatar = "/img/admin.png";
  } else if (user?.role === "staff") {
    avatar = "/img/staff.png";
  }
  return `
    <div class="hidden md:flex w-[260px] h-screen bg-[#143F76] text-white flex-col">

      <!-- LOGO -->
      <div class="px-6 py-5">

        <img src="/img/logo.png" 
            alt="logo"
            class="w-42">
      </div>

      <!-- AVATAR -->
      <div class="flex flex-col items-center mt-4">

        <img 
          src="${avatar}" 
          alt="avatar"
          class="w-32 h-32 rounded-full object-cover shadow"
        />
        <p class="mt-4 text-sm font-semibold tracking-wide">
          ${user ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Unknown"}
        </p>
      </div>

      <!-- MENU -->
      <div class="mt-8 flex flex-col gap-2 px-3">

        ${menus.map(m => menuItem(m.link, m.label, path, false, m.icon)).join("")}


      </div>

      <!-- LOGOUT -->
      <div class="mt-auto pb-6 flex justify-center">
        <button
          id="logoutBtn"
          class="w-[70%] max-w-[150px] bg-primaryBtn hover:bg-primaryHover text-white 
                       px-2 py-3 rounded-xl text-base md:text-lg font-semibold items-center
                       shadow-[0px_4px_10px_rgba(0,0,0,0.25)] transition duration-300">
          Đăng xuất
        </button>
      </div>

    </div>
  `;
}

// helper tạo menu item
function menuItem(link, label, path, isMobile = false, icon = "") {
  const currentPage = path.split("/").pop();
  const isActive = currentPage === link;

  return `
    <a href="/${link}"
      class="
        block px-4 py-3 rounded-l-full text-sm font-medium tracking-wide transition
        ${
          isMobile
            ? "hover:bg-gray-100 rounded-md"
            : isActive
            ? "bg-[#F4F7FC] text-[#143F76] rounded-l-full ml-3 font-semibold"
            : "hover:bg-primaryBtn rounded-xl"
        }
      ">
      
      <div class="flex items-center gap-3">
        <i class="fa-solid ${icon} ${isActive ? "text-[#143F76]" : "text-white"} text-[16px]"></i>
        <span>${label}</span>
      </div>

    </a>
  `;
}
// logout tạm (frontend)
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}