document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  fetchPackages();
});

async function fetchPackages() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:3000/api/packages", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    console.log(data);

  } catch (err) {
    console.error("Lỗi gọi API", err);
  }
}
