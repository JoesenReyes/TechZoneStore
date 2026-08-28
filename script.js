/* ==========================================
   IMPORTANT:
   PUT YOUR DEPLOYED APPS SCRIPT URL HERE
========================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyDVrmpO-EcJFwcqXj8_zzGJb1Pzp59WyOfAhX31miQIpK9TgNvS7YM8g_iOdayB6wSWQ/exec";


let currentUser = null;

let currentRole = null;

let pendingEmail = null;


/* ==========================================
   API REQUEST
========================================== */

async function server(
  action,
  data = {}
) {

  try {

    const response =
      await fetch(
        API_URL,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({

            action:
              action,

            ...data

          })

        }
      );


    const result =
      await response.json();


    return result;


  } catch (error) {

    console.error(error);


    return {

      success: false,

      message:
        "Cannot connect to TechZone Store server."

    };

  }

}


/* ==========================================
   TOAST
========================================== */

function toast(
  message
) {

  const container =
    document.getElementById(
      "toast"
    );


  const element =
    document.createElement(
      "div"
    );


  element.className =
    "toast-message";


  element.textContent =
    message;


  container.appendChild(
    element
  );


  setTimeout(
    function() {

      element.remove();

    },
    3000
  );

}


/* ==========================================
   LOGIN
========================================== */

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

    toast(
      "Please enter your Gmail and password."
    );

    return;

  }


  const result =
    await server(
      "login",
      {

        email:
          email,

        password:
          password

      }
    );


  if (!result.success) {

    toast(
      result.message
    );

    return;

  }


  pendingEmail =
    result.email;


  currentRole =
    result.role;


  showPage(
    "otpPage"
  );


  toast(
    result.message
  );

}


/* ==========================================
   VERIFY OTP
========================================== */

async function verifyOTP() {

  const otp =
    document
      .getElementById(
        "otpInput"
      )
      .value
      .trim();


  if (otp.length !== 6) {

    toast(
      "Enter the 6-digit OTP."
    );

    return;

  }


  const result =
    await server(
      "verifyOTP",
      {

        email:
          pendingEmail,

        otp:
          otp

      }
    );


  if (!result.success) {

    toast(
      result.message
    );

    return;

  }


  currentUser =
    result.email;


  currentRole =
    result.role;


  document
    .getElementById(
      "currentUser"
    )
    .textContent =
    currentUser;


  document
    .getElementById(
      "currentRole"
    )
    .textContent =
    currentRole;


  document
    .getElementById(
      "dashboardRole"
    )
    .textContent =
    currentRole;


  showPage(
    "dashboard"
  );


  configureRole();


  await loadProducts();

  await loadCategories();


  if (
    currentRole ===
    "Admin"
  ) {

    await loadCustomers();

    await loadLogs();

  }

}


/* ==========================================
   REGISTER
========================================== */

async function register() {

  const name =
    document
      .getElementById(
        "regName"
      )
      .value
      .trim();


  const email =
    document
      .getElementById(
        "regEmail"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "regPassword"
      )
      .value;


  const confirm =
    document
      .getElementById(
        "regConfirm"
      )
      .value;


  if (
    !name ||
    !email ||
    !password ||
    !confirm
  ) {

    toast(
      "Please complete all fields."
    );

    return;

  }


  if (
    password !==
    confirm
  ) {

    toast(
      "Passwords do not match."
    );

    return;

  }


  if (
    password.length < 6
  ) {

    toast(
      "Password must be at least 6 characters."
    );

    return;

  }


  const result =
    await server(
      "register",
      {

        name:
          name,

        email:
          email,

        password:
          password

      }
    );


  if (!result.success) {

    toast(
      result.message
    );

    return;

  }


  pendingEmail =
    result.email;


  currentRole =
    "Customer";


  showPage(
    "otpPage"
  );


  toast(
    result.message
  );

}


/* ==========================================
   ROLE CONTROL
========================================== */

function configureRole() {

  const addButton =
    document.getElementById(
      "addProductButton"
    );


  const logsButton =
    document.getElementById(
      "logsButton"
    );


  const customersButton =
    document.querySelector(
      "button[onclick=\"showFeature('customersFeature')\"]"
    );


  if (
    currentRole ===
    "Admin"
  ) {

    addButton.style.display =
      "block";

    logsButton.style.display =
      "block";

    customersButton.style.display =
      "block";

  } else {

    addButton.style.display =
      "none";

    logsButton.style.display =
      "none";

    customersButton.style.display =
      "none";

  }

}


/* ==========================================
   PRODUCTS
========================================== */

