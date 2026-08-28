/******************************************************
 * TECHZONE STORE
 * FRONTEND JAVASCRIPT
 ******************************************************/

/*
========================================================
GOOGLE APPS SCRIPT WEB APP URL
========================================================
*/

const APP_URL =
    "https://script.google.com/macros/s/AKfycbzIZamJvTQdXDaKsSzaIIcBh_arDRfsBI671kA3cSKXnIDQ4JfFNIGEwPV_Oq2ePU_XtA/exec";


/*
========================================================
GLOBAL VARIABLES
========================================================
*/

let currentUser = "";
let currentRole = "";

let products = [];
let categories = [];
let users = [];
let activityLogs = [];
let deletedProducts = [];

let pendingAction = null;
let pendingActionData = null;


/*
========================================================
API
========================================================
*/

async function api(
    action,
    data = {}
) {

    if (
        !APP_URL ||
        APP_URL ===
        "PASTE_YOUR_WEB_APP_URL_HERE"
    ) {

        throw new Error(
            "APP_URL is not configured in script.js."
        );

    }


    try {

        const response =
            await fetch(
                APP_URL,
                {

                    method: "POST",

                    redirect: "follow",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                action,

                            ...data

                        })

                }
            );


        const text =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(text);

        } catch (error) {

            console.error(
                "Server response:",
                text
            );

            throw new Error(
                "Invalid server response."
            );

        }


        return result;


    } catch (error) {

        console.error(error);


        throw new Error(
            "Cannot connect to Google Apps Script. " +
            error.message
        );

    }

}


/*
========================================================
MESSAGE
========================================================
*/

function showMessage(
    text,
    success = false
) {

    const message =
        document.getElementById(
            "message"
        );


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.style.color =
        success
            ? "#16803c"
            : "#d9363e";

}


/*
========================================================
HIDE LOGIN FORMS
========================================================
*/

