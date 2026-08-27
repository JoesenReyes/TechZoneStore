// ======================================================
// TECHZONE STORE
// FRONTEND JAVASCRIPT
// ======================================================

// ======================================================
// GOOGLE APPS SCRIPT API
// ======================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbxAxfswlsbGlr5dofhk_vayxsuH_P_cMjl4ySAlloBqalMiKY_LmGfWvCrobRT-d3j2Xg/exec";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let customerRegistrationData = null;
let customerLoginData = null;

let productsCache = [];
let customersCache = [];

let pendingProductAction = null;


// ======================================================
// DOM READY
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    selectLoginType("customer");

    // Allow Enter key on customer login
    document
        .getElementById("customerPassword")
        ?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                startCustomerLoginOTP();
            }
        });

    // Allow Enter key on registration confirm
    document
        .getElementById("registerConfirm")
        ?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                startCustomerRegistrationOTP();
            }
        });

    // OTP input: numbers only
    document
        .getElementById("customerOTP")
        ?.addEventListener("input", (event) => {
            event.target.value =
                event.target.value.replace(/\D/g, "").slice(0, 6);
        });

    document
        .getElementById("adminOTP")
        ?.addEventListener("input", (event) => {
            event.target.value =
                event.target.value.replace(/\D/g, "").slice(0, 6);
        });

    showLogin();
});


// ======================================================
// API HELPER
// ======================================================

async function apiRequest(payload) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });

    const text = await response.text();

    let result;

    try {
        result = JSON.parse(text);
    } catch (error) {
        console.error("Invalid API response:", text);
        throw new Error("Invalid response from server.");
    }

    return result;
}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(message, type = "info") {

    const box = document.getElementById("message");

    if (!box) return;

    if (!message) {
        box.textContent = "";
        box.className = "";
        return;
    }

    box.textContent = message;
    box.className = "message " + type;
}


// ======================================================
// LOGIN TYPE
// ======================================================

function selectLoginType(type) {

    const customerTab =
        document.getElementById("customerTab");

    const adminTab =
        document.getElementById("adminTab");

    const customerLogin =
        document.getElementById("customerLogin");

    const adminLoginBox =
        document.getElementById("adminLogin");

    const registerPage =
        document.getElementById("registerPage");

    if (type === "customer") {

        customerTab?.classList.add("active");
        adminTab?.classList.remove("active");

        customerLogin?.classList.remove("hidden");
        adminLoginBox?.classList.add("hidden");
        registerPage?.classList.add("hidden");

    } else {

        customerTab?.classList.remove("active");
        adminTab?.classList.add("active");

        customerLogin?.classList.add("hidden");
        adminLoginBox?.classList.remove("hidden");
        registerPage?.classList.add("hidden");
    }

    showMessage("", "info");
}


// ======================================================
// SHOW LOGIN
// ======================================================

function showLogin() {

    const customerLogin =
        document.getElementById("customerLogin");

    const adminLoginBox =
        document.getElementById("adminLogin");

    const registerPage =
        document.getElementById("registerPage");

    const customerTab =
        document.getElementById("customerTab");

    const adminTab =
        document.getElementById("adminTab");

    customerLogin?.classList.remove("hidden");
    adminLoginBox?.classList.add("hidden");
    registerPage?.classList.add("hidden");

    customerTab?.classList.add("active");
    adminTab?.classList.remove("active");

    showMessage("", "info");
}


// ======================================================
// SHOW REGISTER
// ======================================================

function showRegister() {

    const customerLogin =
        document.getElementById("customerLogin");

    const adminLoginBox =
        document.getElementById("adminLogin");

    const registerPage =
        document.getElementById("registerPage");

    customerLogin?.classList.add("hidden");
    adminLoginBox?.classList.add("hidden");
    registerPage?.classList.remove("hidden");

    showMessage("", "info");
}


// ======================================================
// CUSTOMER REGISTRATION
// ======================================================

