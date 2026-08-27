// ======================================================
// TECHZONE STORE
// FRONTEND JAVASCRIPT
// ======================================================


// ======================================================
// GOOGLE APPS SCRIPT API
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzRESfk299u_onBCXmnpRIpHIDjJNGffrWkJR2iJ0lVq48VxFbHtYKIyR8_nKSAYRs5/exec";


// ======================================================
// GLOBAL DATA
// ======================================================

let loginType = "customer";

let products = [];

let customers = [];

let currentCustomer = null;

let pendingOTP = false;

let passcodeAction = null;


// ======================================================
// API HELPER
// ======================================================

async function apiRequest(data) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type":
                "text/plain;charset=utf-8"
        },

        body: JSON.stringify(data)

    });


    const result =
        await response.json();


    return result;

}


// ======================================================
// LOGIN TYPE
// ======================================================

function selectLoginType(type) {

    loginType = type;


    document
        .getElementById("customerTab")
        .classList.remove("active");


    document
        .getElementById("adminTab")
        .classList.remove("active");


    document
        .getElementById("customerLogin")
        .classList.add("hidden");


    document
        .getElementById("adminLogin")
        .classList.add("hidden");


    document
        .getElementById("registerPage")
        .classList.add("hidden");


    if (type === "customer") {

        document
            .getElementById("customerTab")
            .classList.add("active");


        document
            .getElementById("customerLogin")
            .classList.remove("hidden");

    } else {

        document
            .getElementById("adminTab")
            .classList.add("active");


        document
            .getElementById("adminLogin")
            .classList.remove("hidden");

    }


    clearMessage();

}


// ======================================================
// REGISTER PAGE
// ======================================================

function showRegister() {

    document
        .getElementById("customerLogin")
        .classList.add("hidden");


    document
        .getElementById("adminLogin")
        .classList.add("hidden");


    document
        .getElementById("registerPage")
        .classList.remove("hidden");


    clearMessage();

}


// ======================================================
// SHOW LOGIN
// ======================================================

function showLogin() {

    document
        .getElementById("registerPage")
        .classList.add("hidden");


    document
        .getElementById("customerLogin")
        .classList.remove("hidden");


    document
        .getElementById("customerTab")
        .classList.add("active");


    document
        .getElementById("adminTab")
        .classList.remove("active");


    loginType = "customer";


    clearMessage();

}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    message,
    success = false
) {

    const box =
        document.getElementById("message");


    box.textContent =
        message;


    box.style.color =
        success
            ? "#198754"
            : "#dc3545";

}


function clearMessage() {

    const box =
        document.getElementById("message");


    if (box) {

        box.textContent = "";

    }

}


// ======================================================
// CUSTOMER REGISTRATION
// ======================================================

function startCustomerRegistrationOTP() {

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


    const confirm =
        document
            .getElementById("registerConfirm")
            .value;


    if (!name) {

        showMessage(
            "Please enter your full name."
        );

        return;

    }


    if (
        !/^[^\s@]+@gmail\.com$/i
            .test(email)
    ) {

        showMessage(
            "Please use a valid Gmail account."
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters."
        );

        return;

    }


    if (password !== confirm) {

        showMessage(
            "Passwords do not match."
        );

        return;

    }


    customerOtpPurpose =
        "registration";


    customerOtpEmail =
        email;


    customerOtpPassword =
        password;


    sendCustomerOTP(
        "registration"
    );

}


// ======================================================
// CUSTOMER LOGIN OTP
// ======================================================

function startCustomerLoginOTP() {

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


    if (
        !/^[^\s@]+@gmail\.com$/i
            .test(email)
    ) {

        showMessage(
            "Please enter a valid Gmail address."
        );

        return;

    }


    if (!password) {

        showMessage(
            "Please enter your password."
        );

        return;

    }


    customerOtpPurpose =
        "login";


    customerOtpEmail =
        email;


    customerOtpPassword =
        password;


    sendCustomerOTP(
        "login"
    );

}


// ======================================================
// CUSTOMER OTP GLOBAL
// ======================================================

let customerOtpPurpose = null;

let customerOtpEmail = null;

let customerOtpPassword = null;

