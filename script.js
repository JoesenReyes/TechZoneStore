/* =====================================================
   TECHZONE STORE FRONTEND
===================================================== */


/* =====================================================
   IMPORTANT
=====================================================

PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE.

Example:

const APP_URL =
"https://script.google.com/macros/s/XXXXXXXX/exec";

===================================================== */

const APP_URL =
    "https://script.google.com/macros/s/AKfycbwmxJZq5y9LmbSI8uigGsuFtfok6WZd-5ZqmxKBE_KIHquR0AFglKOGIOtndJx0uQJV/exec";


/* =====================================================
   ADMIN SETTINGS
===================================================== */

const ADMIN_EMAIL =
    "reyesjoesen6@gmail.com";


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentUser = null;

let currentOTPEmail = "";

let currentOTPType = "";

let products = [];

let categories = [];

let activityLogs = [];


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkConnection();

        loadProducts();

        loadCategories();

    }
);


/* =====================================================
   API REQUEST
===================================================== */

async function api(action, data = {}) {

    if (
        APP_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        showNotification(
            "Setup Required",
            "Please put your Apps Script Web App URL in script.js."
        );

        throw new Error(
            "APP_URL is not configured."
        );
    }


    const response = await fetch(
        APP_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: action,
                ...data
            })
        }
    );


    const result =
        await response.json();

    return result;
}


/* =====================================================
   CONNECTION TEST
===================================================== */

async function checkConnection() {

    const status =
        document.getElementById(
            "connectionStatus"
        );

    try {

        const url =
            APP_URL +
            "?action=test";

        const response =
            await fetch(url);

        const result =
            await response.json();

        if (result.success) {

            status.textContent =
                "● Connected";

            status.className =
                "connection online";
        }

    } catch (error) {

        status.textContent =
            "● Offline";

        status.className =
            "connection offline";
    }
}


/* =====================================================
   LOGIN TABS
===================================================== */

function showLogin(type) {

    const customer =
        document.getElementById(
            "customerLogin"
        );

    const admin =
        document.getElementById(
            "adminLogin"
        );

    const tabs =
        document.querySelectorAll(
            ".tab"
        );

    tabs.forEach(
        tab =>
            tab.classList.remove(
                "active"
            )
    );


    if (type === "customer") {

        customer.classList.remove(
            "hidden"
        );

        admin.classList.add(
            "hidden"
        );

        tabs[0].classList.add(
            "active"
        );

    } else {

        customer.classList.add(
            "hidden"
        );

        admin.classList.remove(
            "hidden"
        );

        tabs[1].classList.add(
            "active"
        );
    }
}


/* =====================================================
   CUSTOMER LOGIN
===================================================== */

async function customerLogin() {

    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "customerPassword"
        ).value.trim();


    if (!email || !password) {

        showNotification(
            "Missing Information",
            "Enter your email and password."
        );

        return;
    }


    try {

        const result =
            await api(
                "customerLogin",
                {
                    email,
                    password
                }
            );


        if (!result.success) {

            showNotification(
                "Login Failed",
                result.message
            );

            return;
        }


        /*
         * CUSTOMER LOGIN SUCCESS
         *
         * Now request OTP.
         */

        currentOTPEmail = email;

        currentOTPType =
            "CUSTOMER_LOGIN";


        const otpResult =
            await api(
                "sendOTP",
                {
                    email,
                    purpose:
                        "CUSTOMER_LOGIN"
                }
            );


        if (otpResult.success) {

            document.getElementById(
                "otpMessage"
            ).textContent =
                "OTP sent to " +
                email +
                ". Enter the 6-digit code.";

            document.getElementById(
                "otpModal"
            ).classList.remove(
                "hidden"
            );

        } else {

            showNotification(
                "OTP Error",
                otpResult.message
            );
        }

    } catch (error) {

        showNotification(
            "Connection Error",
            error.message
        );
    }
}


/* =====================================================
   ADMIN LOGIN
===================================================== */

