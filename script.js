/****************************************************
 * TECHZONE STORE FRONTEND
 ****************************************************/


/*
 * AFTER DEPLOYING GOOGLE APPS SCRIPT,
 * PUT YOUR WEB APP URL HERE.
 */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyDVrmpO-EcJFwcqXj8_zzGJb1Pzp59WyOfAhX31miQIpK9TgNvS7YM8g_iOdayB6wSWQ/exec";


/****************************************************
 * GLOBAL VARIABLES
 ****************************************************/

let currentUser = null;

let currentOtpEmail = "";

let currentOtpPurpose = "";

let allProducts = [];

let allCategories = [];


/****************************************************
 * START
 ****************************************************/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedUser =
            sessionStorage.getItem(
                "techzoneUser"
            );

        if (savedUser) {

            try {

                currentUser =
                    JSON.parse(savedUser);

                showCorrectDashboard();

            } catch (error) {

                sessionStorage.clear();

            }

        }

    }
);


/****************************************************
 * API
 ****************************************************/

async function api(
    action,
    params = {}
) {

    if (
        API_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        alert(
            "Please put your Google Apps Script Web App URL inside script.js first."
        );

        throw new Error(
            "API URL not configured."
        );

    }

    const query =
        new URLSearchParams();

    query.append(
        "action",
        action
    );

    Object.keys(params).forEach(
        function (key) {

            let value =
                params[key];

            if (
                typeof value ===
                "object"
            ) {

                value =
                    JSON.stringify(
                        value
                    );

            }

            query.append(
                key,
                value
            );

        }
    );

    const response =
        await fetch(
            API_URL +
            "?" +
            query.toString()
        );

    return await response.json();
}


/****************************************************
 * LOGIN
 ****************************************************/

async function login() {

    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;

    if (!email || !password) {

        showMessage(
            "loginMessage",
            "Please enter email and password.",
            "error"
        );

        return;
    }

    try {

        const result =
            await api(
                "login",
                {
                    email: email,
                    password: password
                }
            );

        if (!result.success) {

            showMessage(
                "loginMessage",
                result.message,
                "error"
            );

            return;
        }

        currentOtpEmail =
            email;

        currentOtpPurpose =
            "LOGIN";

        const otpResult =
            await api(
                "sendOtp",
                {
                    email: email,
                    purpose: "LOGIN"
                }
            );

        if (!otpResult.success) {

            showMessage(
                "loginMessage",
                otpResult.message,
                "error"
            );

            return;
        }

        document
            .getElementById(
                "otpEmailText"
            )
            .textContent =
            email;

        showPage(
            "otpPage"
        );

        showMessage(
            "otpMessage",
            "OTP sent to your Gmail.",
            "success"
        );

    } catch (error) {

        showMessage(
            "loginMessage",
            "Unable to connect to server.",
            "error"
        );

        console.error(error);

    }
}


/****************************************************
 * REGISTER
 ****************************************************/

async function register() {

    const name =
        document
            .getElementById(
                "registerName"
            )
            .value
            .trim();

    const email =
        document
            .getElementById(
                "registerEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "registerPassword"
            )
            .value;

    const confirm =
        document
            .getElementById(
                "registerConfirm"
            )
            .value;

    if (
        !name ||
        !email ||
        !password ||
        !confirm
    ) {

        showMessage(
            "registerMessage",
            "Please complete all fields.",
            "error"
        );

        return;
    }

    if (password !== confirm) {

        showMessage(
            "registerMessage",
            "Passwords do not match.",
            "error"
        );

        return;
    }

    try {

        const result =
            await api(
                "register",
                {
                    name: name,
                    email: email,
                    password: password
                }
            );

        if (!result.success) {

            showMessage(
                "registerMessage",
                result.message,
                "error"
            );

            return;
        }

        showMessage(
            "registerMessage",
            result.message,
            "success"
        );

        setTimeout(
            showLogin,
            1200
        );

    } catch (error) {

        showMessage(
            "registerMessage",
            "Unable to connect to server.",
            "error"
        );

    }
}


/****************************************************
 * VERIFY OTP
 ****************************************************/

