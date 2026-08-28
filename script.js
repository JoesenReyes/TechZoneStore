// =====================================================
// TECHZONE STORE - SCRIPT.JS
// =====================================================

// AFTER DEPLOYING GOOGLE APPS SCRIPT,
// REPLACE THIS URL WITH YOUR WEB APP URL.

const API_URL = "https://script.google.com/macros/s/AKfycbyDVrmpO-EcJFwcqXj8_zzGJb1Pzp59WyOfAhX31miQIpK9TgNvS7YM8g_iOdayB6wSWQ/exec";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentUser = null;

let products = [];
let categories = [];
let customers = [];
let logs = [];
let notifications = [];

let pendingOTPEmail = "";
let pendingOTPAction = "";


// =====================================================
// START APPLICATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const savedUser = localStorage.getItem("techzoneUser");

    if (savedUser) {

        try {

            currentUser = JSON.parse(savedUser);

            showApplication();

            loadData();

        } catch (error) {

            localStorage.removeItem("techzoneUser");

            showLoginPage();

        }

    } else {

        showLoginPage();

    }


    setupForms();

});


// =====================================================
// API REQUEST
// =====================================================

async function api(action, data = {}) {

    if (!API_URL || API_URL.includes("PASTE_YOUR")) {

        throw new Error(
            "Please put your Google Apps Script Web App URL in script.js."
        );

    }


    const payload = {
        action: action,
        ...data
    };


    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify(payload)

    });


    const result = await response.json();


    if (!result.success) {

        throw new Error(
            result.message || "Something went wrong."
        );

    }


    return result;

}


// =====================================================
// LOGIN / REGISTER TABS
// =====================================================

function showLogin() {

    document.getElementById("loginForm")
        .classList.remove("hidden");

    document.getElementById("registerForm")
        .classList.add("hidden");

    document.getElementById("loginTab")
        .classList.add("active");

    document.getElementById("registerTab")
        .classList.remove("active");

    clearAuthMessage();

}


function showRegister() {

    document.getElementById("loginForm")
        .classList.add("hidden");

    document.getElementById("registerForm")
        .classList.remove("hidden");

    document.getElementById("loginTab")
        .classList.remove("active");

    document.getElementById("registerTab")
        .classList.add("active");

    clearAuthMessage();

}


// =====================================================
// FORM SETUP
// =====================================================

function setupForms() {

    document
        .getElementById("loginForm")
        .addEventListener("submit", login);


    document
        .getElementById("registerForm")
        .addEventListener("submit", register);


    document
        .getElementById("productForm")
        .addEventListener("submit", saveProduct);


    document
        .getElementById("categoryForm")
        .addEventListener("submit", saveCategory);

}


// =====================================================
// REGISTER
// =====================================================

async function register(event) {

    event.preventDefault();


    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const confirmPassword =
        document.getElementById("registerConfirmPassword").value;


    if (password !== confirmPassword) {

        showAuthMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        showAuthMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        return;

    }


    try {

        showAuthMessage(
            "Creating account...",
            "normal"
        );


        const result = await api("register", {

            name: name,
            email: email,
            password: password

        });


        if (result.success) {

            pendingOTPEmail = email;
            pendingOTPAction = "register";


            document.getElementById("otpEmail")
                .textContent = email;

            document.getElementById("otpModal")
                .classList.remove("hidden");


            showAuthMessage(
                "OTP sent to your Gmail.",
                "success"
            );

        }

    } catch (error) {

        showAuthMessage(
            error.message,
            "error"
        );

    }

}


// =====================================================
// LOGIN
// =====================================================

async function login(event) {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    try {

        showAuthMessage(
            "Checking account...",
            "normal"
        );


        const result = await api("login", {

            email: email,
            password: password

        });


        if (result.success) {

            pendingOTPEmail = email;
            pendingOTPAction = "login";


            document.getElementById("otpEmail")
                .textContent = email;

            document.getElementById("otpModal")
                .classList.remove("hidden");


            showAuthMessage(
                "OTP sent to your Gmail.",
                "success"
            );

        }

    } catch (error) {

        showAuthMessage(
            error.message,
            "error"
        );

    }

}


// =====================================================
// VERIFY OTP
// =====================================================