let customerOtpResendTimer = null;

let customerOtpResendSeconds = 0;


// ======================================================
// SEND CUSTOMER OTP
// ======================================================

async function sendCustomerOTP(
    purpose
) {

    setCustomerOtpMessage(
        "Sending OTP...",
        "loading"
    );


    try {

        const result =
            await apiRequest({

                action:
                    "sendCustomerOTP",

                email:
                    customerOtpEmail,

                purpose:
                    purpose

            });


        if (!result.success) {

            setCustomerOtpMessage(
                result.message ||
                "Unable to send OTP.",
                "error"
            );

            showMessage(
                result.message ||
                "Unable to send OTP."
            );

            return;

        }


        document
            .getElementById("customerOtpInfo")
            .textContent =
            "A 6-digit OTP has been sent to " +
            customerOtpEmail +
            ".";


        openCustomerOtpModal();


        setCustomerOtpMessage(
            "OTP sent successfully. It expires in 5 minutes.",
            "success"
        );


        startCustomerOtpResendTimer();


    } catch (error) {

        console.error(error);


        setCustomerOtpMessage(
            "Cannot connect to Google Apps Script.",
            "error"
        );


        showMessage(
            "Cannot connect to Google Apps Script."
        );

    }

}


// ======================================================
// VERIFY CUSTOMER OTP
// ======================================================

async function verifyCustomerOTP() {

    const otp =
        document
            .getElementById("customerOTP")
            .value
            .trim();


    if (!/^\d{6}$/.test(otp)) {

        setCustomerOtpMessage(
            "Please enter the 6-digit OTP.",
            "error"
        );

        return;

    }


    setCustomerOtpMessage(
        "Verifying OTP...",
        "loading"
    );


    try {

        const result =
            await apiRequest({

                action:
                    "verifyCustomerOTP",

                email:
                    customerOtpEmail,

                otp:
                    otp,

                purpose:
                    customerOtpPurpose

            });


        if (!result.success) {

            setCustomerOtpMessage(
                result.message ||
                "Invalid OTP.",
                "error"
            );

            return;

        }


        const purpose =
            customerOtpPurpose;


        closeCustomerOtpModal();


        if (
            purpose === "login"
        ) {

            await loginCustomerAfterOTP();

        }


        else if (
            purpose === "registration"
        ) {

            await registerCustomerAfterOTP();

        }


    } catch (error) {

        console.error(error);


        setCustomerOtpMessage(
            "OTP verification failed.",
            "error"
        );

    }

}


// ======================================================
// CUSTOMER LOGIN AFTER OTP
// ======================================================

async function loginCustomerAfterOTP() {

    try {

        showMessage(
            "Logging in..."
        );


        const result =
            await apiRequest({

                action:
                    "customerLogin",

                email:
                    customerOtpEmail,

                password:
                    customerOtpPassword

            });


        if (result.success) {

            currentCustomer =
                result.customer;


            clearCustomerOtpState();


            openCustomerPage();

        } else {

            showMessage(
                result.message ||
                "Invalid customer login."
            );

        }


    } catch (error) {

        console.error(error);


        showMessage(
            "Cannot connect to Google Apps Script."
        );

    }

}


// ======================================================
// CUSTOMER REGISTER AFTER OTP
// ======================================================

async function registerCustomerAfterOTP() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    try {

        showMessage(
            "Creating account..."
        );


        const result =
            await apiRequest({

                action:
                    "registerCustomer",

                fullName:
                    name,

                email:
                    customerOtpEmail,

                password:
                    customerOtpPassword

            });


        if (result.success) {

            showMessage(
                "Account created successfully! You can now login.",
                true
            );


            document
                .getElementById("registerName")
                .value = "";


            document
                .getElementById("registerEmail")
                .value = "";


            document
                .getElementById("registerPassword")
                .value = "";


            document
                .getElementById("registerConfirm")
                .value = "";


            clearCustomerOtpState();


            setTimeout(
                showLogin,
                1500
            );

        } else {

            showMessage(
                result.message ||
                "Registration failed."
            );

        }


    } catch (error) {

        console.error(error);


        showMessage(
            "Cannot connect to Google Apps Script."
        );

    }

}