async function adminLogin() {

    const email =
        document.getElementById(
            "adminEmail"
        ).value.trim();

    const passcode =
        document.getElementById(
            "adminPasscode"
        ).value.trim();


    if (!email || !passcode) {

        showNotification(
            "Missing Information",
            "Enter admin email and passcode."
        );

        return;
    }


    if (
        email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        showNotification(
            "Access Denied",
            "Invalid administrator email."
        );

        return;
    }


    try {

        /*
         * First verify passcode on server.
         */

        const result =
            await api(
                "adminLogin",
                {
                    email,
                    passcode
                }
            );


        if (!result.success) {

            showNotification(
                "Admin Login Failed",
                result.message
            );

            return;
        }


        /*
         * Passcode correct.
         * Send Gmail OTP.
         */

        currentOTPEmail =
            email;

        currentOTPType =
            "ADMIN_LOGIN";


        const otpResult =
            await api(
                "sendOTP",
                {
                    email,
                    purpose:
                        "ADMIN_LOGIN"
                }
            );


        if (otpResult.success) {

            document.getElementById(
                "otpMessage"
            ).textContent =
                "Admin OTP sent to " +
                email;

            document.getElementById(
                "otpModal"
            ).classList.remove(
                "hidden"
            );

        } else {

            showNotification(
                "OTP Error",
                otpResult.message
            );
        }

    } catch (error) {

        showNotification(
            "Connection Error",
            error.message
        );
    }
}


/* =====================================================
   VERIFY OTP
===================================================== */

async function verifyOTP() {

    const otp =
        document.getElementById(
            "otpInput"
        ).value.trim();


    if (
        !otp ||
        otp.length !== 6
    ) {

        showNotification(
            "Invalid OTP",
            "Enter the 6-digit OTP."
        );

        return;
    }


    try {

        const result =
            await api(
                "verifyOTP",
                {
                    email:
                        currentOTPEmail,

                    otp
                }
            );


        if (!result.success) {

            showNotification(
                "OTP Failed",
                result.message
            );

            return;
        }


        closeOTP();


        if (
            currentOTPType ===
            "ADMIN_LOGIN"
        ) {

            currentUser = {
                name:
                    "TechZone Administrator",

                email:
                    ADMIN_EMAIL,

                role:
                    "ADMIN"
            };


            localStorage.setItem(
                "techzoneUser",
                JSON.stringify(
                    currentUser
                )
            );


            openAdminApp();

            showNotification(
                "Login Successful",
                "Welcome, Administrator!"
            );


        } else {

            /*
             * Get customer information
             * from login fields.
             */

            currentUser = {
                name:
                    document.getElementById(
                        "customerEmail"
                    ).value,

                email:
                    currentOTPEmail,

                role:
                    "CUSTOMER"
            };


            localStorage.setItem(
                "techzoneUser",
                JSON.stringify(
                    currentUser
                )
            );


            openCustomerApp();

            showNotification(
                "Login Successful",
                "Welcome to TechZone Store!"
            );
        }

    } catch (error) {

        showNotification(
            "Error",
            error.message
        );
    }
}


/* =====================================================
   REGISTER CUSTOMER
===================================================== */

async function registerCustomer() {

    const name =
        document.getElementById(
            "registerName"
        ).value.trim();

    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "registerPassword"
        ).value.trim();


    if (
        !name ||
        !email ||
        !password
    ) {

        showNotification(
            "Missing Information",
            "Complete all fields."
        );

        return;
    }


    try {

        const result =
            await api(
                "customerRegister",
                {
                    name,
                    email,
                    password
                }
            );


        if (!result.success) {

            showNotification(
                "Registration Failed",
                result.message
            );

            return;
        }


        /*
         * Send OTP after registration.
         */

        currentOTPEmail =
            email;

        currentOTPType =
            "CUSTOMER_REGISTER";


        const otpResult =
            await api(
                "sendOTP",
                {
                    email,
                    purpose:
                        "CUSTOMER_REGISTER"
                }
            );


        if (otpResult.success) {

            document.getElementById(
                "otpMessage"
            ).textContent =
                "Account created. OTP sent to " +
                email;

            document.getElementById(
                "otpModal"
            ).classList.remove(
                "hidden"
            );

        }

    } catch (error) {

        showNotification(
            "Error",
            error.message
        );
    }
}


/* =====================================================
   SHOW REGISTER
===================================================== */

function showRegister() {

    document.getElementById(
        "loginPage"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "registerPage"
    ).classList.remove(
        "hidden"
    );
}


/* =====================================================
   BACK TO LOGIN
===================================================== */

function showLoginPage() {

    document.getElementById(
        "registerPage"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "loginPage"
    ).classList.remove(
        "hidden"
    );
}


