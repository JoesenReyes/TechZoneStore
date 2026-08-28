/* =========================================================
   TECHZONE STORE
   script.js
   ========================================================= */

/*
   IMPORTANT:
   After deploying Google Apps Script as Web App,
   paste the /exec URL here.

   Example:
   const APP_URL =
   "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";
*/

const APP_URL =
    "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentUser = null;

let products = [];
let categories = [];
let customers = [];
let logs = [];
let deletedProducts = [];

let editingProductId = null;

let pendingAuth = {
    type: "",
    email: ""
};


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("=================================");
    console.log("TECHZONE STORE");
    console.log("Frontend loaded successfully.");
    console.log("APP_URL:", APP_URL);
    console.log("=================================");

    const savedUser =
        localStorage.getItem("techzone_user");

    if (savedUser) {

        try {

            currentUser = JSON.parse(savedUser);

            if (currentUser.role === "ADMIN") {

                showAdminPage();

            } else {

                showCustomerPage();

            }

            loadEverything();

        } catch (error) {

            console.error(error);

            localStorage.removeItem("techzone_user");

            showLoginPage();
        }

    } else {

        showLoginPage();

    }

});


/* =========================================================
   API CONNECTION
   ========================================================= */

async function api(action, data = {}) {

    if (
        !APP_URL ||
        APP_URL.includes("PASTE_YOUR")
    ) {

        message(
            "Please set the Google Apps Script Web App URL in script.js.",
            "error"
        );

        console.error(
            "APP_URL is not configured."
        );

        return {
            success: false
        };
    }


    console.log(
        "API REQUEST:",
        action,
        data
    );


    try {

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
                    data: data
                })
            }
        );


        const text =
            await response.text();

        console.log(
            "API RESPONSE:",
            text
        );


        let result;

        try {

            result =
                JSON.parse(text);

        } catch (error) {

            console.error(
                "Server returned invalid JSON:",
                text
            );

            message(
                "Invalid server response. Check Apps Script deployment.",
                "error"
            );

            return {
                success: false
            };
        }


        if (
            result.success === false &&
            result.message
        ) {

            console.warn(
                result.message
            );
        }


        return result;


    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );

        message(
            "Cannot connect to Google Apps Script.",
            "error"
        );

        return {
            success: false,
            message: error.message
        };
    }
}


/* =========================================================
   MESSAGE / NOTIFICATION
   ========================================================= */

function message(text, type = "info") {

    const el =
        document.getElementById("message");

    if (!el) return;

    el.textContent = text;

    if (type === "error") {

        el.style.color = "#d9363e";

    } else if (type === "success") {

        el.style.color = "#198754";

    } else {

        el.style.color = "#0d63c7";
    }

}


/* =========================================================
   LOGIN PAGE
   ========================================================= */

function showLoginPage() {

    document
        .getElementById("loginPage")
        ?.classList.remove("hidden");

    document
        .getElementById("adminPage")
        ?.classList.add("hidden");

    document
        .getElementById("customerPage")
        ?.classList.add("hidden");

    hideLoginForms();

}


/* =========================================================
   HIDE LOGIN FORMS
   ========================================================= */

function hideLoginForms() {

    document
        .getElementById("loginChoice")
        ?.classList.remove("hidden");

    document
        .getElementById("adminLogin")
        ?.classList.add("hidden");

    document
        .getElementById("customerLogin")
        ?.classList.add("hidden");

    document
        .getElementById("registerForm")
        ?.classList.add("hidden");

    document
        .getElementById("otpForm")
        ?.classList.add("hidden");

}


/* =========================================================
   ADMIN LOGIN FORM
   ========================================================= */

function showAdminLogin() {

    hideLoginForms();

    document
        .getElementById("loginChoice")
        ?.classList.add("hidden");

    document
        .getElementById("adminLogin")
        ?.classList.remove("hidden");

    document
        .getElementById("adminEmail")
        ?.focus();

    message("");

}


/* =========================================================
   CUSTOMER LOGIN FORM
   ========================================================= */

