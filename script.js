// ==============================
// MiHD Store
// script.js
// ==============================

let appData = [];

const container = document.getElementById("appContainer");
const searchInput = document.getElementById("search");

// Tải apps.json
async function loadApps() {

    try {

        const response = await fetch("apps.json");

        if (!response.ok) {
            throw new Error("Không thể đọc apps.json");
        }

        appData = await response.json();

        renderApps(appData);

    } catch (error) {

        container.innerHTML = `
            <div class="empty">
                ❌ Không thể tải danh sách ứng dụng.
            </div>
        `;

        console.error(error);

    }

}

// Hiển thị danh sách
function renderApps(data) {

    container.innerHTML = "";

    let hasResult = false;

    data.forEach(category => {

        if (category.apps.length === 0) return;

        hasResult = true;

        const section = document.createElement("section");
        section.className = "category";

        section.innerHTML = `
            <h2 class="category-title">
                ${category.category}
            </h2>

            <div class="grid"></div>
        `;

        const grid = section.querySelector(".grid");

        category.apps.forEach(app => {

            const card = document.createElement("div");

            card.className = "card";

            card.innerHTML = `

                <h3>${app.name}</h3>

                <a
                    class="download"
                    href="${app.file}"
                    target="_blank">

                    ⬇ Tải về

                </a>

            `;

            grid.appendChild(card);

        });

        container.appendChild(section);

    });

    if (!hasResult) {

        container.innerHTML = `
            <div class="empty">

                Không tìm thấy ứng dụng.

            </div>
        `;

    }

}

// Tìm kiếm
searchInput.addEventListener("input", function () {

    const keyword = this.value.toLowerCase().trim();

    if (keyword === "") {

        renderApps(appData);

        return;

    }

    const filtered = appData.map(category => {

        return {

            category: category.category,

            apps: category.apps.filter(app =>

                app.name.toLowerCase().includes(keyword)

            )

        };

    });

    renderApps(filtered);

});

// Khởi động
loadApps();
