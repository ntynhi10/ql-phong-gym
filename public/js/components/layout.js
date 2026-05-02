function renderLayout(content) {
  const path = window.location.pathname;

  return `
    <div class="flex h-screen bg-[#143F76]">
      
      ${renderSidebar()}

      <!-- MAIN -->
      <div class="flex-1 bg-[#143F76] pl-3 pt-3 pb-3 md:p-3"> 
        
        <!-- MENU BUTTON -->
        <button 
          id="menuBtn"
          class="md:hidden fixed top-2 left-3 z-50 p-2 text-white">
          ☰
        </button>

        <!-- MOBILE MENU -->
        <div id="mobileMenu"
          class="hidden md:hidden fixed top-12 left-3 w-[200px] bg-white rounded-xl shadow p-3 z-40">

          <!-- MENU -->
          <div class="flex flex-col gap-2">
            ${menus.map((m) => menuItem(m.link, m.label, path, true)).join("")}
          </div>

          <!-- LOGOUT -->
          <button
            id="logoutBtnMobile"
            class="mt-3 w-full hover:bg-primaryHover text-black 
                   px-3 py-2 rounded-xl text-sm font-semibold transition">
            Đăng xuất
          </button>

        </div>

        <!-- KHUNG TRẮNG -->
        <div class="h-full bg-[#F4F7FC] rounded-3xl p-6 overflow-visible
          ml-2 mr-2 mt-8 md:ml-[-30px] md:mt-0">
          ${content}
        </div>
      </div>
    </div>
      
  `;
}
function initMenuEvent() {
  document.addEventListener("click", (e) => {
    const popup = document.getElementById("popup");

    // ❗ nếu đang click trong popup → bỏ qua
    if (popup && popup.contains(e.target)) return;
    const menu = document.getElementById("mobileMenu");
    const btn = document.getElementById("menuBtn");

    if (!menu || !btn) return;

    if (e.target.closest("#menuBtn")) {
      menu.classList.toggle("hidden");
      return;
    }
    if (e.target.closest("#logoutBtn")) {
      handleLogout();
      return;
    }

    if (e.target.closest("#logoutBtnMobile")) {
      handleLogout();
      return;
    }

    if (menu.contains(e.target) && e.target.tagName === "A") {
      menu.classList.add("hidden");
      return;
    }

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
}