async function verifyLoginOtp() {

    const otp =
        document
            .getElementById(
                "otpInput"
            )
            .value
            .trim();

    if (
        otp.length !== 6
    ) {

        showMessage(
            "otpMessage",
            "Enter the 6-digit OTP.",
            "error"
        );

        return;
    }

    try {

        const result =
            await api(
                "verifyOtp",
                {
                    email:
                        currentOtpEmail,

                    otp: otp,

                    purpose:
                        currentOtpPurpose
                }
            );

        if (!result.success) {

            showMessage(
                "otpMessage",
                result.message,
                "error"
            );

            return;
        }

        currentUser = {

            email:
                currentOtpEmail,

            role:
                result.role,

            name:
                result.name ||
                currentOtpEmail

        };

        sessionStorage.setItem(
            "techzoneUser",
            JSON.stringify(
                currentUser
            )
        );

        showCorrectDashboard();

    } catch (error) {

        showMessage(
            "otpMessage",
            "OTP verification failed.",
            "error"
        );

    }
}


/****************************************************
 * RESEND OTP
 ****************************************************/

async function resendOtp() {

    try {

        const result =
            await api(
                "sendOtp",
                {
                    email:
                        currentOtpEmail,

                    purpose:
                        currentOtpPurpose
                }
            );

        showMessage(
            "otpMessage",
            result.message,
            result.success
                ? "success"
                : "error"
        );

    } catch (error) {

        showMessage(
            "otpMessage",
            "Unable to resend OTP.",
            "error"
        );

    }
}


/****************************************************
 * DASHBOARD
 ****************************************************/

function showCorrectDashboard() {

    hideAllMainPages();

    if (
        currentUser.role ===
        "Admin"
    ) {

        document
            .getElementById(
                "adminApp"
            )
            .classList.remove(
                "hidden"
            );

        loadAdminData();

    } else {

        document
            .getElementById(
                "customerApp"
            )
            .classList.remove(
                "hidden"
            );

        document
            .getElementById(
                "customerName"
            )
            .textContent =
            currentUser.name ||
            currentUser.email;

        loadCustomerStore();

    }
}


/****************************************************
 * CUSTOMER STORE
 ****************************************************/

async function loadCustomerStore() {

    try {

        const categoryResult =
            await api(
                "getCategories"
            );

        if (
            categoryResult.success
        ) {

            allCategories =
                categoryResult.categories;

            populateCustomerCategories();

        }

        const productResult =
            await api(
                "getProducts"
            );

        if (
            productResult.success
        ) {

            allProducts =
                productResult.products;

            renderCustomerProducts(
                allProducts
            );

        }

    } catch (error) {

        console.error(error);

    }
}


/****************************************************
 * CUSTOMER CATEGORIES
 ****************************************************/

