/* =========================================================
   TECHZONE STORE - script.js
   Google Apps Script Web App Frontend
   ========================================================= */

/* =========================================================
   1. GOOGLE APPS SCRIPT WEB APP URL
   ========================================================= */

const APP_URL =
  "https://script.google.com/macros/s/AKfycbyikWmVlrmgRFWx2qdtwmKJPNnhAbz9YH4hvx0-gNsoHmFtAUG2Kpd9eHD9_c3flIlH/exec";


/* =========================================================
   2. GLOBAL VARIABLES
   ========================================================= */

let currentUser = null;
let products = [];
let categories = [];
let deletedProducts = [];
let activityLogs = [];

let currentPage = "dashboard";
let editingProductId = null;


/* =========================================================
   3. ADMIN SETTINGS
   ========================================================= */

const ADMIN_EMAIL = "reyesjoesen@gmail.com";

// Normal admin password
const ADMIN_PASSWORD = "joesenreyes";

// Passcode required for:
// ADD PRODUCT
// UPDATE PRODUCT
// DELETE PRODUCT
const ADMIN_PASSCODE = "techzone202";

// OTP length
const OTP_LENGTH = 6;

// OTP expiration: 5 minutes
const OTP_EXPIRATION = 5 * 60 * 1000;


/* =========================================================
   4. INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  console.log("TechZone Store starting...");

  loadSavedSession();

  setupNavigation();

  setupLogout();

  setupProductForm();

  setupCategoryForm();

  setupSearch();

  setupButtons();

  if (currentUser) {
    showMainApplication();
    loadAllData();
  } else {
    showLoginPage();
  }

});


/* =========================================================
   5. GOOGLE APPS SCRIPT REQUEST
   ========================================================= */