/* =====================================================
   OPEN ADMIN
===================================================== */

function openAdminApp() {

    document.getElementById(
        "loginPage"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "registerPage"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "customerApp"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "adminApp"
    ).classList.remove(
        "hidden"
    );

    document.getElementById(
        "logoutBtn"
    ).classList.remove(
        "hidden"
    );


    loadProducts();
    loadCategories();
    loadLogs();
}


/* =====================================================
   OPEN CUSTOMER
===================================================== */

function openCustomerApp() {

    document.getElementById(
        "loginPage"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "registerPage"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "adminApp"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "customerApp"
    ).classList.remove(
        "hidden"
    );

    document.getElementById(
        "logoutBtn"
    ).classList.remove(
        "hidden"
    );


    loadProducts();
    loadCategories();
}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutUser() {

    /*
     * First show confirmation.
     */

    showConfirm(
        "Logout",
        "Do you want to logout from TechZone Store?",
        async function () {

            try {

                if (currentUser) {

                    await api(
                        "logout",
                        {
                            name:
                                currentUser.name,

                            email:
                                currentUser.email,

                            role:
                                currentUser.role
                        }
                    );
                }

            } catch (error) {

                console.log(
                    error
                );
            }


            localStorage.removeItem(
                "techzoneUser"
            );

            currentUser = null;


            document.getElementById(
                "adminApp"
            ).classList.add(
                "hidden"
            );

            document.getElementById(
                "customerApp"
            ).classList.add(
                "hidden"
            );

            document.getElementById(
                "registerPage"
            ).classList.add(
                "hidden"
            );

            document.getElementById(
                "loginPage"
            ).classList.remove(
                "hidden"
            );

            document.getElementById(
                "logoutBtn"
            ).classList.add(
                "hidden"
            );


            document.getElementById(
                "adminPasscode"
            ).value = "";


            showNotification(
                "Logged Out",
                "You have successfully logged out."
            );

        }
    );
}


/* =====================================================
   CLOSE OTP
===================================================== */

function closeOTP() {

    document.getElementById(
        "otpModal"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "otpInput"
    ).value = "";
}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const result =
            await fetch(
                APP_URL +
                "?action=products"
            ).then(
                response =>
                    response.json()
            );


        if (
            result.success
        ) {

            products =
                result.products || [];

            renderProducts();

            updateDashboard();

        }

    } catch (error) {

        console.log(
            "Product error:",
            error
        );
    }
}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    const adminGrid =
        document.getElementById(
            "adminProductGrid"
        );

    const customerGrid =
        document.getElementById(
            "customerProductGrid"
        );


    if (adminGrid) {

        adminGrid.innerHTML =
            products
                .map(
                    productCardAdmin
                )
                .join("");
    }


    if (customerGrid) {

        customerGrid.innerHTML =
            products
                .filter(
                    p =>
                        String(
                            p.status
                        ).toLowerCase()
                        === "active"
                )
                .map(
                    productCardCustomer
                )
                .join("");
    }
}


/* =====================================================
   ADMIN PRODUCT CARD
===================================================== */

function productCardAdmin(
    product
) {

    const image =
        product.image
            ? `
                <img
                    src="${escapeHTML(
                        product.image
                    )}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                >
              `
            : `
                <div class="product-no-image">
                    💻
                </div>
              `;


    return `
        <div class="product-card">

            <div class="product-image">
                ${image}
            </div>

            <div class="product-info">

                <span class="category-tag">
                    ${escapeHTML(
                        product.category
                    )}
                </span>

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>

                <p class="product-description">
                    ${escapeHTML(
                        product.description || ""
                    )}
                </p>

                <div class="price">
                    ₱${Number(
                        product.price || 0
                    ).toLocaleString(
                        "en-PH",
                        {
                            minimumFractionDigits:
                                2
                        }
                    )}
                </div>

                <div class="stock">
                    Stock:
                    ${product.stock}
                    |
                    ${product.status}
                </div>

                <div class="product-actions">

                    <button
                        class="edit-btn"
                        onclick="editProduct('${escapeJS(
                            product.id
                        )}')"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="confirmDeleteProduct('${escapeJS(
                            product.id
                        )}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    `;
}


/* =====================================================
   CUSTOMER PRODUCT CARD
===================================================== */