function populateCustomerCategories() {

    const select =
        document.getElementById(
            "customerCategory"
        );

    select.innerHTML =
        `<option value="ALL">
            All Categories
        </option>`;

    allCategories.forEach(
        function (category) {

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


/****************************************************
 * CUSTOMER PRODUCTS
 ****************************************************/

function renderCustomerProducts(
    products
) {

    const container =
        document.getElementById(
            "customerProducts"
        );

    container.innerHTML = "";

    if (!products.length) {

        container.innerHTML =
            `<p>No products available.</p>`;

        return;
    }

    products.forEach(
        function (product) {

            if (
                product.status ===
                "Inactive"
            ) {
                return;
            }

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "product-card";

            let imageHTML =
                `<div class="no-image">
                    💻
                 </div>`;

            if (product.image) {

                imageHTML =
                    `<img
                        src="${escapeHtml(product.image)}"
                        alt="${escapeHtml(product.name)}"
                     >`;

            }

            card.innerHTML = `

                <div class="product-image">

                    ${imageHTML}

                </div>

                <div class="product-info">

                    <div class="category">
                        ${escapeHtml(
                            product.category
                        )}
                    </div>

                    <h3>
                        ${escapeHtml(
                            product.name
                        )}
                    </h3>

                    <div class="price">
                        ₱${formatMoney(
                            product.price
                        )}
                    </div>

                    <div class="stock">
                        Stock:
                        ${product.stock}
                    </div>

                    <p style="margin-top:10px;color:#667085">
                        ${escapeHtml(
                            product.description ||
                            ""
                        )}
                    </p>

                </div>

            `;

            container.appendChild(
                card
            );

        }
    );
}


/****************************************************
 * FILTER CUSTOMER PRODUCTS
 ****************************************************/

function filterCustomerProducts() {

    const category =
        document
            .getElementById(
                "customerCategory"
            )
            .value;

    if (
        category ===
        "ALL"
    ) {

        renderCustomerProducts(
            allProducts
        );

        return;
    }

    const filtered =
        allProducts.filter(
            function (product) {

                return (
                    product.category ===
                    category
                );

            }
        );

    renderCustomerProducts(
        filtered
    );
}


/****************************************************
 * ADMIN DATA
 ****************************************************/

async function loadAdminData() {

    loadDashboard();

    loadAdminProducts();

    loadCategories();

    loadCustomers();

    loadOrders();

    loadActivityLogs();
}


/****************************************************
 * DASHBOARD DATA
 ****************************************************/

async function loadDashboard() {

    try {

        const passcode =
            prompt(
                "Enter Admin Passcode to view dashboard:"
            );

        if (!passcode) {
            return;
        }

        const result =
            await api(
                "dashboard",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode
                }
            );

        if (!result.success) {

            alert(result.message);

            return;
        }

        document
            .getElementById(
                "statProducts"
            )
            .textContent =
            result.dashboard.products;

        document
            .getElementById(
                "statCustomers"
            )
            .textContent =
            result.dashboard.customers;

        document
            .getElementById(
                "statCategories"
            )
            .textContent =
            result.dashboard.categories;

        document
            .getElementById(
                "statOrders"
            )
            .textContent =
            result.dashboard.orders;

    } catch (error) {

        console.error(error);

    }
}


/****************************************************
 * ADMIN PRODUCTS
 ****************************************************/

async function loadAdminProducts() {

    try {

        const result =
            await api(
                "getProducts"
            );

        if (
            !result.success
        ) {
            return;
        }

        allProducts =
            result.products;

        renderAdminProducts(
            allProducts
        );

    } catch (error) {

        console.error(error);

    }
}


function renderAdminProducts(
    products
) {

    const container =
        document.getElementById(
            "adminProducts"
        );

    container.innerHTML = "";

    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "product-card";

            let imageHTML =
                `<div class="no-image">
                    💻
                 </div>`;

            if (product.image) {

                imageHTML =
                    `<img
                        src="${escapeHtml(product.image)}"
                        alt="${escapeHtml(product.name)}"
                     >`;

            }

            card.innerHTML = `

                <div class="product-image">

                    ${imageHTML}

                </div>

                <div class="product-info">

                    <div class="category">
                        ${escapeHtml(
                            product.category
                        )}
                    </div>

                    <h3>
                        ${escapeHtml(
                            product.name
                        )}
                    </h3>

                    <div class="price">
                        ₱${formatMoney(
                            product.price
                        )}
                    </div>

                    <div class="stock">
                        Stock:
                        ${product.stock}
                    </div>

                    <div class="product-actions">

                        <button
                            class="edit-btn"
                            onclick="editProduct('${product.id}')">

                            Update

                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteProduct('${product.id}')">

                            Delete

                        </button>

                    </div>

                </div>

            `;

            container.appendChild(
                card
            );

        }
    );
}


/****************************************************
 * OPEN ADD PRODUCT
 ****************************************************/

async function openAddProduct() {

    const passcode =
        prompt(
            "ADMIN VERIFICATION\n\nEnter Admin Passcode:"
        );

    if (!passcode) {
        return;
    }

    const verified =
        await verifyAdminPasscode(
            passcode
        );

    if (!verified) {
        return;
    }

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Add Product";

    document
        .getElementById(
            "editProductId"
        )
        .value = "";

    clearProductForm();

    await loadProductCategorySelect();

    document
        .getElementById(
            "productModal"
        )
        .classList.remove(
            "hidden"
        );
}


/****************************************************
 * EDIT PRODUCT
 ****************************************************/

