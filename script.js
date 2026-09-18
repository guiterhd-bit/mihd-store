```javascript
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
// Thumbnail mặc định
// ==============================

const DEFAULT_THUMBNAIL =
    "https://raw.githubusercontent.com/guiterhd-bit/mihdtv/main/mstore2.png";


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
// Tạo App ID
// ==============================

function getAppId(app) {

    if (app.id) {
        return String(app.id);
    }

    return String(app.name || "app")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


// ==============================
// Lấy số lượt tải
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
            throw new Error(
                `CounterAPI HTTP ${response.status}`
            );
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
            throw new Error(
                `CounterAPI HTTP ${response.status}`
            );
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

    element.textContent =
        "⬇ Đang tải...";

    const count =
        await getDownloadCount(appId);

    element.textContent =
        `⬇ ${count.toLocaleString("vi-VN")} lượt tải`;
}


// ==============================
// Tạo Card ứng dụng
// ==============================

function createAppCard(app) {

    const card =
        document.createElement("div");

    card.className = "card";


    // ==========================
    // ID ứng dụng
    // ==========================

    const appId =
        getAppId(app);


    // ==========================
    // Thumbnail
    // ==========================

    const thumbnail =
        app.thumbnail ||
        DEFAULT_THUMBNAIL;


    // ==========================
    // HTML Card
    // ==========================

    card.innerHTML = `
        <div class="thumbnail-box">

            <img
                class="thumbnail"
                src="${escapeAttribute(thumbnail)}"
                alt="${escapeAttribute(app.name)}"
                loading="lazy"
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

                    ⬇ Đang tải...

                </span>


                <span class="app-size">

                    💾 ${escapeHTML(
                        app.size || "Không rõ"
                    )}

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


    // ==============================
    // Lấy phần tử
    // ==============================

    const image =
        card.querySelector(".thumbnail");

    const countElement =
        card.querySelector(".download-count");

    const downloadButton =
        card.querySelector(".download");


    // ==============================
    // Xử lý ảnh lỗi
    // ==============================

    image.addEventListener(
        "error",
        function () {

            if (
                image.src !==
                DEFAULT_THUMBNAIL
            ) {

                image.src =
                    DEFAULT_THUMBNAIL;
            }

        }
    );


    // ==============================
    // Tải số lượt tải hiện tại
    // ==============================

    loadDownloadCount(
        appId,
        countElement
    );


    // ==============================
    // Nút Tải về
    // ==============================

    downloadButton.addEventListener(
        "click",
        async function (event) {

            // Kiểm tra link APK

            if (!app.file) {

                event.preventDefault();

                alert(
                    "Ứng dụng này chưa có liên kết tải xuống."
                );

                return;
            }


            // Ngăn trình duyệt mở link ngay

            event.preventDefault();


            // Lưu nội dung nút

            const originalText =
                downloadButton.innerHTML;


            // Hiển thị trạng thái

            downloadButton.innerHTML =
                "⏳ Đang xử lý...";


            downloadButton.style.pointerEvents =
                "none";


            // ==========================
            // Tăng lượt tải
            // ==========================

            const newCount =
                await increaseDownloadCount(
                    appId
                );


            // ==========================
            // Cập nhật số lượt tải
            // ==========================

            if (
                newCount !== null &&
                countElement
            ) {

                countElement.textContent =
                    `⬇ ${newCount.toLocaleString("vi-VN")} lượt tải`;
            }


            // ==========================
            // Khôi phục nút
            // ==========================

            downloadButton.innerHTML =
                originalText;

            downloadButton.style.pointerEvents =
                "";


            // ==========================
            // Mở link APK
            // ==========================

            window.open(
                app.file,
                "_blank",
                "noopener,noreferrer"
            );

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


    // ==============================
    // Duyệt danh mục
    // ==============================

    data.forEach(category => {

        if (
            !category ||
            !Array.isArray(category.apps) ||
            category.apps.length === 0
        ) {
            return;
        }


        // ==========================
        // Tạo Category
        // ==========================

        const section =
            document.createElement("section");

        section.className =
            "category";


        section.innerHTML = `
            <h2 class="category-title">
                ${escapeHTML(category.category)}
            </h2>

            <div class="grid"></div>
        `;


        const grid =
            section.querySelector(".grid");


        // ==========================
        // Thêm ứng dụng
        // ==========================

        category.apps.forEach(app => {

            if (
                !app ||
                !app.name
            ) {
                return;
            }


            hasResult = true;


            const card =
                createAppCard(app);


            grid.appendChild(card);

        });


        // Chỉ thêm category
        // nếu có ứng dụng

        if (grid.children.length > 0) {

            container.appendChild(
                section
            );
        }

    });


    // ==============================
    // Không tìm thấy ứng dụng
    // ==============================

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


            // ==========================
            // Không nhập từ khóa
            // ==========================

            if (keyword === "") {

                renderApps(
                    appData
                );

                return;
            }


            // ==========================
            // Lọc ứng dụng
            // ==========================

            const filtered =
                appData.map(category => {

                    return {

                        category:
                            category.category,

                        apps:
                            Array.isArray(
                                category.apps
                            )
                                ? category.apps.filter(
                                    app => {

                                        const name =
                                            String(
                                                app.name || ""
                                            ).toLowerCase();

                                        return name.includes(
                                            keyword
                                        );
                                    }
                                )
                                : []
                    };

                });


            renderApps(
                filtered
            );

        }
    );
}


// ==============================
// Tải apps.json
// ==============================

async function loadApps() {

    try {

        // ==========================
        // Hiển thị loading
        // ==========================

        container.innerHTML = `
            <div class="loading">

                <div class="loading-spinner"></div>

                <div>
                    Đang tải danh sách ứng dụng...
                </div>

            </div>
        `;


        // ==========================
        // Đọc apps.json
        // ==========================

        const response =
            await fetch(
                "apps.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Không thể đọc apps.json (${response.status})`
            );
        }


        // ==========================
        // Chuyển sang JSON
        // ==========================

        const json =
            await response.json();


        // ==========================
        // Kiểm tra cấu trúc
        // ==========================

        if (Array.isArray(json)) {

            appData =
                json;

        }

        else if (
            json &&
            Array.isArray(
                json.categories
            )
        ) {

            appData =
                json.categories;

        }

        else {

            throw new Error(
                "Cấu trúc apps.json không hợp lệ"
            );
        }


        // ==========================
        // Hiển thị ứng dụng
        // ==========================

        renderApps(
            appData
        );


    } catch (error) {

        console.error(
            "Lỗi tải apps.json:",
            error
        );


        // ==========================
        // Hiển thị lỗi
        // ==========================

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