function hideLoginForms() {

    [

        "loginType",

        "adminLoginForm",

        "adminOTPForm",

        "customerLoginForm",

        "customerOTPForm",

        "customerRegisterForm",

        "registerOTPForm"

    ].forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/*
========================================================
LOGIN TYPE
========================================================
*/

function backToLoginType() {

    hideLoginForms();


    document
        .getElementById(
            "loginType"
        )
        .classList.remove(
            "hidden"
        );


    showMessage("");

}


function showAdminLogin() {

    hideLoginForms();


    document
        .getElementById(
            "adminLoginForm"
        )
        .classList.remove(
            "hidden"
        );


    showMessage("");

}


function showCustomerLogin() {

    hideLoginForms();


    document
        .getElementById(
            "customerLoginForm"
        )
        .classList.remove(
            "hidden"
        );


    showMessage("");

}


function showCustomerRegister() {

    hideLoginForms();


    document
        .getElementById(
            "customerRegisterForm"
        )
        .classList.remove(
            "hidden"
        );


    showMessage("");

}


/*
========================================================
ADMIN OTP
========================================================
*/

async function requestAdminOTP(
    event
) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;


    showMessage(
        "Sending OTP...",
        true
    );


    try {

        const result =
            await api(

                "adminRequestOTP",

                {
                    email,
                    password
                }

            );


        if (!result.success) {

            showMessage(
                result.message
            );

            return;

        }


        document
            .getElementById(
                "adminLoginForm"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "adminOTPForm"
            )
            .classList.remove(
                "hidden"
            );


        showMessage(
            "OTP sent to admin Gmail.",
            true
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


async function verifyAdminOTP(
    event
) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();


    const otp =
        document
            .getElementById(
                "adminOTP"
            )
            .value
            .trim();


    showMessage(
        "Verifying OTP...",
        true
    );


    try {

        const result =
            await api(

                "adminVerifyOTP",

                {
                    email,
                    otp
                }

            );


        if (!result.success) {

            showMessage(
                result.message
            );

            return;

        }


        loginSuccess(
            result.user,
            "ADMIN"
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/*
========================================================
CUSTOMER REGISTER
========================================================
*/

async function requestCustomerRegisterOTP(
    event
) {

    event.preventDefault();


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


    showMessage(
        "Sending registration OTP...",
        true
    );


    try {

        const result =
            await api(

                "customerRegisterOTP",

                {
                    name,
                    email,
                    password
                }

            );


        if (!result.success) {

            showMessage(
                result.message
            );

            return;

        }


        document
            .getElementById(
                "customerRegisterForm"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "registerOTPForm"
            )
            .classList.remove(
                "hidden"
            );


        showMessage(
            "OTP sent to your Gmail.",
            true
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


async function verifyCustomerRegisterOTP(
    event
) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "registerEmail"
            )
            .value
            .trim();


    const otp =
        document
            .getElementById(
                "registerOTP"
            )
            .value
            .trim();


    showMessage(
        "Creating account...",
        true
    );


    try {

        const result =
            await api(

                "customerRegister",

                {
                    email,
                    otp
                }

            );


        if (!result.success) {

            showMessage(
                result.message
            );

            return;

        }


        alert(
            "Account created successfully!"
        );


        showCustomerLogin();


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/*
========================================================
CUSTOMER LOGIN
========================================================
*/

async function requestCustomerOTP(
    event
) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "customerLoginEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "customerLoginPassword"
            )
            .value;


    showMessage(
        "Sending customer OTP...",
        true
    );


    try {

        const result =
            await api(

                "customerLoginOTP",

                {
                    email,
                    password
                }

            );


        if (!result.success) {

            showMessage(
                result.message
            );

            return;

        }


        document
            .getElementById(
                "customerLoginForm"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "customerOTPForm"
            )
            .classList.remove(
                "hidden"
            );


        showMessage(
            "OTP sent to your Gmail.",
            true
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


async function verifyCustomerOTP(
    event
) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "customerLoginEmail"
            )
            .value
            .trim();


    const otp =
        document
            .getElementById(
                "customerOTP"
            )
            .value
            .trim();


    showMessage(
        "Verifying OTP...",
        true
    );


    try {

        const result =
            await api(

                "customerVerifyOTP",

                {
                    email,
                    otp
                }

            );


        if (!result.success) {

            showMessage(
                result.message
            );

            return;

        }


        loginSuccess(
            result.user,
            "CUSTOMER"
        );


    } catch (error) {

        showMessage(
            error.message
        );

    }

}


/*
========================================================
LOGIN SUCCESS
========================================================
*/

function loginSuccess(
    user,
    role
) {

    currentUser =
        user;

    currentRole =
        role;


    document
        .getElementById(
            "loginPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "appPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "currentUser"
        )
        .textContent =
        user;


    document
        .getElementById(
            "currentRole"
        )
        .textContent =
        role;


    configureRole();


    /*
    IMPORTANT:
    CUSTOMER -> PRODUCTS
    ADMIN -> DASHBOARD
    */

    if (
        role === "CUSTOMER"
    ) {

        showSection(
            "products"
        );

    } else {

        showSection(
            "dashboard"
        );

    }


    loadAllData();

}


/*
========================================================
ROLE CONFIGURATION
========================================================
*/

function configureRole() {

    const admin =
        currentRole ===
        "ADMIN";


    document
        .getElementById(
            "usersMenu"
        )
        .classList.toggle(
            "hidden",
            !admin
        );


    document
        .getElementById(
            "activityMenu"
        )
        .classList.toggle(
            "hidden",
            !admin
        );


    document
        .getElementById(
            "deletedMenu"
        )
        .classList.toggle(
            "hidden",
            !admin
        );


    document
        .getElementById(
            "reportsMenu"
        )
        .classList.toggle(
            "hidden",
            !admin
        );


    document
        .getElementById(
            "addProductButton"
        )
        .classList.toggle(
            "hidden",
            !admin
        );


    document
        .getElementById(
            "addCategoryButton"
        )
        .classList.toggle(
            "hidden",
            !admin
        );

}


/*
========================================================
LOAD ALL DATA
========================================================
*/

async function loadAllData() {

    await loadProducts();

    await loadCategories();

    await loadDashboard();


    if (
        currentRole ===
        "ADMIN"
    ) {

        await loadUsers();

        await loadActivityLogs();

        await loadDeletedProducts();

    }

}


/*
========================================================
SECTION
========================================================
*/

function showSection(
    section
) {

    document
        .querySelectorAll(
            ".app-section"
        )
        .forEach(
            function(el) {

                el.classList.add(
                    "hidden"
                );

            }
        );


    const target =
        document.getElementById(
            section +
            "Section"
        );


    if (target) {

        target.classList.remove(
            "hidden"
        );

    }


    if (
        section ===
        "products"
    ) {

        loadProducts();

    }


    if (
        section ===
        "categories"
    ) {

        loadCategories();

    }


    if (
        section ===
        "users" &&
        currentRole ===
        "ADMIN"
    ) {

        loadUsers();

    }


    if (
        section ===
        "activity" &&
        currentRole ===
        "ADMIN"
    ) {

        loadActivityLogs();

    }


    if (
        section ===
        "deleted" &&
        currentRole ===
        "ADMIN"
    ) {

        loadDeletedProducts();

    }


    if (
        section ===
        "reports" &&
        currentRole ===
        "ADMIN"
    ) {

        loadDashboard();

    }

}


/*
========================================================
DASHBOARD
========================================================
*/

async function loadDashboard() {

    try {

        const result =
            await api(
                "getDashboard"
            );


        if (!result.success) {
            return;
        }


        const stats =
            result.stats;


        document
            .getElementById(
                "statProducts"
            )
            .textContent =
            stats.products;


        document
            .getElementById(
                "statCategories"
            )
            .textContent =
            stats.categories;


        document
            .getElementById(
                "statCustomers"
            )
            .textContent =
            stats.customers;


        document
            .getElementById(
                "statStock"
            )
            .textContent =
            stats.stock;


        document
            .getElementById(
                "statDeleted"
            )
            .textContent =
            stats.deleted;


        document
            .getElementById(
                "reportProducts"
            )
            .textContent =
            stats.products;


        document
            .getElementById(
                "reportCategories"
            )
            .textContent =
            stats.categories;


        document
            .getElementById(
                "reportCustomers"
            )
            .textContent =
            stats.customers;


        document
            .getElementById(
                "reportStock"
            )
            .textContent =
            stats.stock;


        document
            .getElementById(
                "reportDeleted"
            )
            .textContent =
            stats.deleted;


    } catch (error) {

        console.error(error);

    }

}


/*
========================================================
PRODUCTS
========================================================
*/

async function loadProducts() {

    try {

        const result =
            await api(

                "getProducts",

                {
                    role:
                        currentRole
                }

            );


        if (!result.success) {

            console.error(
                result.message
            );

            return;

        }


        products =
            result.products ||
            [];


        renderProducts();


    } catch (error) {

        console.error(error);

    }

}


/*
========================================================
RENDER PRODUCTS
========================================================
*/

function renderProducts() {

    const grid =
        document.getElementById(
            "productGrid"
        );


    if (!grid) {
        return;
    }


    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const categoryFilter =
        document.getElementById(
            "productCategoryFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "";


    const filtered =
        products.filter(
            function(product) {

                const matchesSearch =
                    String(
                        product.Name
                    )
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesCategory =
                    !category ||
                    String(
                        product.Category
                    ) === category;


                return (

                    matchesSearch &&
                    matchesCategory

                );

            }
        );


    if (
        filtered.length === 0
    ) {

        grid.innerHTML =

            "<div class='stat-card'>" +

            (

                currentRole ===
                "CUSTOMER"

                    ? "No available products."

                    : "No products found."

            ) +

            "</div>";


        return;

    }


    grid.innerHTML =

        filtered

            .map(
                function(product) {


                    const image =
                        product.Image ||

                        "https://via.placeholder.com/500x300?text=TechZone";


                    const adminButtons =

                        currentRole ===
                        "ADMIN"

                            ?

                            `

                            <button
                                class="btn outline"
                                onclick="editProduct('${escapeHtml(product.ID)}')"
                            >
                                UPDATE
                            </button>

                            <button
                                class="btn"
                                style="background:#d9363e;color:white"
                                onclick="askDeleteProduct('${escapeHtml(product.ID)}')"
                            >
                                DELETE
                            </button>

                            `

                            :

                            "";


                    return `

                        <div class="product-card">

                            <img
                                src="${escapeHtml(image)}"
                                onerror="this.src='https://via.placeholder.com/500x300?text=TechZone'"
                            >

                            <div class="product-info">

                                <h3>
                                    ${escapeHtml(
                                        product.Name
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        product.Category
                                    )}
                                </p>

                                <p>
                                    ${escapeHtml(
                                        product.Description || ""
                                    )}
                                </p>

                                <div class="price">
                                    ₱${Number(
                                        product.Price || 0
                                    ).toLocaleString()}
                                </div>

                                <div class="stock">
                                    Stock:
                                    ${escapeHtml(
                                        product.Stock
                                    )}
                                </div>

                                <div class="product-actions">

                                    ${adminButtons}

                                </div>

                            </div>

                        </div>

                    `;

                }
            )

            .join("");

}


/*
========================================================
CATEGORIES
========================================================
*/

async function loadCategories() {

    try {

        const result =
            await api(
                "getCategories"
            );


        if (!result.success) {
            return;
        }


        categories =
            result.categories ||
            [];


        renderCategories();

        populateCategorySelects();


    } catch (error) {

        console.error(error);

    }

}


function renderCategories() {

    const list =
        document.getElementById(
            "categoryList"
        );


    if (!list) {
        return;
    }


    if (
        categories.length ===
        0
    ) {

        list.innerHTML =
            "<div class='stat-card'>" +
            "No categories." +
            "</div>";

        return;

    }


    list.innerHTML =

        categories

            .map(
                function(category) {

                    return `

                        <div class="category-card">

                            🗂
                            ${escapeHtml(
                                category.Name
                            )}

                        </div>

                    `;

                }
            )

            .join("");

}


function populateCategorySelects() {

    const select =
        document.getElementById(
            "productCategory"
        );


    const filter =
        document.getElementById(
            "productCategoryFilter"
        );


    if (!select || !filter) {
        return;
    }


    select.innerHTML =

        categories

            .map(
                function(category) {

                    return `

                        <option
                            value="${escapeHtml(
                                category.Name
                            )}"
                        >
                            ${escapeHtml(
                                category.Name
                            )}
                        </option>

                    `;

                }
            )

            .join("");


    filter.innerHTML =

        `

        <option value="">
            All Categories
        </option>

        ` +

        categories

            .map(
                function(category) {

                    return `

                        <option
                            value="${escapeHtml(
                                category.Name
                            )}"
                        >
                            ${escapeHtml(
                                category.Name
                            )}
                        </option>

                    `;

                }
            )

            .join("");

}


/*
========================================================
CATEGORY MODAL
========================================================
*/

function openCategoryModal() {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    document
        .getElementById(
            "categoryName"
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


function closeCategoryModal() {

    document
        .getElementById(
            "categoryModal"
        )
        .classList.add(
            "hidden"
        );

}


function saveCategory() {

    const name =
        document
            .getElementById(
                "categoryName"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "Enter category name."
        );

        return;

    }


    requestPasscode(

        "addCategory",

        {
            name:
                name
        }

    );

}


/*
========================================================
PRODUCT MODAL
========================================================
*/

function openProductModal() {

    if (
        currentRole !==
        "ADMIN"
    ) {

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
            "productDescription"
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
            "productModal"
        )
        .classList.remove(
            "hidden"
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


function editProduct(id) {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    const product =
        products.find(
            function(p) {

                return (

                    String(p.ID) ===
                    String(id)

                );

            }
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


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
        product.ID;


    document
        .getElementById(
            "productName"
        )
        .value =
        product.Name;


    document
        .getElementById(
            "productCategory"
        )
        .value =
        product.Category;


    document
        .getElementById(
            "productDescription"
        )
        .value =
        product.Description ||
        "";


    document
        .getElementById(
            "productPrice"
        )
        .value =
        product.Price;


    document
        .getElementById(
            "productStock"
        )
        .value =
        product.Stock;


    document
        .getElementById(
            "productImage"
        )
        .value =
        product.Image ||
        "";


    document
        .getElementById(
            "productModal"
        )
        .classList.remove(
            "hidden"
        );

}


function saveProduct() {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    const id =
        document
            .getElementById(
                "productId"
            )
            .value;


    const product = {

        id:
            id,

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

        description:

            document
                .getElementById(
                    "productDescription"
                )
                .value
                .trim(),

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

        image:

            document
                .getElementById(
                    "productImage"
                )
                .value
                .trim()

    };


    if (!product.name) {

        alert(
            "Product name is required."
        );

        return;

    }


    requestPasscode(

        id
            ? "updateProduct"
            : "addProduct",

        product

    );

}


/*
========================================================
DELETE
========================================================
*/

function askDeleteProduct(id) {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    const product =
        products.find(
            function(p) {

                return (

                    String(p.ID) ===
                    String(id)

                );

            }
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(

            "Are you sure you want to delete " +

            product.Name +

            "?"

        );


    if (!confirmed) {
        return;
    }


    requestPasscode(

        "deleteProduct",

        {
            id:
                id
        }

    );

}


/*
========================================================
PASSCODE
========================================================
*/

function requestPasscode(
    action,
    data
) {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    pendingAction =
        action;


    pendingActionData =
        data;


    document
        .getElementById(
            "adminPasscode"
        )
        .value = "";


    document
        .getElementById(
            "passcodeModal"
        )
        .classList.remove(
            "hidden"
        );

}


function closePasscodeModal() {

    pendingAction =
        null;


    pendingActionData =
        null;


    document
        .getElementById(
            "passcodeModal"
        )
        .classList.add(
            "hidden"
        );

}


/*
========================================================
SUBMIT PASSCODE
========================================================
*/

async function submitPasscode() {

    const passcode =
        document
            .getElementById(
                "adminPasscode"
            )
            .value;


    if (!passcode) {

        alert(
            "Enter admin passcode."
        );

        return;

    }


    const action =
        pendingAction;


    const data =
        pendingActionData ||
        {};


    closePasscodeModal();


    try {

        const result =
            await api(

                action,

                {

                    ...data,

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


        closeProductModal();

        closeCategoryModal();


        await loadAllData();


    } catch (error) {

        alert(
            error.message
        );

    }

}


/*
========================================================
DELETED PRODUCTS
========================================================
*/

async function loadDeletedProducts() {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    try {

        const result =
            await api(
                "getDeletedProducts"
            );


        if (!result.success) {
            return;
        }


        deletedProducts =
            result.products ||
            [];


        renderDeletedProducts();


    } catch (error) {

        console.error(error);

    }

}


function renderDeletedProducts() {

    const container =
        document.getElementById(
            "deletedList"
        );


    if (!container) {
        return;
    }


    if (
        deletedProducts.length ===
        0
    ) {

        container.innerHTML =
            "<div class='stat-card'>" +
            "No deleted products." +
            "</div>";

        return;

    }


    container.innerHTML =

        deletedProducts

            .map(
                function(product) {

                    const image =
                        product.Image ||

                        "https://via.placeholder.com/500x300?text=Deleted";


                    return `

                        <div class="product-card">

                            <img
                                src="${escapeHtml(
                                    image
                                )}"
                                onerror="this.src='https://via.placeholder.com/500x300?text=Deleted'"
                            >

                            <div class="product-info">

                                <h3>
                                    ${escapeHtml(
                                        product.Name
                                    )}
                                </h3>

                                <p>
                                    Category:
                                    ${escapeHtml(
                                        product.Category
                                    )}
                                </p>

                                <p>
                                    Deleted by:
                                    ${escapeHtml(
                                        product.DeletedBy
                                    )}
                                </p>

                                <p>
                                    Deleted:
                                    ${escapeHtml(
                                        product.DeletedAt
                                    )}
                                </p>

                                <div class="product-actions">

                                    <button
                                        class="btn primary"
                                        onclick="restoreDeletedProduct('${escapeHtml(product.ID)}')"
                                    >
                                        RESTORE
                                    </button>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )

            .join("");

}


/*
========================================================
RESTORE
========================================================
*/

function restoreDeletedProduct(
    id
) {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Restore this product?"
        );


    if (!confirmed) {
        return;
    }


    requestPasscode(

        "restoreProduct",

        {
            deletedId:
                id
        }

    );

}


/*
========================================================
USERS
========================================================
*/

async function loadUsers() {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    try {

        const result =
            await api(
                "getUsers"
            );


        if (!result.success) {
            return;
        }


        users =
            result.users ||
            [];


        const tbody =
            document
                .getElementById(
                    "usersTable"
                );


        tbody.innerHTML =

            users

                .map(
                    function(user) {

                        return `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        user.Name
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.Email
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.Role
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.Verified
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.CreatedAt
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.LastLogin ||
                                        "-"
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                )

                .join("");


    } catch (error) {

        console.error(error);

    }

}


/*
========================================================
ACTIVITY LOGS
========================================================
*/

async function loadActivityLogs() {

    if (
        currentRole !==
        "ADMIN"
    ) {

        return;

    }


    try {

        const result =
            await api(
                "getActivityLogs"
            );


        if (!result.success) {
            return;
        }


        activityLogs =
            result.logs ||
            [];


        const tbody =
            document
                .getElementById(
                    "activityTable"
                );


        tbody.innerHTML =

            activityLogs

                .map(
                    function(log) {

                        return `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        log.DateTime
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        log.User
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        log.Role
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        log.Action
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        log.Details
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        log.Status
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                )

                .join("");


    } catch (error) {

        console.error(error);

    }

}


/*
========================================================
LOGOUT
========================================================
*/

function confirmLogout() {

    const confirmed =
        confirm(
            "Do you want to log out?"
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

                email:
                    currentUser,

                role:
                    currentRole

            }

        );


    } catch (error) {

        console.error(error);

    }


    currentUser =
        "";

    currentRole =
        "";


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


    hideLoginForms();


    document
        .getElementById(
            "loginType"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "adminPassword"
        )
        .value =
        "";


    document
        .getElementById(
            "adminOTP"
        )
        .value =
        "";


    document
        .getElementById(
            "customerLoginPassword"
        )
        .value =
        "";


    document
        .getElementById(
            "customerOTP"
        )
        .value =
        "";


    showMessage(
        "You have logged out."
    );

}


/*
========================================================
ESCAPE HTML
========================================================
*/

function escapeHtml(
    value
) {

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


/*
========================================================
STARTUP
========================================================
*/

window.addEventListener(

    "DOMContentLoaded",

    function() {

        console.log(
            "TechZone Store frontend loaded."
        );


        console.log(
            "APP_URL:",
            APP_URL
        );

    }

);
