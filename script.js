/* =========================================================
   TECHZONE STORE
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   APPS SCRIPT URL
========================================================= */

const API_URL =
"https://script.google.com/macros/s/AKfycbxAxfswlsbGlr5dofhk_vayxsuH_P_cMjl4ySAlloBqalMiKY_LmGfWvCrobRT-d3j2Xg/exec";


/* =========================================================
   ADMIN SECURITY
========================================================= */

const ADMIN_GMAIL =
"reyesjoesen6@gmail.com";


/*
    NOTE:
    These credentials should ALSO be checked
    inside Google Apps Script.
*/

const ADMIN_USERNAME = "admin";

const ADMIN_PASSWORD = "admin123";

const ADMIN_PASSCODE = "adminako";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let products = [];

let currentOTPEmail = "";

let currentOTPPurpose = "";

let currentAdminAuthorized = false;

let currentCustomer = null;


/* =========================================================
   API HELPER
========================================================= */

async function api(action, data = {}) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify({

                action: action,

                ...data

            })

        });


        const result =
            await response.json();


        return result;

    }

    catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        return {

            success: false,

            message:
                "Unable to connect to TechZone server."

        };

    }

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

    }
);


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const grid =
        document.getElementById(
            "productGrid"
        );


    if (!grid) return;


    grid.innerHTML = `

        <div class="loading">

            Loading products...

        </div>

    `;


    const result =
        await api("getProducts");


    if (!result.success) {

        grid.innerHTML = `

            <div class="loading">

                Unable to load products.

            </div>

        `;

        return;

    }


    products =
        result.products || [];


    renderProducts(products);

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(items) {

    const grid =
        document.getElementById(
            "productGrid"
        );


    if (!grid) return;


    grid.innerHTML = "";


    if (!items.length) {

        grid.innerHTML = `

            <div class="loading">

                No products available.

            </div>

        `;

        return;

    }


    items.forEach(function(product) {

        const image =
            product.image_url ||
            "https://via.placeholder.com/600x400?text=TechZone";


        grid.innerHTML += `

            <article class="product-card">

                <img
                    class="product-image"
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.product_name || "Product")}"
                    onerror="
                        this.src=
                        'https://via.placeholder.com/600x400?text=TechZone'
                    "
                >


                <div class="product-info">

                    <span class="product-category">

                        ${escapeHTML(
                            product.category ||
                            "Technology"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            product.product_name ||
                            "Unnamed Product"
                        )}

                    </h3>


                    <p class="product-description">

                        ${escapeHTML(
                            product.description || ""
                        )}

                    </p>


                    <div class="product-bottom">

                        <div class="product-price">

                            ₱${formatMoney(
                                product.price
                            )}

                        </div>


                        <button
                            class="view-btn"
                            onclick="
                                viewProduct(
                                    '${escapeHTML(
                                        product.product_id
                                    )}'
                                )
                            ">

                            View

                        </button>

                    </div>

                </div>

            </article>

        `;

    });

}


/* =========================================================
   VIEW PRODUCT
========================================================= */

function viewProduct(productId) {

    const product =
        products.find(
            p =>
                String(p.product_id) ===
                String(productId)
        );


    if (!product) return;


    document.getElementById(
        "detailImage"
    ).src =
        product.image_url ||
        "https://via.placeholder.com/600x400?text=TechZone";


    document.getElementById(
        "detailCategory"
    ).innerText =
        product.category ||
        "Technology";


    document.getElementById(
        "detailName"
    ).innerText =
        product.product_name ||
        "Product";


    document.getElementById(
        "detailDescription"
    ).innerText =
        product.description ||
        "";


    document.getElementById(
        "detailPrice"
    ).innerText =
        "₱" +
        formatMoney(product.price);


    document.getElementById(
        "detailStock"
    ).innerText =
        "Available Stock: " +
        (product.stock || 0);


    openModal("productModal");

}


/* =========================================================
   OPEN ACCOUNT
========================================================= */

function openAccountModal() {

    closeModals();

    selectAccountType(
        "customer"
    );

    selectCustomerMode(
        "login"
    );

    openModal(
        "accountModal"
    );

}


/* =========================================================
   CUSTOMER / ADMIN SELECTOR
========================================================= */