// ======================================================
// CUSTOMER OTP MODAL
// ======================================================

function openCustomerOtpModal() {

    document
        .getElementById("customerOtpModal")
        .classList.remove("hidden");


    const input =
        document.getElementById(
            "customerOTP"
        );


    input.value = "";


    setTimeout(
        () => input.focus(),
        100
    );

}


function closeCustomerOtpModal() {

    document
        .getElementById("customerOtpModal")
        .classList.add("hidden");


    clearCustomerOtpState();

}


function clearCustomerOtpState() {

    customerOtpPurpose = null;

    customerOtpEmail = null;

    customerOtpPassword = null;


    if (customerOtpResendTimer) {

        clearInterval(
            customerOtpResendTimer
        );

        customerOtpResendTimer =
            null;

    }


    customerOtpResendSeconds = 0;


    const button =
        document.getElementById(
            "resendCustomerOtpBtn"
        );


    if (button) {

        button.disabled = false;

        button.textContent =
            "Resend OTP";

    }

}


// ======================================================
// CUSTOMER OTP MESSAGE
// ======================================================

function setCustomerOtpMessage(
    message,
    type = ""
) {

    const box =
        document.getElementById(
            "customerOtpMessage"
        );


    if (!box) return;


    box.textContent =
        message;


    box.className =
        type;

}


// ======================================================
// RESEND CUSTOMER OTP
// ======================================================

function resendCustomerOTP() {

    if (
        !customerOtpEmail ||
        !customerOtpPurpose
    ) {

        return;

    }


    if (
        customerOtpResendSeconds > 0
    ) {

        return;

    }


    sendCustomerOTP(
        customerOtpPurpose
    );

}


// ======================================================
// OTP TIMER
// ======================================================

function startCustomerOtpResendTimer() {

    if (customerOtpResendTimer) {

        clearInterval(
            customerOtpResendTimer
        );

    }


    customerOtpResendSeconds =
        30;


    const button =
        document.getElementById(
            "resendCustomerOtpBtn"
        );


    button.disabled =
        true;


    button.textContent =
        "Resend OTP (" +
        customerOtpResendSeconds +
        "s)";


    customerOtpResendTimer =
        setInterval(() => {

            customerOtpResendSeconds--;


            if (
                customerOtpResendSeconds <= 0
            ) {

                clearInterval(
                    customerOtpResendTimer
                );


                customerOtpResendTimer =
                    null;


                button.disabled =
                    false;


                button.textContent =
                    "Resend OTP";


                return;

            }


            button.textContent =
                "Resend OTP (" +
                customerOtpResendSeconds +
                "s)";


        }, 1000);

}


// ======================================================
// ADMIN LOGIN
// ======================================================

async function adminLogin() {

    const username =
        document
            .getElementById("adminUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            .value;


    if (!username || !password) {

        showMessage(
            "Enter admin username and password."
        );

        return;

    }


    try {

        showMessage(
            "Checking admin credentials..."
        );


        const result =
            await apiRequest({

                action:
                    "adminLogin",

                username:
                    username,

                password:
                    password

            });


        if (!result.success) {

            showMessage(
                result.message ||
                "Invalid admin credentials."
            );

            return;

        }


        showMessage(
            "Sending security OTP..."
        );


        const otpResult =
            await apiRequest({

                action:
                    "sendAdminOTP",

                email:
                    "reyesjoesen6@gmail.com"

            });


        if (
            otpResult.success
        ) {

            pendingOTP =
                true;


            document
                .getElementById("otpBox")
                .classList.remove("hidden");


            showMessage(
                "OTP sent to the admin Gmail.",
                true
            );

        } else {

            showMessage(
                otpResult.message ||
                "Failed to send OTP."
            );

        }


    } catch (error) {

        console.error(error);


        showMessage(
            "Cannot connect to Google Apps Script."
        );

    }

}


// ======================================================
// VERIFY ADMIN OTP
// ======================================================

async function verifyAdminOTP() {

    const otp =
        document
            .getElementById("adminOTP")
            .value
            .trim();


    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            "Enter the 6-digit OTP."
        );

        return;

    }


    try {

        showMessage(
            "Verifying OTP..."
        );


        const result =
            await apiRequest({

                action:
                    "verifyAdminOTP",

                otp:
                    otp

            });


        if (result.success) {

            pendingOTP =
                false;


            openAdminPage();

        } else {

            showMessage(
                result.message ||
                "Invalid OTP."
            );

        }


    } catch (error) {

        console.error(error);


        showMessage(
            "OTP verification failed."
        );

    }

}