function showCustomerLogin() {

    hideLoginForms();

    document
        .getElementById("loginChoice")
        ?.classList.add("hidden");

    document
        .getElementById("customerLogin")
        ?.classList.remove("hidden");

    document
        .getElementById("customerEmail")
        ?.focus();

    message("");

}


/* =========================================================
   REGISTER FORM
   ========================================================= */

function showRegister() {

    hideLoginForms();

    document
        .getElementById("loginChoice")
        ?.classList.add("hidden");

    document
        .getElementById("registerForm")
        ?.classList.remove("hidden");

    document
        .getElementById("registerName")
        ?.focus();

    message("");

}


/* =========================================================
   BACK
   ========================================================= */

function backLogin() {

    showLoginPage();

    message("");

}


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

async function adminLogin() {

    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("adminPassword")
            .value;


    if (!email || !password) {

        message(
            "Enter admin Gmail and password.",
            "error"
        );

        return;
    }


    message(
        "Checking admin account..."
    );


    const result =
        await api(
            "adminLogin",
            {
                email: email,
                password: password
            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Admin login failed.",
            "error"
        );

        return;
    }


    pendingAuth = {

        type: "ADMIN_LOGIN",

        email: email

    };


    showOTP(
        "A verification code was sent to the admin Gmail."
    );


    message(
        "OTP sent to admin Gmail.",
        "success"
    );

}


/* =========================================================
   CUSTOMER LOGIN
   ========================================================= */