async function startCustomerRegistrationOTP() {

    const name =
        document.getElementById("registerName")?.value.trim() || "";

    const email =
        document.getElementById("registerEmail")?.value.trim().toLowerCase() || "";

    const password =
        document.getElementById("registerPassword")?.value || "";

    const confirmPassword =
        document.getElementById("registerConfirm")?.value || "";


    // Required fields
    if (!name || !email || !password || !confirmPassword) {

        showMessage(
            "Please complete all fields.",
            "error"
        );

        return;
    }


    // Gmail only
    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {

        showMessage(
            "Please use a valid Gmail address.",
            "error"
        );

        return;
    }


    // Password length
    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }


    // Confirm password
    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    // Save registration data before OTP
    customerRegistrationData = {
        fullName: name,
        email: email,
        password: password
    };


    try {

        showMessage(
            "Sending OTP to your Gmail...",
            "info"
        );


        const result = await apiRequest({
            action: "sendCustomerOTP",
            email: email,
            purpose: "registration"
        });


        if (!result.success) {

            showMessage(
                result.message || "Unable to send OTP.",
                "error"
            );

            return;
        }


        document.getElementById(
            "customerOtpInfo"
        ).textContent =
            "A 6-digit OTP has been sent to " + email;


        document.getElementById(
            "customerOTP"
        ).value = "";


        document.getElementById(
            "customerOtpMessage"
        ).textContent = "";


        document.getElementById(
            "customerOtpModal"
        ).classList.remove("hidden");


        document.getElementById(
            "customerOTP"
        ).focus();


        showMessage("", "info");

    } catch (error) {

        console.error(
            "Registration OTP error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to connect to the server.",
            "error"
        );
    }
}


// ======================================================
// VERIFY CUSTOMER OTP
// ======================================================

async function verifyCustomerOTP() {

    const otp =
        document.getElementById("customerOTP")?.value.trim() || "";

    const message =
        document.getElementById("customerOtpMessage");


    if (!customerRegistrationData) {

        if (message) {
            message.textContent =
                "Registration session expired. Please try again.";
        }

        return;
    }


    if (!/^\d{6}$/.test(otp)) {

        if (message) {
            message.textContent =
                "OTP must be 6 digits.";
        }

        return;
    }


    try {

        if (message) {
            message.textContent =
                "Verifying OTP...";
        }


        const verifyResult = await apiRequest({
            action: "verifyCustomerOTP",
            email: customerRegistrationData.email,
            otp: otp,
            purpose: "registration"
        });


        if (!verifyResult.success) {

            if (message) {
                message.textContent =
                    verifyResult.message ||
                    "Invalid OTP.";
            }

            return;
        }


        // OTP verified:
        // Create customer account with the SAME fields
        // expected by registerCustomer().
        const registerResult = await apiRequest({

            action: "registerCustomer",

            fullName:
                customerRegistrationData.fullName,

            email:
                customerRegistrationData.email,

            password:
                customerRegistrationData.password
        });


        if (!registerResult.success) {

            if (message) {
                message.textContent =
                    registerResult.message ||
                    "Unable to create account.";
            }

            return;
        }


        // Close OTP
        closeCustomerOtpModal();


        // Clear registration fields
        document.getElementById(
            "registerName"
        ).value = "";

        document.getElementById(
            "registerEmail"
        ).value = "";

        document.getElementById(
            "registerPassword"
        ).value = "";

        document.getElementById(
            "registerConfirm"
        ).value = "";


        customerRegistrationData = null;


        // Return to login
        showLogin();


        showMessage(
            "Account created successfully. You can now login.",
            "success"
        );

    } catch (error) {

        console.error(
            "Customer registration error:",
            error
        );

        if (message) {
            message.textContent =
                error.message ||
                "Unable to connect to the server.";
        }
    }
}


// ======================================================
// CLOSE CUSTOMER OTP MODAL
// ======================================================