// ======================================================
// CUSTOMER PAGE
// ======================================================

async function openCustomerPage() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");


    document
        .getElementById("adminPage")
        .classList.add("hidden");


    document
        .getElementById("customerPage")
        .classList.remove("hidden");


    if (currentCustomer) {

        document
            .getElementById(
                "customerNameDisplay"
            )
            .textContent =
            currentCustomer.fullName ||
            "Customer";

    }


    await loadProducts();

}


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

    try {

        const result =
            await apiRequest({

                action:
                    "getProducts"

            });


        if (result.success) {

            products =
                result.products || [];


            displayCustomerProducts(
                products
            );

        }


    } catch (error) {

        console.error(error);


        showMessage(
            "Unable to load products."
        );

    }

}


// ======================================================
// DISPLAY CUSTOMER PRODUCTS
// ======================================================

function displayCustomerProducts(
    list
) {

    const container =
        document.getElementById(
            "customerProducts"
        );


    container.innerHTML = "";


    if (!list.length) {

        container.innerHTML =
            `<div class="empty-box">
                No products available.
            </div>`;

        return;

    }


    list.forEach(product => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "product-card";


        card.innerHTML = `

            <img
                class="product-image"
                src="${
                    product.image ||
                    "https://via.placeholder.com/400"
                }"
                alt="${escapeHTML(
                    product.name
                )}"
            >


            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(
                        product.category
                    )}
                </span>


                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>


                <p class="price">
                    ₱${Number(
                        product.price
                    ).toLocaleString()}
                </p>


                <p class="stock">
                    Stock:
                    ${product.stock}
                </p>

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


// ======================================================
// CUSTOMER SEARCH
// ======================================================

function searchCustomerProducts() {

    const keyword =
        document
            .getElementById(
                "customerSearch"
            )
            .value
            .toLowerCase()
            .trim();


    const filtered =
        products.filter(product =>

            String(product.name)
                .toLowerCase()
                .includes(keyword)

            ||

            String(product.category)
                .toLowerCase()
                .includes(keyword)

        );


    displayCustomerProducts(
        filtered
    );

}


// ======================================================
// CUSTOMER LOGOUT
// ======================================================

function customerLogout() {

    currentCustomer =
        null;


    document
        .getElementById(
            "customerPage"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "loginPage"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "customerEmail"
        )
        .value = "";


    document
        .getElementById(
            "customerPassword"
        )
        .value = "";


    selectLoginType(
        "customer"
    );

}


// ======================================================
// ADMIN PAGE
// ======================================================

async function openAdminPage() {

    document
        .getElementById(
            "loginPage"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "customerPage"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "adminPage"
        )
        .classList.remove("hidden");


    await loadAdminData();


    showAdminSection(
        "dashboard"
    );

}


// ======================================================
// LOAD ADMIN DATA
// ======================================================

async function loadAdminData() {

    await loadProducts();

    await loadCustomers();

    updateDashboard();

    displayAdminProducts();

    displayCustomers();

}


// ======================================================
// LOAD CUSTOMERS
// ======================================================

async function loadCustomers() {

    try {

        const result =
            await apiRequest({

                action:
                    "getCustomers"

            });


        if (result.success) {

            customers =
                result.customers || [];

        }


    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// ADMIN SECTION
// ======================================================

function showAdminSection(
    section
) {

    document
        .getElementById(
            "dashboardSection"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "productsSection"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "customersSection"
        )
        .classList.add("hidden");


    document
        .querySelectorAll(
            ".side-btn"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    if (
        section === "dashboard"
    ) {

        document
            .getElementById(
                "dashboardSection"
            )
            .classList.remove(
                "hidden"
            );


        document
            .querySelector(
                '[onclick="showAdminSection(\'dashboard\')"]'
            )
            ?.classList.add(
                "active"
            );

    }


    if (
        section === "products"
    ) {

        document
            .getElementById(
                "productsSection"
            )
            .classList.remove(
                "hidden"
            );


        document
            .querySelector(
                '[onclick="showAdminSection(\'products\')"]'
            )
            ?.classList.add(
                "active"
            );


        displayAdminProducts();

    }


    if (
        section === "customers"
    ) {

        document
            .getElementById(
                "customersSection"
            )
            .classList.remove(
                "hidden"
            );


        document
            .querySelector(
                '[onclick="showAdminSection(\'customers\')"]'
            )
            ?.classList.add(
                "active"
            );


        displayCustomers();

    }

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    document
        .getElementById(
            "totalProducts"
        )
        .textContent =
        products.length;


    document
        .getElementById(
            "totalCustomers"
        )
        .textContent =
        customers.length;

}


// ======================================================
// ADMIN PRODUCTS TABLE
// ======================================================

function displayAdminProducts() {

    const table =
        document.getElementById(
            "adminProductsTable"
        );


    table.innerHTML = "";


    products.forEach(product => {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(
                        product.name
                    )}
                </strong>
            </td>


            <td>
                ${escapeHTML(
                    product.category
                )}
            </td>


            <td>
                ₱${Number(
                    product.price
                ).toLocaleString()}
            </td>


            <td>
                ${product.stock}
            </td>


            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="requestEditProduct('${escapeAttribute(product.id)}')"
                >
                    Edit
                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="requestDeleteProduct('${escapeAttribute(product.id)}')"
                >
                    Delete
                </button>

            </td>

        `;


        table.appendChild(
            row
        );

    });

}


