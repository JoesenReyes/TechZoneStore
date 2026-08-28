/*******************************************************
 * TECHZONE STORE FRONTEND
 *******************************************************/


/* =====================================================
   IMPORTANT
===================================================== */

// PASTE HERE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL

const APP_URL =
    "https://script.google.com/macros/s/AKfycbwtayMhDsHWwbSRphI5tIYZJzzUUaRpNCBoOhHmN3tDl09iF2czZ27zNLCjG0zt6w0iRg/exec";


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let sessionToken = "";
let currentRole = "";
let currentEmail = "";
let currentName = "";

let allProducts = [];
let allCategories = [];


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            !APP_URL ||
            APP_URL.includes(
                "PASTE_YOUR"
            )
        ) {

            showMessage(
                "Please put your Apps Script /exec URL in script.js",
                true
            );

            return;
        }

        testConnection();

    }
);


/* =====================================================
   API
===================================================== */

function api(
    action,
    params = {}
) {

    return new Promise(
        function(resolve, reject) {

            const callbackName =
                "tzCallback_" +
                Date.now() +
                "_" +
                Math.floor(
                    Math.random() * 10000
                );

            const query =
                new URLSearchParams();

            query.set(
                "action",
                action
            );

            query.set(
                "callback",
                callbackName
            );

            Object.keys(params)
                .forEach(function(key) {

                    if (
                        params[key] !== undefined &&
                        params[key] !== null
                    ) {

                        query.set(
                            key,
                            params[key]
                        );
                    }
                });

            const script =
                document.createElement(
                    "script"
                );

            window[callbackName] =
                function(data) {

                    delete window[
                        callbackName
                    ];

                    script.remove();

                    resolve(data);
                };

            script.onerror =
                function() {

                    delete window[
                        callbackName
                    ];

                    script.remove();

                    reject(
                        new Error(
                            "Cannot connect to Google Apps Script."
                        )
                    );
                };

            script.src =
                APP_URL +
                "?" +
                query.toString();

            document.body.appendChild(
                script
            );
        }
    );
}


/* =====================================================
   TEST CONNECTION
===================================================== */

async function testConnection() {

    try {

        const result =
            await api("ping");

        if (result.success) {

            console.log(
                "TechZone Store API connected."
            );
        }

    } catch (error) {

        console.error(error);

        showMessage(
            "Google Apps Script connection failed.",
            true
        );
    }
}


/* =====================================================
   LOGIN PAGE
===================================================== */

function hideAllLoginForms() {

    document
        .getElementById("loginChoice")
        .classList.add("hidden");

    document
        .getElementById("adminLogin")
        .classList.add("hidden");

    document
        .getElementById("customerLogin")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.add("hidden");
}


function backToChoice() {

    hideAllLoginForms();

    document
        .getElementById("loginChoice")
        .classList.remove("hidden");

    clearMessage();
}


function showAdminLogin() {

    hideAllLoginForms();

    document
        .getElementById("adminLogin")
        .classList.remove("hidden");

    document
        .getElementById("adminOtpArea")
        .classList.add("hidden");
}


function showCustomerLogin() {

    hideAllLoginForms();

    document
        .getElementById("customerLogin")
        .classList.remove("hidden");

    document
        .getElementById("customerOtpArea")
        .classList.add("hidden");
}


function showRegister() {

    hideAllLoginForms();

    document
        .getElementById("registerPage")
        .classList.remove("hidden");

    document
        .getElementById("registerOtpArea")
        .classList.add("hidden");
}


/* =====================================================
   ADMIN LOGIN
===================================================== */