async function apiRequest(action, data = {}) {

  console.log("API REQUEST:", action, data);

  try {

    const response = await fetch(APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: action,
        data: data
      })
    });

    const text = await response.text();

    console.log("API RESPONSE:", text);

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error("Invalid JSON response:", text);

      showNotification(
        "Server returned an invalid response.",
        "error"
      );

      return {
        success: false,
        message: "Invalid server response."
      };
    }

    if (!result.success) {

      showNotification(
        result.message || "Something went wrong.",
        "error"
      );

    }

    return result;

  } catch (error) {

    console.error("API ERROR:", error);

    showNotification(
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
   6. LOGIN PAGE
   ========================================================= */

function showLoginPage() {

  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");

  if (loginPage) {
    loginPage.style.display = "flex";
  }

  if (appPage) {
    appPage.style.display = "none";
  }

}


function showMainApplication() {

  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");

  if (loginPage) {
    loginPage.style.display = "none";
  }

  if (appPage) {
    appPage.style.display = "block";
  }

  updateUserInterface();

}


/* =========================================================
   7. LOGIN FORM
   ========================================================= */

function setupButtons() {

  const loginButton = document.getElementById("loginBtn");

  if (loginButton) {

    loginButton.addEventListener("click", function () {
      login();
    });

  }

}


async function login() {

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) {
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {

    showNotification(
      "Please enter your email and password.",
      "warning"
    );

    return;
  }

  showLoading(true);

  /*
   * ADMIN LOGIN
   */

  if (
    email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  ) {

    if (password !== ADMIN_PASSWORD) {

      showLoading(false);

      showNotification(
        "Incorrect admin password.",
        "error"
      );

      return;
    }

    /*
     * Ask Google Apps Script to send OTP
     */

    const result = await apiRequest("sendAdminOTP", {
      email: email
    });

    showLoading(false);

    if (result.success) {

      sessionStorage.setItem(
        "pendingOTPEmail",
        email
      );

      sessionStorage.setItem(
        "pendingOTPType",
        "admin"
      );

      showOTPModal();

      showNotification(
        "OTP has been sent to the admin Gmail.",
        "success"
      );

    }

    return;
  }


  /*
   * CUSTOMER LOGIN
   */

  const result = await apiRequest("loginUser", {
    email: email,
    password: password
  });

  showLoading(false);

  if (!result.success) {
    return;
  }

  /*
   * Customer OTP
   */

  const otpResult = await apiRequest("sendCustomerOTP", {
    email: email
  });

  if (otpResult.success) {

    sessionStorage.setItem(
      "pendingOTPEmail",
      email
    );

    sessionStorage.setItem(
      "pendingOTPType",
      "customer"
    );

    sessionStorage.setItem(
      "pendingUser",
      JSON.stringify(result.user)
    );

    showOTPModal();

    showNotification(
      "OTP has been sent to your Gmail.",
      "success"
    );

  }

}


/* =========================================================
   8. OTP MODAL
   ========================================================= */

function showOTPModal() {

  const modal = document.getElementById("otpModal");

  if (modal) {
    modal.style.display = "flex";
  }

  const otpInput = document.getElementById("otpCode");

  if (otpInput) {

    otpInput.value = "";

    setTimeout(function () {
      otpInput.focus();
    }, 200);

  }

}


function closeOTPModal() {

  const modal = document.getElementById("otpModal");

  if (modal) {
    modal.style.display = "none";
  }

}


async function verifyOTP() {

  const otpInput = document.getElementById("otpCode");

  if (!otpInput) {
    return;
  }

  const otp = otpInput.value.trim();

  if (!otp) {

    showNotification(
      "Enter the OTP code.",
      "warning"
    );

    return;
  }

  if (otp.length !== OTP_LENGTH) {

    showNotification(
      "OTP must contain 6 digits.",
      "warning"
    );

    return;
  }

  const email =
    sessionStorage.getItem("pendingOTPEmail");

  const type =
    sessionStorage.getItem("pendingOTPType");

  if (!email || !type) {

    showNotification(
      "OTP session expired. Please login again.",
      "error"
    );

    return;
  }

  showLoading(true);

  const result = await apiRequest("verifyOTP", {
    email: email,
    otp: otp,
    type: type
  });

  showLoading(false);

  if (!result.success) {
    return;
  }

  /*
   * ADMIN
   */

  if (type === "admin") {

    currentUser = {
      email: ADMIN_EMAIL,
      name: "Joesen Reyes",
      role: "admin"
    };

  }

  /*
   * CUSTOMER
   */

  else {

    let savedUser =
      sessionStorage.getItem("pendingUser");

    let user = null;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      user = {};
    }

    currentUser = {
      ...user,
      email: email,
      role: "customer"
    };

  }


  /*
   * Save session
   */

  localStorage.setItem(
    "techzoneUser",
    JSON.stringify(currentUser)
  );


  /*
   * Clear OTP session
   */

  sessionStorage.removeItem("pendingOTPEmail");
  sessionStorage.removeItem("pendingOTPType");
  sessionStorage.removeItem("pendingUser");


  closeOTPModal();

  showMainApplication();

  await logActivity(
    "LOGIN",
    "User logged in"
  );

  await loadAllData();

  showNotification(
    "Login successful.",
    "success"
  );

}


/* =========================================================
   9. RESEND OTP
   ========================================================= */

async function resendOTP() {

  const email =
    sessionStorage.getItem("pendingOTPEmail");

  const type =
    sessionStorage.getItem("pendingOTPType");

  if (!email || !type) {

    showNotification(
      "Login session expired.",
      "error"
    );

    return;
  }

  showLoading(true);

  let action =
    type === "admin"
      ? "sendAdminOTP"
      : "sendCustomerOTP";

  const result = await apiRequest(action, {
    email: email
  });

  showLoading(false);

  if (result.success) {

    showNotification(
      "New OTP sent successfully.",
      "success"
    );

  }

}


/* =========================================================
   10. LOAD SAVED SESSION
   ========================================================= */

function loadSavedSession() {

  const saved =
    localStorage.getItem("techzoneUser");

  if (!saved) {
    return;
  }

  try {

    currentUser = JSON.parse(saved);

  } catch (error) {

    localStorage.removeItem("techzoneUser");

    currentUser = null;

  }

}


/* =========================================================
   11. LOGOUT
   ========================================================= */

function setupLogout() {

  const logoutButton =
    document.getElementById("logoutBtn");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      confirmLogout
    );

  }

}