function closeCustomerOtpModal() {

    document
        .getElementById("customerOtpModal")
        ?.classList.add("hidden");

    const message =
        document.getElementById("customerOtpMessage");

    if (message) {
        message.textContent = "";
    }
}


// ======================================================
// RESEND CUSTOMER OTP
// ======================================================

async function resendCustomerOTP() {

    if (!customerRegistrationData) {

        return;
    }


    const message =
        document.getElementById("customerOtpMessage");


    try {

        if (message) {
            message.textContent =
                "Sending new OTP...";
        }


        const result = await apiRequest({

            action: "sendCustomerOTP",

            email:
                customerRegistrationData.email,

            purpose:
                "registration"
        });


        if (message) {
            message.textContent =
                result.message ||
                "OTP sent successfully.";
        }

    } catch (error) {

        console.error(error);

        if (message) {
            message.textContent =
                "Unable to resend OTP.";
        }
    }
}


// ======================================================
// CUSTOMER LOGIN - START OTP
// ======================================================

async function startCustomerLoginOTP() {

    const email =
        document.getElementById("customerEmail")?.value.trim().toLowerCase() || "";

    const password =
        document.getElementById("customerPassword")?.value || "";


    if (!email || !password) {

        showMessage(
            "Enter Gmail and password.",
            "error"
        );

        return;
    }


    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {

        showMessage(
            "Please use a valid Gmail address.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "Checking your account...",
            "info"
        );


        // Check credentials first.
        // The backend does NOT send OTP here.
        const loginResult = await apiRequest({

            action: "customerLogin",

            email: email,

            password: password
        });


        if (!loginResult.success) {

            showMessage(
                loginResult.message ||
                "Incorrect Gmail or password.",
                "error"
            );

            return;
        }


        customerLoginData = {

            email: email,

            password: password,

            customer:
                loginResult.customer || null
        };


        // Send login OTP
        const otpResult = await apiRequest({

            action: "sendCustomerOTP",

            email: email,

            purpose: "login"
        });


        if (!otpResult.success) {

            customerLoginData = null;

            showMessage(
                otpResult.message ||
                "Unable to send login OTP.",
                "error"
            );

            return;
        }


        document.getElementById(
            "customerOtpInfo"
        ).textContent =
            "A 6-digit login OTP has been sent to " + email;


        document.getElementById(
            "customerOTP"
        ).value = "";


        document.getElementById(
            "customerOtpMessage"
        ).textContent = "";


        document.getElementById(
            "customerOtpModal"
        ).classList.remove("hidden");


        document.getElementById(
            "customerOTP"
        ).focus();


        showMessage("", "info");

    } catch (error) {

        console.error(
            "Customer login OTP error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to connect to the server.",
            "error"
        );
    }
}


// ======================================================
// VERIFY CUSTOMER LOGIN OTP
// ======================================================

async function verifyCustomerLoginOTP() {

    if (!customerLoginData) {
        return;
    }


    const otp =
        document.getElementById("customerOTP")?.value.trim() || "";

    const message =
        document.getElementById("customerOtpMessage");


    if (!/^\d{6}$/.test(otp)) {

        if (message) {
            message.textContent =
                "OTP must be 6 digits.";
        }

        return;
    }


    try {

        if (message) {
            message.textContent =
                "Verifying OTP...";
        }


        const result = await apiRequest({

            action: "verifyCustomerOTP",

            email:
                customerLoginData.email,

            otp: otp,

            purpose: "login"
        });


        if (!result.success) {

            if (message) {
                message.textContent =
                    result.message ||
                    "Invalid OTP.";
            }

            return;
        }


        // Successful customer login
        const customer =
            customerLoginData.customer || {};


        document.getElementById(
            "customerNameDisplay"
        ).textContent =
            customer.fullName ||
            "Customer";


        closeCustomerOtpModal();


        customerLoginData = null;


        showCustomerPage();

    } catch (error) {

        console.error(error);

        if (message) {
            message.textContent =
                error.message ||
                "Unable to connect to the server.";
        }
    }
}


