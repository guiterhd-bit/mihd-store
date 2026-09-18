// ==============================
// MiHD Store
// script.js
// ==============================

let appData = [];

const container = document.getElementById("appContainer");
const searchInput = document.getElementById("search");

// ==============================
// COUNTER ONLINE
// ==============================
//
// Counter được tạo riêng theo tên ứng dụng:
//
// mihd-store/youtube
// mihd-store/mihd-tv
//
// CounterAPI sẽ lưu số lượt tải online.
//
// ==============================

const COUNTER_NAMESPACE = "mihd-store";


// ==============================
// Tạo ID counter
// ==============================

function getCounterKey(app) {

    return app.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


// ==============================
// Lấy lượt tải
// ==============================

async function getDownloadCount(app) {

    const key = getCounterKey(app);

    try {

        const response = await fetch(
            `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${key}`
        );

        if (!response.ok) {
            throw new Error("Không thể lấy counter");
        }

        const data = await response.json();

        return Number(data.count || 0);

    } catch (error) {

        console.error(
            `Không thể lấy lượt tải của ${app.name}:`,
            error
        );

        return 0;

    }

}


// ==============================
// Tăng lượt tải
// ==============================

async function increaseDownloadCount(app) {

    const key = getCounterKey(app);

    try {

        const response = await fetch(
            `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${key}/up`
        );

        if (!response.ok) {
            throw new Error("Không thể tăng counter");
        }

        const data = await response.json();

        return Number(data.count || 0);

    } catch (error) {

        console.error(
            `Không thể tăng lượt tải của ${app.name}:`,
            error
        );

        return null;

    }

}


// ==============================
// Format số
// ==============================

function formatNumber(number) {

    return Number(number || 0).toLocaleString("vi-VN");

}


// ==============================
// Thumbnail mặc định
// ==============================

const DEFAULT_THUMBNAIL =
    "https://via.placeholder.com/512x512?text=MiHD";


// ==============================
// Tải apps.json
// ==============================

async function loadApps() {

    try {

        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <span>Đang tải ứng dụng...</span>
            </div>
        `;

        const response = await fetch(
            `apps.json?v=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error("Không thể đọc apps.json");
        }

        const data = await response.json();

        // Hỗ trợ cấu trúc mới
        if (Array.isArray(data.categories)) {

            appData = data.categories;

        }
        // Hỗ trợ luôn cấu trúc apps.json cũ
        else if (Array.isArray(data)) {

            appData = data;

        }
        else {

            throw new Error(
                "Cấu trúc apps.json không hợp lệ"
            );

        }

        renderApps(appData);

    } catch (error) {

        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">❌</div>

                <h3>
                    Không thể tải danh sách ứng dụng
                </h3>

                <p>
                    Vui lòng thử tải lại trang.
                </p>
            </div>
        `;

        console.error(error);

    }

}


// ==============================
// Hiển thị danh sách
// ==============================

async function renderApps(data) {

    container.innerHTML = "";

    let hasResult = false;

    for (const category of data) {

        if (
            !category.apps ||
            category.apps.length === 0
        ) {
            continue;
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

        container.appendChild(section);

        // ==============================
        // Tạo card
        // ==============================

        category.apps.forEach(app => {

            const card =
                document.createElement("article");

            card.className = "card";

            const thumbnail =
                app.thumbnail || DEFAULT_THUMBNAIL;

            card.innerHTML = `

                <div class="thumbnail">

                    <img
                        src="${escapeAttribute(thumbnail)}"
                        alt="${escapeAttribute(app.name)}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='${DEFAULT_THUMBNAIL}';"
                    >

                </div>

                <div class="card-content">

                    <h3 class="app-name">
                        ${escapeHTML(app.name)}
                    </h3>

                    ${
                        app.description
                        ? `
                            <p class="description">
                                ${escapeHTML(app.description)}
                            </p>
                        `
                        : ""
                    }

                    <div class="info">

                        <span class="download-info">

                            ⬇

                            <span class="download-count">
                                ...
                            </span>

                            lượt tải

                        </span>

                        ${
                            app.size
                            ? `
                                <span class="size-info">
                                    💾 ${escapeHTML(app.size)}
                                </span>
                            `
                            : ""
                        }

                    </div>

                    <a
                        class="download"
                        href="${escapeAttribute(app.file)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-app-name="${escapeAttribute(app.name)}"
                    >

                        <span class="download-icon">
                            ⬇
                        </span>

                        <span>
                            Tải về
                        </span>

                    </a>

                </div>

            `;

            grid.appendChild(card);

            // ==============================
            // Lấy counter
            // ==============================

            const countElement =
                card.querySelector(".download-count");

            getDownloadCount(app)
                .then(count => {

                    countElement.textContent =
                        formatNumber(count);

                });


            // ==============================
            // Nút tải
            // ==============================

            const downloadButton =
                card.querySelector(".download");

            downloadButton.addEventListener(
                "click",
                async function () {

                    // Tránh click nhiều lần liên tiếp
                    if (
                        downloadButton.dataset.loading ===
                        "true"
                    ) {
                        return;
                    }

                    downloadButton.dataset.loading =
                        "true";

                    const originalHTML =
                        downloadButton.innerHTML;

                    downloadButton.innerHTML = `
                        <span class="download-spinner"></span>
                        <span>Đang xử lý...</span>
                    `;

                    // Tăng counter
                    const newCount =
                        await increaseDownloadCount(app);

                    if (newCount !== null) {

                        countElement.textContent =
                            formatNumber(newCount);

                    }

                    // Khôi phục nút
                    downloadButton.innerHTML =
                        originalHTML;

                    downloadButton.dataset.loading =
                        "false";

                }
            );

        });

    }

    // ==============================
    // Không có kết quả
    // ==============================

    if (!hasResult) {

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    Không tìm thấy ứng dụng
                </h3>

                <p>
                    Hãy thử tìm kiếm với từ khóa khác.
                </p>

            </div>

        `;

    }

}


// ==============================
// Escape HTML
// ==============================

function escapeHTML(value) {

    return String(value ?? "")
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

    return escapeHTML(value);

}


// ==============================
// Tìm kiếm
// ==============================

searchInput.addEventListener(
    "input",
    function () {

        const keyword =
            this.value.toLowerCase().trim();

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
                                (
                                    app.name || ""
                                ).toLowerCase();

                            const description =
                                (
                                    app.description || ""
                                ).toLowerCase();

                            const categoryName =
                                (
                                    category.category || ""
                                ).toLowerCase();

                            return (
                                name.includes(keyword) ||
                                description.includes(keyword) ||
                                categoryName.includes(keyword)
                            );

                        })

                };

            });

        renderApps(filtered);

    }
);


// ==============================
// Khởi động
// ==============================

loadApps();