function confirmLogout() {

  const answer = confirm(
    "Are you sure you want to log out?"
  );

  if (!answer) {
    return;
  }

  logout();

}


async function logout() {

  if (currentUser) {

    await logActivity(
      "LOGOUT",
      "User logged out"
    );

  }

  localStorage.removeItem(
    "techzoneUser"
  );

  currentUser = null;

  products = [];

  categories = [];

  deletedProducts = [];

  activityLogs = [];

  showLoginPage();

  showNotification(
    "You have been logged out.",
    "success"
  );

}


/* =========================================================
   12. USER INTERFACE
   ========================================================= */

function updateUserInterface() {

  if (!currentUser) {
    return;
  }

  const userName =
    document.getElementById("userName");

  const userRole =
    document.getElementById("userRole");

  if (userName) {

    userName.textContent =
      currentUser.name ||
      currentUser.email ||
      "User";

  }

  if (userRole) {

    userRole.textContent =
      currentUser.role === "admin"
        ? "Administrator"
        : "Customer";

  }


  /*
   * Customer is VIEW ONLY
   */

  const adminOnlyElements =
    document.querySelectorAll(
      ".admin-only"
    );

  adminOnlyElements.forEach(function (element) {

    if (currentUser.role === "admin") {

      element.style.display = "";

    } else {

      element.style.display = "none";

    }

  });


  /*
   * Activity Logs only admin
   */

  const activityMenu =
    document.getElementById("activityLogsMenu");

  if (activityMenu) {

    activityMenu.style.display =
      currentUser.role === "admin"
        ? ""
        : "none";

  }


  /*
   * Restore only admin
   */

  const restoreMenu =
    document.getElementById("restoreMenu");

  if (restoreMenu) {

    restoreMenu.style.display =
      currentUser.role === "admin"
        ? ""
        : "none";

  }

}


/* =========================================================
   13. NAVIGATION
   ========================================================= */

function setupNavigation() {

  const navigation =
    document.querySelectorAll(
      "[data-page]"
    );

  navigation.forEach(function (item) {

    item.addEventListener(
      "click",
      function () {

        const page =
          this.getAttribute("data-page");

        openPage(page);

      }
    );

  });

}


function openPage(page) {

  if (!currentUser) {
    return;
  }


  /*
   * Customer cannot access admin pages
   */

  const adminPages = [
    "activityLogs",
    "restore",
    "users"
  ];

  if (
    currentUser.role !== "admin" &&
    adminPages.includes(page)
  ) {

    showNotification(
      "Admin access only.",
      "error"
    );

    return;
  }


  currentPage = page;


  const pages =
    document.querySelectorAll(
      ".page"
    );

  pages.forEach(function (element) {

    element.style.display = "none";

  });


  const selected =
    document.getElementById(
      page + "Page"
    );

  if (selected) {

    selected.style.display = "block";

  }


  switch (page) {

    case "dashboard":
      renderDashboard();
      break;

    case "products":
      renderProducts();
      break;

    case "categories":
      renderCategories();
      break;

    case "activityLogs":
      renderActivityLogs();
      break;

    case "restore":
      renderDeletedProducts();
      break;

    case "users":
      renderUsers();
      break;

  }

}


/* =========================================================
   14. LOAD ALL DATA
   ========================================================= */

async function loadAllData() {

  showLoading(true);

  try {

    const productResult =
      await apiRequest(
        "getProducts"
      );

    if (productResult.success) {

      products =
        productResult.products || [];

    }


    const categoryResult =
      await apiRequest(
        "getCategories"
      );

    if (categoryResult.success) {

      categories =
        categoryResult.categories || [];

    }


    if (currentUser.role === "admin") {

      const deletedResult =
        await apiRequest(
          "getDeletedProducts"
        );

      if (deletedResult.success) {

        deletedProducts =
          deletedResult.products || [];

      }


      const logsResult =
        await apiRequest(
          "getActivityLogs"
        );

      if (logsResult.success) {

        activityLogs =
          logsResult.logs || [];

      }

    }


    renderDashboard();

    renderProducts();

    renderCategories();

    if (currentUser.role === "admin") {

      renderActivityLogs();

      renderDeletedProducts();

    }

  } catch (error) {

    console.error(
      "Load data error:",
      error
    );

  }

  showLoading(false);

}