async function requestAdminOTP() {

    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;

    if (
        email !==
        "reyesjoesen6@gmail.com"
    ) {

        showMessage(
            "Invalid admin Gmail.",
            true
        );

        return;
    }

    if (!password) {

        showMessage(
            "Enter admin password.",
            true
        );

        return;
    }

    /*
     * The password is verified before requesting
     * the OTP. This prevents unauthorized OTP requests.
     *
     * For the initial account:
     *
     * joesenreyes
     */

    if (
        password !==
        "joesenreyes1"
    ) {

        showMessage(
            "Incorrect admin password.",
            true
        );

        return;
    }

    showMessage(
        "Sending OTP..."
    );

    try {

        const result =
            await api(
                "requestAdminOtp",
                {
                    email: email
                }
            );

        if (result.success) {

            document
                .getElementById(
                    "adminOtpArea"
                )
                .classList.remove(
                    "hidden"
                );

            showMessage(
                "OTP sent to admin Gmail."
            );

        } else {

            showMessage(
                result.message,
                true
            );
        }

    } catch (error) {

        showMessage(
            error.message,
            true
        );
    }
}


async function verifyAdmin() {

    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim()
            .toLowerCase();

    const otp =
        document
            .getElementById(
                "adminOtp"
            )
            .value
            .trim();

    if (!otp) {

        showMessage(
            "Enter OTP.",
            true
        );

        return;
    }

    showMessage(
        "Verifying OTP..."
    );

    try {

        const result =
            await api(
                "verifyAdminOtp",
                {
                    email: email,
                    otp: otp
                }
            );

        if (!result.success) {

            showMessage(
                result.message,
                true
            );

            return;
        }

        startSession(result);

    } catch (error) {

        showMessage(
            error.message,
            true
        );
    }
}


/* =====================================================
   CUSTOMER LOGIN
===================================================== */

async function customerLoginRequest() {

    const email =
        document
            .getElementById(
                "customerEmail"
            )
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById(
                "customerPassword"
            )
            .value;

    if (!email || !password) {

        showMessage(
            "Enter email and password.",
            true
        );

        return;
    }

    showMessage(
        "Checking account..."
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
                true
            );

            return;
        }

        /*
         * Customer password is checked on server.
         * Now request OTP.
         */

        const otpResult =
            await api(
                "requestCustomerOtp",
                {
                    email: email,
                    purpose: "login"
                }
            );

        if (!otpResult.success) {

            showMessage(
                otpResult.message,
                true
            );

            return;
        }

        /*
         * We don't use the temporary login token yet.
         * The final customer session is created below
         * after OTP verification.
         */

        window.pendingCustomerEmail =
            email;

        document
            .getElementById(
                "customerOtpArea"
            )
            .classList.remove(
                "hidden"
            );

        showMessage(
            "OTP sent to your Gmail."
        );

    } catch (error) {

        showMessage(
            error.message,
            true
        );
    }
}


async function verifyCustomerLoginOTP() {

    const email =
        window.pendingCustomerEmail;

    const otp =
        document
            .getElementById(
                "customerOtp"
            )
            .value
            .trim();

    if (!otp) {

        showMessage(
            "Enter OTP.",
            true
        );

        return;
    }

    try {

        const result =
            await api(
                "verifyCustomerOtp",
                {
                    email: email,
                    otp: otp
                }
            );

        if (!result.success) {

            showMessage(
                result.message,
                true
            );

            return;
        }

        /*
         * Login again to create the session.
         */

        const password =
            document
                .getElementById(
                    "customerPassword"
                )
                .value;

        const login =
            await api(
                "customerLogin",
                {
                    email: email,
                    password: password
                }
            );

        if (!login.success) {

            showMessage(
                login.message,
                true
            );

            return;
        }

        startSession(login);

    } catch (error) {

        showMessage(
            error.message,
            true
        );
    }
}


/* =====================================================
   CUSTOMER REGISTRATION
===================================================== */

async function requestRegisterOTP() {

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
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById(
                "registerPassword"
            )
            .value;

    if (!name || !email || !password) {

        showMessage(
            "Complete all registration fields.",
            true
        );

        return;
    }

    try {

        const result =
            await api(
                "requestCustomerOtp",
                {
                    email: email,
                    purpose: "register"
                }
            );

        if (result.success) {

            window.pendingRegister =
                {
                    name: name,
                    email: email,
                    password: password
                };

            document
                .getElementById(
                    "registerOtpArea"
                )
                .classList.remove(
                    "hidden"
                );

            showMessage(
                "Registration OTP sent to Gmail."
            );

        } else {

            showMessage(
                result.message,
                true
            );
        }

    } catch (error) {

        showMessage(
            error.message,
            true
        );
    }
}