// ======================================================
// CUSTOMER OTP BUTTON ROUTER
// ======================================================
//
// The HTML already calls verifyCustomerOTP().
// This function decides whether the OTP belongs to
// registration or login.

const originalVerifyCustomerOTP = verifyCustomerOTP;

verifyCustomerOTP = async function () {

    if (customerRegistrationData) {

        return originalVerifyCustomerOTP();

    }

    if (customerLoginData) {

        return verifyCustomerLoginOTP();

    }

    const message =
        document.getElementById("customerOtpMessage");

    if (message) {
        message.textContent =
            "No active verification session.";
    }
};


// ======================================================
// CUSTOMER PAGE
// ======================================================

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


    loadCustomerProducts();
}


// ======================================================
// CUSTOMER LOGOUT
// ======================================================

function customerLogout() {

    document
        .getElementById("customerPage")
        ?.classList.add("hidden");

    document
        .getElementById("loginPage")
        ?.classList.remove("hidden");


    document.getElementById(
        "customerEmail"
    ).value = "";

    document.getElementById(
        "customerPassword"
    ).value = "";


    document.getElementById(
        "customerNameDisplay"
    ).textContent = "Customer";


    customerLoginData = null;

    selectLoginType("customer");
}


// ======================================================
// ADMIN LOGIN
// ======================================================

async function adminLogin() {

    const username =
        document.getElementById("adminUsername")?.value.trim() || "";

    const password =
        document.getElementById("adminPassword")?.value || "";


    if (!username || !password) {

        showMessage(
            "Enter admin username and password.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "Checking admin credentials...",
            "info"
        );


        const result = await apiRequest({

            action: "adminLogin",

            username: username,

            password: password
        });


        if (!result.success) {

            showMessage(
                result.message ||
                "Invalid admin credentials.",
                "error"
            );

            return;
        }


        // Credentials correct.
        // Now send admin OTP.
        const otpResult = await apiRequest({

            action: "sendAdminOTP",

            email:
                "reyesjoesen6@gmail.com"
        });


        if (!otpResult.success) {

            showMessage(
                otpResult.message ||
                "Unable to send admin OTP.",
                "error"
            );

            return;
        }


        document
            .getElementById("otpBox")
            ?.classList.remove("hidden");


        showMessage(
            "Admin OTP sent to the authorized Gmail.",
            "success"
        );


        document.getElementById(
            "adminOTP"
        )?.focus();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Unable to connect to the server.",
            "error"
        );
    }
}


// ======================================================
// VERIFY ADMIN OTP
// ======================================================

async function verifyAdminOTP() {

    const otp =
        document.getElementById("adminOTP")?.value.trim() || "";


    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            "Enter a valid 6-digit OTP.",
            "error"
        );

        return;
    }


    try {

        const result = await apiRequest({

            action: "verifyAdminOTP",

            otp: otp
        });


        if (!result.success) {

            showMessage(
                result.message ||
                "Invalid OTP.",
                "error"
            );

            return;
        }


        document
            .getElementById("otpBox")
            ?.classList.add("hidden");


        document.getElementById(
            "adminOTP"
        ).value = "";


        showMessage("", "info");


        showAdminPage();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Unable to connect to the server.",
            "error"
        );
    }
}


// ======================================================
// ADMIN PAGE
// ======================================================

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


    showAdminSection("dashboard");

    loadAdminData();
}


// ======================================================
// ADMIN LOGOUT
// ======================================================

function adminLogout() {

    document
        .getElementById("adminPage")
        ?.classList.add("hidden");

    document
        .getElementById("loginPage")
        ?.classList.remove("hidden");


    document.getElementById(
        "adminUsername"
    ).value = "";

    document.getElementById(
        "adminPassword"
    ).value = "";

    document.getElementById(
        "adminOTP"
    ).value = "";


    document
        .getElementById("otpBox")
        ?.classList.add("hidden");


    selectLoginType("admin");
}