function productCardCustomer(
    product
) {

    const image =
        product.image
            ? `
                <img
                    src="${escapeHTML(
                        product.image
                    )}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                >
              `
            : `
                <div class="product-no-image">
                    💻
                </div>
              `;


    return `
        <div class="product-card">

            <div class="product-image">
                ${image}
            </div>

            <div class="product-info">

                <span class="category-tag">
                    ${escapeHTML(
                        product.category
                    )}
                </span>

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>

                <p class="product-description">
                    ${escapeHTML(
                        product.description || ""
                    )}
                </p>

                <div class="price">
                    ₱${Number(
                        product.price || 0
                    ).toLocaleString(
                        "en-PH",
                        {
                            minimumFractionDigits:
                                2
                        }
                    )}
                </div>

                <div class="stock">
                    Available Stock:
                    ${product.stock}
                </div>

            </div>

        </div>
    `;
}


/* =====================================================
   LOAD CATEGORIES
===================================================== */

async function loadCategories() {

    try {

        const result =
            await fetch(
                APP_URL +
                "?action=categories"
            ).then(
                response =>
                    response.json()
            );


        if (
            result.success
        ) {

            categories =
                result.categories || [];

            renderCategories();

            populateCategorySelect();

            updateDashboard();
        }

    } catch (error) {

        console.log(
            "Category error:",
            error
        );
    }
}


/* =====================================================
   RENDER CATEGORIES
===================================================== */

function renderCategories() {

    const container =
        document.getElementById(
            "categoryList"
        );


    if (!container) return;


    container.innerHTML =
        categories
            .map(
                category => `
                    <div class="category-card">

                        <strong>
                            ${escapeHTML(
                                category.name
                            )}
                        </strong>

                        <button
                            onclick="confirmDeleteCategory('${escapeJS(
                                category.id
                            )}')"
                        >
                            Delete
                        </button>

                    </div>
                `
            )
            .join("");
}


/* =====================================================
   CATEGORY SELECT
===================================================== */

function populateCategorySelect() {

    const select =
        document.getElementById(
            "productCategory"
        );

    if (!select) return;


    select.innerHTML =
        categories
            .map(
                category => `
                    <option
                        value="${escapeHTML(
                            category.name
                        )}"
                    >
                        ${escapeHTML(
                            category.name
                        )}
                    </option>
                `
            )
            .join("");
}


/* =====================================================
   ADD CATEGORY
===================================================== */

async function addCategoryPrompt() {

    const name =
        prompt(
            "Enter new category:"
        );


    if (!name) return;


    const passcode =
        prompt(
            "Enter Admin Passcode:"
        );


    if (!passcode) return;


    try {

        const result =
            await api(
                "addCategory",
                {
                    name,
                    email:
                        currentUser.email,

                    passcode
                }
            );


        if (
            result.success
        ) {

            showNotification(
                "Category Added",
                result.message
            );

            loadCategories();
            loadLogs();

        } else {

            showNotification(
                "Failed",
                result.message
            );
        }

    } catch (error) {

        showNotification(
            "Error",
            error.message
        );
    }
}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(
    product = null
) {

    document.getElementById(
        "productModal"
    ).classList.remove(
        "hidden"
    );


    if (product) {

        document.getElementById(
            "productModalTitle"
        ).textContent =
            "Update Product";

        document.getElementById(
            "productId"
        ).value =
            product.id;

        document.getElementById(
            "productName"
        ).value =
            product.name;

        document.getElementById(
            "productCategory"
        ).value =
            product.category;

        document.getElementById(
            "productDescription"
        ).value =
            product.description;

        document.getElementById(
            "productPrice"
        ).value =
            product.price;

        document.getElementById(
            "productStock"
        ).value =
            product.stock;

        document.getElementById(
            "productImage"
        ).value =
            product.image;

        document.getElementById(
            "productStatus"
        ).value =
            product.status;

    } else {

        document.getElementById(
            "productModalTitle"
        ).textContent =
            "Add Product";

        clearProductForm();
    }
}


/* =====================================================
   CLOSE PRODUCT MODAL
===================================================== */

function closeProductModal() {

    document.getElementById(
        "productModal"
    ).classList.add(
        "hidden"
    );

    clearProductForm();
}


/* =====================================================
   CLEAR PRODUCT FORM
===================================================== */