async function verifyOTP() {

    const otp =
        document.getElementById("otpInput").value.trim();


    if (!otp || otp.length !== 6) {

        showOTPMessage(
            "Please enter the 6-digit OTP.",
            "error"
        );

        return;

    }


    try {

        showOTPMessage(
            "Verifying...",
            "normal"
        );


        const result = await api("verifyOTP", {

            email: pendingOTPEmail,
            otp: otp,
            otpAction: pendingOTPAction

        });


        if (result.success) {

            currentUser = result.user;


            localStorage.setItem(
                "techzoneUser",
                JSON.stringify(currentUser)
            );


            closeOTP();


            showApplication();


            await loadData();


            showToast(
                "Welcome to TechZone Store!",
                "success"
            );

        }

    } catch (error) {

        showOTPMessage(
            error.message,
            "error"
        );

    }

}


// =====================================================
// RESEND OTP
// =====================================================

async function resendOTP() {

    if (!pendingOTPEmail) {

        return;

    }


    try {

        showOTPMessage(
            "Sending new OTP...",
            "normal"
        );


        await api("sendOTP", {

            email: pendingOTPEmail,
            otpAction: pendingOTPAction

        });


        showOTPMessage(
            "A new OTP was sent to your Gmail.",
            "success"
        );


    } catch (error) {

        showOTPMessage(
            error.message,
            "error"
        );

    }

}


// =====================================================
// OTP MODAL
// =====================================================

function closeOTP() {

    document
        .getElementById("otpModal")
        .classList.add("hidden");

    document
        .getElementById("otpInput")
        .value = "";

}


function showOTPMessage(message, type) {

    const element =
        document.getElementById("otpMessage");

    element.textContent = message;

    element.style.color =
        type === "error"
            ? "#dc2626"
            : type === "success"
                ? "#15803d"
                : "#555";

}


// =====================================================
// APPLICATION
// =====================================================

function showLoginPage() {

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");

}


function showApplication() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    updateUserInterface();

}


// =====================================================
// USER INTERFACE
// =====================================================

function updateUserInterface() {

    if (!currentUser) return;


    const name =
        currentUser.name || "User";

    const role =
        currentUser.role || "Customer";


    document.getElementById("welcomeName")
        .textContent = name;


    document.getElementById("sidebarName")
        .textContent = name;


    document.getElementById("sidebarRole")
        .textContent = role;


    document.getElementById("topAvatar")
        .textContent =
            name.charAt(0).toUpperCase();


    document.getElementById("sidebarAvatar")
        .textContent =
            name.charAt(0).toUpperCase();


    const admin =
        role.toLowerCase() === "admin";


    document
        .querySelectorAll(".admin-only")
        .forEach(element => {

            if (admin) {

                element.style.display = "";

            } else {

                element.style.display = "none";

            }

        });


    if (!admin) {

        document
            .getElementById("addProductButton")
            .style.display = "none";


        document
            .getElementById("addCategoryButton")
            .style.display = "none";

    } else {

        document
            .getElementById("addProductButton")
            .style.display = "";


        document
            .getElementById("addCategoryButton")
            .style.display = "";

    }

}


// =====================================================
// NAVIGATION
// =====================================================

function showSection(sectionId) {

    document
        .querySelectorAll(".content-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

        });


    const activeButton =
        document.querySelector(
            `.nav-item[data-section="${sectionId}"]`
        );


    if (activeButton) {

        activeButton.classList.add("active");

    }


    const titles = {

        dashboard: [
            "Dashboard",
            "Store overview and statistics"
        ],

        products: [
            "Products",
            "Manage TechZone products"
        ],

        categories: [
            "Categories",
            "Manage product categories"
        ],

        inventory: [
            "Inventory",
            "Monitor product stock"
        ],

        customers: [
            "Customers",
            "Manage customer accounts"
        ],

        logs: [
            "Activity Logs",
            "Track system activities"
        ],

        notifications: [
            "Notifications",
            "Important store updates"
        ]

    };


    if (titles[sectionId]) {

        document.getElementById("pageTitle")
            .textContent = titles[sectionId][0];

        document.getElementById("pageSubtitle")
            .textContent = titles[sectionId][1];

    }

}


// =====================================================
// LOAD ALL DATA
// =====================================================

