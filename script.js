/*******************************************************
 * TECHZONE STORE FRONTEND
 *******************************************************/

/*
 IMPORTANT:
 After deploying Apps Script as Web App,
 paste your Web App URL here.

 Example:

 const APP_URL =
 "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";
*/

const APP_URL =
    "https://script.google.com/macros/s/AKfycbwtayMhDsHWwbSRphI5tIYZJzzUUaRpNCBoOhHmN3tDl09iF2czZ27zNLCjG0zt6w0iRg/exec";


/*******************************************************
 * STATE
 *******************************************************/

let sessionToken =
    localStorage.getItem("techzone_token") || "";

let currentUser =
    JSON.parse(
        localStorage.getItem("techzone_user") || "null"
    );

let pendingEmail = "";
let pendingPurpose = "";


/*******************************************************
 * START
 *******************************************************/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !APP_URL ||
            APP_URL.includes("PASTE_YOUR")
        ) {

            showMessage(
                "Add your Apps Script Web App URL in script.js.",
                "error"
            );

            return;
        }

        if (
            sessionToken &&
            currentUser
        ) {

            showApp();

        } else {

            showLogin("admin");
        }


        document
            .getElementById("adminLoginForm")
            .addEventListener(
                "submit",
                adminLogin
            );


        document
            .getElementById("customerLoginForm")
            .addEventListener(
                "submit",
                customerLogin
            );


        document
            .getElementById("registerForm")
            .addEventListener(
                "submit",
                registerCustomer
            );


        document
            .getElementById("otpForm")
            .addEventListener(
                "submit",
                verifyOTPForm
            );


        document
            .getElementById("productForm")
            .addEventListener(
                "submit",
                saveProduct
            );


        document
            .getElementById("categoryForm")
            .addEventListener(
                "submit",
                saveCategory
            );

    }
);


/*******************************************************
 * API
 *******************************************************/

async function api(action, data = {}) {

    if (
        !APP_URL ||
        APP_URL.includes("PASTE_YOUR")
    ) {

        throw new Error(
            "Apps Script Web App URL is missing."
        );
    }

    const body =
        new URLSearchParams();

    body.append(
        "action",
        action
    );

    Object.keys(data).forEach(
        function (key) {

            body.append(
                key,
                data[key] === undefined ||
                data[key] === null
                    ? ""
                    : data[key]
            );

        }
    );

    const response =
        await fetch(
            APP_URL,
            {
                method: "POST",
                body: body
            }
        );

    if (!response.ok) {

        throw new Error(
            "Server connection failed."
        );
    }

    return await response.json();
}


/*******************************************************
 * LOGIN TYPE
 *******************************************************/

function showLogin(type) {

    document
        .getElementById("adminLoginForm")
        .classList.add("hidden");

    document
        .getElementById("customerLoginForm")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.add("hidden");

    document
        .getElementById("otpForm")
        .classList.add("hidden");

    document
        .getElementById("adminTab")
        .classList.remove("active");

    document
        .getElementById("customerTab")
        .classList.remove("active");


    if (type === "admin") {

        document
            .getElementById("adminLoginForm")
            .classList.remove("hidden");

        document
            .getElementById("adminTab")
            .classList.add("active");

    } else {

        document
            .getElementById("customerLoginForm")
            .classList.remove("hidden");

        document
            .getElementById("customerTab")
            .classList.add("active");

    }

    clearMessage();
}


/*******************************************************
 * ADMIN LOGIN
 *******************************************************/