function selectAccountType(type) {

    const customerTab =
        document.getElementById(
            "customerTab"
        );

    const adminTab =
        document.getElementById(
            "adminTab"
        );

    const customerArea =
        document.getElementById(
            "customerArea"
        );

    const adminArea =
        document.getElementById(
            "adminArea"
        );


    if (type === "customer") {

        customerTab.classList.add(
            "active"
        );

        adminTab.classList.remove(
            "active"
        );

        customerArea.classList.remove(
            "hidden"
        );

        adminArea.classList.add(
            "hidden"
        );


        document.getElementById(
            "accountTitle"
        ).innerText =
            "Welcome to TechZone";


        document.getElementById(
            "accountSubtitle"
        ).innerText =
            "Login or create your customer account.";

    }


    else {

        adminTab.classList.add(
            "active"
        );

        customerTab.classList.remove(
            "active"
        );

        adminArea.classList.remove(
            "hidden"
        );

        customerArea.classList.add(
            "hidden"
        );


        document.getElementById(
            "accountTitle"
        ).innerText =
            "Admin Access";


        document.getElementById(
            "accountSubtitle"
        ).innerText =
            "Sign in to manage TechZone Store.";

    }

}


/* =========================================================
   CUSTOMER LOGIN / REGISTER TABS
========================================================= */