async function loadData() {

    try {

        const result =
            await api("getAllData", {

                email: currentUser.email,
                role: currentUser.role

            });


        products =
            result.products || [];

        categories =
            result.categories || [];

        customers =
            result.customers || [];

        logs =
            result.logs || [];

        notifications =
            result.notifications || [];


        renderEverything();

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// RENDER EVERYTHING
// =====================================================

function renderEverything() {

    renderDashboard();

    renderProducts();

    renderCategories();

    renderInventory();

    renderCustomers();

    renderLogs();

    renderNotifications();

    updateCategoryDropdowns();

    updateNotificationBadges();

}


// =====================================================
// DASHBOARD
// =====================================================

function renderDashboard() {

    document.getElementById("totalProducts")
        .textContent = products.length;


    document.getElementById("totalCategories")
        .textContent = categories.length;


    document.getElementById("totalCustomers")
        .textContent = customers.length;


    const low =
        products.filter(product => {

            const stock =
                Number(product.stock || 0);

            return stock > 0 && stock <= 5;

        }).length;


    document.getElementById("lowStock")
        .textContent = low;


    const recentProducts =
        products.slice(-5).reverse();


    const productContainer =
        document.getElementById("recentProducts");


    if (!recentProducts.length) {

        productContainer.innerHTML =
            "<p>No products yet.</p>";

    } else {

        productContainer.innerHTML =
            recentProducts.map(product => `

                <div class="notification-item">

                    <div>
                        📦
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <p>
                            ₱${formatNumber(product.price)}
                        </p>

                    </div>

                </div>

            `).join("");

    }


    const recentLogs =
        logs.slice(-5).reverse();


    const activityContainer =
        document.getElementById("recentActivity");


    if (!recentLogs.length) {

        activityContainer.innerHTML =
            "<p>No activity yet.</p>";

    } else {

        activityContainer.innerHTML =
            recentLogs.map(log => `

                <div class="notification-item">

                    <div>
                        📝
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(log.action)}
                        </strong>

                        <p>
                            ${escapeHTML(log.details)}
                        </p>

                    </div>

                </div>

            `).join("");

    }

}


// =====================================================
// PRODUCTS
// =====================================================

function renderProducts() {

    const grid =
        document.getElementById("productGrid");


    const search =
        (
            document
                .getElementById("productSearch")
                ?.value || ""
        ).toLowerCase();


    const category =
        document
            .getElementById("productCategoryFilter")
            ?.value || "";


    let filtered =
        products.filter(product => {

            const matchSearch =
                String(product.name || "")
                    .toLowerCase()
                    .includes(search);


            const matchCategory =
                !category ||
                String(product.categoryId) ===
                    String(category);


            return matchSearch && matchCategory;

        });


    if (!filtered.length) {

        grid.innerHTML = `
            <div class="panel">
                <p>No products found.</p>
            </div>
        `;

        return;

    }


    const admin =
        currentUser.role.toLowerCase() === "admin";


    grid.innerHTML =
        filtered.map(product => {

            const categoryName =
                getCategoryName(product.categoryId);


            const stock =
                Number(product.stock || 0);


            let stockClass = "available";
            let stockText = `Stock: ${stock}`;


            if (stock === 0) {

                stockClass = "out";
                stockText = "Out of Stock";

            } else if (stock <= 5) {

                stockClass = "low";
                stockText = `Low Stock: ${stock}`;

            }


            return `

                <div class="product-card">

                    <div class="product-image">

                        ${
                            product.image
                            ?
                            `<img
                                src="${escapeAttribute(product.image)}"
                                alt="${escapeAttribute(product.name)}"
                            >`
                            :
                            `<div class="no-image">
                                💻
                            </div>`
                        }

                    </div>


                    <div class="product-body">

                        <span class="product-category">
                            ${escapeHTML(categoryName)}
                        </span>


                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>


                        <div class="product-description">
                            ${escapeHTML(product.description || "No description")}
                        </div>


                        <div class="product-bottom">

                            <span class="product-price">
                                ₱${formatNumber(product.price)}
                            </span>


                            <span class="stock ${stockClass}">
                                ${stockText}
                            </span>

                        </div>


                        ${
                            admin
                            ?
                            `

                            <div class="product-actions">

                                <button
                                    class="small-btn"
                                    onclick="editProduct('${product.id}')"
                                >
                                    Edit
                                </button>


                                <button
                                    class="danger-btn"
                                    onclick="deleteProduct('${product.id}')"
                                >
                                    Delete
                                </button>

                            </div>

                            `
                            :
                            ""
                        }

                    </div>

                </div>

            `;

        }).join("");

}


// =====================================================
// ADD / EDIT PRODUCT
// =====================================================

function openProductModal(productId = "") {

    if (!isAdmin()) {

        showToast(
            "Only admin can manage products.",
            "error"
        );

        return;

    }


    document.getElementById("productForm").reset();

    document.getElementById("productId")
        .value = productId;


    if (productId) {

        const product =
            products.find(
                p => String(p.id) === String(productId)
            );


        if (!product) return;


        document.getElementById("productModalTitle")
            .textContent = "Update Product";


        document.getElementById("productName")
            .value = product.name || "";


        document.getElementById("productCategory")
            .value = product.categoryId || "";


        document.getElementById("productPrice")
            .value = product.price || "";


        document.getElementById("productStock")
            .value = product.stock || "";


        document.getElementById("productImage")
            .value = product.image || "";


        document.getElementById("productDescription")
            .value = product.description || "";

    } else {

        document.getElementById("productModalTitle")
            .textContent = "Add Product";

    }


    document
        .getElementById("productModal")
        .classList.remove("hidden");

}


function editProduct(productId) {

    openProductModal(productId);

}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList.add("hidden");

}


// =====================================================
// SAVE PRODUCT
// =====================================================

async function saveProduct(event) {

    event.preventDefault();


    if (!isAdmin()) {

        showToast(
            "Only admin can add or update products.",
            "error"
        );

        return;

    }


    const id =
        document.getElementById("productId").value;


    const data = {

        id: id,

        name:
            document.getElementById("productName")
                .value.trim(),

        categoryId:
            document.getElementById("productCategory")
                .value,

        price:
            document.getElementById("productPrice")
                .value,

        stock:
            document.getElementById("productStock")
                .value,

        image:
            document.getElementById("productImage")
                .value.trim(),

        description:
            document.getElementById("productDescription")
                .value.trim(),

        userEmail:
            currentUser.email

    };


    try {

        if (id) {

            const confirmed =
                await customConfirm(
                    "Update Product",
                    "Are you sure you want to update this product?"
                );


            if (!confirmed) return;


            await api("updateProduct", data);


            showToast(
                "Product updated successfully.",
                "success"
            );

        } else {

            await api("addProduct", data);


            showToast(
                "Product added successfully.",
                "success"
            );

        }


        closeProductModal();

        await loadData();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

    if (!isAdmin()) {

        showToast(
            "Only admin can delete products.",
            "error"
        );

        return;

    }


    const product =
        products.find(
            p => String(p.id) === String(id)
        );


    if (!product) return;


    const confirmed =
        await customConfirm(
            "Delete Product",
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) return;


    try {

        await api("deleteProduct", {

            id: id,

            userEmail:
                currentUser.email

        });


        showToast(
            "Product deleted successfully.",
            "success"
        );


        await loadData();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// CATEGORIES
// =====================================================

function renderCategories() {

    const grid =
        document.getElementById("categoryGrid");


    if (!categories.length) {

        grid.innerHTML = `
            <div class="panel">
                <p>No categories yet.</p>
            </div>
        `;

        return;

    }


    const admin = isAdmin();


    grid.innerHTML =
        categories.map(category => {

            const count =
                products.filter(
                    p =>
                        String(p.categoryId) ===
                        String(category.id)
                ).length;


            return `

                <div class="category-card">

                    <div class="category-icon">
                        🗂️
                    </div>


                    <h3>
                        ${escapeHTML(category.name)}
                    </h3>


                    <p>
                        ${escapeHTML(category.description || "No description")}
                    </p>


                    <div class="category-count">
                        ${count} product(s)
                    </div>


                    ${
                        admin
                        ?
                        `

                        <div class="category-actions">

                            <button
                                class="small-btn"
                                onclick="editCategory('${category.id}')"
                            >
                                Edit
                            </button>


                            <button
                                class="danger-btn"
                                onclick="deleteCategory('${category.id}')"
                            >
                                Delete
                            </button>

                        </div>

                        `
                        :
                        ""
                    }

                </div>

            `;

        }).join("");

}


function openCategoryModal(id = "") {

    if (!isAdmin()) {

        showToast(
            "Only admin can manage categories.",
            "error"
        );

        return;

    }


    document
        .getElementById("categoryForm")
        .reset();


    document
        .getElementById("categoryId")
        .value = id;


    if (id) {

        const category =
            categories.find(
                c => String(c.id) === String(id)
            );


        if (!category) return;


        document
            .getElementById("categoryName")
            .value = category.name || "";


        document
            .getElementById("categoryDescription")
            .value = category.description || "";

    }


    document
        .getElementById("categoryModal")
        .classList.remove("hidden");

}


function editCategory(id) {

    openCategoryModal(id);

}


function closeCategoryModal() {

    document
        .getElementById("categoryModal")
        .classList.add("hidden");

}


// =====================================================
// SAVE CATEGORY
// =====================================================

async function saveCategory(event) {

    event.preventDefault();


    if (!isAdmin()) return;


    const id =
        document.getElementById("categoryId")
            .value;


    const data = {

        id: id,

        name:
            document.getElementById("categoryName")
                .value.trim(),

        description:
            document.getElementById("categoryDescription")
                .value.trim(),

        userEmail:
            currentUser.email

    };


    try {

        if (id) {

            const confirmed =
                await customConfirm(
                    "Update Category",
                    "Are you sure you want to update this category?"
                );


            if (!confirmed) return;


            await api(
                "updateCategory",
                data
            );


            showToast(
                "Category updated.",
                "success"
            );

        } else {

            await api(
                "addCategory",
                data
            );


            showToast(
                "Category added.",
                "success"
            );

        }


        closeCategoryModal();

        await loadData();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// DELETE CATEGORY
// =====================================================

async function deleteCategory(id) {

    if (!isAdmin()) return;


    const category =
        categories.find(
            c => String(c.id) === String(id)
        );


    if (!category) return;


    const used =
        products.some(
            p =>
                String(p.categoryId) ===
                String(id)
        );


    if (used) {

        showToast(
            "Cannot delete category while products use it.",
            "error"
        );

        return;

    }


    const confirmed =
        await customConfirm(
            "Delete Category",
            `Are you sure you want to delete "${category.name}"?`
        );


    if (!confirmed) return;


    try {

        await api(
            "deleteCategory",
            {
                id: id,
                userEmail: currentUser.email
            }
        );


        showToast(
            "Category deleted.",
            "success"
        );


        await loadData();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// INVENTORY
// =====================================================

function renderInventory() {

    const tbody =
        document.getElementById("inventoryTable");


    if (!products.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    No products.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        products.map(product => {

            const stock =
                Number(product.stock || 0);


            let status = "";
            let className = "";


            if (stock === 0) {

                status = "Out of Stock";
                className = "danger";

            } else if (stock <= 5) {

                status = "Low Stock";
                className = "warning";

            } else {

                status = "Available";
                className = "success";

            }


            return `

                <tr>

                    <td>
                        ${escapeHTML(product.name)}
                    </td>

                    <td>
                        ${escapeHTML(
                            getCategoryName(product.categoryId)
                        )}
                    </td>

                    <td>
                        ₱${formatNumber(product.price)}
                    </td>

                    <td>
                        ${stock}
                    </td>

                    <td>
                        <span class="status ${className}">
                            ${status}
                        </span>
                    </td>

                </tr>

            `;

        }).join("");

}


// =====================================================
// CUSTOMERS
// =====================================================

function renderCustomers() {

    const tbody =
        document.getElementById("customerTable");


    if (!isAdmin()) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Customer management is available to admin only.
                </td>
            </tr>
        `;

        return;

    }


    if (!customers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    No customers registered.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        customers.map(customer => `

            <tr>

                <td>
                    ${escapeHTML(customer.name)}
                </td>

                <td>
                    ${escapeHTML(customer.email)}
                </td>

                <td>
                    <span class="status success">
                        ${escapeHTML(customer.status || "Active")}
                    </span>
                </td>

                <td>
                    ${formatDate(customer.createdAt)}
                </td>

                <td>
                    ${formatDate(customer.lastLogin)}
                </td>

            </tr>

        `).join("");

}


// =====================================================
// ACTIVITY LOGS
// =====================================================

function renderLogs() {

    const tbody =
        document.getElementById("logsTable");


    if (!isAdmin()) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Activity logs are available to admin only.
                </td>
            </tr>
        `;

        return;

    }


    if (!logs.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    No activity logs.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        logs.slice().reverse().map(log => `

            <tr>

                <td>
                    ${formatDate(log.timestamp)}
                </td>

                <td>
                    ${escapeHTML(log.userEmail)}
                </td>

                <td>
                    ${escapeHTML(log.role)}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(log.action)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(log.details)}
                </td>

            </tr>

        `).join("");

}


// =====================================================
// NOTIFICATIONS
// =====================================================

function renderNotifications() {

    const container =
        document.getElementById("notificationList");


    if (!notifications.length) {

        container.innerHTML = `
            <div class="panel">
                <p>No notifications.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        notifications.slice().reverse().map(notification => `

            <div class="
                notification-item
                ${notification.read ? "" : "unread"}
            ">

                <div>
                    ${notification.icon || "🔔"}
                </div>


                <div>

                    <strong>
                        ${escapeHTML(notification.title)}
                    </strong>

                    <p>
                        ${escapeHTML(notification.message)}
                    </p>

                    <div class="notification-time">
                        ${formatDate(notification.timestamp)}
                    </div>

                </div>

            </div>

        `).join("");

}


function updateNotificationBadges() {

    const unread =
        notifications.filter(
            n => String(n.read).toLowerCase() !== "true"
        ).length;


    document.getElementById(
        "notificationBadge"
    ).textContent = unread;


    document.getElementById(
        "topNotificationBadge"
    ).textContent = unread;

}


async function markNotificationsRead() {

    try {

        await api(
            "markNotificationsRead",
            {
                email: currentUser.email,
                role: currentUser.role
            }
        );


        await loadData();


        showToast(
            "Notifications marked as read.",
            "success"
        );


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// CATEGORY DROPDOWNS
// =====================================================

function updateCategoryDropdowns() {

    const productCategory =
        document.getElementById(
            "productCategory"
        );


    const filter =
        document.getElementById(
            "productCategoryFilter"
        );


    const currentProduct =
        productCategory.value;


    const currentFilter =
        filter.value;


    productCategory.innerHTML =
        categories.map(category => `

            <option value="${category.id}">
                ${escapeHTML(category.name)}
            </option>

        `).join("");


    filter.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        filter.innerHTML += `

            <option value="${category.id}">
                ${escapeHTML(category.name)}
            </option>

        `;

    });


    productCategory.value =
        currentProduct;


    filter.value =
        currentFilter;

}


// =====================================================
// HELPERS
// =====================================================

function getCategoryName(id) {

    const category =
        categories.find(
            c => String(c.id) === String(id)
        );


    return category
        ? category.name
        : "Uncategorized";

}


function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


function formatDate(value) {

    if (!value) return "-";


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return String(value);

    }


    return date.toLocaleString(
        "en-PH",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


function isAdmin() {

    return currentUser &&
        String(currentUser.role).toLowerCase() === "admin";

}


// =====================================================
// LOGOUT
// =====================================================

async function confirmLogout() {

    const confirmed =
        await customConfirm(
            "Logout",
            "Are you sure you want to log out of TechZone Store?"
        );


    if (!confirmed) return;


    try {

        await api(
            "logout",
            {
                email: currentUser.email,
                role: currentUser.role
            }
        );

    } catch (error) {

        console.log(error);

    }


    localStorage.removeItem(
        "techzoneUser"
    );


    currentUser = null;


    document
        .getElementById("app")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("loginForm")
        .reset();


    showToast(
        "You have been logged out.",
        "success"
    );

}


// =====================================================
// CUSTOM CONFIRM
// =====================================================

function customConfirm(title, message) {

    return new Promise(resolve => {

        const modal =
            document.getElementById("confirmModal");


        document.getElementById(
            "confirmTitle"
        ).textContent = title;


        document.getElementById(
            "confirmMessage"
        ).textContent = message;


        modal.classList.remove("hidden");


        const button =
            document.getElementById(
                "confirmActionButton"
            );


        button.onclick = () => {

            modal.classList.add("hidden");

            resolve(true);

        };

    });

}


function closeConfirm() {

    document
        .getElementById("confirmModal")
        .classList.add("hidden");

}


// =====================================================
// AUTH MESSAGE
// =====================================================

function showAuthMessage(message, type) {

    const element =
        document.getElementById("authMessage");


    element.textContent = message;


    element.style.color =
        type === "error"
            ? "#dc2626"
            : type === "success"
                ? "#15803d"
                : "#555";

}


function clearAuthMessage() {

    document.getElementById(
        "authMessage"
    ).textContent = "";

}


// =====================================================
// TOAST
// =====================================================

function showToast(message, type = "") {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;


    toast.className =
        "toast show " + type;


    setTimeout(() => {

        toast.className = "toast";

    }, 3000);

}