async function customerLogin() {

    const email =
        document
            .getElementById("customerEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("customerPassword")
            .value;


    if (!email || !password) {

        message(
            "Enter Gmail and password.",
            "error"
        );

        return;
    }


    message(
        "Checking customer account..."
    );


    const result =
        await api(
            "customerLogin",
            {
                email: email,
                password: password
            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Customer login failed.",
            "error"
        );

        return;
    }


    pendingAuth = {

        type: "CUSTOMER_LOGIN",

        email: email

    };


    showOTP(
        "A verification code was sent to your Gmail."
    );


    message(
        "OTP sent to your Gmail.",
        "success"
    );

}


/* =========================================================
   REGISTER CUSTOMER
   ========================================================= */

async function registerCustomer() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("registerPassword")
            .value;


    if (!name || !email || !password) {

        message(
            "Please complete all registration fields.",
            "error"
        );

        return;
    }


    if (!email.includes("@gmail.com")) {

        message(
            "Please use a Gmail address.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        message(
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }


    message(
        "Creating customer account..."
    );


    const result =
        await api(
            "registerCustomer",
            {
                name: name,
                email: email,
                password: password
            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Registration failed.",
            "error"
        );

        return;
    }


    pendingAuth = {

        type: "REGISTER",

        email: email

    };


    showOTP(
        "A verification code was sent to your Gmail."
    );


    message(
        "Registration successful. Check your Gmail for OTP.",
        "success"
    );

}


/* =========================================================
   SHOW OTP
   ========================================================= */

function showOTP(text) {

    document
        .getElementById("loginChoice")
        ?.classList.add("hidden");

    document
        .getElementById("adminLogin")
        ?.classList.add("hidden");

    document
        .getElementById("customerLogin")
        ?.classList.add("hidden");

    document
        .getElementById("registerForm")
        ?.classList.add("hidden");

    document
        .getElementById("otpForm")
        ?.classList.remove("hidden");


    const otpText =
        document.getElementById("otpText");

    if (otpText) {

        otpText.textContent = text;
    }


    const otp =
        document.getElementById("otpCode");

    if (otp) {

        otp.value = "";

        otp.focus();
    }

}


/* =========================================================
   VERIFY OTP
   ========================================================= */

async function verifyOTP() {

    const otp =
        document
            .getElementById("otpCode")
            .value
            .trim();


    if (!otp) {

        message(
            "Enter the OTP code.",
            "error"
        );

        return;
    }


    if (!/^\d{6}$/.test(otp)) {

        message(
            "OTP must contain 6 digits.",
            "error"
        );

        return;
    }


    message(
        "Verifying OTP..."
    );


    const result =
        await api(
            "verifyOTP",
            {
                email:
                    pendingAuth.email,

                otp:
                    otp,

                type:
                    pendingAuth.type
            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Invalid OTP.",
            "error"
        );

        return;
    }


    currentUser =
        result.user;


    if (result.token) {

        currentUser.token =
            result.token;
    }


    localStorage.setItem(
        "techzone_user",
        JSON.stringify(currentUser)
    );


    pendingAuth = {

        type: "",
        email: ""

    };


    if (
        currentUser.role === "ADMIN"
    ) {

        showAdminPage();

    } else {

        showCustomerPage();

    }


    await loadEverything();


    message(
        "Login successful!",
        "success"
    );

}


/* =========================================================
   SHOW ADMIN PAGE
   ========================================================= */

function showAdminPage() {

    document
        .getElementById("loginPage")
        ?.classList.add("hidden");

    document
        .getElementById("customerPage")
        ?.classList.add("hidden");

    document
        .getElementById("adminPage")
        ?.classList.remove("hidden");


    const name =
        document.getElementById(
            "adminUserName"
        );

    if (name) {

        name.textContent =
            currentUser?.name ||
            currentUser?.email ||
            "Admin";
    }


    showSection("dashboard");

}


/* =========================================================
   SHOW CUSTOMER PAGE
   ========================================================= */

function showCustomerPage() {

    document
        .getElementById("loginPage")
        ?.classList.add("hidden");

    document
        .getElementById("adminPage")
        ?.classList.add("hidden");

    document
        .getElementById("customerPage")
        ?.classList.remove("hidden");


    const name =
        document.getElementById(
            "customerUserName"
        );

    if (name) {

        name.textContent =
            currentUser?.name ||
            currentUser?.email ||
            "Customer";
    }

}


/* =========================================================
   LOAD EVERYTHING
   ========================================================= */

async function loadEverything() {

    if (!currentUser) return;


    await loadProducts();

    await loadCategories();


    if (
        currentUser.role === "ADMIN"
    ) {

        await loadCustomers();

        await loadLogs();

        await loadDeletedProducts();

        await updateDashboard();

    }


    if (
        currentUser.role === "CUSTOMER"
    ) {

        renderCustomerProducts();

    }

}


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

function showSection(section) {

    const sections = [

        "dashboardSection",

        "productsSection",

        "categoriesSection",

        "customersSection",

        "logsSection",

        "deletedSection"

    ];


    sections.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (!element) return;

            element.classList.add("hidden");

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


    if (section === "products") {

        loadProducts();

    }


    if (section === "categories") {

        loadCategories();

    }


    if (section === "customers") {

        loadCustomers();

    }


    if (section === "logs") {

        loadLogs();

    }


    if (section === "deleted") {

        loadDeletedProducts();

    }


    if (section === "dashboard") {

        updateDashboard();

    }

}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

    const result =
        await api(
            "getProducts",
            {
                token:
                    currentUser?.token || ""
            }
        );


    if (!result.success) return;


    products =
        Array.isArray(result.products)
            ? result.products
            : [];


    renderProducts();

    renderCustomerProducts();

    updateDashboard();

}


/* =========================================================
   RENDER ADMIN PRODUCTS
   ========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productsList"
        );


    if (!container) return;


    if (products.length === 0) {

        container.innerHTML = `
            <div class="stat-card">
                <h3>No Products</h3>
                <p>Add your first product.</p>
            </div>
        `;

        return;
    }


    let html = `

        <div class="product-grid">

    `;


    products.forEach(
        function (product) {

            const image =
                product.image ||
                "https://via.placeholder.com/500x350?text=TechZone";


            const price =
                Number(product.price || 0)
                    .toLocaleString(
                        "en-PH",
                        {
                            minimumFractionDigits: 2
                        }
                    );


            html += `

                <div class="product-card">

                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(product.name)}"
                        onerror="this.src='https://via.placeholder.com/500x350?text=TechZone'"
                    >

                    <div class="product-info">

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p>
                            ${escapeHTML(product.category)}
                        </p>

                        <p>
                            ${escapeHTML(product.description || "")}
                        </p>

                        <div class="price">
                            ₱${price}
                        </div>

                        <div class="stock">
                            Stock: ${Number(product.stock || 0)}
                        </div>

                        <div style="margin-top:12px">

                            <button
                                class="btn primary"
                                onclick="editProduct('${escapeAttribute(product.id)}')">
                                Update
                            </button>

                            <button
                                class="btn"
                                style="background:#d9363e;color:white"
                                onclick="deleteProduct('${escapeAttribute(product.id)}')">
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    html += `
        </div>
    `;


    container.innerHTML = html;

}


/* =========================================================
   CUSTOMER PRODUCTS
   VIEW ONLY
   ========================================================= */