async function loadProducts() {

  const result =
    await server(
      "products"
    );


  if (
    !Array.isArray(result)
  ) {

    toast(
      result.message ||
      "Cannot load products."
    );

    return;

  }


  const container =
    document.getElementById(
      "productsContainer"
    );


  container.innerHTML =
    "";


  document.getElementById(
    "totalProducts"
  ).textContent =
    result.length;


  document.getElementById(
    "reportProducts"
  ).textContent =
    result.length;


  result.forEach(
    function(product) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "product-card";


      const image =
        product.image ||
        "https://via.placeholder.com/500x350?text=TechZone+Store";


      card.innerHTML = `

        <img
          class="product-image"
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
        >

        <div class="product-body">

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <div class="product-category">
            ${escapeHTML(product.category)}
          </div>

          <div class="product-price">
            ₱${Number(product.price).toLocaleString()}
          </div>

          <div class="product-stock">
            Stock:
            ${escapeHTML(product.stock)}
          </div>

          <p style="margin-top:10px;color:#64748b">
            ${escapeHTML(product.description || "")}
          </p>

        </div>

      `;


      if (
        currentRole ===
        "Admin"
      ) {

        const actions =
          document.createElement(
            "div"
          );


        actions.className =
          "product-actions";


        actions.innerHTML = `

          <button
            class="edit-btn"
          >
            Update
          </button>

          <button
            class="delete-btn"
          >
            Delete
          </button>

        `;


        actions
          .querySelector(
            ".edit-btn"
          )
          .onclick =
          function() {

            editProduct(
              product
            );

          };


        actions
          .querySelector(
            ".delete-btn"
          )
          .onclick =
          function() {

            removeProduct(
              product.id
            );

          };


        card
          .querySelector(
            ".product-body"
          )
          .appendChild(
            actions
          );

      }


      container.appendChild(
        card
      );

    }
  );

}


/* ==========================================
   CATEGORIES
========================================== */