// ======================================================
// ADMIN SECTIONS
// ======================================================

function showAdminSection(section) {

    const dashboard =
        document.getElementById("dashboardSection");

    const products =
        document.getElementById("productsSection");

    const customers =
        document.getElementById("customersSection");


    dashboard?.classList.add("hidden");
    products?.classList.add("hidden");
    customers?.classList.add("hidden");


    if (section === "dashboard") {

        dashboard?.classList.remove("hidden");

        loadAdminData();

    } else if (section === "products") {

        products?.classList.remove("hidden");

        loadAdminProducts();

    } else if (section === "customers") {

        customers?.classList.remove("hidden");

        loadAdminCustomers();
    }


    document
        .querySelectorAll(".side-btn")
        .forEach(button => {
            button.classList.remove("active");
        });


    const buttons =
        document.querySelectorAll(".side-btn");


    if (section === "dashboard" && buttons[0]) {
        buttons[0].classList.add("active");
    }

    if (section === "products" && buttons[1]) {
        buttons[1].classList.add("active");
    }

    if (section === "customers" && buttons[2]) {
        buttons[2].classList.add("active");
    }
}


// ======================================================
// LOAD ADMIN DATA
// ======================================================

async function loadAdminData() {

    try {

        const productResult = await apiRequest({
            action: "getProducts"
        });


        const customerResult = await apiRequest({
            action: "getCustomers"
        });


        productsCache =
            productResult.products || [];

        customersCache =
            customerResult.customers || [];


        document.getElementById(
            "totalProducts"
        ).textContent =
            productsCache.length;


        document.getElementById(
            "totalCustomers"
        ).textContent =
            customersCache.length;

    } catch (error) {

        console.error(
            "Unable to load admin data:",
            error
        );
    }
}


// ======================================================
// LOAD ADMIN PRODUCTS
// ======================================================

async function loadAdminProducts() {

    try {

        const result = await apiRequest({
            action: "getProducts"
        });


        if (!result.success) {
            return;
        }


        productsCache =
            result.products || [];


        renderAdminProducts();

    } catch (error) {

        console.error(error);
    }
}


// ======================================================
// RENDER ADMIN PRODUCTS
// ======================================================

function renderAdminProducts() {

    const table =
        document.getElementById(
            "adminProductsTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (!productsCache.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    No products available.
                </td>
            </tr>
        `;

        return;
    }


    productsCache.forEach(product => {

        const row =
            document.createElement("tr");


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
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

            <td>
                ${Number(product.stock)}
            </td>

            <td>

                <button
                    class="action-btn"
                    onclick="editProduct('${escapeJS(product.id)}')">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="requestDeleteProduct('${escapeJS(product.id)}')">
                    Delete
                </button>

            </td>
        `;


        table.appendChild(row);
    });
}


// ======================================================
// OPEN PRODUCT MODAL
// ======================================================

function openProductModal(product = null) {

    document
        .getElementById("productModal")
        ?.classList.remove("hidden");


    document.getElementById(
        "editProductId"
    ).value =
        product?.id || "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        product ? "Edit Product" : "Add Product";


    document.getElementById(
        "productName"
    ).value =
        product?.name || "";


    document.getElementById(
        "productCategory"
    ).value =
        product?.category || "";


    document.getElementById(
        "productPrice"
    ).value =
        product?.price ?? "";


    document.getElementById(
        "productStock"
    ).value =
        product?.stock ?? "";


    document.getElementById(
        "productImage"
    ).value =
        product?.image || "";
}


// ======================================================
// CLOSE PRODUCT MODAL
// ======================================================