function renderCustomerProducts() {

    const container =
        document.getElementById(
            "customerProducts"
        );


    if (!container) return;


    if (products.length === 0) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    No products available
                </h3>

                <p>
                    Please check again later.
                </p>

            </div>

        `;

        return;
    }


    let html = "";


    products
        .filter(
            p =>
                String(p.status)
                    .toUpperCase()
                    !== "HIDDEN"
        )
        .forEach(
            function (product) {

                const image =
                    product.image ||
                    "https://via.placeholder.com/500x350?text=TechZone";


                const price =
                    Number(product.price || 0)
                        .toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2
                            }
                        );


                html += `

                    <div class="product-card">

                        <img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(product.name)}"
                            onerror="this.src='https://via.placeholder.com/500x350?text=TechZone'"
                        >

                        <div class="product-info">

                            <h3>
                                ${escapeHTML(product.name)}
                            </h3>

                            <p>
                                ${escapeHTML(product.category)}
                            </p>

                            <p>
                                ${escapeHTML(product.description || "")}
                            </p>

                            <div class="price">
                                ₱${price}
                            </div>

                            <div class="stock">
                                ${escapeHTML(product.status)}
                            </div>

                        </div>

                    </div>

                `;

            }
        );


    container.innerHTML = html;

}


/* =========================================================
   ADD PRODUCT
   ========================================================= */

function openAddProduct() {

    if (!isAdmin()) return;


    editingProductId = null;


    const title =
        document.getElementById(
            "productModalTitle"
        );

    if (title) {

        title.textContent =
            "Add Product";
    }


    clearProductForm();

    populateCategorySelect();


    document
        .getElementById("productModal")
        ?.classList.remove("hidden");

}


/* =========================================================
   CLEAR PRODUCT FORM
   ========================================================= */

function clearProductForm() {

    const ids = [

        "productId",

        "productName",

        "productDescription",

        "productPrice",

        "productStock",

        "productImage"

    ];


    ids.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.value = "";
            }

        }
    );


    const status =
        document.getElementById(
            "productStatus"
        );

    if (status) {

        status.value =
            "AVAILABLE";
    }

}


/* =========================================================
   EDIT PRODUCT
   ========================================================= */

function editProduct(id) {

    if (!isAdmin()) return;


    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {

        message(
            "Product not found.",
            "error"
        );

        return;
    }


    editingProductId =
        product.id;


    const title =
        document.getElementById(
            "productModalTitle"
        );

    if (title) {

        title.textContent =
            "Update Product";
    }


    document.getElementById(
        "productId"
    ).value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    populateCategorySelect(
        product.category
    );


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock || "";


    document.getElementById(
        "productImage"
    ).value =
        product.image || "";


    document.getElementById(
        "productStatus"
    ).value =
        product.status ||
        "AVAILABLE";


    document
        .getElementById("productModal")
        ?.classList.remove("hidden");

}


/* =========================================================
   POPULATE CATEGORY SELECT
   ========================================================= */

function populateCategorySelect(
    selected = ""
) {

    const select =
        document.getElementById(
            "productCategory"
        );


    if (!select) return;


    select.innerHTML = "";


    if (categories.length === 0) {

        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "No categories - add one first";

        select.appendChild(option);

        return;
    }


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.name;

            option.textContent =
                category.name;


            if (
                String(category.name)
                === String(selected)
            ) {

                option.selected =
                    true;
            }


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   SAVE PRODUCT
   ========================================================= */

async function saveProduct() {

    if (!isAdmin()) return;


    const name =
        document
            .getElementById("productName")
            .value
            .trim();

    const category =
        document
            .getElementById("productCategory")
            .value
            .trim();

    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();

    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );

    const stock =
        Number(
            document
                .getElementById("productStock")
                .value
        );

    const image =
        document
            .getElementById("productImage")
            .value
            .trim();

    const status =
        document
            .getElementById("productStatus")
            .value;


    if (!name) {

        message(
            "Product name is required.",
            "error"
        );

        return;
    }


    if (!category) {

        message(
            "Select a category.",
            "error"
        );

        return;
    }


    if (Number.isNaN(price) || price < 0) {

        message(
            "Enter a valid price.",
            "error"
        );

        return;
    }


    if (Number.isNaN(stock) || stock < 0) {

        message(
            "Enter a valid stock.",
            "error"
        );

        return;
    }


    const passcode =
        prompt(
            "Enter Admin Action Passcode:"
        );


    if (passcode === null) {

        return;
    }


    if (!passcode) {

        message(
            "Passcode is required.",
            "error"
        );

        return;
    }


    const payload = {

        token:
            currentUser.token,

        passcode:
            passcode,

        product: {

            id:
                editingProductId || "",

            name:
                name,

            category:
                category,

            description:
                description,

            price:
                price,

            stock:
                stock,

            image:
                image,

            status:
                status
        }

    };


    const action =
        editingProductId
            ? "updateProduct"
            : "addProduct";


    message(
        editingProductId
            ? "Updating product..."
            : "Adding product..."
    );


    const result =
        await api(
            action,
            payload
        );


    if (!result.success) {

        message(
            result.message ||
            "Product operation failed.",
            "error"
        );

        return;
    }


    closeProductModal();


    message(
        editingProductId
            ? "Product updated successfully."
            : "Product added successfully.",
        "success"
    );


    editingProductId = null;


    await loadEverything();

}


/* =========================================================
   CLOSE PRODUCT MODAL
   ========================================================= */

function closeProductModal() {

    document
        .getElementById("productModal")
        ?.classList.add("hidden");

    editingProductId = null;

}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

async function deleteProduct(id) {

    if (!isAdmin()) return;


    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {

        message(
            "Product not found.",
            "error"
        );

        return;
    }


    const passcode =
        prompt(
            "Enter Admin Action Passcode:"
        );


    if (passcode === null) return;


    if (!passcode) {

        message(
            "Passcode is required.",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) {

        return;
    }


    message(
        "Deleting product..."
    );


    const result =
        await api(
            "deleteProduct",
            {

                token:
                    currentUser.token,

                passcode:
                    passcode,

                productId:
                    id

            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Delete failed.",
            "error"
        );

        return;
    }


    message(
        "Product deleted successfully.",
        "success"
    );


    await loadEverything();

}


/* =========================================================
   LOAD CATEGORIES
   ========================================================= */

async function loadCategories() {

    const result =
        await api(
            "getCategories",
            {
                token:
                    currentUser?.token || ""
            }
        );


    if (!result.success) return;


    categories =
        Array.isArray(result.categories)
            ? result.categories
            : [];


    renderCategories();

    populateCategorySelect();


    updateDashboard();

}


/* =========================================================
   RENDER CATEGORIES
   ========================================================= */

function renderCategories() {

    const container =
        document.getElementById(
            "categoriesList"
        );


    if (!container) return;


    if (categories.length === 0) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    No Categories
                </h3>

                <p>
                    Add your first category.
                </p>

            </div>

        `;

        return;
    }


    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            Category
                        </th>

                        <th>
                            Created By
                        </th>

                        <th>
                            Date
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    categories.forEach(
        function (category, index) {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(category.name)}
                    </td>

                    <td>
                        ${escapeHTML(category.createdBy || "")}
                    </td>

                    <td>
                        ${escapeHTML(category.createdAt || "")}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   ADD CATEGORY
   ========================================================= */

async function addCategory() {

    if (!isAdmin()) return;


    const name =
        prompt(
            "Enter new category name:"
        );


    if (name === null) return;


    const categoryName =
        name.trim();


    if (!categoryName) {

        message(
            "Category name is required.",
            "error"
        );

        return;
    }


    const passcode =
        prompt(
            "Enter Admin Action Passcode:"
        );


    if (passcode === null) return;


    if (!passcode) {

        message(
            "Passcode is required.",
            "error"
        );

        return;
    }


    const result =
        await api(
            "addCategory",
            {

                token:
                    currentUser.token,

                passcode:
                    passcode,

                name:
                    categoryName

            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Could not add category.",
            "error"
        );

        return;
    }


    message(
        "Category added successfully.",
        "success"
    );


    await loadCategories();

}


/* =========================================================
   LOAD CUSTOMERS
   ========================================================= */

async function loadCustomers() {

    if (!isAdmin()) return;


    const result =
        await api(
            "getCustomers",
            {
                token:
                    currentUser.token
            }
        );


    if (!result.success) return;


    customers =
        Array.isArray(result.customers)
            ? result.customers
            : [];


    renderCustomers();

    updateDashboard();

}


/* =========================================================
   RENDER CUSTOMERS
   ========================================================= */

function renderCustomers() {

    const container =
        document.getElementById(
            "customersList"
        );


    if (!container) return;


    if (customers.length === 0) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    No Customers
                </h3>

            </div>

        `;

        return;
    }


    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            Name
                        </th>

                        <th>
                            Gmail
                        </th>

                        <th>
                            Role
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Created
                        </th>

                        <th>
                            Last Login
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    customers.forEach(
        function (customer) {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(customer.name || "")}
                    </td>

                    <td>
                        ${escapeHTML(customer.email || "")}
                    </td>

                    <td>
                        ${escapeHTML(customer.role || "")}
                    </td>

                    <td>
                        ${escapeHTML(customer.status || "")}
                    </td>

                    <td>
                        ${escapeHTML(customer.createdAt || "")}
                    </td>

                    <td>
                        ${escapeHTML(customer.lastLogin || "")}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   LOAD ACTIVITY LOGS
   ========================================================= */

async function loadLogs() {

    if (!isAdmin()) return;


    const result =
        await api(
            "getLogs",
            {
                token:
                    currentUser.token
            }
        );


    if (!result.success) return;


    logs =
        Array.isArray(result.logs)
            ? result.logs
            : [];


    renderLogs();

    updateDashboard();

}


/* =========================================================
   RENDER LOGS
   ========================================================= */

function renderLogs() {

    const container =
        document.getElementById(
            "logsList"
        );


    if (!container) return;


    if (logs.length === 0) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    No Activity Logs
                </h3>

            </div>

        `;

        return;
    }


    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            Date/Time
                        </th>

                        <th>
                            User
                        </th>

                        <th>
                            Role
                        </th>

                        <th>
                            Action
                        </th>

                        <th>
                            Description
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    logs.forEach(
        function (log) {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(log.dateTime || "")}
                    </td>

                    <td>
                        ${escapeHTML(log.user || "")}
                    </td>

                    <td>
                        ${escapeHTML(log.role || "")}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(log.action || "")}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(log.description || "")}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   LOAD DELETED PRODUCTS
   ========================================================= */