async function loadCategories() {

  const result =
    await server(
      "categories"
    );


  if (
    !Array.isArray(result)
  ) {

    toast(
      "Cannot load categories."
    );

    return;

  }


  document.getElementById(
    "totalCategories"
  ).textContent =
    result.length;


  document.getElementById(
    "reportCategories"
  ).textContent =
    result.length;


  const container =
    document.getElementById(
      "categoriesContainer"
    );


  const select =
    document.getElementById(
      "productCategory"
    );


  container.innerHTML =
    "";


  select.innerHTML =
    "";


  result.forEach(
    function(category) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "category-card";


      card.innerHTML = `

        <div style="font-size:30px">
          🏷️
        </div>

        <strong>
          ${escapeHTML(category.name)}
        </strong>

      `;


      container.appendChild(
        card
      );


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


/* ==========================================
   CUSTOMERS
========================================== */

async function loadCustomers() {

  if (
    currentRole !==
    "Admin"
  ) return;


  const result =
    await server(
      "customers",
      {
        email:
          currentUser
      }
    );


  if (
    !Array.isArray(result)
  ) {

    return;

  }


  const container =
    document.getElementById(
      "customersContainer"
    );


  container.innerHTML = "";


  const header =
    document.createElement(
      "div"
    );


  header.className =
    "customer-row customer-header";


  header.innerHTML = `

    <div>Name</div>
    <div>Email</div>
    <div>Role</div>
    <div>Status</div>

  `;


  container.appendChild(
    header
  );


  result.forEach(
    function(customer) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "customer-row";


      row.innerHTML = `

        <div>
          ${escapeHTML(customer.name)}
        </div>

        <div>
          ${escapeHTML(customer.email)}
        </div>

        <div>
          ${escapeHTML(customer.role)}
        </div>

        <div>
          ${escapeHTML(customer.status)}
        </div>

      `;


      container.appendChild(
        row
      );

    }
  );

}


/* ==========================================
   PRODUCT MODAL
========================================== */

function openProductModal(
  product = null
) {

  if (
    currentRole !==
    "Admin"
  ) {

    toast(
      "Admin only."
    );

    return;

  }


  document
    .getElementById(
      "productModal"
    )
    .classList.remove(
      "hidden"
    );


  if (product) {

    document.getElementById(
      "modalTitle"
    ).textContent =
      "Update Product";


    document.getElementById(
      "productId"
    ).value =
      product.id;


    document.getElementById(
      "productName"
    ).value =
      product.name;


    document.getElementById(
      "productCategory"
    ).value =
      product.category;


    document.getElementById(
      "productPrice"
    ).value =
      product.price;


    document.getElementById(
      "productStock"
    ).value =
      product.stock;


    document.getElementById(
      "productDescription"
    ).value =
      product.description || "";


    document.getElementById(
      "productImage"
    ).value =
      product.image || "";

  } else {

    document.getElementById(
      "modalTitle"
    ).textContent =
      "Add Product";


    document.getElementById(
      "productId"
    ).value =
      "";


    document.getElementById(
      "productName"
    ).value =
      "";


    document.getElementById(
      "productPrice"
    ).value =
      "";


    document.getElementById(
      "productStock"
    ).value =
      "";


    document.getElementById(
      "productDescription"
    ).value =
      "";


    document.getElementById(
      "productImage"
    ).value =
      "";

  }

}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeProductModal() {

  document
    .getElementById(
      "productModal"
    )
    .classList.add(
      "hidden"
    );

}


/* ==========================================
   SAVE PRODUCT
========================================== */

async function saveProduct() {

  if (
    currentRole !==
    "Admin"
  ) {

    toast(
      "Admin only."
    );

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
        .value
        .trim()

  };


  if (
    !product.name ||
    !product.price
  ) {

    toast(
      "Product name and price are required."
    );

    return;

  }


  let confirmed;


  if (id) {

    confirmed =
      confirm(
        "Are you sure you want to UPDATE this product?"
      );

  } else {

    confirmed =
      confirm(
        "Are you sure you want to ADD this product?"
      );

  }


  if (!confirmed) {

    toast(
      "Action cancelled."
    );

    return;

  }


  let result;


  if (id) {

    result =
      await server(
        "updateProduct",
        {

          product:
            product,

          email:
            currentUser

        }
      );

  } else {

    result =
      await server(
        "addProduct",
        {

          product:
            product,

          email:
            currentUser

        }
      );

  }


  if (!result.success) {

    toast(
      result.message
    );

    return;

  }


  closeProductModal();


  toast(
    result.message
  );


  await loadProducts();

  await loadLogs();

}


/* ==========================================
   EDIT
========================================== */

function editProduct(
  product
) {

  if (
    currentRole !==
    "Admin"
  ) {

    toast(
      "Admin only."
    );

    return;

  }


  openProductModal(
    product
  );

}


/* ==========================================
   DELETE
========================================== */

async function removeProduct(
  productId
) {

  if (
    currentRole !==
    "Admin"
  ) {

    toast(
      "Admin only."
    );

    return;

  }


  const confirmed =
    confirm(
      "⚠️ Are you sure you want to DELETE this product?\n\nThis action cannot be undone."
    );


  if (!confirmed) {

    toast(
      "Delete cancelled."
    );

    return;

  }


  const result =
    await server(
      "deleteProduct",
      {

        productId:
          productId,

        email:
          currentUser

      }
    );


  if (!result.success) {

    toast(
      result.message
    );

    return;

  }


  toast(
    "Product deleted successfully."
  );


  await loadProducts();

  await loadLogs();

}


/* ==========================================
   ACTIVITY LOGS
========================================== */

async function loadLogs() {

  if (
    currentRole !==
    "Admin"
  ) return;


  const result =
    await server(
      "activityLogs",
      {

        email:
          currentUser

      }
    );


  if (
    !Array.isArray(result)
  ) {

    return;

  }


  const container =
    document.getElementById(
      "logsContainer"
    );


  container.innerHTML =
    "";


  if (
    result.length === 0
  ) {

    container.innerHTML =
      "<p>No activity logs yet.</p>";

    return;

  }


  result.forEach(
    function(log) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "log-card";


      card.innerHTML = `

        <div class="log-action">
          ${escapeHTML(log.action)}
        </div>

        <div class="log-details">
          ${escapeHTML(log.details)}
        </div>

        <div class="log-meta">

          User:
          ${escapeHTML(log.email)}

          |
          Role:
          ${escapeHTML(log.role)}

          |
          ${escapeHTML(String(log.date))}

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );

}


/* ==========================================
   LOGOUT
========================================== */

async function logout() {

  const confirmed =
    confirm(
      "Are you sure you want to logout?"
    );


  if (!confirmed) {

    toast(
      "Logout cancelled."
    );

    return;

  }


  await server(
    "logout",
    {

      email:
        currentUser,

      role:
        currentRole

    }
  );


  currentUser =
    null;


  currentRole =
    null;


  pendingEmail =
    null;


  document
    .getElementById(
      "loginEmail"
    )
    .value =
    "";


  document
    .getElementById(
      "loginPassword"
    )
    .value =
    "";


  showPage(
    "loginPage"
  );


  toast(
    "Successfully logged out."
  );

}


/* ==========================================
   PAGE
========================================== */

function showPage(
  pageId
) {

  document
    .querySelectorAll(
      ".auth-page, #dashboard"
    )
    .forEach(
      function(element) {

        element.classList.add(
          "hidden"
        );

      }
    );


  document
    .getElementById(
      pageId
    )
    .classList.remove(
      "hidden"
    );

}


/* ==========================================
   REGISTER / LOGIN PAGE
========================================== */

function showLogin() {

  showPage(
    "loginPage"
  );

}


function showRegister() {

  showPage(
    "registerPage"
  );

}


/* ==========================================
   FEATURES
========================================== */

function showFeature(
  featureId
) {

  document
    .querySelectorAll(
      ".feature"
    )
    .forEach(
      function(feature) {

        feature.classList.add(
          "hidden"
        );

      }
    );


  const feature =
    document.getElementById(
      featureId
    );


  if (!feature) return;


  feature.classList.remove(
    "hidden"
  );


  if (
    featureId ===
    "logsFeature"
  ) {

    loadLogs();

  }


  if (
    featureId ===
    "customersFeature"
  ) {

    loadCustomers();

  }

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )

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