async function completeRegistration() {

    const data =
        window.pendingRegister;

    const otp =
        document
            .getElementById(
                "registerOtp"
            )
            .value
            .trim();

    if (!data || !otp) {

        showMessage(
            "Enter registration OTP.",
            true
        );

        return;
    }

    try {

        const result =
            await api(
                "registerCustomer",
                {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    otp: otp
                }
            );

        if (result.success) {

            alert(
                "Customer account created successfully!"
            );

            backToChoice();

        } else {

            showMessage(
                result.message,
                true
            );
        }

    } catch (error) {

        showMessage(
            error.message,
            true
        );
    }
}


/* =====================================================
   SESSION
===================================================== */

function startSession(data) {

    sessionToken =
        data.token;

    currentRole =
        data.role;

    currentEmail =
        data.email;

    currentName =
        data.name;

    document
        .getElementById(
            "loginPage"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "app"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "currentUser"
        )
        .textContent =
        currentName +
        " (" +
        currentRole +
        ")";

    configureRole();

    showSection("dashboard");

    loadEverything();
}


function configureRole() {

    const isAdmin =
        currentRole === "ADMIN";

    document
        .getElementById(
            "usersMenu"
        )
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById(
            "logsMenu"
        )
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById(
            "restoreMenu"
        )
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById(
            "reportsMenu"
        )
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById(
            "addProductButton"
        )
        .classList.toggle(
            "hidden",
            !isAdmin
        );

    document
        .getElementById(
            "addCategoryButton"
        )
        .classList.toggle(
            "hidden",
            !isAdmin
        );
}


/* =====================================================
   LOAD EVERYTHING
===================================================== */

async function loadEverything() {

    await loadProducts();
    await loadCategories();

    if (
        currentRole === "ADMIN"
    ) {

        await loadUsers();
        await loadLogs();
        await loadDeleted();
        await loadReports();
    }
}


/* =====================================================
   SECTIONS
===================================================== */

function showSection(sectionID) {

    document
        .querySelectorAll(".section")
        .forEach(
            function(section) {

                section.classList.add(
                    "hidden"
                );

            }
        );

    const section =
        document.getElementById(
            sectionID
        );

    if (section) {

        section.classList.remove(
            "hidden"
        );
    }

    if (sectionID === "logs") {
        loadLogs();
    }

    if (sectionID === "restore") {
        loadDeleted();
    }

    if (sectionID === "users") {
        loadUsers();
    }

    if (sectionID === "reports") {
        loadReports();
    }
}


/* =====================================================
   PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const result =
            await api(
                "getProducts"
            );

        if (!result.success) {

            alert(result.message);

            return;
        }

        allProducts =
            result.products || [];

        renderProducts(
            allProducts
        );

        updateDashboard();

    } catch (error) {

        console.error(error);
    }
}


function renderProducts(
    products
) {

    const grid =
        document.getElementById(
            "productGrid"
        );

    grid.innerHTML = "";

    if (!products.length) {

        grid.innerHTML =
            "<p>No products available.</p>";

        return;
    }

    products.forEach(
        function(product) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "product-card";

            const image =
                product.image
                ||
                "https://via.placeholder.com/500x300?text=TechZone+Store";

            let adminButtons = "";

            if (
                currentRole === "ADMIN"
            ) {

                adminButtons = `
                    <div>
                        <button
                            class="small-btn edit-btn"
                            onclick="editProduct('${escapeJS(product.id)}')"
                        >
                            Edit
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteProductConfirm('${escapeJS(product.id)}')"
                        >
                            Delete
                        </button>
                    </div>
                `;
            }

            card.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.src='https://via.placeholder.com/500x300?text=TechZone+Store'"
                >

                <div class="product-info">

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    <span class="category-badge">
                        ${escapeHTML(product.category)}
                    </span>

                    <p class="price">
                        ₱${Number(product.price).toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2
                            }
                        )}
                    </p>

                    <p class="stock">
                        Stock: ${product.stock}
                    </p>

                    <p>
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>

                    ${adminButtons}

                </div>
            `;

            grid.appendChild(card);

        }
    );
}


function filterProducts() {

    const search =
        document
            .getElementById(
                "productSearch"
            )
            .value
            .toLowerCase();

    const filtered =
        allProducts.filter(
            function(product) {

                return (
                    String(product.name)
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(product.category)
                        .toLowerCase()
                        .includes(search)
                );
            }
        );

    renderProducts(
        filtered
    );
}


/* =====================================================
   ADD / UPDATE PRODUCT
===================================================== */