function clearProductForm() {

    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "productName"
    ).value = "";

    document.getElementById(
        "productDescription"
    ).value = "";

    document.getElementById(
        "productPrice"
    ).value = "";

    document.getElementById(
        "productStock"
    ).value = "";

    document.getElementById(
        "productImage"
    ).value = "";

    document.getElementById(
        "productStatus"
    ).value = "Active";
}


/* =====================================================
   SAVE PRODUCT
===================================================== */

async function saveProduct() {

    if (
        !currentUser ||
        currentUser.role !==
        "ADMIN"
    ) {

        showNotification(
            "Access Denied",
            "Admin only."
        );

        return;
    }


    const id =
        document.getElementById(
            "productId"
        ).value;

    const name =
        document.getElementById(
            "productName"
        ).value.trim();

    const category =
        document.getElementById(
            "productCategory"
        ).value;

    const description =
        document.getElementById(
            "productDescription"
        ).value.trim();

    const price =
        document.getElementById(
            "productPrice"
        ).value;

    const stock =
        document.getElementById(
            "productStock"
        ).value;

    const image =
        document.getElementById(
            "productImage"
        ).value.trim();

    const status =
        document.getElementById(
            "productStatus"
        ).value;


    if (!name) {

        showNotification(
            "Missing Product Name",
            "Enter the product name."
        );

        return;
    }


    /*
     * IMPORTANT:
     * Admin passcode is requested
     * every time Add or Update is used.
     */

    const passcode =
        prompt(
            "Enter Admin Passcode to continue:"
        );


    if (!passcode) {

        showNotification(
            "Cancelled",
            "Admin passcode is required."
        );

        return;
    }


    try {

        const action =
            id
                ? "updateProduct"
                : "addProduct";


        const result =
            await api(
                action,
                {
                    id,
                    name,
                    category,
                    description,
                    price,
                    stock,
                    image,
                    status,

                    email:
                        currentUser.email,

                    passcode
                }
            );


        if (
            result.success
        ) {

            closeProductModal();

            showNotification(
                id
                    ? "Product Updated"
                    : "Product Added",

                result.message
            );

            loadProducts();
            loadLogs();

        } else {

            showNotification(
                "Action Failed",
                result.message
            );
        }

    } catch (error) {

        showNotification(
            "Error",
            error.message
        );
    }
}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {

        showNotification(
            "Error",
            "Product not found."
        );

        return;
    }


    openProductModal(
        product
    );
}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function confirmDeleteProduct(
    id
) {

    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) return;


    showConfirm(
        "Delete Product?",
        "Are you sure you want to delete " +
        product.name +
        "? This action cannot be undone.",

        async function () {

            /*
             * Passcode requested
             * before deletion.
             */

            const passcode =
                prompt(
                    "Enter Admin Passcode to DELETE:"
                );


            if (!passcode) {

                showNotification(
                    "Cancelled",
                    "Admin passcode is required."
                );

                return;
            }


            try {

                const result =
                    await api(
                        "deleteProduct",
                        {
                            id,

                            email:
                                currentUser.email,

                            passcode
                        }
                    );


                if (
                    result.success
                ) {

                    showNotification(
                        "Product Deleted",
                        result.message
                    );

                    loadProducts();
                    loadLogs();

                } else {

                    showNotification(
                        "Delete Failed",
                        result.message
                    );
                }

            } catch (error) {

                showNotification(
                    "Error",
                    error.message
                );
            }

        }
    );
}


/* =====================================================
   DELETE CATEGORY
===================================================== */

function confirmDeleteCategory(
    id
) {

    const category =
        categories.find(
            c =>
                String(c.id) ===
                String(id)
        );


    if (!category) return;


    showConfirm(
        "Delete Category?",
        "Do you want to delete " +
        category.name +
        "?",

        async function () {

            const passcode =
                prompt(
                    "Enter Admin Passcode:"
                );


            if (!passcode) return;


            try {

                const result =
                    await api(
                        "deleteCategory",
                        {
                            id,

                            email:
                                currentUser.email,

                            passcode
                        }
                    );


                if (
                    result.success
                ) {

                    showNotification(
                        "Category Deleted",
                        result.message
                    );

                    loadCategories();
                    loadLogs();

                } else {

                    showNotification(
                        "Delete Failed",
                        result.message
                    );
                }

            } catch (error) {

                showNotification(
                    "Error",
                    error.message
                );
            }

        }
    );
}


