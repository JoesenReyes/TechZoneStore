// ======================================================
// TECHZONE STORE
// GOOGLE APPS SCRIPT API
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbxAxfswlsbGlr5dofhk_vayxsuH_P_cMjl4ySAlloBqalMiKY_LmGfWvCrobRT-d3j2Xg/exec";


// ======================================================
// GLOBAL DATA
// ======================================================

let loginType = "customer";

let products = [
    {
        id: 1,
        name: "Laptop",
        category: "Computer",
        price: 25000,
        stock: 10,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    },
    {
        id: 2,
        name: "Smartphone",
        category: "Mobile",
        price: 15000,
        stock: 15,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    },
    {
        id: 3,
        name: "Wireless Headset",
        category: "Accessories",
        price: 1800,
        stock: 20,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    },
    {
        id: 4,
        name: "Mechanical Keyboard",
        category: "Accessories",
        price: 2500,
        stock: 12,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3"
    },
    {
        id: 5,
        name: "Gaming Mouse",
        category: "Accessories",
        price: 1200,
        stock: 25,
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db"
    },
    {
        id: 6,
        name: "Computer Monitor",
        category: "Computer",
        price: 9500,
        stock: 8,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
    }
];


let customers = [];

let currentCustomer = null;

let pendingOTP = false;


// ======================================================
// CUSTOMER OTP GLOBAL
// ======================================================

let customerOtpPurpose = null;
let customerOtpEmail = null;
let customerOtpPassword = null;

let customerOtpRegistration = null;

let customerOtpResendTimer = null;
let customerOtpResendSeconds = 0;


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

function showMessage(message, success = false) {

    const box =
        document.getElementById("message");

    box.textContent = message;

    box.style.color =
        success ? "#198754" : "#dc3545";
}


function clearMessage() {

    const box =
        document.getElementById("message");

    if (box) {
        box.textContent = "";
    }
}


// ======================================================
// API HELPER
// ======================================================