/* =========================================================
   15. DASHBOARD
   ========================================================= */

function renderDashboard() {

  const totalProducts =
    document.getElementById(
      "totalProducts"
    );

  const totalCategories =
    document.getElementById(
      "totalCategories"
    );

  const totalUsers =
    document.getElementById(
      "totalUsers"
    );

  const deletedCount =
    document.getElementById(
      "deletedProducts"
    );


  if (totalProducts) {

    totalProducts.textContent =
      products.length;

  }


  if (totalCategories) {

    totalCategories.textContent =
      categories.length;

  }


  if (deletedCount) {

    deletedCount.textContent =
      deletedProducts.length;

  }


  if (
    currentUser &&
    currentUser.role === "admin"
  ) {

    loadUserCount();

  }

}


async function loadUserCount() {

  const result =
    await apiRequest(
      "getUsers"
    );

  if (!result.success) {
    return;
  }

  const totalUsers =
    document.getElementById(
      "totalUsers"
    );

  if (totalUsers) {

    totalUsers.textContent =
      (result.users || []).length;

  }

}


/* =========================================================
   16. PRODUCTS
   ========================================================= */

function renderProducts() {

  const container =
    document.getElementById(
      "productsContainer"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";


  if (products.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>No Products Found</h3>
        <p>There are currently no products.</p>
      </div>
    `;

    return;
  }


  products.forEach(function (product) {

    const card =
      document.createElement("div");

    card.className =
      "product-card";


    const adminButtons =
      currentUser &&
      currentUser.role === "admin"
        ? `
          <div class="product-actions">

            <button
              class="btn btn-primary"
              onclick="requestUpdateProduct('${escapeJS(product.id)}')">
              Update
            </button>

            <button
              class="btn btn-danger"
              onclick="requestDeleteProduct('${escapeJS(product.id)}')">
              Delete
            </button>

          </div>
        `
        : "";


    card.innerHTML = `

      <div class="product-image">

        ${
          product.image
            ? `<img src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name || "Product")}">`
            : `<div class="no-image">
                 No Image
               </div>`
        }

      </div>


      <div class="product-content">

        <span class="product-category">
          ${escapeHTML(product.category || "Uncategorized")}
        </span>

        <h3>
          ${escapeHTML(product.name || "")}
        </h3>

        <p class="product-description">
          ${escapeHTML(product.description || "")}
        </p>

        <div class="product-price">
          ₱${formatNumber(product.price)}
        </div>

        <div class="product-stock">
          Stock: ${formatNumber(product.stock)}
        </div>

        ${adminButtons}

      </div>

    `;


    container.appendChild(card);

  });

}


/* =========================================================
   17. ADD PRODUCT
   ========================================================= */

function setupProductForm() {

  const form =
    document.getElementById(
      "productForm"
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      saveProduct();

    }
  );

}


async function saveProduct() {

  if (!isAdmin()) {

    showNotification(
      "Only admin can add or update products.",
      "error"
    );

    return;
  }


  /*
   * Ask admin passcode
   */

  const passcode =
    prompt(
      "Enter ADMIN PASSCODE to add/update product:"
    );


  if (passcode === null) {
    return;
  }


  if (passcode !== ADMIN_PASSCODE) {

    showNotification(
      "Incorrect admin passcode.",
      "error"
    );

    return;
  }


  const name =
    getValue("productName");

  const category =
    getValue("productCategory");

  const description =
    getValue("productDescription");

  const price =
    getValue("productPrice");

  const stock =
    getValue("productStock");

  const image =
    getValue("productImage");


  if (!name) {

    showNotification(
      "Product name is required.",
      "warning"
    );

    return;
  }


  if (!price) {

    showNotification(
      "Product price is required.",
      "warning"
    );

    return;
  }


  showLoading(true);


  const data = {

    id:
      editingProductId ||
      generateID("PROD"),

    name: name,

    category: category,

    description: description,

    price: Number(price),

    stock: Number(stock || 0),

    image: image,

    createdBy:
      currentUser.email,

    updatedBy:
      currentUser.email

  };


  let result;


  if (editingProductId) {

    result =
      await apiRequest(
        "updateProduct",
        data
      );

  } else {

    result =
      await apiRequest(
        "addProduct",
        data
      );

  }


  showLoading(false);


  if (!result.success) {
    return;
  }


  await logActivity(

    editingProductId
      ? "UPDATE_PRODUCT"
      : "ADD_PRODUCT",

    editingProductId
      ? `Updated product: ${name}`
      : `Added product: ${name}`

  );


  showNotification(

    editingProductId
      ? "Product updated successfully."
      : "Product added successfully.",

    "success"

  );


  editingProductId = null;


  resetProductForm();


  await loadAllData();

}


/* =========================================================
   18. UPDATE PRODUCT
   ========================================================= */

function requestUpdateProduct(id) {

  if (!isAdmin()) {

    showNotification(
      "Admin only.",
      "error"
    );

    return;
  }


  const product =
    products.find(
      p => String(p.id) === String(id)
    );


  if (!product) {

    showNotification(
      "Product not found.",
      "error"
    );

    return;
  }


  editingProductId =
    product.id;


  setValue(
    "productName",
    product.name
  );

  setValue(
    "productCategory",
    product.category
  );

  setValue(
    "productDescription",
    product.description
  );

  setValue(
    "productPrice",
    product.price
  );

  setValue(
    "productStock",
    product.stock
  );

  setValue(
    "productImage",
    product.image
  );


  const formTitle =
    document.getElementById(
      "productFormTitle"
    );

  if (formTitle) {

    formTitle.textContent =
      "Update Product";

  }


  const form =
    document.getElementById(
      "productForm"
    );

  if (form) {

    form.scrollIntoView({
      behavior: "smooth"
    });

  }

}


/* =========================================================
   19. DELETE PRODUCT
   ========================================================= */

async function requestDeleteProduct(id) {

  if (!isAdmin()) {

    showNotification(
      "Only admin can delete products.",
      "error"
    );

    return;
  }


  /*
   * Passcode
   */

  const passcode =
    prompt(
      "Enter ADMIN PASSCODE to delete this product:"
    );


  if (passcode === null) {
    return;
  }


  if (passcode !== ADMIN_PASSCODE) {

    showNotification(
      "Incorrect admin passcode.",
      "error"
    );

    return;
  }


  const product =
    products.find(
      p => String(p.id) === String(id)
    );


  if (!product) {

    showNotification(
      "Product not found.",
      "error"
    );

    return;
  }


  /*
   * Delete confirmation
   */

  const confirmed =
    confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThe product can still be restored from Restore Data.`
    );


  if (!confirmed) {

    showNotification(
      "Delete cancelled.",
      "info"
    );

    return;
  }


  showLoading(true);


  const result =
    await apiRequest(
      "deleteProduct",
      {
        id: id,
        deletedBy: currentUser.email
      }
    );


  showLoading(false);


  if (!result.success) {
    return;
  }


  await logActivity(
    "DELETE_PRODUCT",
    `Deleted product: ${product.name}`
  );


  showNotification(
    "Product moved to deleted data.",
    "success"
  );


  await loadAllData();

}


/* =========================================================
   20. RESTORE PRODUCT
   ========================================================= */

async function restoreProduct(id) {

  if (!isAdmin()) {

    showNotification(
      "Admin only.",
      "error"
    );

    return;
  }


  const passcode =
    prompt(
      "Enter ADMIN PASSCODE to restore:"
    );


  if (passcode !== ADMIN_PASSCODE) {

    showNotification(
      "Incorrect admin passcode.",
      "error"
    );

    return;
  }


  const product =
    deletedProducts.find(
      p => String(p.id) === String(id)
    );


  if (!product) {

    showNotification(
      "Deleted product not found.",
      "error"
    );

    return;
  }


  const confirmed =
    confirm(
      `Restore "${product.name}"?`
    );


  if (!confirmed) {
    return;
  }


  showLoading(true);


  const result =
    await apiRequest(
      "restoreProduct",
      {
        id: id,
        restoredBy: currentUser.email
      }
    );


  showLoading(false);


  if (!result.success) {
    return;
  }


  await logActivity(
    "RESTORE_PRODUCT",
    `Restored product: ${product.name}`
  );


  showNotification(
    "Product restored successfully.",
    "success"
  );


  await loadAllData();

}


/* =========================================================
   21. RENDER DELETED PRODUCTS
   ========================================================= */

function renderDeletedProducts() {

  const container =
    document.getElementById(
      "deletedProductsContainer"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";


  if (
    !deletedProducts ||
    deletedProducts.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>No Deleted Products</h3>
        <p>Deleted products will appear here.</p>
      </div>
    `;

    return;
  }


  deletedProducts.forEach(
    function (product) {

      const item =
        document.createElement("div");

      item.className =
        "deleted-product";


      item.innerHTML = `

        <div>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p>
            ${escapeHTML(product.category || "")}
          </p>

        </div>

        <button
          class="btn btn-success"
          onclick="restoreProduct('${escapeJS(product.id)}')">

          Restore

        </button>

      `;


      container.appendChild(item);

    }
  );

}


/* =========================================================
   22. CATEGORIES
   ========================================================= */

function setupCategoryForm() {

  const form =
    document.getElementById(
      "categoryForm"
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      addCategory();

    }
  );

}


async function addCategory() {

  if (!isAdmin()) {

    showNotification(
      "Admin only.",
      "error"
    );

    return;
  }


  const passcode =
    prompt(
      "Enter ADMIN PASSCODE:"
    );


  if (passcode !== ADMIN_PASSCODE) {

    showNotification(
      "Incorrect admin passcode.",
      "error"
    );

    return;
  }


  const input =
    document.getElementById(
      "categoryName"
    );


  if (!input) {
    return;
  }


  const name =
    input.value.trim();


  if (!name) {

    showNotification(
      "Enter category name.",
      "warning"
    );

    return;
  }


  showLoading(true);


  const result =
    await apiRequest(
      "addCategory",
      {
        id: generateID("CAT"),
        name: name,
        createdBy: currentUser.email
      }
    );


  showLoading(false);


  if (!result.success) {
    return;
  }


  await logActivity(
    "ADD_CATEGORY",
    `Added category: ${name}`
  );


  input.value = "";


  showNotification(
    "Category added.",
    "success"
  );


  await loadAllData();

}


function renderCategories() {

  const container =
    document.getElementById(
      "categoriesContainer"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";


  categories.forEach(
    function (category) {

      const item =
        document.createElement("div");

      item.className =
        "category-item";

      item.textContent =
        category.name;

      container.appendChild(item);

    }
  );


  /*
   * Update product category dropdown
   */

  const select =
    document.getElementById(
      "productCategory"
    );

  if (select) {

    const current =
      select.value;

    select.innerHTML =
      `<option value="">Select Category</option>`;


    categories.forEach(
      function (category) {

        const option =
          document.createElement("option");

        option.value =
          category.name;

        option.textContent =
          category.name;

        select.appendChild(option);

      }
    );


    select.value =
      current;

  }

}


/* =========================================================
   23. ACTIVITY LOGS
   ========================================================= */

async function logActivity(
  action,
  description
) {

  if (!currentUser) {
    return;
  }


  const log = {

    id:
      generateID("LOG"),

    user:
      currentUser.email,

    userName:
      currentUser.name ||
      currentUser.email,

    role:
      currentUser.role,

    action:
      action,

    description:
      description,

    date:
      new Date().toISOString(),

    timestamp:
      new Date().toLocaleString()

  };


  /*
   * Send to Google Sheet
   */

  const result =
    await apiRequest(
      "addActivityLog",
      log
    );


  /*
   * Also keep locally for immediate UI
   */

  if (result.success) {

    activityLogs.unshift(log);

    renderActivityLogs();

  }

}


function renderActivityLogs() {

  const container =
    document.getElementById(
      "activityLogsContainer"
    );

  if (!container) {
    return;
  }


  if (
    !currentUser ||
    currentUser.role !== "admin"
  ) {

    container.innerHTML = `
      <div class="empty-state">
        Admin access only.
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  if (
    !activityLogs ||
    activityLogs.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">
        No activity logs yet.
      </div>
    `;

    return;
  }


  activityLogs.forEach(
    function (log) {

      const row =
        document.createElement("div");

      row.className =
        "activity-log";


      row.innerHTML = `

        <div class="activity-icon">
          ${getActivityIcon(log.action)}
        </div>

        <div class="activity-info">

          <strong>
            ${escapeHTML(
              log.userName ||
              log.user ||
              "Unknown"
            )}
          </strong>

          <span>
            ${escapeHTML(
              log.action || ""
            )}
          </span>

          <p>
            ${escapeHTML(
              log.description || ""
            )}
          </p>

        </div>

        <div class="activity-time">
          ${escapeHTML(
            log.timestamp ||
            formatDate(log.date)
          )}
        </div>

      `;


      container.appendChild(row);

    }
  );

}


function getActivityIcon(action) {

  switch (action) {

    case "LOGIN":
      return "🔐";

    case "LOGOUT":
      return "🚪";

    case "ADD_PRODUCT":
      return "➕";

    case "UPDATE_PRODUCT":
      return "✏️";

    case "DELETE_PRODUCT":
      return "🗑️";

    case "RESTORE_PRODUCT":
      return "♻️";

    case "ADD_CATEGORY":
      return "📁";

    default:
      return "📌";

  }

}


/* =========================================================
   24. USERS
   ========================================================= */

async function renderUsers() {

  if (!isAdmin()) {
    return;
  }


  const container =
    document.getElementById(
      "usersContainer"
    );

  if (!container) {
    return;
  }


  const result =
    await apiRequest(
      "getUsers"
    );


  if (!result.success) {
    return;
  }


  const users =
    result.users || [];


  container.innerHTML = "";


  users.forEach(
    function (user) {

      const item =
        document.createElement("div");

      item.className =
        "user-item";


      item.innerHTML = `

        <div>

          <strong>
            ${escapeHTML(
              user.name ||
              user.email ||
              ""
            )}
          </strong>

          <p>
            ${escapeHTML(
              user.email || ""
            )}
          </p>

        </div>

        <span>
          Customer
        </span>

      `;


      container.appendChild(item);

    }
  );

}


/* =========================================================
   25. CUSTOMER REGISTRATION
   ========================================================= */

async function registerCustomer() {

  const name =
    getValue("registerName");

  const email =
    getValue("registerEmail");

  const password =
    getValue("registerPassword");

  const confirmPassword =
    getValue("registerConfirmPassword");


  if (!name || !email || !password) {

    showNotification(
      "Please complete all required fields.",
      "warning"
    );

    return;
  }


  if (
    password !== confirmPassword
  ) {

    showNotification(
      "Passwords do not match.",
      "error"
    );

    return;
  }


  if (!isValidEmail(email)) {

    showNotification(
      "Invalid email address.",
      "error"
    );

    return;
  }


  showLoading(true);


  const result =
    await apiRequest(
      "registerUser",
      {
        id: generateID("USR"),
        name: name,
        email: email,
        password: password,
        role: "customer"
      }
    );


  showLoading(false);


  if (!result.success) {
    return;
  }


  showNotification(
    "Account created. OTP will be sent to your Gmail.",
    "success"
  );


  /*
   * Send OTP after registration
   */

  const otpResult =
    await apiRequest(
      "sendCustomerOTP",
      {
        email: email
      }
    );


  if (otpResult.success) {

    sessionStorage.setItem(
      "pendingOTPEmail",
      email
    );

    sessionStorage.setItem(
      "pendingOTPType",
      "customer"
    );

    sessionStorage.setItem(
      "pendingUser",
      JSON.stringify({
        id: result.userId,
        name: name,
        email: email,
        role: "customer"
      })
    );

    showOTPModal();

  }

}


/* =========================================================
   26. SEARCH PRODUCTS
   ========================================================= */

function setupSearch() {

  const search =
    document.getElementById(
      "productSearch"
    );

  if (!search) {
    return;
  }


  search.addEventListener(
    "input",
    function () {

      const keyword =
        this.value
          .trim()
          .toLowerCase();


      if (!keyword) {

        renderProducts();

        return;

      }


      const filtered =
        products.filter(
          function (product) {

            return (

              String(
                product.name || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                product.category || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                product.description || ""
              )
                .toLowerCase()
                .includes(keyword)

            );

          }
        );


      renderFilteredProducts(
        filtered
      );

    }
  );

}


function renderFilteredProducts(
  filteredProducts
) {

  const original =
    products;

  products =
    filteredProducts;

  renderProducts();

  products =
    original;

}


/* =========================================================
   27. PRODUCT FORM RESET
   ========================================================= */

function resetProductForm() {

  const form =
    document.getElementById(
      "productForm"
    );

  if (form) {
    form.reset();
  }


  editingProductId =
    null;


  const title =
    document.getElementById(
      "productFormTitle"
    );

  if (title) {

    title.textContent =
      "Add Product";

  }

}


/* =========================================================
   28. ADMIN CHECK
   ========================================================= */

function isAdmin() {

  return (
    currentUser &&
    currentUser.role === "admin"
  );

}


/* =========================================================
   29. LOADING INDICATOR
   ========================================================= */

function showLoading(show) {

  const loader =
    document.getElementById(
      "loadingOverlay"
    );

  if (!loader) {
    return;
  }


  loader.style.display =
    show
      ? "flex"
      : "none";

}


/* =========================================================
   30. NOTIFICATION
   ========================================================= */

function showNotification(
  message,
  type = "info"
) {

  let container =
    document.getElementById(
      "notificationContainer"
    );


  if (!container) {

    container =
      document.createElement("div");

    container.id =
      "notificationContainer";

    document.body.appendChild(
      container
    );

  }


  const notification =
    document.createElement("div");


  notification.className =
    `notification notification-${type}`;


  notification.innerHTML = `

    <div class="notification-message">
      ${escapeHTML(message)}
    </div>

    <button
      class="notification-close"
      onclick="this.parentElement.remove()">
      ×
    </button>

  `;


  container.appendChild(
    notification
  );


  setTimeout(
    function () {

      if (
        notification &&
        notification.parentElement
      ) {

        notification.remove();

      }

    },
    5000
  );

}


/* =========================================================
   31. HELPER FUNCTIONS
   ========================================================= */

function getValue(id) {

  const element =
    document.getElementById(id);

  if (!element) {
    return "";
  }

  return element.value.trim();

}


function setValue(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.value =
      value ?? "";

  }

}


function formatNumber(value) {

  const number =
    Number(value || 0);

  return number.toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

}


function formatDate(date) {

  if (!date) {
    return "";
  }

  try {

    return new Date(date)
      .toLocaleString(
        "en-PH"
      );

  } catch (error) {

    return String(date);

  }

}


function generateID(prefix) {

  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );

}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}


/* =========================================================
   32. SECURITY / HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

  if (value === null ||
      value === undefined) {

    return "";

  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeJS(value) {

  if (value === null ||
      value === undefined) {

    return "";

  }

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

}


/* =========================================================
   33. GLOBAL FUNCTIONS
   ========================================================= */

window.login =
  login;

window.verifyOTP =
  verifyOTP;

window.resendOTP =
  resendOTP;

window.closeOTPModal =
  closeOTPModal;

window.logout =
  logout;

window.openPage =
  openPage;

window.saveProduct =
  saveProduct;

window.requestUpdateProduct =
  requestUpdateProduct;

window.requestDeleteProduct =
  requestDeleteProduct;

window.restoreProduct =
  restoreProduct;

window.addCategory =
  addCategory;

window.registerCustomer =
  registerCustomer;

window.showNotification =
  showNotification;

window.resetProductForm =
  resetProductForm;


/* =========================================================
   34. DEBUG INFORMATION
   ========================================================= */

console.log(
  "========================================"
);

console.log(
  "TECHZONE STORE"
);

console.log(
  "Frontend loaded successfully."
);

console.log(
  "APP_URL:",
  APP_URL
);

console.log(
  "========================================"
);
