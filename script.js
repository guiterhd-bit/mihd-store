// ==============================
// MiHD Store
// script.js
// ==============================

let appData = [];

const container = document.getElementById("appContainer");
const searchInput = document.getElementById("search");

// ==============================
// Cấu hình CounterAPI
// ==============================

const COUNTER_NAMESPACE = "mihd-store";


// ==============================
// Escape HTML
// ==============================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==============================
// Escape Attribute
// ==============================

function escapeAttribute(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


// ==============================
// Tải số lượt tải
// ==============================

async function getDownloadCount(appId) {

    try {

        const url =
            `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${encodeURIComponent(appId)}`;

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Counter API error");
        }

        const data = await response.json();

        return Number(data.count || 0);

    } catch (error) {

        console.error(
            `Không thể lấy lượt tải của ${appId}:`,
            error
        );

        return 0;
    }
}


// ==============================
// Tăng lượt tải
// ==============================

async function increaseDownloadCount(appId) {

    try {

        const url =
            `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${encodeURIComponent(appId)}/up`;

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Counter API error");
        }

        const data = await response.json();

        return Number(data.count || 0);

    } catch (error) {

        console.error(
            `Không thể tăng lượt tải của ${appId}:`,
            error
        );

        return null;
    }
}


// ==============================
// Hiển thị lượt tải
// ==============================

async function loadDownloadCount(appId, element) {

    if (!element) {
        return;
    }

    element.textContent = "⬇ 0 lượt tải";

    const count = await getDownloadCount(appId);

    element.textContent =
        `⬇ ${count.toLocaleString("vi-VN")} lượt tải`;
}


// ==============================
// Xử lý khi bấm tải
// ==============================

async function handleDownload(app, downloadButton, countElement) {

    if (!app || !app.file) {
        return;
    }

    // Mở APK trước
    window.open(app.file, "_blank", "noopener,noreferrer");

    // Tăng lượt tải
    const newCount = await increaseDownloadCount(app.id);

    if (newCount !== null && countElement) {

        countElement.textContent =
            `⬇ ${newCount.toLocaleString("vi-VN")} lượt tải`;
    }
}


// ==============================
// Tạo Card ứng dụng
// ==============================

function createAppCard(app) {

    const card = document.createElement("div");

    card.className = "card";

    const appId =
        app.id ||
        app.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");

    const thumbnail =
        app.thumbnail ||
        "https://raw.githubusercontent.com/guiterhd-bit/mihdtv/main/mstore2.png";

    card.innerHTML = `
        <div class="thumbnail-box">

            <img
                class="thumbnail"
                src="${escapeAttribute(thumbnail)}"
                alt="${escapeAttribute(app.name)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/guiterhd-bit/mihdtv/main/mstore2.png';"
            >

        </div>

        <div class="card-content">

            <h3 class="app-name">
                ${escapeHTML(app.name)}
            </h3>

            <div class="app-info">

                <span
                    class="download-count"
                    data-app-id="${escapeAttribute(appId)}">
                    ⬇ 0 lượt tải
                </span>

                <span class="app-size">
                    💾 ${escapeHTML(app.size || "Không rõ")}
                </span>

            </div>

            <a
                class="download"
                href="${escapeAttribute(app.file || "#")}"
                target="_blank"
                rel="noopener noreferrer">

                ⬇ Tải về

            </a>

        </div>
    `;

    const countElement =
        card.querySelector(".download-count");

    const downloadButton =
        card.querySelector(".download");

    // Tải lượt tải hiện tại
    loadDownloadCount(
        appId,
        countElement
    );

    // Xử lý click
    downloadButton.addEventListener(
        "click",
        async function (event) {

            if (!app.file) {

                event.preventDefault();

                alert(
                    "Ứng dụng này chưa có liên kết tải xuống."
                );

                return;
            }

            // Không ngăn trình duyệt mở link
            const newCount =
                await increaseDownloadCount(appId);

            if (
                newCount !== null &&
                countElement
            ) {

                countElement.textContent =
                    `⬇ ${newCount.toLocaleString("vi-VN")} lượt tải`;
            }
        }
    );

    return card;
}


// ==============================
// Hiển thị danh sách ứng dụng
// ==============================

function renderApps(data) {

    container.innerHTML = "";

    let hasResult = false;

    data.forEach(category => {

        if (
            !category ||
            !Array.isArray(category.apps) ||
            category.apps.length === 0
        ) {
            return;
        }

        hasResult = true;

        const section =
            document.createElement("section");

        section.className = "category";

        section.innerHTML = `
            <h2 class="category-title">
                ${escapeHTML(category.category)}
            </h2>

            <div class="grid"></div>
        `;

        const grid =
            section.querySelector(".grid");

        category.apps.forEach(app => {

            if (!app || !app.name) {
                return;
            }

            const card =
                createAppCard(app);

            grid.appendChild(card);
        });

        container.appendChild(section);
    });


    // Không có kết quả
    if (!hasResult) {

        container.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    🔍
                </div>

                <div class="empty-title">
                    Không tìm thấy ứng dụng
                </div>

                <div class="empty-text">
                    Hãy thử tìm kiếm với từ khóa khác.
                </div>

            </div>
        `;
    }
}


// ==============================
// Tìm kiếm
// ==============================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .toLowerCase()
                    .trim();

            // Không nhập từ khóa
            if (keyword === "") {

                renderApps(appData);

                return;
            }

            const filtered =
                appData.map(category => {

                    return {

                        category:
                            category.category,

                        apps:
                            category.apps.filter(app => {

                                const name =
                                    String(
                                        app.name || ""
                                    ).toLowerCase();

                                return name.includes(keyword);
                            })
                    };
                });

            renderApps(filtered);
        }
    );
}


// ==============================
// Tải apps.json
// ==============================

async function loadApps() {

    try {

        container.innerHTML = `
            <div class="loading">

                <div class="loading-spinner"></div>

                <div>
                    Đang tải danh sách ứng dụng...
                </div>

            </div>
        `;

        const response =
            await fetch(
                "apps.json",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Không thể đọc apps.json"
            );
        }

        const json =
            await response.json();


        // Hỗ trợ cấu trúc:
        // { categories: [...] }
        // hoặc trực tiếp [...]

        if (Array.isArray(json)) {

            appData = json;

        } else if (
            json &&
            Array.isArray(json.categories)
        ) {

            appData = json.categories;

        } else {

            throw new Error(
                "Cấu trúc apps.json không hợp lệ"
            );
        }

        renderApps(appData);

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty error">

                <div class="empty-icon">
                    ⚠️
                </div>

                <div class="empty-title">
                    Không thể tải danh sách ứng dụng
                </div>

                <div class="empty-text">
                    Vui lòng kiểm tra lại file apps.json.
                </div>

            </div>
        `;
    }
}


// ==============================
// Khởi động
// ==============================

loadApps();