async function callAPI(data) {

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


    if (!name || !email || !password || !confirm) {

        showMessage(
            "Please complete all fields."
        );

        return;
    }


    if (!email.endsWith("@gmail.com")) {

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


    customerOtpPurpose = "registration";

    customerOtpEmail = email;

    customerOtpPassword = password;

    customerOtpRegistration = {

        name: name,

        email: email,

        password: password

    };


    sendCustomerOTP("registration");
}


// ======================================================
// SEND CUSTOMER OTP
// ======================================================

async function sendCustomerOTP(purpose) {

    showMessage("Sending OTP...");


    try {

        const result = await callAPI({

            action: "sendCustomerOTP",

            email: customerOtpEmail,

            purpose: purpose

        });


        if (result.success) {

            openCustomerOtpModal();

            document
                .getElementById("customerOtpInfo")
                .textContent =
                "A 6-digit OTP has been sent to " +
                customerOtpEmail +
                ".";


            setCustomerOtpMessage(
                "OTP sent successfully. It expires in 5 minutes.",
                "success"
            );


            startCustomerOtpResendTimer();


            clearMessage();

        } else {

            showMessage(
                result.message ||
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
// CUSTOMER LOGIN → OTP
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


    if (!email) {

        showMessage(
            "Please enter your Gmail."
        );

        return;
    }


    if (!email.endsWith("@gmail.com")) {

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


    customerOtpPurpose = "login";

    customerOtpEmail = email;

    customerOtpPassword = password;


    sendCustomerOTP("login");
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

        const result = await callAPI({

            action: "verifyCustomerOTP",

            email: customerOtpEmail,

            otp: otp,

            purpose: customerOtpPurpose

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


        closeCustomerOtpModal(false);


        // ==============================================
        // LOGIN
        // ==============================================

        if (purpose === "login") {

            await customerLoginAfterOTP();

        }


        // ==============================================
        // REGISTRATION
        // ==============================================

        else if (purpose === "registration") {

            await createAccountAfterOTP();

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

async function customerLoginAfterOTP() {

    try {

        showMessage("Logging in...");


        const result = await callAPI({

            action: "customerLogin",

            email: customerOtpEmail,

            password: customerOtpPassword

        });


        if (result.success) {

            currentCustomer =
                result.customer;

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
// CREATE ACCOUNT AFTER OTP
// ======================================================

async function createAccountAfterOTP() {

    try {

        showMessage(
            "Creating your account..."
        );


        const result = await callAPI({

            action: "registerCustomer",

            fullName:
                customerOtpRegistration.name,

            email:
                customerOtpRegistration.email,

            password:
                customerOtpRegistration.password

        });


        if (result.success) {

            closeCustomerOtpModal();

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


    const otp =
        document.getElementById("customerOTP");


    otp.value = "";

    setTimeout(() => {

        otp.focus();

    }, 100);

}


function closeCustomerOtpModal(clearState = true) {

    document
        .getElementById("customerOtpModal")
        .classList.add("hidden");


    if (clearState) {

        clearCustomerOtpState();

    }

}


function clearCustomerOtpState() {

    customerOtpPurpose = null;

    customerOtpEmail = null;

    customerOtpPassword = null;

    customerOtpRegistration = null;


    if (customerOtpResendTimer) {

        clearInterval(
            customerOtpResendTimer
        );

        customerOtpResendTimer = null;

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


    box.textContent = message;

    box.className =
        "otp-message " + type;

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


    if (customerOtpResendSeconds > 0) {

        return;

    }


    sendCustomerOTP(
        customerOtpPurpose
    );

}


// ======================================================
// RESEND TIMER
// ======================================================

function startCustomerOtpResendTimer() {

    if (customerOtpResendTimer) {

        clearInterval(
            customerOtpResendTimer
        );

    }


    customerOtpResendSeconds = 30;


    const button =
        document.getElementById(
            "resendCustomerOtpBtn"
        );


    button.disabled = true;


    button.textContent =
        "Resend OTP (30s)";


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

                button.disabled = false;

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


    if (username !== "admin") {

        showMessage(
            "Invalid admin username."
        );

        return;
    }


    if (password !== "admin123") {

        showMessage(
            "Invalid admin password."
        );

        return;
    }


    try {

        showMessage(
            "Sending security OTP..."
        );


        const result = await callAPI({

            action: "sendAdminOTP",

            email:
                "reyesjoesen6@gmail.com"

        });


        if (result.success) {

            pendingOTP = true;


            document
                .getElementById("otpBox")
                .classList.remove("hidden");


            showMessage(
                "OTP sent to the admin Gmail.",
                true
            );

        } else {

            showMessage(
                result.message ||
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

        const result = await callAPI({

            action: "verifyAdminOTP",

            otp: otp

        });


        if (result.success) {

            pendingOTP = false;

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

function openCustomerPage() {

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
            .getElementById("customerNameDisplay")
            .textContent =
            currentCustomer.fullName ||
            "Customer";

    }


    displayCustomerProducts(
        products
    );

}


// ======================================================
// CUSTOMER PRODUCTS
// ======================================================

function displayCustomerProducts(list) {

    const container =
        document.getElementById(
            "customerProducts"
        );


    container.innerHTML = "";


    if (!list.length) {

        container.innerHTML =
            "<p>No products available.</p>";

        return;

    }


    list.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.innerHTML = `

            <img
                class="product-image"
                src="${product.image || 'https://via.placeholder.com/400'}"
                alt="${escapeHTML(product.name)}"
            >

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p class="category">
                    ${escapeHTML(product.category)}
                </p>

                <p class="price">
                    ₱${Number(product.price).toLocaleString()}
                </p>

                <p class="stock">
                    Stock: ${product.stock}
                </p>

            </div>

        `;


        container.appendChild(card);

    });

}


// ======================================================
// SEARCH
// ======================================================

function searchCustomerProducts() {

    const keyword =
        document
            .getElementById(
                "customerSearch"
            )
            .value
            .toLowerCase();


    const filtered =
        products.filter(product =>

            product.name
                .toLowerCase()
                .includes(keyword)

            ||

            product.category
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

    currentCustomer = null;


    document
        .getElementById("customerPage")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("customerEmail")
        .value = "";


    document
        .getElementById("customerPassword")
        .value = "";

}


// ======================================================
// ADMIN PAGE
// ======================================================

function openAdminPage() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("customerPage")
        .classList.add("hidden");

    document
        .getElementById("adminPage")
        .classList.remove("hidden");


    updateDashboard();

    displayAdminProducts();

    displayCustomers();

}


// ======================================================
// ADMIN SECTION
// ======================================================

function showAdminSection(section) {

    document
        .getElementById("dashboardSection")
        .classList.add("hidden");

    document
        .getElementById("productsSection")
        .classList.add("hidden");

    document
        .getElementById("customersSection")
        .classList.add("hidden");


    if (section === "dashboard") {

        document
            .getElementById("dashboardSection")
            .classList.remove("hidden");

    }


    if (section === "products") {

        document
            .getElementById("productsSection")
            .classList.remove("hidden");

    }


    if (section === "customers") {

        document
            .getElementById("customersSection")
            .classList.remove("hidden");

    }

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    document
        .getElementById("totalProducts")
        .textContent =
        products.length;


    document
        .getElementById("totalCustomers")
        .textContent =
        customers.length;

}


// ======================================================
// ADMIN PRODUCTS
// ======================================================

function displayAdminProducts() {

    const table =
        document.getElementById(
            "adminProductsTable"
        );


    table.innerHTML = "";


    products.forEach(product => {

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
                ₱${Number(product.price).toLocaleString()}
            </td>

            <td>
                ${product.stock}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="requestEditProduct(${product.id})">

                    Edit

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="requestDeleteProduct(${product.id})">

                    Delete

                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// ======================================================
// PRODUCT MODAL
// ======================================================

function openProductModal(product = null) {

    document
        .getElementById("productModal")
        .classList
        .remove("hidden");


    if (product) {

        document
            .getElementById("modalTitle")
            .textContent =
            "Edit Product";


        document
            .getElementById("editProductId")
            .value =
            product.id;


        document
            .getElementById("productName")
            .value =
            product.name;


        document
            .getElementById("productCategory")
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
            .getElementById("productImage")
            .value =
            product.image;

    } else {

        document
            .getElementById("modalTitle")
            .textContent =
            "Add Product";


        clearProductForm();

    }

}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList
        .add("hidden");

}


function clearProductForm() {

    const ids = [

        "editProductId",

        "productName",

        "productCategory",

        "productPrice",

        "productStock",

        "productImage"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });

}


// ======================================================
// SAVE PRODUCT
// ======================================================

function saveProduct() {

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


    const price =
        document
            .getElementById("productPrice")
            .value;


    const stock =
        document
            .getElementById("productStock")
            .value;


    const image =
        document
            .getElementById("productImage")
            .value
            .trim();


    const editId =
        document
            .getElementById("editProductId")
            .value;


    if (!name || !category || !price || !stock) {

        alert(
            "Please complete the product information."
        );

        return;
    }


    if (editId) {

        const product =
            products.find(
                p => p.id == editId
            );


        if (product) {

            product.name = name;

            product.category = category;

            product.price =
                Number(price);

            product.stock =
                Number(stock);

            product.image = image;

        }

    } else {

        products.push({

            id: Date.now(),

            name: name,

            category: category,

            price: Number(price),

            stock: Number(stock),

            image:
                image ||
                "https://via.placeholder.com/400"

        });

    }


    closeProductModal();

    displayAdminProducts();

    displayCustomerProducts(
        products
    );

    updateDashboard();

}


// ======================================================
// EDIT PRODUCT
// ======================================================

function requestEditProduct(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) return;


    askAdminPasscode(function () {

        openProductModal(product);

    });

}


// ======================================================
// DELETE PRODUCT
// ======================================================

function requestDeleteProduct(id) {

    askAdminPasscode(function () {

        const confirmed =
            confirm(
                "Delete this product?"
            );


        if (!confirmed) return;


        products =
            products.filter(
                p => p.id !== id
            );


        displayAdminProducts();

        displayCustomerProducts(
            products
        );

        updateDashboard();

    });

}


// ======================================================
// ADMIN PASSCODE
// ======================================================

let passcodeAction = null;


function askAdminPasscode(callback) {

    passcodeAction =
        callback;


    const input =
        document.getElementById(
            "functionPasscode"
        );


    const modal =
        document.getElementById(
            "passcodeModal"
        );


    if (input && modal) {

        input.value = "";

        modal
            .classList
            .remove("hidden");

    }

}


function verifyFunctionPasscode() {

    const input =
        document.getElementById(
            "functionPasscode"
        );


    if (!input) return;


    const passcode =
        input.value;


    if (passcode !== "adminako") {

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


function closePasscodeModal() {

    const modal =
        document.getElementById(
            "passcodeModal"
        );


    if (modal) {

        modal
            .classList
            .add("hidden");

    }


    passcodeAction = null;

}


// ======================================================
// CUSTOMER TABLE
// ======================================================

function displayCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );


    if (!table) return;


    table.innerHTML = "";


    customers.forEach(customer => {

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
                Active
            </td>

        `;


        table.appendChild(row);

    });

}


// ======================================================
// ADMIN LOGOUT
// ======================================================

function adminLogout() {

    document
        .getElementById("adminPage")
        .classList
        .add("hidden");


    document
        .getElementById("loginPage")
        .classList
        .remove("hidden");


    document
        .getElementById("adminUsername")
        .value = "";


    document
        .getElementById("adminPassword")
        .value = "";


    document
        .getElementById("adminOTP")
        .value = "";


    document
        .getElementById("otpBox")
        .classList
        .add("hidden");


    pendingOTP = false;

}


// ======================================================
// SECURITY
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


// ======================================================
// ENTER KEY FOR CUSTOMER OTP
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            document
                .getElementById(
                    "customerOtpModal"
                )
                .classList
                .contains("hidden") === false
        ) {

            verifyCustomerOTP();

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

        displayCustomerProducts(
            products
        );

    }
);
