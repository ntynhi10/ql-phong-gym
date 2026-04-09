const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            message.textContent = data.message;
            message.classList.remove("hidden");
            return;
        }

        message.classList.add("hidden");

        window.location.href = "/dashboard";

    } catch (err) {
        message.textContent = "Lỗi server";
        message.classList.remove("hidden");
    }
});