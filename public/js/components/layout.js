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
<<<<<<< HEAD
            ${menus.map(m => menuItem(m.link, m.label, path, true)).join("")}
=======
            ${menus.map((m) => menuItem(m.link, m.label, path, true)).join("")}
>>>>>>> feature/customer-management
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
<<<<<<< HEAD
        <div class="h-full bg-[#F4F7FC] rounded-3xl p-6 overflow-auto 
=======
        <div class="h-full bg-[#F4F7FC] rounded-3xl p-6 overflow-visible
>>>>>>> feature/customer-management
          ml-2 mr-2 mt-8 md:ml-[-30px] md:mt-0">
          ${content}
        </div>

      </div>
<<<<<<< HEAD

    </div>
=======
      <!--Thêm khách hàng-->
      <div id="modalAddCustomer"
             class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             hidden flex items-center justify-center
             bg-black/30 z-[99999] w-full h-full">

          <div class="bg-[#9DB8DA] rounded-2xl w-[500px] p-6">

            <h2 class="text-center mb-4 font-extrabold font-mono">Thêm khách hàng</h2>

            <input id="name" placeholder="Tên" class="w-full mb-2 p-3 rounded"/>
            <input id="phone" placeholder="SĐT" class="w-full mb-2 p-3 rounded"/>

            <select id="type" class="w-full mb-2 p-2 rounded">
              <option value="member">Hội viên</option>  
              <option value="guest">Khách vãng lai</option>
            </select>

        <!-- GÓI -->
        <div id="packageField" class="mb-2">
          <select id="package" class="w-full p-2 rounded">
            <option>1 tháng</option>
            <option>3 tháng</option>
          </select>
        </div>

        <!-- BUTTON -->
        <div class="flex justify-end gap-2">
          <button id="btnSave" class="bg-blue-400 px-3 py-2 rounded">
            Xác nhận
          </button>

          <button id="btnSaveCheckin" class="bg-blue-500 px-3 py-2 rounded">
            Xác nhận & Checkin
          </button>

          <button id="btnOnlyCheckin" class="hidden bg-green-400 px-3 py-2 rounded">
            Checkin
          </button>
        </div>

        </div>
        </div>

        <!-- CHECKIN MODAL -->
        <div id="modalCheckin" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             hidden flex items-center justify-center
             bg-black/30 z-[99999] w-full h-full">

          <div class="bg-[#9DB8DA] rounded-2xl w-[500px] p-6">

            <h2 class="text-center mb-4 font-bold">Checkin</h2>

            <input id="checkinName" placeholder="Tên"
              class="w-full mb-2 p-3 rounded"/>

            <div class="flex gap-2">
              <input id="checkinPhone" placeholder="SĐT"
                class="flex-1 mb-2 p-3 rounded"/>

              <input id="checkinGender" placeholder="Giới tính"
                class="w-[120px] mb-2 p-3 rounded"/>
            </div>

            <!-- TIME -->
            <input id="checkinTime"
              class="w-full mb-4 p-3 rounded bg-gray-100"
              readonly/>

            <!-- BUTTON -->
            <div class="flex justify-end">
              <button id="btnConfirmCheckin"
                class="bg-blue-500 px-4 py-2 rounded text-white">
                Checkin
              </button>
            </div>

          </div>
        </div>

    </div>
      
      
>>>>>>> feature/customer-management
  `;
}
function initMenuEvent() {
  document.addEventListener("click", (e) => {
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
<<<<<<< HEAD
    
=======

>>>>>>> feature/customer-management
    if (menu.contains(e.target) && e.target.tagName === "A") {
      menu.classList.add("hidden");
      return;
    }

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> feature/customer-management
