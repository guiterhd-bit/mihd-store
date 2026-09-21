// ======================================================
// MiHD Store - script.js
// Phiên bản đơn giản - không sử dụng bộ đếm lượt tải
// ======================================================

"use strict";

// ======================================================
// BIẾN TOÀN CỤC
// ======================================================

let appData = [];

const container =
    document.getElementById("appContainer");

const searchInput =
    document.getElementById("search");

const DEFAULT_THUMBNAIL =
    "https://raw.githubusercontent.com/guiterhd-bit/mihdtv/main/mstore2.png";

// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ======================================================
// TẠO ID ỨNG DỤNG
// ======================================================

function getAppId(app) {

    if (app && app.id) {
        return String(app.id);
    }

    return String(
        (app && app.name) || "app"
    )
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ======================================================
// TẠO CARD ỨNG DỤNG
// ======================================================

function createAppCard(app) {

    const card =
        document.createElement("div");

    card.className = "card";

    // --------------------------------------------------
    // THÔNG TIN ỨNG DỤNG
    // --------------------------------------------------

    const appName =
        app.name || "Ứng dụng";

    const thumbnail =
        app.thumbnail || DEFAULT_THUMBNAIL;

    const appSize =
        app.size || "Không rõ";

    const appFile =
        app.file || "";

    // --------------------------------------------------
    // HTML CARD
    // --------------------------------------------------

    card.innerHTML = `
        <div class="thumbnail-box">

            <img
                class="thumbnail"
                src="${escapeAttribute(thumbnail)}"
                alt="${escapeAttribute(appName)}"
                loading="lazy"
            >

        </div>

        <div class="card-content">

            <h3 class="app-name">
                ${escapeHTML(appName)}
            </h3>

            <div class="app-info">

                <span class="app-size">
                    💾 ${escapeHTML(appSize)}
                </span>

            </div>

            <a
                class="download"
                href="${escapeAttribute(appFile || "#")}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ⬇ Tải về
            </a>

        </div>
    `;

    // --------------------------------------------------
    // XỬ LÝ ẢNH LỖI
    // --------------------------------------------------

    const image =
        card.querySelector(".thumbnail");

    if (image) {

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
    }

    // --------------------------------------------------
    // KIỂM TRA LINK TẢI
    // --------------------------------------------------

    const downloadButton =
        card.querySelector(".download");

    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            function (event) {

                if (!appFile) {

                    event.preventDefault();

                    alert(
                        "Ứng dụng này chưa có liên kết tải xuống."
                    );
                }

            }
        );
    }

    return card;
}

// ======================================================
// HIỂN THỊ DANH SÁCH ỨNG DỤNG
// ======================================================

function renderApps(data) {

    if (!container) {
        console.error(
            'Không tìm thấy #appContainer'
        );

        return;
    }

    container.innerHTML = "";

    let hasResult = false;

    // --------------------------------------------------
    // KIỂM TRA DATA
    // --------------------------------------------------

    if (!Array.isArray(data)) {

        container.innerHTML = `
            <div class="empty error">

                <div class="empty-icon">
                    ⚠️
                </div>

                <div class="empty-title">
                    Dữ liệu ứng dụng không hợp lệ
                </div>

                <div class="empty-text">
                    Không thể đọc danh sách ứng dụng.
                </div>

            </div>
        `;

        return;
    }

    // --------------------------------------------------
    // DUYỆT CATEGORY
    // --------------------------------------------------

    data.forEach(category => {

        if (
            !category ||
            !Array.isArray(category.apps) ||
            category.apps.length === 0
        ) {
            return;
        }

        const section =
            document.createElement("section");

        section.className =
            "category";

        section.innerHTML = `
            <h2 class="category-title">
                ${escapeHTML(
                    category.category ||
                    "Ứng dụng"
                )}
            </h2>

            <div class="grid"></div>
        `;

        const grid =
            section.querySelector(".grid");

        // ------------------------------------------------
        // THÊM ỨNG DỤNG
        // ------------------------------------------------

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

        // ------------------------------------------------
        // THÊM CATEGORY
        // ------------------------------------------------

        if (
            grid &&
            grid.children.length > 0
        ) {

            container.appendChild(
                section
            );
        }

    });

    // --------------------------------------------------
    // KHÔNG CÓ KẾT QUẢ
    // --------------------------------------------------

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

// ======================================================
// TÌM KIẾM
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .toLowerCase()
                    .trim();

            // ------------------------------------------------
            // KHÔNG CÓ TỪ KHÓA
            // ------------------------------------------------

            if (keyword === "") {

                renderApps(
                    appData
                );

                return;
            }

            // ------------------------------------------------
            // LỌC
            // ------------------------------------------------

            const filtered =
                appData.map(category => {

                    const apps =
                        Array.isArray(
                            category.apps
                        )
                            ? category.apps.filter(
                                app => {

                                    const name =
                                        String(
                                            app.name ||
                                            ""
                                        ).toLowerCase();

                                    return name.includes(
                                        keyword
                                    );
                                }
                            )
                            : [];

                    return {

                        category:
                            category.category,

                        apps:
                            apps
                    };
                });

            renderApps(
                filtered
            );
        }
    );
}

// ======================================================
// TẢI APPS.JSON
// ======================================================

async function loadApps() {

    if (!container) {
        return;
    }

    try {

        // ------------------------------------------------
        // LOADING
        // ------------------------------------------------

        container.innerHTML = `
            <div class="loading">

                <div class="loading-spinner"></div>

                <div>
                    Đang tải danh sách ứng dụng...
                </div>

            </div>
        `;

        // ------------------------------------------------
        // FETCH APPS.JSON
        // ------------------------------------------------

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

        // ------------------------------------------------
        // ĐỌC JSON
        // ------------------------------------------------

        const json =
            await response.json();

        // ------------------------------------------------
        // KIỂM TRA CẤU TRÚC
        // ------------------------------------------------

        if (Array.isArray(json)) {

            appData =
                json;

        } else if (
            json &&
            Array.isArray(
                json.categories
            )
        ) {

            appData =
                json.categories;

        } else {

            throw new Error(
                "Cấu trúc apps.json không hợp lệ"
            );
        }

        // ------------------------------------------------
        // HIỂN THỊ
        // ------------------------------------------------

        renderApps(
            appData
        );

    } catch (error) {

        console.error(
            "Lỗi tải apps.json:",
            error
        );

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

// ======================================================
// KHỞI ĐỘNG
// ======================================================

loadApps();