/* =====================================================
   LOAD LOGS
===================================================== */

async function loadLogs() {

    if (
        !currentUser ||
        currentUser.role !==
        "ADMIN"
    ) {

        return;
    }


    try {

        const result =
            await fetch(
                APP_URL +
                "?action=logs"
            ).then(
                response =>
                    response.json()
            );


        if (
            result.success
        ) {

            activityLogs =
                result.logs || [];

            renderLogs();

            updateDashboard();
        }

    } catch (error) {

        console.log(
            "Logs error:",
            error
        );
    }
}


/* =====================================================
   RENDER LOGS
===================================================== */

function renderLogs() {

    const table =
        document.getElementById(
            "logsTable"
        );


    if (!table) return;


    table.innerHTML =
        activityLogs
            .map(
                log => {

                    const date =
                        log.date
                            ? new Date(
                                log.date
                            ).toLocaleString()
                            : "";

                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    date
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.user
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.email
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.role
                                )}
                            </td>

                            <td>
                                <span
                                    class="action-badge"
                                >
                                    ${escapeHTML(
                                        log.action
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHTML(
                                    log.details
                                )}
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );

    const totalCategories =
        document.getElementById(
            "totalCategories"
        );

    const totalLogs =
        document.getElementById(
            "totalLogs"
        );


    if (totalProducts) {

        totalProducts.textContent =
            products.length;
    }

    if (totalCategories) {

        totalCategories.textContent =
            categories.length;
    }

    if (totalLogs) {

        totalLogs.textContent =
            activityLogs.length;
    }


    const customerProducts =
        document.getElementById(
            "customerProductCount"
        );

    const customerCategories =
        document.getElementById(
            "customerCategoryCount"
        );


    if (customerProducts) {

        customerProducts.textContent =
            products.filter(
                p =>
                    String(
                        p.status
                    ).toLowerCase()
                    === "active"
            ).length;
    }

    if (customerCategories) {

        customerCategories.textContent =
            categories.length;
    }
}


/* =====================================================
   ADMIN SECTION
===================================================== */

function showAdminSection(
    sectionId,
    button
) {

    const sections =
        [
            "dashboardSection",
            "productsSection",
            "categoriesSection",
            "logsSection"
        ];


    sections.forEach(
        id => {

            document.getElementById(
                id
            ).classList.add(
                "hidden"
            );

        }
    );


    document.getElementById(
        sectionId
    ).classList.remove(
        "hidden"
    );


    document
        .querySelectorAll(
            ".side-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    if (button) {

        button.classList.add(
            "active"
        );
    }


    if (
        sectionId ===
        "logsSection"
    ) {

        loadLogs();
    }
}


/* =====================================================
   CUSTOMER SECTION
===================================================== */

function showCustomerSection(
    sectionId
) {

    document.getElementById(
        "customerDashboard"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "customerProducts"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        sectionId
    ).classList.remove(
        "hidden"
    );


    document
        .querySelectorAll(
            "#customerApp .side-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    event.target.classList.add(
        "active"
    );
}


/* =====================================================
   CONFIRM MODAL
===================================================== */

let confirmCallback =
    null;


function showConfirm(
    title,
    message,
    callback
) {

    document.getElementById(
        "confirmTitle"
    ).textContent =
        title;

    document.getElementById(
        "confirmMessage"
    ).textContent =
        message;


    confirmCallback =
        callback;


    document.getElementById(
        "confirmModal"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "confirmYes"
    ).onclick =
        async function () {

            closeConfirm();

            if (
                confirmCallback
            ) {

                await confirmCallback();
            }
        };
}


function closeConfirm() {

    document.getElementById(
        "confirmModal"
    ).classList.add(
        "hidden"
    );

    confirmCallback =
        null;
}


/* =====================================================
   NOTIFICATION
===================================================== */

function showNotification(
    title,
    message
) {

    const box =
        document.getElementById(
            "notification"
        );

    document.getElementById(
        "notificationTitle"
    ).textContent =
        title;

    document.getElementById(
        "notificationMessage"
    ).textContent =
        message;


    box.classList.remove(
        "hidden"
    );


    setTimeout(
        function () {

            box.classList.add(
                "hidden"
            );

        },
        3500
    );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
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


/* =====================================================
   ESCAPE JAVASCRIPT
===================================================== */

function escapeJS(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );
}