// ======================================================
// PRODUCT MODAL
// ======================================================

function openProductModal(
    product = null
) {

    document
        .getElementById(
            "productModal"
        )
        .classList.remove(
            "hidden"
        );


    if (product) {

        document
            .getElementById(
                "modalTitle"
            )
            .textContent =
            "Edit Product";


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
                "productImage"
            )
            .value =
            product.image || "";

    } else {

        document
            .getElementById(
                "modalTitle"
            )
            .textContent =
            "Add Product";


        clearProductForm();

    }

}


// ======================================================
// CLOSE PRODUCT MODAL
// ======================================================

function closeProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList.add(
            "hidden"
        );

}


// ======================================================
// CLEAR PRODUCT FORM
// ======================================================

function clearProductForm() {

    document
        .getElementById(
            "editProductId"
        )
        .value = "";


    document
        .getElementById(
            "productName"
        )
        .value = "";


    document
        .getElementById(
            "productCategory"
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

}


// ======================================================
// SAVE PRODUCT
// ======================================================

function saveProduct() {

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
            .value
            .trim();


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
            .value
            .trim();


    const editId =
        document
            .getElementById(
                "editProductId"
            )
            .value;


    if (
        !name ||
        !category ||
        price === "" ||
        stock === ""
    ) {

        alert(
            "Please complete the product information."
        );

        return;

    }


    askAdminPasscode(
        async function () {

            try {

                let result;


                if (editId) {

                    result =
                        await apiRequest({

                            action:
                                "updateProduct",

                            id:
                                editId,

                            name:
                                name,

                            category:
                                category,

                            price:
                                Number(price),

                            stock:
                                Number(stock),

                            image:
                                image,

                            passcode:
                                "adminako"

                        });

                } else {

                    result =
                        await apiRequest({

                            action:
                                "addProduct",

                            name:
                                name,

                            category:
                                category,

                            price:
                                Number(price),

                            stock:
                                Number(stock),

                            image:
                                image,

                            passcode:
                                "adminako"

                        });

                }


                if (result.success) {

                    alert(
                        result.message
                    );


                    closeProductModal();


                    await loadProducts();


                    displayAdminProducts();


                    updateDashboard();

                } else {

                    alert(
                        result.message ||
                        "Operation failed."
                    );

                }


            } catch (error) {

                console.error(error);


                alert(
                    "Cannot connect to Google Apps Script."
                );

            }

        }
    );

}


// ======================================================
// EDIT PRODUCT
// ======================================================

function requestEditProduct(
    id
) {

    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    askAdminPasscode(
        function () {

            openProductModal(
                product
            );

        }
    );

}


// ======================================================
// DELETE PRODUCT
// ======================================================

function requestDeleteProduct(
    id
) {

    askAdminPasscode(
        async function () {

            const confirmed =
                confirm(
                    "Delete this product?"
                );


            if (!confirmed) {

                return;

            }


            try {

                const result =
                    await apiRequest({

                        action:
                            "deleteProduct",

                        id:
                            id,

                        passcode:
                            "adminako"

                    });


                if (result.success) {

                    alert(
                        result.message
                    );


                    await loadProducts();


                    displayAdminProducts();


                    updateDashboard();

                } else {

                    alert(
                        result.message ||
                        "Delete failed."
                    );

                }


            } catch (error) {

                console.error(error);


                alert(
                    "Cannot connect to Google Apps Script."
                );

            }

        }
    );

}


// ======================================================
// ADMIN PASSCODE
// ======================================================

function askAdminPasscode(
    callback
) {

    passcodeAction =
        callback;


    document
        .getElementById(
            "functionPasscode"
        )
        .value = "";


    document
        .getElementById(
            "passcodeModal"
        )
        .classList.remove(
            "hidden"
        );


    setTimeout(
        () => {

            document
                .getElementById(
                    "functionPasscode"
                )
                .focus();

        },
        100
    );

}


// ======================================================
// VERIFY FUNCTION PASSCODE
// ======================================================

function verifyFunctionPasscode() {

    const passcode =
        document
            .getElementById(
                "functionPasscode"
            )
            .value;


    if (
        passcode !==
        "adminako"
    ) {

        alert(
            "Incorrect admin passcode."
        );

        return;

    }


    const callback =
        passcodeAction;


    closePasscodeModal();


    if (callback) {

        callback();

    }

}


// ======================================================
// CLOSE PASSCODE
// ======================================================

function closePasscodeModal() {

    document
        .getElementById(
            "passcodeModal"
        )
        .classList.add(
            "hidden"
        );


    passcodeAction =
        null;

}


// ======================================================
// CUSTOMER TABLE
// ======================================================

function displayCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );


    table.innerHTML = "";


    if (!customers.length) {

        table.innerHTML =
            `<tr>
                <td colspan="3" class="empty-table">
                    No customers found.
                </td>
            </tr>`;

        return;

    }


    customers.forEach(
        customer => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        customer.fullName
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        customer.email
                    )}
                </td>


                <td>
                    <span class="status-active">
                        ${escapeHTML(
                            customer.status
                        )}
                    </span>
                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}