function openProductModal() {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

    document
        .getElementById(
            "productModal"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Add Product";

    clearProductForm();

    populateCategorySelect();
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


function clearProductForm() {

    document
        .getElementById(
            "productId"
        )
        .value = "";

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
            "productImage"
        )
        .value = "";

    document
        .getElementById(
            "productDescription"
        )
        .value = "";
}


function populateCategorySelect() {

    const select =
        document.getElementById(
            "productCategory"
        );

    select.innerHTML = "";

    allCategories.forEach(
        function(category) {

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

    if (!allCategories.length) {

        const option =
            document.createElement(
                "option"
            );

        option.value = "Others";
        option.textContent = "Others";

        select.appendChild(
            option
        );
    }
}


function editProduct(id) {

    const product =
        allProducts.find(
            function(item) {

                return String(item.id)
                    === String(id);
            }
        );

    if (!product) {
        return;
    }

    openProductModal();

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Update Product";

    document
        .getElementById(
            "productId"
        )
        .value =
        product.id;

    document
        .getElementById(
            "productName"
        )
        .value =
        product.name;

    populateCategorySelect();

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
            "productImage"
        )
        .value =
        product.image || "";

    document
        .getElementById(
            "productDescription"
        )
        .value =
        product.description || "";
}


async function saveProduct() {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

    const id =
        document
            .getElementById(
                "productId"
            )
            .value;

    const name =
        document
            .getElementById(
                "productName"
            )
            .value
            .trim();

    const category =
        document
            .getElementById(
                "productCategory"
            )
            .value;

    const price =
        document
            .getElementById(
                "productPrice"
            )
            .value;

    const stock =
        document
            .getElementById(
                "productStock"
            )
            .value;

    const image =
        document
            .getElementById(
                "productImage"
            )
            .value;

    const description =
        document
            .getElementById(
                "productDescription"
            )
            .value;

    if (!name) {

        alert(
            "Product name is required."
        );

        return;
    }

    /*
     * Separate admin action passcode.
     *
     * Initial passcode:
     * techzone202
     */

    const passcode =
        prompt(
            "Enter ADMIN PASSCODE to continue:"
        );

    if (
        passcode === null
    ) {
        return;
    }

    if (!passcode) {

        alert(
            "Admin passcode is required."
        );

        return;
    }

    try {

        let result;

        if (id) {

            result =
                await api(
                    "updateProduct",
                    {
                        token:
                            sessionToken,

                        id: id,

                        name: name,

                        category:
                            category,

                        price:
                            price,

                        stock:
                            stock,

                        image:
                            image,

                        description:
                            description,

                        passcode:
                            passcode
                    }
                );

        } else {

            result =
                await api(
                    "addProduct",
                    {
                        token:
                            sessionToken,

                        name: name,

                        category:
                            category,

                        price:
                            price,

                        stock:
                            stock,

                        image:
                            image,

                        description:
                            description,

                        passcode:
                            passcode
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

        await loadProducts();

        if (
            currentRole === "ADMIN"
        ) {
            await loadLogs();
        }

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =====================================================
   DELETE
===================================================== */

async function deleteProductConfirm(id) {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

    const product =
        allProducts.find(
            function(item) {

                return String(item.id)
                    === String(id);
            }
        );

    if (!product) {
        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to DELETE this product?\n\n" +
            product.name +
            "\n\nThe product will be moved to Deleted Products and can be restored."
        );

    if (!confirmed) {
        return;
    }

    const passcode =
        prompt(
            "Enter ADMIN PASSCODE to delete:"
        );

    if (
        passcode === null
    ) {
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

            alert(
                result.message
            );

            return;
        }

        alert(
            "Product deleted successfully."
        );

        await loadProducts();
        await loadDeleted();
        await loadLogs();

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =====================================================
   CATEGORIES
===================================================== */

async function loadCategories() {

    try {

        const result =
            await api(
                "getCategories"
            );

        if (
            result.success
        ) {

            allCategories =
                result.categories || [];

            renderCategories();

            populateCategorySelect();
        }

    } catch (error) {

        console.error(error);
    }
}


function renderCategories() {

    const container =
        document.getElementById(
            "categoryList"
        );

    container.innerHTML = "";

    if (!allCategories.length) {

        container.innerHTML =
            "<p>No categories yet.</p>";

        return;
    }

    allCategories.forEach(
        function(category) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "category-card";

            card.innerHTML = `

                <h3>
                    ${escapeHTML(category.name)}
                </h3>

                <p>
                    ${escapeHTML(
                        category.description || ""
                    )}
                </p>
            `;

            container.appendChild(
                card
            );
        }
    );
}


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
            "Enter ADMIN PASSCODE:"
        );

    if (
        passcode === null
    ) {
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
                        name,

                    description:
                        description,

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

        alert(
            result.message
        );

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

        closeCategoryModal();

        await loadCategories();
        await loadLogs();

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =====================================================
   USERS
===================================================== */

async function loadUsers() {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

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

            alert(
                result.message
            );

            return;
        }

        const table =
            document.getElementById(
                "usersTable"
            );

        table.innerHTML = "";

        result.users.forEach(
            function(user) {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${escapeHTML(user.name)}
                    </td>

                    <td>
                        ${escapeHTML(user.email)}
                    </td>

                    <td>
                        ${escapeHTML(user.role)}
                    </td>

                    <td>
                        ${escapeHTML(user.status)}
                    </td>

                    <td>
                        ${escapeHTML(user.createdAt)}
                    </td>

                    <td>
                        ${escapeHTML(
                            user.lastLogin || "-"
                        )}
                    </td>
                `;

                table.appendChild(
                    row
                );
            }
        );

    } catch (error) {

        console.error(error);
    }
}


/* =====================================================
   ACTIVITY LOGS
===================================================== */

async function loadLogs() {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

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

            return;
        }

        const table =
            document.getElementById(
                "logsTable"
            );

        table.innerHTML = "";

        result.logs.forEach(
            function(log) {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${escapeHTML(log.timestamp)}
                    </td>

                    <td>
                        ${escapeHTML(log.email)}
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
                        ${escapeHTML(log.module)}
                    </td>

                    <td>
                        ${escapeHTML(log.details)}
                    </td>
                `;

                table.appendChild(
                    row
                );
            }
        );

    } catch (error) {

        console.error(error);
    }
}


/* =====================================================
   RESTORE
===================================================== */

async function loadDeleted() {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

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
            return;
        }

        const table =
            document.getElementById(
                "restoreTable"
            );

        table.innerHTML = "";

        result.products.forEach(
            function(product) {

                const row =
                    document.createElement(
                        "tr"
                    );

                let action =
                    "-";

                if (
                    product.restoreStatus
                    === "DELETED"
                ) {

                    action = `
                        <button
                            class="small-btn restore-btn"
                            onclick="restoreProductConfirm('${escapeJS(product.id)}')"
                        >
                            Restore
                        </button>
                    `;
                }

                row.innerHTML = `

                    <td>
                        ${escapeHTML(product.name)}
                    </td>

                    <td>
                        ${escapeHTML(product.category)}
                    </td>

                    <td>
                        ₱${Number(product.price).toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2
                            }
                        )}
                    </td>

                    <td>
                        ${product.stock}
                    </td>

                    <td>
                        ${escapeHTML(product.deletedBy)}
                    </td>

                    <td>
                        ${escapeHTML(product.deletedAt)}
                    </td>

                    <td>
                        ${action}
                    </td>
                `;

                table.appendChild(
                    row
                );
            }
        );

    } catch (error) {

        console.error(error);
    }
}


async function restoreProductConfirm(id) {

    const confirmed =
        confirm(
            "Restore this product?"
        );

    if (!confirmed) {
        return;
    }

    const passcode =
        prompt(
            "Enter ADMIN PASSCODE to restore:"
        );

    if (
        passcode === null
    ) {
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

        if (!result.success) {

            alert(
                result.message
            );

            return;
        }

        alert(
            result.message
        );

        await loadProducts();
        await loadDeleted();
        await loadLogs();

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =====================================================
   REPORTS
===================================================== */

async function loadReports() {

    if (
        currentRole !== "ADMIN"
    ) {
        return;
    }

    try {

        const result =
            await api(
                "getReports",
                {
                    token:
                        sessionToken
                }
            );

        if (!result.success) {
            return;
        }

        const r =
            result.reports;

        document
            .getElementById(
                "reportsContent"
            )
            .innerHTML = `

                <div class="stat-card">

                    <span>
                        Total Products
                    </span>

                    <strong>
                        ${r.totalProducts}
                    </strong>

                </div>

                <div class="stat-card">

                    <span>
                        Total Stock
                    </span>

                    <strong>
                        ${r.totalStock}
                    </strong>

                </div>

                <div class="stat-card">

                    <span>
                        Customers
                    </span>

                    <strong>
                        ${r.customers}
                    </strong>

                </div>

                <div class="stat-card">

                    <span>
                        Inventory Value
                    </span>

                    <strong>
                        ₱${Number(
                            r.inventoryValue
                        ).toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2
                            }
                        )}
                    </strong>

                </div>
            `;

    } catch (error) {

        console.error(error);
    }
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalProducts =
        allProducts.length;

    let totalStock = 0;
    let totalValue = 0;

    allProducts.forEach(
        function(product) {

            totalStock +=
                Number(product.stock) || 0;

            totalValue +=
                (
                    Number(product.price) || 0
                ) *
                (
                    Number(product.stock) || 0
                );
        }
    );

    document
        .getElementById(
            "statProducts"
        )
        .textContent =
        totalProducts;

    document
        .getElementById(
            "statStock"
        )
        .textContent =
        totalStock;

    document
        .getElementById(
            "statValue"
        )
        .textContent =
        "₱" +
        totalValue.toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2
            }
        );

    if (
        currentRole === "ADMIN"
    ) {

        loadReports();
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function confirmLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to log out?"
        );

    if (!confirmed) {
        return;
    }

    performLogout();
}


async function performLogout() {

    try {

        await api(
            "logout",
            {
                token:
                    sessionToken,

                role:
                    currentRole,

                email:
                    currentEmail
            }
        );

    } catch (error) {

        console.error(error);
    }

    sessionToken = "";
    currentRole = "";
    currentEmail = "";
    currentName = "";

    document
        .getElementById(
            "app"
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

    backToChoice();

    document
        .getElementById(
            "adminPassword"
        )
        .value = "";

    document
        .getElementById(
            "adminOtp"
        )
        .value = "";

    document
        .getElementById(
            "customerPassword"
        )
        .value = "";

    document
        .getElementById(
            "customerOtp"
        )
        .value = "";

    showMessage(
        "You have been logged out."
    );
}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    message,
    error = false
) {

    const element =
        document.getElementById(
            "message"
        );

    element.textContent =
        message;

    element.style.color =
        error
            ? "#d9363e"
            : "#168a45";
}


function clearMessage() {

    document
        .getElementById(
            "message"
        )
        .textContent = "";
}


/* =====================================================
   SECURITY HELPERS
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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

    return String(
        value ?? ""
    )
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
    );
}