async function editProduct(
    productId
) {

    const passcode =
        prompt(
            "ADMIN VERIFICATION\n\nEnter Admin Passcode:"
        );

    if (!passcode) {
        return;
    }

    const verified =
        await verifyAdminPasscode(
            passcode
        );

    if (!verified) {
        return;
    }

    const product =
        allProducts.find(
            function (p) {

                return (
                    p.id ===
                    productId
                );

            }
        );

    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }

    await loadProductCategorySelect();

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Update Product";

    document
        .getElementById(
            "editProductId"
        )
        .value =
        product.id;

    document
        .getElementById(
            "productName"
        )
        .value =
        product.name;

    document
        .getElementById(
            "productCategory"
        )
        .value =
        product.category;

    document
        .getElementById(
            "productPrice"
        )
        .value =
        product.price;

    document
        .getElementById(
            "productStock"
        )
        .value =
        product.stock;

    document
        .getElementById(
            "productDescription"
        )
        .value =
        product.description || "";

    document
        .getElementById(
            "productImage"
        )
        .value =
        product.image || "";

    document
        .getElementById(
            "productStatus"
        )
        .value =
        product.status || "Available";

    document
        .getElementById(
            "productModal"
        )
        .classList.remove(
            "hidden"
        );
}


/****************************************************
 * VERIFY ADMIN PASSCODE
 ****************************************************/

async function verifyAdminPasscode(
    passcode
) {

    try {

        const result =
            await api(
                "dashboard",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode
                }
            );

        if (!result.success) {

            alert(
                "Access denied: " +
                result.message
            );

            return false;
        }

        return true;

    } catch (error) {

        alert(
            "Unable to verify admin."
        );

        return false;

    }
}


/****************************************************
 * LOAD CATEGORY SELECT
 ****************************************************/

