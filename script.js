// =====================================================
// TECHZONE STORE - SCRIPT.JS
// =====================================================

// AFTER DEPLOYING GOOGLE APPS SCRIPT,
// REPLACE THIS URL WITH YOUR WEB APP URL.

const API_URL = "https://script.google.com/macros/s/AKfycbyDVrmpO-EcJFwcqXj8_zzGJb1Pzp59WyOfAhX31miQIpK9TgNvS7YM8g_iOdayB6wSWQ/exec";

let currentUser = null;
let currentRole = null;
let pendingEmail = null;


/* ================================
   GOOGLE APPS SCRIPT CALL
================================ */

function server(functionName, ...args) {

  return new Promise((resolve, reject) => {

    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName](...args);

  });

}


/* ================================
   TOAST
================================ */

function toast(message) {

  const container =
    document.getElementById("toast");

  const div =
    document.createElement("div");

  div.className = "toast";

  div.innerText = message;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);

}


/* ================================
   LOGIN
================================ */

async function login() {

  const email =
    document.getElementById("loginEmail").value;

  const password =
    document.getElementById("loginPassword").value;

  if (!email || !password) {

    toast("Please enter email and password.");

    return;

  }

  try {

    const result =
      await server(
        "login",
        email,
        password
      );

    if (!result.success) {

      toast(result.message);

      return;

    }

    pendingEmail = result.email;

    currentRole = result.role;

    showPage("otpPage");

    toast(result.message);

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   VERIFY OTP
================================ */

async function verifyOTP() {

  const otp =
    document.getElementById("otpInput").value;

  if (otp.length !== 6) {

    toast("Enter the 6-digit OTP.");

    return;

  }

  try {

    const result =
      await server(
        "verifyOTP",
        pendingEmail,
        otp
      );

    if (!result.success) {

      toast(result.message);

      return;

    }

    currentUser = result.email;

    currentRole = result.role;

    document.getElementById(
      "currentUser"
    ).innerText = currentUser;

    document.getElementById(
      "currentRole"
    ).innerText =
      " | " + currentRole;

    document.getElementById(
      "customerEmail"
    ).innerText = currentUser;

    document.getElementById(
      "customerRole"
    ).innerText = currentRole;

    document.getElementById(
      "dashboardRole"
    ).innerText = currentRole;

    showPage("dashboard");

    configureRole();

    loadProducts();

    loadCategories();

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   REGISTER
================================ */

async function register() {

  const name =
    document.getElementById("regName").value;

  const email =
    document.getElementById("regEmail").value;

  const password =
    document.getElementById("regPassword").value;

  const confirm =
    document.getElementById("regConfirm").value;

  if (!name || !email || !password) {

    toast("Please complete all fields.");

    return;

  }

  if (password !== confirm) {

    toast("Passwords do not match.");

    return;

  }

  if (password.length < 6) {

    toast("Password must be at least 6 characters.");

    return;

  }

  try {

    const result =
      await server(
        "registerCustomer",
        name,
        email,
        password
      );

    if (!result.success) {

      toast(result.message);

      return;

    }

    pendingEmail = result.email;

    currentRole = "Customer";

    showPage("otpPage");

    toast(result.message);

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   ROLE CONTROL
================================ */

function configureRole() {

  const addButton =
    document.getElementById(
      "addProductButton"
    );

  const logsButton =
    document.getElementById(
      "logsButton"
    );

  if (currentRole === "Admin") {

    addButton.style.display = "block";

    logsButton.style.display = "block";

  } else {

    addButton.style.display = "none";

    logsButton.style.display = "none";

  }

}


/* ================================
   LOAD PRODUCTS
================================ */

async function loadProducts() {

  try {

    const products =
      await server("getProducts");

    const container =
      document.getElementById(
        "productsContainer"
      );

    container.innerHTML = "";

    document.getElementById(
      "totalProducts"
    ).innerText = products.length;

    document.getElementById(
      "reportProducts"
    ).innerText = products.length;

    products.forEach(product => {

      const div =
        document.createElement("div");

      div.className = "product";

      const image =
        product.image ||
        "https://via.placeholder.com/500x300?text=TechZone";

      div.innerHTML = `

        <img src="${image}">

        <h3>${escapeHTML(product.name)}</h3>

        <p>${escapeHTML(product.category)}</p>

        <div class="price">
          ₱${Number(product.price).toLocaleString()}
        </div>

        <p>
          Stock: ${product.stock}
        </p>

        <p>
          ${escapeHTML(product.description || "")}
        </p>

      `;

      if (currentRole === "Admin") {

        const actions =
          document.createElement("div");

        actions.className =
          "product-actions";

        actions.innerHTML = `

          <button class="edit-btn">
            Update
          </button>

          <button class="delete-btn">
            Delete
          </button>

        `;

        actions
          .querySelector(".edit-btn")
          .onclick = () =>
            editProduct(product);

        actions
          .querySelector(".delete-btn")
          .onclick = () =>
            removeProduct(product.id);

        div.appendChild(actions);

      }

      container.appendChild(div);

    });

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   LOAD CATEGORIES
================================ */

async function loadCategories() {

  try {

    const categories =
      await server("getCategories");

    document.getElementById(
      "totalCategories"
    ).innerText = categories.length;

    document.getElementById(
      "reportCategories"
    ).innerText = categories.length;

    const container =
      document.getElementById(
        "categoriesContainer"
      );

    const select =
      document.getElementById(
        "productCategory"
      );

    container.innerHTML = "";

    select.innerHTML = "";

    categories.forEach(category => {

      const div =
        document.createElement("div");

      div.className = "category";

      div.innerText =
        "🏷 " + category.name;

      container.appendChild(div);

      const option =
        document.createElement("option");

      option.value =
        category.name;

      option.textContent =
        category.name;

      select.appendChild(option);

    });

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   ADD / UPDATE PRODUCT
================================ */

function openProductModal(product = null) {

  if (currentRole !== "Admin") {

    toast("Admin only.");

    return;

  }

  document.getElementById(
    "productModal"
  ).classList.remove("hidden");

  if (product) {

    document.getElementById(
      "modalTitle"
    ).innerText = "Update Product";

    document.getElementById(
      "productId"
    ).value = product.id;

    document.getElementById(
      "productName"
    ).value = product.name;

    document.getElementById(
      "productCategory"
    ).value = product.category;

    document.getElementById(
      "productPrice"
    ).value = product.price;

    document.getElementById(
      "productStock"
    ).value = product.stock;

    document.getElementById(
      "productDescription"
    ).value = product.description;

    document.getElementById(
      "productImage"
    ).value = product.image;

  } else {

    document.getElementById(
      "modalTitle"
    ).innerText = "Add Product";

    document.getElementById(
      "productId"
    ).value = "";

    document.getElementById(
      "productName"
    ).value = "";

    document.getElementById(
      "productPrice"
    ).value = "";

    document.getElementById(
      "productStock"
    ).value = "";

    document.getElementById(
      "productDescription"
    ).value = "";

    document.getElementById(
      "productImage"
    ).value = "";

  }

}


function closeProductModal() {

  document.getElementById(
    "productModal"
  ).classList.add("hidden");

}


/* ================================
   SAVE PRODUCT
================================ */

async function saveProduct() {

  if (currentRole !== "Admin") {

    toast("Only Admin can modify products.");

    return;

  }

  const id =
    document.getElementById(
      "productId"
    ).value;

  const product = {

    id: id,

    name:
      document.getElementById(
        "productName"
      ).value,

    category:
      document.getElementById(
        "productCategory"
      ).value,

    price:
      document.getElementById(
        "productPrice"
      ).value,

    stock:
      document.getElementById(
        "productStock"
      ).value,

    description:
      document.getElementById(
        "productDescription"
      ).value,

    image:
      document.getElementById(
        "productImage"
      ).value

  };


  if (!product.name || !product.price) {

    toast("Product name and price are required.");

    return;

  }


  const action =
    id ? "update" : "add";


  const confirmed =
    confirm(
      action === "add"
        ? "Are you sure you want to ADD this product?"
        : "Are you sure you want to UPDATE this product?"
    );


  if (!confirmed) return;


  try {

    let result;

    if (id) {

      result =
        await server(
          "updateProduct",
          product,
          currentUser
        );

    } else {

      result =
        await server(
          "addProduct",
          product,
          currentUser
        );

    }


    if (!result.success) {

      toast(result.message);

      return;

    }


    toast(result.message);

    closeProductModal();

    loadProducts();

    loadLogs();

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   EDIT PRODUCT
================================ */

function editProduct(product) {

  if (currentRole !== "Admin") {

    toast("Admin only.");

    return;

  }

  openProductModal(product);

}


/* ================================
   DELETE PRODUCT
================================ */

async function removeProduct(productId) {

  if (currentRole !== "Admin") {

    toast("Admin only.");

    return;

  }


  const confirmed =
    confirm(
      "⚠️ Are you sure you want to DELETE this product?\n\nThis action cannot be undone."
    );


  if (!confirmed) {

    toast("Delete cancelled.");

    return;

  }


  try {

    const result =
      await server(
        "deleteProduct",
        productId,
        currentUser
      );


    if (!result.success) {

      toast(result.message);

      return;

    }


    toast("Product deleted successfully.");

    loadProducts();

    loadLogs();

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   ACTIVITY LOGS
================================ */

async function loadLogs() {

  if (currentRole !== "Admin") return;

  try {

    const logs =
      await server(
        "getActivityLogs",
        currentUser
      );

    const container =
      document.getElementById(
        "logsContainer"
      );

    container.innerHTML = "";

    if (!Array.isArray(logs)) {

      container.innerText =
        logs.message || "No logs.";

      return;

    }

    logs.forEach(log => {

      const div =
        document.createElement("div");

      div.className = "log";

      div.innerHTML = `

        <div class="log-action">
          ${escapeHTML(log.action)}
        </div>

        <div>
          ${escapeHTML(log.details)}
        </div>

        <div>
          User:
          ${escapeHTML(log.email)}
        </div>

        <div>
          Role:
          ${escapeHTML(log.role)}
        </div>

        <small>
          ${escapeHTML(String(log.date))}
        </small>

      `;

      container.appendChild(div);

    });

  } catch (error) {

    toast(error.message);

  }

}


/* ================================
   LOGOUT
================================ */

async function logout() {

  const confirmed =
    confirm(
      "Are you sure you want to logout?"
    );

  if (!confirmed) {

    toast("Logout cancelled.");

    return;

  }

  try {

    await server(
      "logout",
      currentUser,
      currentRole
    );

  } catch (error) {}

  currentUser = null;
  currentRole = null;
  pendingEmail = null;

  showPage("loginPage");

  toast("You have been logged out.");

}


/* ================================
   PAGE NAVIGATION
================================ */

function showPage(pageId) {

  document
    .querySelectorAll(".page, #dashboard")
    .forEach(element => {

      element.classList.add("hidden");

    });

  document
    .getElementById(pageId)
    .classList.remove("hidden");

}


function showLogin() {

  showPage("loginPage");

}


function showRegister() {

  showPage("registerPage");

}


function showFeature(featureId) {

  document
    .querySelectorAll(".feature")
    .forEach(feature => {

      feature.classList.add("hidden");

    });

  document
    .getElementById(featureId)
    .classList.remove("hidden");


  if (featureId === "logsFeature") {

    loadLogs();

  }

}


/* ================================
   ESCAPE HTML
================================ */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