// ======================================================
// ADMIN LOGOUT
// ======================================================

function adminLogout() {

    document
        .getElementById(
            "adminPage"
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
            "adminUsername"
        )
        .value = "";


    document
        .getElementById(
            "adminPassword"
        )
        .value = "";


    document
        .getElementById(
            "adminOTP"
        )
        .value = "";


    document
        .getElementById(
            "otpBox"
        )
        .classList.add(
            "hidden"
        );


    pendingOTP =
        false;


    selectLoginType(
        "customer"
    );

}


// ======================================================
// HTML SECURITY
// ======================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(value) {

    return String(value)
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        );

}


// ======================================================
// KEYBOARD
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            const customerModal =
                document.getElementById(
                    "customerOtpModal"
                );


            const productModal =
                document.getElementById(
                    "productModal"
                );


            const passcodeModal =
                document.getElementById(
                    "passcodeModal"
                );


            if (
                customerModal &&
                !customerModal.classList.contains(
                    "hidden"
                )
            ) {

                closeCustomerOtpModal();

            }


            if (
                productModal &&
                !productModal.classList.contains(
                    "hidden"
                )
            ) {

                closeProductModal();

            }


            if (
                passcodeModal &&
                !passcodeModal.classList.contains(
                    "hidden"
                )
            ) {

                closePasscodeModal();

            }

        }

    }
);


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        selectLoginType(
            "customer"
        );

    }
);