async function loadProductCategorySelect() {

    const result =
        await api(
            "getCategories"
        );

    if (
        !result.success
    ) {
        return;
    }

    allCategories =
        result.categories;

    const select =
        document.getElementById(
            "productCategory"
        );

    select.innerHTML = "";

    allCategories.forEach(
        function (category) {

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


/****************************************************
 * SAVE PRODUCT
 ****************************************************/

async function saveProduct() {

    const productId =
        document
            .getElementById(
                "editProductId"
            )
            .value;

    const product = {

        name:
            document
                .getElementById(
                    "productName"
                )
                .value
                .trim(),

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

        image:
            document
                .getElementById(
                    "productImage"
                )
                .value,

        status:
            document
                .getElementById(
                    "productStatus"
                )
                .value

    };

    if (!product.name) {

        alert(
            "Product name is required."
        );

        return;
    }

    /*
     * ASK PASSCODE AGAIN
     * BEFORE ACTUAL ACTION
     */

    const passcode =
        prompt(
            "ADMIN VERIFICATION\n\nEnter Admin Passcode again to save:"
        );

    if (!passcode) {
        return;
    }

    try {

        let result;

        if (productId) {

            result =
                await api(
                    "updateProduct",
                    {
                        email:
                            currentUser.email,

                        passcode:
                            passcode,

                        productId:
                            productId,

                        product:
                            product
                    }
                );

        } else {

            result =
                await api(
                    "addProduct",
                    {
                        email:
                            currentUser.email,

                        passcode:
                            passcode,

                        product:
                            product
                    }
                );

        }

        if (!result.success) {

            alert(
                result.message
            );

            return;
        }

        alert(
            result.message
        );

        closeProductModal();

        loadAdminProducts();

        loadActivityLogs();

    } catch (error) {

        alert(
            "Unable to save product."
        );

    }
}


/****************************************************
 * DELETE PRODUCT
 ****************************************************/

async function deleteProduct(
    productId
) {

    if (!currentUser ||
        currentUser.role !== "Admin") {

        alert(
            "Customers cannot delete products."
        );

        return;
    }

    const product =
        allProducts.find(
            function (p) {

                return p.id === productId;

            }
        );

    const name =
        product
            ? product.name
            : "this product";

    /*
     * CONFIRM DELETE
     */

    const confirmed =
        confirm(
            "Are you sure you want to DELETE " +
            name +
            "?\n\nThis action cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    /*
     * PASSCODE
     */

    const passcode =
        prompt(
            "ADMIN VERIFICATION\n\nEnter Admin Passcode to DELETE:"
        );

    if (!passcode) {
        return;
    }

    try {

        const result =
            await api(
                "deleteProduct",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode,

                    productId:
                        productId
                }
            );

        if (!result.success) {

            alert(
                result.message
            );

            return;
        }

        alert(
            "Product deleted successfully."
        );

        loadAdminProducts();

        loadActivityLogs();

    } catch (error) {

        alert(
            "Unable to delete product."
        );

    }
}


/****************************************************
 * CLEAR PRODUCT FORM
 ****************************************************/

function clearProductForm() {

    document
        .getElementById(
            "productName"
        )
        .value = "";

    document
        .getElementById(
            "productPrice"
        )
        .value = "";

    document
        .getElementById(
            "productStock"
        )
        .value = "";

    document
        .getElementById(
            "productDescription"
        )
        .value = "";

    document
        .getElementById(
            "productImage"
        )
        .value = "";

    document
        .getElementById(
            "productStatus"
        )
        .value =
        "Available";
}


/****************************************************
 * CATEGORIES
 ****************************************************/

async function loadCategories() {

    try {

        const result =
            await api(
                "getCategories"
            );

        if (!result.success) {
            return;
        }

        allCategories =
            result.categories;

        const container =
            document.getElementById(
                "categoriesList"
            );

        let html = `

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Category</th>

                        <th>Description</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

        `;

        allCategories.forEach(
            function (category) {

                html += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                category.id
                            )}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    category.name
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                category.description ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                category.status
                            )}
                        </td>

                    </tr>

                `;

            }
        );

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(error);

    }
}


async function openAddCategory() {

    const passcode =
        prompt(
            "ADMIN VERIFICATION\n\nEnter Admin Passcode:"
        );

    if (!passcode) {
        return;
    }

    const verified =
        await verifyAdminPasscode(
            passcode
        );

    if (!verified) {
        return;
    }

    document
        .getElementById(
            "categoryName"
        )
        .value = "";

    document
        .getElementById(
            "categoryDescription"
        )
        .value = "";

    document
        .getElementById(
            "categoryModal"
        )
        .classList.remove(
            "hidden"
        );
}


async function saveCategory() {

    const name =
        document
            .getElementById(
                "categoryName"
            )
            .value
            .trim();

    const description =
        document
            .getElementById(
                "categoryDescription"
            )
            .value;

    if (!name) {

        alert(
            "Category name is required."
        );

        return;
    }

    const passcode =
        prompt(
            "ADMIN VERIFICATION\n\nEnter Admin Passcode:"
        );

    if (!passcode) {
        return;
    }

    try {

        const result =
            await api(
                "addCategory",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode,

                    name:
                        name,

                    description:
                        description
                }
            );

        if (!result.success) {

            alert(
                result.message
            );

            return;
        }

        alert(
            result.message
        );

        closeCategoryModal();

        loadCategories();

        loadActivityLogs();

    } catch (error) {

        alert(
            "Unable to add category."
        );

    }
}


/****************************************************
 * CUSTOMERS
 ****************************************************/

async function loadCustomers() {

    /*
     * Get admin passcode
     */

    const passcode =
        prompt(
            "Enter Admin Passcode to view customers:"
        );

    if (!passcode) {
        return;
    }

    try {

        const result =
            await api(
                "getUsers",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode
                }
            );

        if (!result.success) {

            return;

        }

        const customers =
            result.users.filter(
                function (user) {

                    return (
                        user.role ===
                        "Customer"
                    );

                }
            );

        const container =
            document.getElementById(
                "customersList"
            );

        let html = `

            <table>

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Status</th>

                        <th>Created</th>

                        <th>Last Login</th>

                    </tr>

                </thead>

                <tbody>

        `;

        customers.forEach(
            function (customer) {

                html += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                customer.name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.email
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.status
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                customer.createdAt
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                customer.lastLogin
                            )}
                        </td>

                    </tr>

                `;

            }
        );

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(error);

    }
}


/****************************************************
 * ORDERS
 ****************************************************/