function selectCustomerMode(mode) {

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const registerTab =
        document.getElementById(
            "registerTab"
        );

    const loginArea =
        document.getElementById(
            "customerLoginArea"
        );

    const registerArea =
        document.getElementById(
            "customerRegisterArea"
        );


    if (mode === "login") {

        loginTab.classList.add(
            "active"
        );

        registerTab.classList.remove(
            "active"
        );

        loginArea.classList.remove(
            "hidden"
        );

        registerArea.classList.add(
            "hidden"
        );

    }


    else {

        registerTab.classList.add(
            "active"
        );

        loginTab.classList.remove(
            "active"
        );

        registerArea.classList.remove(
            "hidden"
        );

        loginArea.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   CUSTOMER LOGIN
========================================================= */

async function customerLogin() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim()
        .toLowerCase();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    if (!email || !password) {

        showMessage(
            "Please enter your Gmail and password."
        );

        return;

    }


    if (!isGmail(email)) {

        showMessage(
            "Please use a valid Gmail address."
        );

        return;

    }


    const button =
        document.getElementById(
            "customerLoginBtn"
        );


    button.disabled = true;

    button.innerText =
        "Logging in...";


    const result =
        await api(
            "customerLogin",
            {

                email: email,

                password: password

            }
        );


    button.disabled = false;

    button.innerText =
        "Login";


    if (!result.success) {

        showMessage(
            result.message ||
            "Invalid Gmail or password."
        );

        return;

    }


    currentCustomer = {

        name:
            result.name ||
            "Customer",

        email:
            email

    };


    closeModals();


    document.getElementById(
        "customerWelcomeText"
    ).innerText =
        "Welcome, " +
        (result.name || "Customer") +
        "! You are logged in as a customer.";


    document.getElementById(
        "customerWelcome"
    ).classList.remove(
        "hidden"
    );

}


/* =========================================================
   CUSTOMER REGISTER
========================================================= */

async function registerCustomer() {

    const name =
        document.getElementById(
            "registerName"
        ).value.trim();


    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim()
        .toLowerCase();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    const confirm =
        document.getElementById(
            "registerConfirm"
        ).value;


    if (
        !name ||
        !email ||
        !password ||
        !confirm
    ) {

        showMessage(
            "Please complete all fields."
        );

        return;

    }


    if (!isGmail(email)) {

        showMessage(
            "Please enter a valid Gmail address."
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters."
        );

        return;

    }


    if (password !== confirm) {

        showMessage(
            "Passwords do not match."
        );

        return;

    }


    const button =
        document.getElementById(
            "registerBtn"
        );


    button.disabled = true;

    button.innerText =
        "Creating Account...";


    const result =
        await api(
            "registerCustomer",
            {

                fullName:
                    name,

                email:
                    email,

                password:
                    password

            }
        );


    button.disabled = false;

    button.innerText =
        "Create Account";


    if (!result.success) {

        showMessage(
            result.message ||
            "Unable to create account."
        );

        return;

    }


    currentOTPEmail =
        email;


    currentOTPPurpose =
        "CUSTOMER_REGISTRATION";


    closeModals();


    document.getElementById(
        "otpMessage"
    ).innerText =
        "A 6-digit OTP was sent to " +
        email +
        ". Check your Gmail.";


    document.getElementById(
        "otpInput"
    ).value = "";


    openModal(
        "otpModal"
    );

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

async function adminLogin() {

    const username =
        document.getElementById(
            "adminUsername"
        ).value.trim();


    const password =
        document.getElementById(
            "adminPassword"
        ).value;


    if (!username || !password) {

        showMessage(
            "Please enter the admin username and password."
        );

        return;

    }


    /*
       Frontend quick validation.
       SERVER-SIDE validation must ALSO exist.
    */

    if (
        username !==
        ADMIN_USERNAME
    ) {

        showMessage(
            "Invalid admin username."
        );

        return;

    }


    if (
        password !==
        ADMIN_PASSWORD
    ) {

        showMessage(
            "Invalid admin password."
        );

        return;

    }


    const result =
        await api(
            "adminLogin",
            {

                username:
                    username,

                password:
                    password

            }
        );


    if (!result.success) {

        showMessage(
            result.message ||
            "Admin login failed."
        );

        return;

    }


    currentOTPEmail =
        ADMIN_GMAIL;


    currentOTPPurpose =
        "ADMIN_LOGIN";


    closeModals();


    document.getElementById(
        "otpMessage"
    ).innerText =
        "Admin OTP was sent to " +
        ADMIN_GMAIL;


    document.getElementById(
        "otpInput"
    ).value = "";


    openModal(
        "otpModal"
    );

}


/* =========================================================
   VERIFY OTP
========================================================= */

async function verifyOTP() {

    const otp =
        document.getElementById(
            "otpInput"
        ).value.trim();


    if (!/^[0-9]{6}$/.test(otp)) {

        showMessage(
            "Please enter the 6-digit OTP."
        );

        return;

    }


    const result =
        await api(
            "verifyOTP",
            {

                email:
                    currentOTPEmail,

                otp:
                    otp,

                purpose:
                    currentOTPPurpose

            }
        );


    if (!result.success) {

        showMessage(
            result.message ||
            "Invalid or expired OTP."
        );

        return;

    }


    document.getElementById(
        "otpInput"
    ).value = "";


    /*
       ADMIN OTP
    */

    if (
        currentOTPPurpose ===
        "ADMIN_LOGIN"
    ) {

        closeModals();

        openModal(
            "passcodeModal"
        );

        return;

    }


    /*
       CUSTOMER REGISTRATION OTP
    */

    closeModals();


    showMessage(
        "Your Gmail has been verified successfully. You can now login."
    );


    selectAccountType(
        "customer"
    );


    selectCustomerMode(
        "login"
    );


    document.getElementById(
        "loginEmail"
    ).value =
        currentOTPEmail;


    openModal(
        "accountModal"
    );

}


/* =========================================================
   RESEND OTP
========================================================= */

async function resendOTP() {

    if (!currentOTPEmail) {

        showMessage(
            "No OTP request found."
        );

        return;

    }


    const result =
        await api(
            "resendOTP",
            {

                email:
                    currentOTPEmail,

                purpose:
                    currentOTPPurpose

            }
        );


    showMessage(
        result.message ||
        "OTP request completed."
    );

}


/* =========================================================
   ADMIN PASSCODE
========================================================= */

async function verifyAdminPasscode() {

    const passcode =
        document.getElementById(
            "adminPasscode"
        ).value;


    if (!passcode) {

        showMessage(
            "Please enter the admin passcode."
        );

        return;

    }


    const result =
        await api(
            "verifyAdminPasscode",
            {

                passcode:
                    passcode

            }
        );


    if (!result.success) {

        showMessage(
            result.message ||
            "Invalid admin passcode."
        );

        return;

    }


    currentAdminAuthorized =
        true;


    document.getElementById(
        "adminPasscode"
    ).value = "";


    closeModals();


    /*
       Hide customer website.
    */

    document.querySelector(
        ".hero"
    ).classList.add(
        "hidden"
    );


    document.querySelector(
        ".products-section"
    ).classList.add(
        "hidden"
    );


    document.querySelector(
        ".about-section"
    ).classList.add(
        "hidden"
    );


    document.querySelector(
        "footer"
    ).classList.add(
        "hidden"
    );


    document.querySelector(
        ".navbar"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "adminDashboard"
    ).classList.remove(
        "hidden"
    );


    loadAdminDashboard();

}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

async function loadAdminDashboard() {

    if (!currentAdminAuthorized) {
        return;
    }


    const result =
        await api(
            "getDashboardData",
            {

                passcode:
                    ADMIN_PASSCODE

            }
        );


    if (result.success) {

        document.getElementById(
            "totalProducts"
        ).innerText =
            result.products || 0;


        document.getElementById(
            "totalCustomers"
        ).innerText =
            result.customers || 0;


        document.getElementById(
            "totalOrders"
        ).innerText =
            result.orders || 0;

    }


    await loadAdminProducts();

    await loadCustomers();

}


/* =========================================================
   LOAD ADMIN PRODUCTS
========================================================= */

async function loadAdminProducts() {

    if (!currentAdminAuthorized) {
        return;
    }


    const result =
        await api(
            "getProducts"
        );


    if (!result.success) {

        showMessage(
            result.message ||
            "Unable to load products."
        );

        return;

    }


    products =
        result.products || [];


    const table =
        document.getElementById(
            "adminProductTable"
        );


    table.innerHTML = "";


    if (!products.length) {

        table.innerHTML = `

            <tr>

                <td colspan="6"
                    style="text-align:center">

                    No products found.

                </td>

            </tr>

        `;

        return;

    }


    products.forEach(function(product) {

        const status =
            Number(product.stock) > 0
                ? "Available"
                : "Out of Stock";


        table.innerHTML += `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(
                            product.product_name
                        )}
                    </strong>

                </td>


                <td>
                    ${escapeHTML(
                        product.category || ""
                    )}
                </td>


                <td>
                    ₱${formatMoney(
                        product.price
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        product.stock
                    )}
                </td>


                <td>

                    <span class="status-available">

                        ${status}

                    </span>

                </td>


                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="
                            editProduct(
                                '${escapeHTML(
                                    product.product_id
                                )}'
                            )
                        ">

                        Edit

                    </button>


                    <button
                        class="action-btn delete-btn"
                        onclick="
                            deleteProduct(
                                '${escapeHTML(
                                    product.product_id
                                )}'
                            )
                        ">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

}


/* =========================================================
   ADD PRODUCT
========================================================= */

function openAddProduct() {

    if (!currentAdminAuthorized) {

        showMessage(
            "Admin authorization is required."
        );

        return;

    }


    document.getElementById(
        "productName"
    ).value = "";


    document.getElementById(
        "productCategory"
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


    openModal(
        "addProductModal"
    );

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct() {

    if (!currentAdminAuthorized) {

        showMessage(
            "Admin authorization is required."
        );

        return;

    }


    const product = {

        product_name:
            document.getElementById(
                "productName"
            ).value.trim(),

        category:
            document.getElementById(
                "productCategory"
            ).value.trim(),

        description:
            document.getElementById(
                "productDescription"
            ).value.trim(),

        price:
            document.getElementById(
                "productPrice"
            ).value,

        stock:
            document.getElementById(
                "productStock"
            ).value,

        image_url:
            document.getElementById(
                "productImage"
            ).value.trim()

    };


    if (
        !product.product_name ||
        !product.category ||
        product.price === "" ||
        product.stock === ""
    ) {

        showMessage(
            "Please complete the required product fields."
        );

        return;

    }


    const passcode =
        prompt(
            "Enter admin passcode to save this product:"
        );


    if (passcode === null) {
        return;
    }


    if (!passcode) {

        showMessage(
            "Admin passcode is required."
        );

        return;

    }


    const result =
        await api(
            "addProduct",
            {

                product:
                    product,

                passcode:
                    passcode

            }
        );


    showMessage(
        result.message ||
        "Product operation completed."
    );


    if (result.success) {

        closeModals();

        loadAdminDashboard();

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

async function editProduct(productId) {

    if (!currentAdminAuthorized) {

        showMessage(
            "Admin authorization is required."
        );

        return;

    }


    const product =
        products.find(
            p =>
                String(p.product_id) ===
                String(productId)
        );


    if (!product) {

        showMessage(
            "Product not found."
        );

        return;

    }


    const passcode =
        prompt(
            "Enter admin passcode to edit this product:"
        );


    if (passcode === null) {
        return;
    }


    if (!passcode) {

        showMessage(
            "Admin passcode is required."
        );

        return;

    }


    const name =
        prompt(
            "Product Name:",
            product.product_name || ""
        );


    if (name === null) return;


    const category =
        prompt(
            "Category:",
            product.category || ""
        );


    if (category === null) return;


    const description =
        prompt(
            "Description:",
            product.description || ""
        );


    if (description === null) return;


    const price =
        prompt(
            "Price:",
            product.price || "0"
        );


    if (price === null) return;


    const stock =
        prompt(
            "Stock:",
            product.stock || "0"
        );


    if (stock === null) return;


    const image =
        prompt(
            "Image URL:",
            product.image_url || ""
        );


    if (image === null) return;


    const updatedProduct = {

        product_id:
            product.product_id,

        product_name:
            name.trim(),

        category:
            category.trim(),

        description:
            description.trim(),

        price:
            price,

        stock:
            stock,

        image_url:
            image.trim(),

        status:
            Number(stock) > 0
                ? "Available"
                : "Out of Stock"

    };


    const result =
        await api(
            "updateProduct",
            {

                product:
                    updatedProduct,

                passcode:
                    passcode

            }
        );


    showMessage(
        result.message ||
        "Product updated."
    );


    if (result.success) {

        loadAdminDashboard();

    }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(productId) {

    if (!currentAdminAuthorized) {

        showMessage(
            "Admin authorization is required."
        );

        return;

    }


    const product =
        products.find(
            p =>
                String(p.product_id) ===
                String(productId)
        );


    if (!product) return;


    const confirmed =
        confirm(
            "Delete " +
            product.product_name +
            "?"
        );


    if (!confirmed) {
        return;
    }


    const passcode =
        prompt(
            "Enter admin passcode to delete this product:"
        );


    if (passcode === null) {
        return;
    }


    if (!passcode) {

        showMessage(
            "Admin passcode is required."
        );

        return;

    }


    const result =
        await api(
            "deleteProduct",
            {

                productId:
                    productId,

                passcode:
                    passcode

            }
        );


    showMessage(
        result.message ||
        "Delete operation completed."
    );


    if (result.success) {

        loadAdminDashboard();

    }

}


/* =========================================================
   LOAD CUSTOMERS
========================================================= */

async function loadCustomers() {

    if (!currentAdminAuthorized) {
        return;
    }


    const result =
        await api(
            "getCustomers",
            {

                passcode:
                    ADMIN_PASSCODE

            }
        );


    if (!result.success) {

        return;

    }


    const table =
        document.getElementById(
            "customerTable"
        );


    table.innerHTML = "";


    const customers =
        result.customers || [];


    if (!customers.length) {

        table.innerHTML = `

            <tr>

                <td colspan="4"
                    style="text-align:center">

                    No customers found.

                </td>

            </tr>

        `;

        return;

    }


    customers.forEach(function(customer) {

        table.innerHTML += `

            <tr>

                <td>

                    <strong>

                        ${escapeHTML(
                            customer.full_name ||
                            ""
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        customer.email ||
                        ""
                    )}

                </td>


                <td>

                    <span class="status-available">

                        ${
                            customer.verified
                                ? "Verified"
                                : "Pending"
                        }

                    </span>

                </td>


                <td>

                    ${formatDate(
                        customer.created_at
                    )}

                </td>

            </tr>

        `;

    });

}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

function logoutAdmin() {

    currentAdminAuthorized =
        false;


    document.getElementById(
        "adminDashboard"
    ).classList.add(
        "hidden"
    );


    document.querySelector(
        ".hero"
    ).classList.remove(
        "hidden"
    );


    document.querySelector(
        ".products-section"
    ).classList.remove(
        "hidden"
    );


    document.querySelector(
        ".about-section"
    ).classList.remove(
        "hidden"
    );


    document.querySelector(
        "footer"
    ).classList.remove(
        "hidden"
    );


    document.querySelector(
        ".navbar"
    ).classList.remove(
        "hidden"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    showMessage(
        "You have been logged out."
    );

}


/* =========================================================
   CUSTOMER WELCOME CLOSE
========================================================= */

function closeCustomerWelcome() {

    document.getElementById(
        "customerWelcome"
    ).classList.add(
        "hidden"
    );

}


/* =========================================================
   MODAL OPEN
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) return;


    modal.classList.add(
        "active"
    );

}


/* =========================================================
   CLOSE MODALS
========================================================= */

function closeModals() {

    document
        .querySelectorAll(".modal")
        .forEach(function(modal) {

            modal.classList.remove(
                "active"
            );

        });

}


/* =========================================================
   SCROLL PRODUCTS
========================================================= */

function scrollToProducts() {

    const section =
        document.getElementById(
            "products"
        );


    if (!section) return;


    section.scrollIntoView({

        behavior:
            "smooth"

    });

}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isGmail(email) {

    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
        .test(email);

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-PH",
        {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (isNaN(date)) {

        return String(value);

    }


    return date.toLocaleDateString(
        "en-PH"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

    alert(
        message ||
        "TechZone Store"
    );

}


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "active"
            );

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeModals();

        }

    }
);


/* =========================================================
   OTP NUMBERS ONLY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const otp =
            document.getElementById(
                "otpInput"
            );


        if (otp) {

            otp.addEventListener(
                "input",
                function() {

                    this.value =
                        this.value
                        .replace(
                            /[^0-9]/g,
                            ""
                        )
                        .slice(
                            0,
                            6
                        );

                }
            );

        }

    }
);