function closeProductModal() {

    document
        .getElementById("productModal")
        ?.classList.add("hidden");


    document.getElementById(
        "editProductId"
    ).value = "";

    document.getElementById(
        "productName"
    ).value = "";

    document.getElementById(
        "productCategory"
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
}


// ======================================================
// EDIT PRODUCT
// ======================================================

function editProduct(id) {

    const product =
        productsCache.find(
            item => String(item.id) === String(id)
        );


    if (!product) {

        alert("Product not found.");

        return;
    }


    openProductModal(product);
}


// ======================================================
// SAVE PRODUCT
// ======================================================

async function saveProduct() {

    const id =
        document.getElementById(
            "editProductId"
        )?.value.trim() || "";


    const name =
        document.getElementById(
            "productName"
        )?.value.trim() || "";


    const category =
        document.getElementById(
            "productCategory"
        )?.value.trim() || "";


    const price =
        document.getElementById(
            "productPrice"
        )?.value;


    const stock =
        document.getElementById(
            "productStock"
        )?.value;


    const image =
        document.getElementById(
            "productImage"
        )?.value.trim() || "";


    if (!name || !category) {

        alert(
            "Product name and category are required."
        );

        return;
    }


    if (
        price === "" ||
        Number(price) < 0 ||
        Number.isNaN(Number(price))
    ) {

        alert(
            "Please enter a valid price."
        );

        return;
    }


    if (
        stock === "" ||
        Number(stock) < 0 ||
        Number.isNaN(Number(stock))
    ) {

        alert(
            "Please enter a valid stock."
        );

        return;
    }


    pendingProductAction = {

        id: id,

        name: name,

        category: category,

        price: Number(price),

        stock: Number(stock),

        image: image,

        mode: id ? "update" : "add"
    };


    closeProductModal();


    document
        .getElementById("passcodeModal")
        ?.classList.remove("hidden");


    document.getElementById(
        "functionPasscode"
    ).value = "";


    document.getElementById(
        "functionPasscode"
    ).focus();
}


// ======================================================
// VERIFY FUNCTION PASSCODE
// ======================================================

async function verifyFunctionPasscode() {

    const passcode =
        document.getElementById(
            "functionPasscode"
        )?.value || "";


    if (!passcode) {

        alert(
            "Enter admin passcode."
        );

        return;
    }


    if (!pendingProductAction) {

        closePasscodeModal();

        return;
    }


    try {

        let result;


        if (
            pendingProductAction.mode === "add"
        ) {

            result = await apiRequest({

                action: "addProduct",

                passcode: passcode,

                name:
                    pendingProductAction.name,

                category:
                    pendingProductAction.category,

                price:
                    pendingProductAction.price,

                stock:
                    pendingProductAction.stock,

                image:
                    pendingProductAction.image
            });

        } else {

            result = await apiRequest({

                action: "updateProduct",

                passcode: passcode,

                id:
                    pendingProductAction.id,

                name:
                    pendingProductAction.name,

                category:
                    pendingProductAction.category,

                price:
                    pendingProductAction.price,

                stock:
                    pendingProductAction.stock,

                image:
                    pendingProductAction.image
            });
        }


        if (!result.success) {

            alert(
                result.message ||
                "Action failed."
            );

            return;
        }


        closePasscodeModal();


        pendingProductAction = null;


        await loadAdminProducts();

        await loadAdminData();


        alert(
            result.message ||
            "Product saved successfully."
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to connect to the server."
        );
    }
}


// ======================================================
// DELETE PRODUCT REQUEST
// ======================================================

function requestDeleteProduct(id) {

    pendingProductAction = {

        mode: "delete",

        id: id
    };


    document
        .getElementById("passcodeModal")
        ?.classList.remove("hidden");


    document.getElementById(
        "functionPasscode"
    ).value = "";


    document.getElementById(
        "functionPasscode"
    ).focus();
}


// ======================================================
// HANDLE DELETE IN PASSCODE
// ======================================================

const originalVerifyFunctionPasscode =
    verifyFunctionPasscode;

verifyFunctionPasscode = async function () {

    const passcode =
        document.getElementById(
            "functionPasscode"
        )?.value || "";


    if (!passcode) {

        alert(
            "Enter admin passcode."
        );

        return;
    }


    if (
        pendingProductAction?.mode !==
        "delete"
    ) {

        return originalVerifyFunctionPasscode();
    }


    try {

        const result = await apiRequest({

            action: "deleteProduct",

            passcode: passcode,

            id:
                pendingProductAction.id
        });


        if (!result.success) {

            alert(
                result.message ||
                "Unable to delete product."
            );

            return;
        }


        closePasscodeModal();


        pendingProductAction = null;


        await loadAdminProducts();

        await loadAdminData();


        alert(
            result.message ||
            "Product deleted."
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to connect to the server."
        );
    }
};


// ======================================================
// CLOSE PASSCODE MODAL
// ======================================================

function closePasscodeModal() {

    document
        .getElementById("passcodeModal")
        ?.classList.add("hidden");


    document.getElementById(
        "functionPasscode"
    ).value = "";


    pendingProductAction = null;
}


// ======================================================
// LOAD ADMIN CUSTOMERS
// ======================================================

async function loadAdminCustomers() {

    try {

        const result = await apiRequest({

            action: "getCustomers"
        });


        if (!result.success) {
            return;
        }


        customersCache =
            result.customers || [];


        renderAdminCustomers();

    } catch (error) {

        console.error(error);
    }
}


// ======================================================
// RENDER ADMIN CUSTOMERS
// ======================================================

function renderAdminCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (!customersCache.length) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    No registered customers.
                </td>
            </tr>
        `;

        return;
    }


    customersCache.forEach(customer => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(customer.fullName)}
            </td>

            <td>
                ${escapeHTML(customer.email)}
            </td>

            <td>
                ${escapeHTML(customer.status)}
            </td>
        `;


        table.appendChild(row);
    });
}