async function loadOrders() {

    const passcode =
        prompt(
            "Enter Admin Passcode to view orders:"
        );

    if (!passcode) {
        return;
    }

    try {

        const result =
            await api(
                "getOrders",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode
                }
            );

        if (!result.success) {
            return;
        }

        const container =
            document.getElementById(
                "ordersList"
            );

        if (!result.orders.length) {

            container.innerHTML =
                `<p style="padding:20px">
                    No orders yet.
                 </p>`;

            return;
        }

        let html = `

            <table>

                <thead>

                    <tr>

                        <th>Order ID</th>

                        <th>Customer</th>

                        <th>Product</th>

                        <th>Qty</th>

                        <th>Total</th>

                        <th>Status</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

        `;

        result.orders.forEach(
            function (order) {

                html += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                order.id
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.customerName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.productName
                            )}
                        </td>

                        <td>
                            ${order.quantity}
                        </td>

                        <td>
                            ₱${formatMoney(
                                order.total
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.status
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                order.createdAt
                            )}
                        </td>

                    </tr>

                `;

            }
        );

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(error);

    }
}


/****************************************************
 * ACTIVITY LOGS
 ****************************************************/

async function loadActivityLogs() {

    const passcode =
        prompt(
            "Enter Admin Passcode to view Activity Logs:"
        );

    if (!passcode) {
        return;
    }

    try {

        const result =
            await api(
                "getActivityLogs",
                {
                    email:
                        currentUser.email,

                    passcode:
                        passcode
                }
            );

        if (!result.success) {

            alert(
                result.message
            );

            return;
        }

        const container =
            document.getElementById(
                "activityLogs"
            );

        if (!result.logs.length) {

            container.innerHTML =
                `<p style="padding:20px">
                    No activity logs yet.
                 </p>`;

            return;
        }

        let html = `

            <table>

                <thead>

                    <tr>

                        <th>Date & Time</th>

                        <th>User</th>

                        <th>Role</th>

                        <th>Action</th>

                        <th>Details</th>

                    </tr>

                </thead>

                <tbody>

        `;

        result.logs.forEach(
            function (log) {

                html += `

                    <tr>

                        <td>
                            ${formatDate(
                                log.date
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                log.email
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                log.role
                            )}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    log.action
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                log.details
                            )}
                        </td>

                    </tr>

                `;

            }
        );

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(error);

    }
}


/****************************************************
 * ADMIN NAVIGATION
 ****************************************************/

function showAdminSection(
    section
) {

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );

    sections.forEach(
        function (item) {

            item.classList.add(
                "hidden"
            );

        }
    );

    document
        .getElementById(
            section +
            "Section"
        )
        .classList.remove(
            "hidden"
        );

    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );

    buttons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );

    event.currentTarget
        .classList.add(
            "active"
        );

    if (
        section ===
        "dashboard"
    ) {
        loadDashboard();
    }

    if (
        section ===
        "products"
    ) {
        loadAdminProducts();
    }

    if (
        section ===
        "categories"
    ) {
        loadCategories();
    }

    if (
        section ===
        "customers"
    ) {
        loadCustomers();
    }

    if (
        section ===
        "orders"
    ) {
        loadOrders();
    }

    if (
        section ===
        "logs"
    ) {
        loadActivityLogs();
    }

}


/****************************************************
 * LOGOUT
 ****************************************************/

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to log out?"
        );

    if (!confirmed) {
        return;
    }

    if (currentUser) {

        /*
         * Client-side logout is recorded
         * by session ending.
         */

        console.log(
            "Logout:",
            currentUser.email
        );

    }

    currentUser = null;

    currentOtpEmail = "";

    currentOtpPurpose = "";

    sessionStorage.removeItem(
        "techzoneUser"
    );

    hideAllMainPages();

    showPage(
        "loginPage"
    );

    document
        .getElementById(
            "loginEmail"
        )
        .value = "";

    document
        .getElementById(
            "loginPassword"
        )
        .value = "";

}


/****************************************************
 * PAGE HELPERS
 ****************************************************/

function showLogin() {

    hideAllMainPages();

    showPage(
        "loginPage"
    );

}

function showRegister() {

    hideAllMainPages();

    showPage(
        "registerPage"
    );

}

function showPage(
    id
) {

    document
        .getElementById(
            id
        )
        .classList.remove(
            "hidden"
        );

}

function hideAllMainPages() {

    const pages = [

        "loginPage",

        "registerPage",

        "otpPage",

        "customerApp",

        "adminApp"

    ];

    pages.forEach(
        function (id) {

            document
                .getElementById(
                    id
                )
                .classList.add(
                    "hidden"
                );

        }
    );

}


/****************************************************
 * MODALS
 ****************************************************/

function closeProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList.add(
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


/****************************************************
 * MESSAGE
 ****************************************************/

function showMessage(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(
            elementId
        );

    element.innerHTML =
        `<div class="message ${type}">
            ${escapeHtml(message)}
         </div>`;

}


/****************************************************
 * FORMAT MONEY
 ****************************************************/

function formatMoney(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/****************************************************
 * FORMAT DATE
 ****************************************************/

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "en-PH"
    );

}


/****************************************************
 * ESCAPE HTML
 ****************************************************/

function escapeHtml(
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