async function loadDeletedProducts() {

    if (!isAdmin()) return;


    const result =
        await api(
            "getDeletedProducts",
            {
                token:
                    currentUser.token
            }
        );


    if (!result.success) return;


    deletedProducts =
        Array.isArray(result.products)
            ? result.products
            : [];


    renderDeletedProducts();

    updateDashboard();

}


/* =========================================================
   RENDER DELETED PRODUCTS
   ========================================================= */

function renderDeletedProducts() {

    const container =
        document.getElementById(
            "deletedList"
        );


    if (!container) return;


    if (deletedProducts.length === 0) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    Trash is Empty
                </h3>

                <p>
                    No deleted products.
                </p>

            </div>

        `;

        return;
    }


    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Category
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Stock
                        </th>

                        <th>
                            Deleted By
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    deletedProducts.forEach(
        function (product) {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(product.name || "")}
                    </td>

                    <td>
                        ${escapeHTML(product.category || "")}
                    </td>

                    <td>
                        ₱${Number(product.price || 0).toFixed(2)}
                    </td>

                    <td>
                        ${Number(product.stock || 0)}
                    </td>

                    <td>
                        ${escapeHTML(product.deletedBy || "")}
                    </td>

                    <td>

                        <button
                            class="btn primary"
                            onclick="restoreProduct('${escapeAttribute(product.id)}')">
                            Restore
                        </button>

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   RESTORE ONE PRODUCT
   ========================================================= */

async function restoreProduct(id) {

    if (!isAdmin()) return;


    const product =
        deletedProducts.find(
            p =>
                String(p.id) ===
                String(id)
        );


    const productName =
        product?.name ||
        "this product";


    const passcode =
        prompt(
            "Enter Admin Action Passcode:"
        );


    if (passcode === null) return;


    if (!passcode) {

        message(
            "Passcode is required.",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            `Restore "${productName}"?`
        );


    if (!confirmed) return;


    const result =
        await api(
            "restoreProduct",
            {

                token:
                    currentUser.token,

                passcode:
                    passcode,

                productId:
                    id

            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Restore failed.",
            "error"
        );

        return;
    }


    message(
        "Product restored successfully.",
        "success"
    );


    await loadEverything();

}


/* =========================================================
   RESTORE ALL
   ========================================================= */

async function restoreAll() {

    if (!isAdmin()) return;


    if (deletedProducts.length === 0) {

        message(
            "There are no deleted products.",
            "info"
        );

        return;
    }


    const passcode =
        prompt(
            "Enter Admin Action Passcode:"
        );


    if (passcode === null) return;


    if (!passcode) {

        message(
            "Passcode is required.",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to restore ALL deleted products?"
        );


    if (!confirmed) return;


    const result =
        await api(
            "restoreAll",
            {

                token:
                    currentUser.token,

                passcode:
                    passcode

            }
        );


    if (!result.success) {

        message(
            result.message ||
            "Restore all failed.",
            "error"
        );

        return;
    }


    message(
        "All deleted products restored.",
        "success"
    );


    await loadEverything();

}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function updateDashboard() {

    if (!isAdmin()) return;


    document.getElementById(
        "totalProducts"
    ).textContent =
        products.length;


    document.getElementById(
        "totalCategories"
    ).textContent =
        categories.length;


    document.getElementById(
        "totalCustomers"
    ).textContent =
        customers.length;


    document.getElementById(
        "totalActivities"
    ).textContent =
        logs.length;


    document.getElementById(
        "deletedProducts"
    ).textContent =
        deletedProducts.length;

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    if (!currentUser) {

        showLoginPage();

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to log out?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await api(
            "logout",
            {

                token:
                    currentUser.token

            }
        );

    } catch (error) {

        console.error(
            error
        );

    }


    localStorage.removeItem(
        "techzone_user"
    );


    currentUser = null;


    products = [];
    categories = [];
    customers = [];
    logs = [];
    deletedProducts = [];


    showLoginPage();


    message(
        "You have been logged out.",
        "success"
    );

}


/* =========================================================
   SECURITY
   ========================================================= */

function isAdmin() {

    if (
        !currentUser ||
        currentUser.role !== "ADMIN"
    ) {

        message(
            "Admin access required.",
            "error"
        );

        return false;
    }

    return true;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   OTP ENTER KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            document
                .getElementById("otpForm")
                ?.classList
                .contains("hidden") === false
        ) {

            verifyOTP();

        }

    }
);


/* =========================================================
   DEBUG
   ========================================================= */

console.log(
    "TechZone Store script.js ready."
);