// ======================================================
// CUSTOMER PRODUCTS
// ======================================================

async function loadCustomerProducts() {

    const container =
        document.getElementById(
            "customerProducts"
        );


    if (container) {

        container.innerHTML = `
            <div class="loading">
                Loading products...
            </div>
        `;
    }


    try {

        const result = await apiRequest({

            action: "getProducts"
        });


        if (!result.success) {

            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        Unable to load products.
                    </div>
                `;
            }

            return;
        }


        productsCache =
            result.products || [];


        renderCustomerProducts();

    } catch (error) {

        console.error(error);

        if (container) {

            container.innerHTML = `
                <div class="empty-state">
                    Unable to connect to the server.
                </div>
            `;
        }
    }
}


// ======================================================
// RENDER CUSTOMER PRODUCTS
// ======================================================

function renderCustomerProducts(list = productsCache) {

    const container =
        document.getElementById(
            "customerProducts"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                No products available.
            </div>
        `;

        return;
    }


    list.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        const image =
            product.image
                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        onerror="this.style.display='none'">
                  `
                : `
                    <div class="product-image-placeholder">
                        TZ
                    </div>
                  `;


        card.innerHTML = `

            <div class="product-image">
                ${image}
            </div>

            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(product.category)}
                </span>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <div class="product-price">
                    ₱${Number(product.price).toLocaleString(
                        "en-PH",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                </div>

                <div class="product-stock">
                    ${
                        Number(product.stock) > 0
                            ? "Stock: " + Number(product.stock)
                            : "Out of stock"
                    }
                </div>

            </div>
        `;


        container.appendChild(card);
    });
}


// ======================================================
// SEARCH CUSTOMER PRODUCTS
// ======================================================

function searchCustomerProducts() {

    const search =
        document.getElementById(
            "customerSearch"
        )?.value.trim().toLowerCase() || "";


    if (!search) {

        renderCustomerProducts(productsCache);

        return;
    }


    const filtered =
        productsCache.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const category =
                String(product.category || "")
                    .toLowerCase();


            return (
                name.includes(search) ||
                category.includes(search)
            );
        });


    renderCustomerProducts(filtered);
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// ESCAPE JAVASCRIPT STRING
// ======================================================

function escapeJS(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}