async function adminLogin(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("adminPassword")
            .value;


    showMessage(
        "Checking admin account...",
        "info"
    );


    try {

        const result =
            await api(
                "adminLogin",
                {
                    email: email,
                    password: password
                }
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        pendingEmail =
            email.toLowerCase();

        pendingPurpose =
            "ADMIN_LOGIN";


        showOTPForm(
            "A verification code was sent to the admin Gmail."
        );

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * CUSTOMER LOGIN
 *******************************************************/

async function customerLogin(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("customerEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("customerPassword")
            .value;


    showMessage(
        "Checking customer account...",
        "info"
    );


    try {

        const result =
            await api(
                "customerLogin",
                {
                    email: email,
                    password: password
                }
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        pendingEmail =
            email.toLowerCase();

        pendingPurpose =
            "CUSTOMER_LOGIN";


        showOTPForm(
            "A verification code was sent to your Gmail."
        );

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * REGISTER
 *******************************************************/

function openRegister() {

    document
        .getElementById("customerLoginForm")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.remove("hidden");

    clearMessage();
}


async function registerCustomer(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;


    showMessage(
        "Creating account...",
        "info"
    );


    try {

        const result =
            await api(
                "customerRegister",
                {
                    name: name,
                    email: email,
                    password: password
                }
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        pendingEmail =
            email.toLowerCase();

        pendingPurpose =
            "CUSTOMER_REGISTER";


        showOTPForm(
            "Registration OTP sent to your Gmail."
        );

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * OTP
 *******************************************************/

function showOTPForm(description) {

    document
        .getElementById("adminLoginForm")
        .classList.add("hidden");

    document
        .getElementById("customerLoginForm")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.add("hidden");

    document
        .getElementById("otpForm")
        .classList.remove("hidden");

    document
        .getElementById("otpDescription")
        .textContent =
        description;

    document
        .getElementById("otpCode")
        .value = "";

    clearMessage();
}


async function verifyOTPForm(event) {

    event.preventDefault();

    const otp =
        document
            .getElementById("otpCode")
            .value
            .trim();


    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            "Enter the 6-digit OTP.",
            "error"
        );

        return;
    }


    showMessage(
        "Verifying OTP...",
        "info"
    );


    try {

        const result =
            await api(
                "verifyOTP",
                {
                    email: pendingEmail,
                    otp: otp,
                    purpose: pendingPurpose
                }
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        sessionToken =
            result.token;

        currentUser = {

            name: result.name,

            email: result.email,

            role: result.role

        };


        localStorage.setItem(
            "techzone_token",
            sessionToken
        );

        localStorage.setItem(
            "techzone_user",
            JSON.stringify(
                currentUser
            )
        );


        showApp();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


function cancelOTP() {

    pendingEmail = "";
    pendingPurpose = "";

    showLogin("admin");
}


/*******************************************************
 * SHOW APP
 *******************************************************/

function showApp() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("appPage")
        .classList.remove("hidden");


    document
        .getElementById("currentUser")
        .textContent =
        currentUser.name +
        " • " +
        currentUser.role;


    const isAdmin =
        currentUser.role === "ADMIN";


    document
        .getElementById("usersMenu")
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById("logsMenu")
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById("deletedMenu")
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById("addProductButton")
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById("addCategoryButton")
        .classList.toggle(
            "hidden",
            !isAdmin
        );


    showSection("dashboard");
}


/*******************************************************
 * SECTIONS
 *******************************************************/

function showSection(section) {

    document
        .querySelectorAll(".app-section")
        .forEach(
            function (element) {

                element.classList.add(
                    "hidden"
                );

            }
        );


    const target =
        document.getElementById(
            section + "Section"
        );


    if (target) {

        target.classList.remove(
            "hidden"
        );

    }


    if (section === "dashboard") {

        loadDashboard();

    }

    if (section === "products") {

        loadProducts();

    }

    if (section === "categories") {

        loadCategories();

    }

    if (
        section === "users" &&
        currentUser.role === "ADMIN"
    ) {

        loadUsers();

    }

    if (
        section === "logs" &&
        currentUser.role === "ADMIN"
    ) {

        loadLogs();

    }

    if (
        section === "deleted" &&
        currentUser.role === "ADMIN"
    ) {

        loadDeletedProducts();

    }
}


/*******************************************************
 * DASHBOARD
 *******************************************************/

async function loadDashboard() {

    try {

        const result =
            await api(
                "getDashboard",
                {
                    token: sessionToken
                }
            );


        if (!result.success) {

            handleSessionError(
                result.message
            );

            return;
        }


        const d =
            result.dashboard;


        document
            .getElementById("stats")
            .innerHTML = `

                <div class="stat-card">
                    <span>📦 Products</span>
                    <strong>${d.products}</strong>
                </div>

                <div class="stat-card">
                    <span>👥 Customers</span>
                    <strong>${d.customers}</strong>
                </div>

                <div class="stat-card">
                    <span>🏷️ Categories</span>
                    <strong>${d.categories}</strong>
                </div>

                <div class="stat-card">
                    <span>♻️ Deleted</span>
                    <strong>${d.deletedProducts}</strong>
                </div>

                <div class="stat-card">
                    <span>📦 Total Stock</span>
                    <strong>${d.totalStock}</strong>
                </div>

                <div class="stat-card">
                    <span>📋 Activity Logs</span>
                    <strong>${d.activityLogs}</strong>
                </div>

            `;

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * PRODUCTS
 *******************************************************/

async function loadProducts() {

    try {

        const result =
            await api(
                "getProducts",
                {
                    token: sessionToken
                }
            );


        if (!result.success) {

            handleSessionError(
                result.message
            );

            return;
        }


        const grid =
            document
                .getElementById(
                    "productGrid"
                );


        if (
            !result.products.length
        ) {

            grid.innerHTML =
                `<div class="empty">
                    No products available.
                </div>`;

            return;
        }


        grid.innerHTML =
            result.products
                .map(
                    productCard
                )
                .join("");


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


function productCard(product) {

    const isAdmin =
        currentUser.role === "ADMIN";


    const image =
        product.imageURL
            ? `<img
                src="${escapeHTML(product.imageURL)}"
                alt="${escapeHTML(product.name)}"
              >`
            : `<div class="no-image">
                📦
              </div>`;


    const actions =
        isAdmin
            ? `

                <div class="product-actions">

                    <button
                        class="btn outline"
                        onclick='editProduct(${JSON.stringify(product)})'
                    >
                        UPDATE
                    </button>

                    <button
                        class="btn danger"
                        onclick="deleteProductConfirm('${escapeJS(product.id)}','${escapeJS(product.name)}')"
                    >
                        DELETE
                    </button>

                </div>

              `
            : "";


    return `

        <div class="product-card">

            ${image}

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(product.category)}
                </p>

                <div class="price">
                    ₱${Number(product.price).toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: 2
                        }
                    )}
                </div>

                <div class="stock">
                    Stock: ${product.stock}
                </div>

                <p style="margin-top:10px">
                    ${escapeHTML(
                        product.description || ""
                    )}
                </p>

                ${actions}

            </div>

        </div>

    `;
}


/*******************************************************
 * PRODUCT MODAL
 *******************************************************/

async function openProductModal(product = null) {

    if (
        currentUser.role !== "ADMIN"
    ) {
        return;
    }


    await loadCategoryOptions();


    document
        .getElementById("productModal")
        .classList.remove("hidden");


    if (product) {

        document
            .getElementById(
                "productModalTitle"
            )
            .textContent =
            "Update Product";

        document
            .getElementById("productId")
            .value =
            product.id;

        document
            .getElementById("productName")
            .value =
            product.name;

        document
            .getElementById(
                "productCategory"
            )
            .value =
            product.category;

        document
            .getElementById("productPrice")
            .value =
            product.price;

        document
            .getElementById("productStock")
            .value =
            product.stock;

        document
            .getElementById(
                "productDescription"
            )
            .value =
            product.description || "";

        document
            .getElementById("productImage")
            .value =
            product.imageURL || "";

    } else {

        document
            .getElementById(
                "productModalTitle"
            )
            .textContent =
            "Add Product";

        document
            .getElementById(
                "productForm"
            )
            .reset();

        document
            .getElementById(
                "productId"
            )
            .value = "";

    }

}


function editProduct(product) {

    openProductModal(
        product
    );
}


function closeProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList.add(
            "hidden"
        );
}


async function saveProduct(event) {

    event.preventDefault();


    const id =
        document
            .getElementById(
                "productId"
            )
            .value;


    const passcode =
        document
            .getElementById(
                "productPasscode"
            )
            .value;


    const payload = {

        token:
            sessionToken,

        passcode:
            passcode,

        id:
            id,

        name:
            document
                .getElementById(
                    "productName"
                )
                .value,

        category:
            document
                .getElementById(
                    "productCategory"
                )
                .value,

        price:
            document
                .getElementById(
                    "productPrice"
                )
                .value,

        stock:
            document
                .getElementById(
                    "productStock"
                )
                .value,

        description:
            document
                .getElementById(
                    "productDescription"
                )
                .value,

        imageURL:
            document
                .getElementById(
                    "productImage"
                )
                .value

    };


    const action =
        id
            ? "updateProduct"
            : "addProduct";


    const confirmed =
        confirm(
            id
                ? "Are you sure you want to UPDATE this product?"
                : "Are you sure you want to ADD this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const result =
            await api(
                action,
                payload
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        closeProductModal();


        showMessage(
            result.message,
            "success"
        );


        loadProducts();
        loadDashboard();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * DELETE PRODUCT
 *******************************************************/

async function deleteProductConfirm(
    id,
    name
) {

    if (
        currentUser.role !== "ADMIN"
    ) {
        return;
    }


    const first =
        confirm(
            `Are you sure you want to DELETE "${name}"?`
        );


    if (!first) {
        return;
    }


    const passcode =
        prompt(
            "Enter ADMIN PASSCODE to delete this product:"
        );


    if (passcode === null) {
        return;
    }


    try {

        const result =
            await api(
                "deleteProduct",
                {
                    token:
                        sessionToken,

                    id:
                        id,

                    passcode:
                        passcode
                }
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        showMessage(
            result.message,
            "success"
        );


        loadProducts();
        loadDashboard();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * CATEGORIES
 *******************************************************/

async function loadCategories() {

    try {

        const result =
            await api(
                "getCategories"
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        const list =
            document
                .getElementById(
                    "categoryList"
                );


        if (
            !result.categories.length
        ) {

            list.innerHTML =
                `<div class="empty">
                    No categories available.
                </div>`;

            return;
        }


        list.innerHTML =
            result.categories
                .map(
                    category => {

                        const admin =
                            currentUser.role === "ADMIN";

                        return `

                            <div class="category-card">

                                <h3>
                                    ${escapeHTML(
                                        category.name
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        category.description || ""
                                    )}
                                </p>

                                ${
                                    admin
                                    ? `
                                        <button
                                            class="btn danger"
                                            onclick="deleteCategoryConfirm(
                                                '${escapeJS(category.id)}',
                                                '${escapeJS(category.name)}'
                                            )"
                                        >
                                            DELETE
                                        </button>
                                      `
                                    : ""
                                }

                            </div>

                        `;
                    }
                )
                .join("");

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


async function loadCategoryOptions() {

    const result =
        await api(
            "getCategories"
        );


    if (!result.success) {
        return;
    }


    const select =
        document
            .getElementById(
                "productCategory"
            );


    select.innerHTML =
        `<option value="">
            Select Category
        </option>`;


    result.categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.name;

            option.textContent =
                category.name;

            select.appendChild(
                option
            );

        }
    );
}


/*******************************************************
 * CATEGORY MODAL
 *******************************************************/

function openCategoryModal() {

    document
        .getElementById(
            "categoryModal"
        )
        .classList.remove(
            "hidden"
        );
}


function closeCategoryModal() {

    document
        .getElementById(
            "categoryModal"
        )
        .classList.add(
            "hidden"
        );
}


async function saveCategory(event) {

    event.preventDefault();


    const confirmed =
        confirm(
            "Are you sure you want to ADD this category?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const result =
            await api(
                "addCategory",
                {

                    token:
                        sessionToken,

                    name:
                        document
                            .getElementById(
                                "categoryName"
                            )
                            .value,

                    description:
                        document
                            .getElementById(
                                "categoryDescription"
                            )
                            .value,

                    passcode:
                        document
                            .getElementById(
                                "categoryPasscode"
                            )
                            .value

                }
            );


        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            return;
        }


        closeCategoryModal();


        document
            .getElementById(
                "categoryForm"
            )
            .reset();


        loadCategories();
        loadDashboard();


        showMessage(
            result.message,
            "success"
        );

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


async function deleteCategoryConfirm(
    id,
    name
) {

    if (
        !confirm(
            `Are you sure you want to DELETE category "${name}"?`
        )
    ) {
        return;
    }


    const passcode =
        prompt(
            "Enter admin passcode:"
        );


    if (passcode === null) {
        return;
    }


    try {

        const result =
            await api(
                "deleteCategory",
                {
                    token:
                        sessionToken,

                    id:
                        id,

                    passcode:
                        passcode
                }
            );


        showMessage(
            result.message,
            result.success
                ? "success"
                : "error"
        );


        if (result.success) {

            loadCategories();
            loadDashboard();

        }

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * USERS
 *******************************************************/

async function loadUsers() {

    try {

        const result =
            await api(
                "getUsers",
                {
                    token:
                        sessionToken
                }
            );


        if (!result.success) {

            handleSessionError(
                result.message
            );

            return;
        }


        document
            .getElementById(
                "usersTable"
            )
            .innerHTML =
            result.users
                .map(
                    user => `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    String(user.id)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(user.name)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(user.email)
                                )}
                            </td>

                            <td>
                                <span class="badge ${
                                    user.role === "ADMIN"
                                        ? "badge-admin"
                                        : "badge-customer"
                                }">
                                    ${escapeHTML(
                                        String(user.role)
                                    )}
                                </span>
                            </td>

                            <td>
                                <span class="badge badge-active">
                                    ${escapeHTML(
                                        String(user.status)
                                    )}
                                </span>
                            </td>

                            <td>
                                ${formatDate(
                                    user.createdAt
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    user.lastLogin
                                )}
                            </td>

                        </tr>

                    `
                )
                .join("");

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * ACTIVITY LOGS
 *******************************************************/

async function loadLogs() {

    try {

        const result =
            await api(
                "getActivityLogs",
                {
                    token:
                        sessionToken
                }
            );


        if (!result.success) {

            handleSessionError(
                result.message
            );

            return;
        }


        document
            .getElementById(
                "logsTable"
            )
            .innerHTML =
            result.logs
                .map(
                    log => `

                        <tr>

                            <td>
                                ${formatDate(
                                    log.dateTime
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(log.email)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(log.role)
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        String(log.action)
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(log.details)
                                )}
                            </td>

                            <td>
                                <span class="badge ${
                                    log.status === "SUCCESS"
                                        ? "badge-success"
                                        : "badge-failed"
                                }">
                                    ${escapeHTML(
                                        String(log.status)
                                    )}
                                </span>
                            </td>

                        </tr>

                    `
                )
                .join("");

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * DELETED PRODUCTS
 *******************************************************/

async function loadDeletedProducts() {

    try {

        const result =
            await api(
                "getDeletedProducts",
                {
                    token:
                        sessionToken
                }
            );


        if (!result.success) {

            handleSessionError(
                result.message
            );

            return;
        }


        const grid =
            document
                .getElementById(
                    "deletedGrid"
                );


        if (
            !result.products.length
        ) {

            grid.innerHTML =
                `<div class="empty">
                    No deleted products.
                </div>`;

            return;
        }


        grid.innerHTML =
            result.products
                .map(
                    product => `

                        <div class="product-card">

                            ${
                                product.imageURL
                                ? `<img
                                    src="${escapeHTML(product.imageURL)}"
                                    alt="${escapeHTML(product.name)}"
                                  >`
                                : `<div class="no-image">
                                    ♻️
                                  </div>`
                            }

                            <div class="product-info">

                                <h3>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </h3>

                                <p>
                                    Category:
                                    ${escapeHTML(
                                        product.category
                                    )}
                                </p>

                                <p class="stock">
                                    Deleted by:
                                    ${escapeHTML(
                                        product.deletedBy
                                    )}
                                </p>

                                <p class="stock">
                                    Deleted:
                                    ${formatDate(
                                        product.deletedAt
                                    )}
                                </p>

                                <button
                                    class="btn success"
                                    onclick="restoreProductConfirm(
                                        '${escapeJS(product.id)}',
                                        '${escapeJS(product.name)}'
                                    )"
                                >
                                    ♻️ RESTORE
                                </button>

                            </div>

                        </div>

                    `
                )
                .join("");

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * RESTORE
 *******************************************************/

async function restoreProductConfirm(
    id,
    name
) {

    const confirmed =
        confirm(
            `Do you want to RESTORE "${name}"?`
        );


    if (!confirmed) {
        return;
    }


    const passcode =
        prompt(
            "Enter admin passcode to restore:"
        );


    if (passcode === null) {
        return;
    }


    try {

        const result =
            await api(
                "restoreProduct",
                {

                    token:
                        sessionToken,

                    id:
                        id,

                    passcode:
                        passcode

                }
            );


        showMessage(
            result.message,
            result.success
                ? "success"
                : "error"
        );


        if (result.success) {

            loadDeletedProducts();
            loadProducts();
            loadDashboard();

        }

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/*******************************************************
 * LOGOUT
 *******************************************************/

function confirmLogout() {

    const answer =
        confirm(
            "Do you want to logout from TechZone Store?"
        );


    if (!answer) {
        return;
    }


    logout();
}


async function logout() {

    try {

        if (sessionToken) {

            await api(
                "logout",
                {
                    token:
                        sessionToken
                }
            );
        }

    } catch (error) {

        console.error(error);

    } finally {

        localStorage.removeItem(
            "techzone_token"
        );

        localStorage.removeItem(
            "techzone_user"
        );

        sessionToken = "";
        currentUser = null;

        document
            .getElementById(
                "appPage"
            )
            .classList.add(
                "hidden"
            );

        document
            .getElementById(
                "loginPage"
            )
            .classList.remove(
                "hidden"
            );

        document
            .getElementById(
                "adminLoginForm"
            )
            .reset();

        showLogin("admin");

        showMessage(
            "You have been logged out.",
            "success"
        );
    }
}


/*******************************************************
 * SESSION ERROR
 *******************************************************/

function handleSessionError(
    message
) {

    if (
        message &&
        (
            message.includes("Session") ||
            message.includes("login") ||
            message.includes("permission")
        )
    ) {

        localStorage.removeItem(
            "techzone_token"
        );

        localStorage.removeItem(
            "techzone_user"
        );

        sessionToken = "";
        currentUser = null;

        document
            .getElementById(
                "appPage"
            )
            .classList.add(
                "hidden"
            );

        document
            .getElementById(
                "loginPage"
            )
            .classList.remove(
                "hidden"
            );

        showLogin("admin");

    }

    showMessage(
        message,
        "error"
    );
}


/*******************************************************
 * MESSAGE
 *******************************************************/

function showMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "message"
        );

    element.textContent =
        message;


    if (type === "error") {

        element.style.color =
            "#d9363e";

    } else if (
        type === "success"
    ) {

        element.style.color =
            "#198754";

    } else {

        element.style.color =
            "#0d63c7";

    }
}


function clearMessage() {

    document
        .getElementById(
            "message"
        )
        .textContent = "";
}


/*******************************************************
 * HELPERS
 *******************************************************/

function formatDate(value) {

    if (
        !value ||
        value === ""
    ) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        isNaN(date.getTime())
    ) {
        return String(value);
    }

    return date.toLocaleString();
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeJS(value) {

    return String(value ?? "")
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\n/g,
            "\\n"
        );
}
