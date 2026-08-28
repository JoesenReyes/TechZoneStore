/****************************************************
 * TECHZONE STORE FRONTEND
 ****************************************************/
const APP_URL = "https://script.google.com/macros/s/AKfycbwtayMhDsHWwbSRphI5tIYZJzzUUaRpNCBoOhHmN3tDl09iF2czZ27zNLCjG0zt6w0iRg/exec";

let currentUser = null;
let currentOTPType = null;
let currentOTPEmail = null;

let editingProduct = false;


/****************************************************
 * HELPER
 ****************************************************/

function showMessage(text, success = false) {

  const box =
    document.getElementById("message");

  box.textContent = text;

  box.style.color =
    success ? "#198754" : "#d9363e";

}


/****************************************************
 * HIDE ALL LOGIN FORMS
 ****************************************************/

function hideLoginForms() {

  document
    .getElementById("loginChoice")
    .classList.add("hidden");

  document
    .getElementById("adminLoginForm")
    .classList.add("hidden");

  document
    .getElementById("customerLoginForm")
    .classList.add("hidden");

  document
    .getElementById("registerForm")
    .classList.add("hidden");

  document
    .getElementById("otpForm")
    .classList.add("hidden");

}


/****************************************************
 * LOGIN NAVIGATION
 ****************************************************/

function backToLogin() {

  hideLoginForms();

  document
    .getElementById("loginChoice")
    .classList.remove("hidden");

  showMessage("");

}


function showAdminLogin() {

  hideLoginForms();

  document
    .getElementById("adminLoginForm")
    .classList.remove("hidden");

}


function showCustomerLogin() {

  hideLoginForms();

  document
    .getElementById("customerLoginForm")
    .classList.remove("hidden");

}


function showRegister() {

  hideLoginForms();

  document
    .getElementById("registerForm")
    .classList.remove("hidden");

}


/****************************************************
 * ADMIN LOGIN
 ****************************************************/

function adminLogin() {

  const email =
    document.getElementById("adminEmail").value.trim();

  const password =
    document.getElementById("adminPassword").value;


  if (!email || !password) {

    showMessage(
      "Please enter email and password."
    );

    return;
  }


  showMessage("Checking admin login...", true);


  google.script.run
    .withSuccessHandler(function(result) {

      if (!result.success) {

        showMessage(result.message);

        return;
      }


      currentOTPType = "Admin";
      currentOTPEmail = email;


      google.script.run
        .withSuccessHandler(function(otpResult) {

          if (!otpResult.success) {

            showMessage(
              otpResult.message
            );

            return;
          }


          hideLoginForms();

          document
            .getElementById("otpForm")
            .classList.remove("hidden");

          showMessage(
            "OTP sent to admin Gmail.",
            true
          );

        })
        .sendOTP(
          email,
          "Admin"
        );

    })
    .adminLogin(
      email,
      password
    );

}


/****************************************************
 * CUSTOMER LOGIN
 ****************************************************/

function customerLogin() {

  const email =
    document
      .getElementById("customerEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("customerPassword")
      .value;


  if (!email || !password) {

    showMessage(
      "Please enter email and password."
    );

    return;
  }


  showMessage(
    "Checking customer account...",
    true
  );


  google.script.run
    .withSuccessHandler(function(result) {

      if (!result.success) {

        showMessage(
          result.message
        );

        return;
      }


      currentOTPType = "Customer";
      currentOTPEmail = email;


      hideLoginForms();

      document
        .getElementById("otpForm")
        .classList.remove("hidden");


      showMessage(
        "OTP sent to your Gmail.",
        true
      );

    })
    .customerLogin(
      email,
      password
    );

}


/****************************************************
 * CUSTOMER REGISTER
 ****************************************************/

function registerCustomer() {

  const name =
    document
      .getElementById("registerName")
      .value
      .trim();

  const email =
    document
      .getElementById("registerEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("registerPassword")
      .value;


  if (!name || !email || !password) {

    showMessage(
      "Please complete all fields."
    );

    return;
  }


  showMessage(
    "Creating account...",
    true
  );


  google.script.run
    .withSuccessHandler(function(result) {

      if (!result.success) {

        showMessage(
          result.message
        );

        return;
      }


      currentOTPType = "Customer";
      currentOTPEmail = email;


      hideLoginForms();

      document
        .getElementById("otpForm")
        .classList.remove("hidden");


      showMessage(
        "Account created. OTP sent to Gmail.",
        true
      );

    })
    .registerCustomer(
      name,
      email,
      password
    );

}


/****************************************************
 * VERIFY OTP
 ****************************************************/

function verifyLoginOTP() {

  const otp =
    document
      .getElementById("otpInput")
      .value
      .trim();


  if (!otp) {

    showMessage(
      "Enter the OTP code."
    );

    return;
  }


  showMessage(
    "Verifying OTP...",
    true
  );


  if (currentOTPType === "Admin") {

    google.script.run
      .withSuccessHandler(function(result) {

        if (!result.success) {

          showMessage(
            result.message
          );

          return;
        }


        currentUser = result;


        openAdminApp();

      })
      .completeAdminLogin(
        currentOTPEmail,
        otp
      );

  }


  else {

    google.script.run
      .withSuccessHandler(function(result) {

        if (!result.success) {

          showMessage(
            result.message
          );

          return;
        }


        currentUser = result;


        openCustomerApp();

      })
      .completeCustomerLogin(
        currentOTPEmail,
        otp
      );

  }

}


/****************************************************
 * RESEND OTP
 ****************************************************/

function resendOTP() {

  if (!currentOTPEmail ||
      !currentOTPType) {

    return;
  }


  google.script.run
    .withSuccessHandler(function(result) {

      showMessage(
        result.message,
        result.success
      );

    })
    .sendOTP(
      currentOTPEmail,
      currentOTPType
    );

}


/****************************************************
 * OPEN ADMIN
 ****************************************************/

function openAdminApp() {

  document
    .getElementById("loginPage")
    .classList.add("hidden");

  document
    .getElementById("customerApp")
    .classList.add("hidden");

  document
    .getElementById("adminApp")
    .classList.remove("hidden");


  document
    .getElementById("adminUserDisplay")
    .textContent =
      currentUser.email;


  showSection("dashboard");

  loadDashboard();

}


/****************************************************
 * OPEN CUSTOMER
 ****************************************************/

function openCustomerApp() {

  document
    .getElementById("loginPage")
    .classList.add("hidden");

  document
    .getElementById("adminApp")
    .classList.add("hidden");

  document
    .getElementById("customerApp")
    .classList.remove("hidden");


  document
    .getElementById("customerUserDisplay")
    .textContent =
      currentUser.email;


  loadCustomerProducts();

}


/****************************************************
 * ADMIN SECTION
 ****************************************************/

function showSection(sectionId) {

  document
    .querySelectorAll(".section")
    .forEach(function(section) {

      section.classList.add("hidden");

    });


  document
    .getElementById(sectionId)
    .classList.remove("hidden");


  if (sectionId === "dashboard") {

    loadDashboard();

  }

  if (sectionId === "products") {

    loadAdminProducts();

  }

  if (sectionId === "categories") {

    loadCategories();

  }

  if (sectionId === "recycle") {

    loadDeletedProducts();

  }

  if (sectionId === "logs") {

    loadActivityLogs();

  }

}


/****************************************************
 * DASHBOARD
 ****************************************************/

function loadDashboard() {

  google.script.run
    .withSuccessHandler(function(data) {

      document
        .getElementById("statProducts")
        .textContent =
          data.products;

      document
        .getElementById("statCategories")
        .textContent =
          data.categories;

      document
        .getElementById("statCustomers")
        .textContent =
          data.customers;

      document
        .getElementById("statStock")
        .textContent =
          data.stock;

    })
    .getDashboard();

}


/****************************************************
 * LOAD CATEGORIES
 ****************************************************/

function loadCategories() {

  google.script.run
    .withSuccessHandler(function(categories) {

      const list =
        document.getElementById(
          "categoryList"
        );

      const select =
        document.getElementById(
          "productCategory"
        );


      list.innerHTML = "";

      select.innerHTML =
        '<option value="">Select category</option>';


      categories.forEach(function(category) {

        const div =
          document.createElement("div");

        div.className =
          "category-item";

        div.textContent =
          "🏷️ " + category.name;

        list.appendChild(div);


        const option =
          document.createElement("option");

        option.value =
          category.name;

        option.textContent =
          category.name;

        select.appendChild(option);

      });

    })
    .getCategories();

}


/****************************************************
 * ADD CATEGORY
 ****************************************************/

function addCategoryPrompt() {

  const name =
    prompt(
      "Enter new category:"
    );


  if (!name) {
    return;
  }


  const passcode =
    prompt(
      "Enter Admin Passcode:"
    );


  if (passcode === null) {
    return;
  }


  google.script.run
    .withSuccessHandler(function(result) {

      alert(result.message);

      if (result.success) {

        loadCategories();
        loadDashboard();

      }

    })
    .addCategory(
      name,
      currentUser.email,
      passcode
    );

}


/****************************************************
 * LOAD ADMIN PRODUCTS
 ****************************************************/

function loadAdminProducts() {

  google.script.run
    .withSuccessHandler(function(products) {

      const grid =
        document.getElementById(
          "adminProductGrid"
        );

      grid.innerHTML = "";


      products.forEach(function(product) {

        grid.appendChild(
          createAdminProductCard(
            product
          )
        );

      });

    })
    .getAllProductsAdmin();

}


/****************************************************
 * ADMIN PRODUCT CARD
 ****************************************************/

function createAdminProductCard(product) {

  const card =
    document.createElement("div");

  card.className =
    "product-card";


  const image =
    product.image
      ? `<img src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}">`
      : `<div class="no-image">📦</div>`;


  card.innerHTML = `

    ${image}

    <div class="product-info">

      <h3>
        ${escapeHTML(product.name)}
      </h3>

      <p>
        ${escapeHTML(product.category || "Uncategorized")}
      </p>

      <div class="price">
        ₱${Number(product.price).toFixed(2)}
      </div>

      <div class="stock">
        Stock: ${product.stock}
      </div>

      <div class="product-actions">

        <button
          class="btn outline"
          onclick='openEditProduct(${JSON.stringify(product)})'>
          ✏️ Update
        </button>

        <button
          class="btn danger"
          onclick='deleteProductConfirm("${product.id}")'>
          🗑️ Delete
        </button>

      </div>

    </div>
  `;


  return card;

}


/****************************************************
 * CUSTOMER PRODUCTS
 ****************************************************/

function loadCustomerProducts() {

  google.script.run
    .withSuccessHandler(function(products) {

      const grid =
        document.getElementById(
          "customerProductGrid"
        );

      grid.innerHTML = "";


      products.forEach(function(product) {

        grid.appendChild(
          createCustomerProductCard(
            product
          )
        );

      });

    })
    .getProducts();

}


/****************************************************
 * CUSTOMER PRODUCT CARD
 ****************************************************/

function createCustomerProductCard(product) {

  const card =
    document.createElement("div");

  card.className =
    "product-card";


  const image =
    product.image
      ? `<img src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}">`
      : `<div class="no-image">📦</div>`;


  card.innerHTML = `

    ${image}

    <div class="product-info">

      <h3>
        ${escapeHTML(product.name)}
      </h3>

      <p>
        ${escapeHTML(product.category || "Uncategorized")}
      </p>

      <div class="price">
        ₱${Number(product.price).toFixed(2)}
      </div>

      <div class="stock">
        ${
          Number(product.stock) > 0
          ? "Available"
          : "Out of Stock"
        }
      </div>

      <button
        class="btn outline full"
        onclick='viewProduct("${escapeJS(product.name)}")'>
        👁️ View Product
      </button>

    </div>
  `;


  return card;

}


/****************************************************
 * CUSTOMER VIEW PRODUCT
 ****************************************************/

function viewProduct(name) {

  google.script.run
    .logProductView(
      currentUser.email,
      name
    );


  alert(
    "You are viewing: " + name
  );

}


/****************************************************
 * ADD PRODUCT
 ****************************************************/

function openAddProduct() {

  editingProduct = false;

  document
    .getElementById("modalTitle")
    .textContent =
      "Add Product";


  document
    .getElementById("productId")
    .value = "";

  document
    .getElementById("productName")
    .value = "";

  document
    .getElementById("productPrice")
    .value = "";

  document
    .getElementById("productStock")
    .value = "";

  document
    .getElementById("productDescription")
    .value = "";

  document
    .getElementById("productImage")
    .value = "";


  loadCategories();


  document
    .getElementById("productModal")
    .classList.remove("hidden");

}


/****************************************************
 * EDIT PRODUCT
 ****************************************************/

function openEditProduct(product) {

  editingProduct = true;

  document
    .getElementById("modalTitle")
    .textContent =
      "Update Product";


  document
    .getElementById("productId")
    .value =
      product.id;

  document
    .getElementById("productName")
    .value =
      product.name;

  document
    .getElementById("productPrice")
    .value =
      product.price;

  document
    .getElementById("productStock")
    .value =
      product.stock;

  document
    .getElementById("productDescription")
    .value =
      product.description || "";

  document
    .getElementById("productImage")
    .value =
      product.image || "";


  loadCategories();


  setTimeout(function() {

    document
      .getElementById("productCategory")
      .value =
        product.category || "";

  }, 300);


  document
    .getElementById("productModal")
    .classList.remove("hidden");

}


/****************************************************
 * CLOSE MODAL
 ****************************************************/

function closeProductModal() {

  document
    .getElementById("productModal")
    .classList.add("hidden");

}


/****************************************************
 * SAVE PRODUCT
 ****************************************************/

function saveProduct() {

  const data = {

    id:
      document
        .getElementById("productId")
        .value,

    name:
      document
        .getElementById("productName")
        .value
        .trim(),

    category:
      document
        .getElementById("productCategory")
        .value,

    price:
      document
        .getElementById("productPrice")
        .value,

    stock:
      document
        .getElementById("productStock")
        .value,

    description:
      document
        .getElementById("productDescription")
        .value,

    image:
      document
        .getElementById("productImage")
        .value,

    status: "ACTIVE"

  };


  if (!data.name) {

    alert(
      "Product name is required."
    );

    return;
  }


  const passcode =
    prompt(
      editingProduct
        ? "Enter Admin Passcode to UPDATE:"
        : "Enter Admin Passcode to ADD:"
    );


  if (passcode === null) {
    return;
  }


  if (editingProduct) {

    google.script.run
      .withSuccessHandler(function(result) {

        alert(result.message);

        if (result.success) {

          closeProductModal();

          loadAdminProducts();

          loadDashboard();

        }

      })
      .updateProduct(
        data,
        currentUser.email,
        passcode
      );

  }


  else {

    google.script.run
      .withSuccessHandler(function(result) {

        alert(result.message);

        if (result.success) {

          closeProductModal();

          loadAdminProducts();

          loadDashboard();

        }

      })
      .addProduct(
        data,
        currentUser.email,
        passcode
      );

  }

}


/****************************************************
 * DELETE CONFIRMATION
 ****************************************************/

function deleteProductConfirm(id) {

  const yes =
    confirm(
      "Are you sure you want to DELETE this product?\n\n" +
      "The product will be moved to the Recycle Bin."
    );


  if (!yes) {
    return;
  }


  const passcode =
    prompt(
      "Enter Admin Passcode to DELETE:"
    );


  if (passcode === null) {
    return;
  }


  google.script.run
    .withSuccessHandler(function(result) {

      alert(result.message);

      if (result.success) {

        loadAdminProducts();

        loadDashboard();

      }

    })
    .deleteProduct(
      id,
      currentUser.email,
      passcode
    );

}


/****************************************************
 * RECYCLE BIN
 ****************************************************/

function loadDeletedProducts() {

  google.script.run
    .withSuccessHandler(function(products) {

      const container =
        document.getElementById(
          "deletedProducts"
        );

      container.innerHTML = "";


      if (products.length === 0) {

        container.innerHTML =
          "<p>No deleted products.</p>";

        return;
      }


      products.forEach(function(product) {

        const div =
          document.createElement("div");

        div.className =
          "category-item";


        div.innerHTML = `

          <strong>
            ${escapeHTML(product.name)}
          </strong>

          <p>
            Category:
            ${escapeHTML(product.category)}
          </p>

          <p>
            Deleted by:
            ${escapeHTML(product.deletedBy)}
          </p>

          <button
            class="btn success"
            onclick='restoreProductConfirm("${product.id}")'>
            ♻️ Restore
          </button>

        `;


        container.appendChild(div);

      });

    })
    .getDeletedProducts();

}


/****************************************************
 * RESTORE
 ****************************************************/

function restoreProductConfirm(id) {

  const yes =
    confirm(
      "Restore this product?"
    );


  if (!yes) {
    return;
  }


  const passcode =
    prompt(
      "Enter Admin Passcode to RESTORE:"
    );


  if (passcode === null) {
    return;
  }


  google.script.run
    .withSuccessHandler(function(result) {

      alert(result.message);

      if (result.success) {

        loadDeletedProducts();

        loadAdminProducts();

        loadDashboard();

      }

    })
    .restoreProduct(
      id,
      currentUser.email,
      passcode
    );

}


/****************************************************
 * ACTIVITY LOGS
 ****************************************************/

function loadActivityLogs() {

  google.script.run
    .withSuccessHandler(function(logs) {

      const tbody =
        document.getElementById(
          "activityTable"
        );

      tbody.innerHTML = "";


      logs.forEach(function(log) {

        const tr =
          document.createElement("tr");


        tr.innerHTML = `

          <td>
            ${formatDate(log.dateTime)}
          </td>

          <td>
            ${escapeHTML(log.email)}
          </td>

          <td>
            ${escapeHTML(log.name)}
          </td>

          <td>
            ${escapeHTML(log.role)}
          </td>

          <td>
            <span class="badge">
              ${escapeHTML(log.action)}
            </span>
          </td>

          <td>
            ${escapeHTML(log.details)}
          </td>

        `;


        tbody.appendChild(tr);

      });

    })
    .getActivityLogs();

}


/****************************************************
 * LOGOUT CONFIRMATION
 ****************************************************/

function confirmLogout() {

  const yes =
    confirm(
      "Are you sure you want to logout?"
    );


  if (!yes) {
    return;
  }


  if (currentUser) {

    google.script.run
      .logoutUser(
        currentUser.email,
        currentUser.name,
        currentUser.role
      );

  }


  currentUser = null;

  currentOTPEmail = null;

  currentOTPType = null;


  document
    .getElementById("adminApp")
    .classList.add("hidden");

  document
    .getElementById("customerApp")
    .classList.add("hidden");

  document
    .getElementById("loginPage")
    .classList.remove("hidden");


  backToLogin();

}


/****************************************************
 * ESCAPE HTML
 ****************************************************/

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/****************************************************
 * ESCAPE JS
 ****************************************************/

function escapeJS(value) {

  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

}


/****************************************************
 * DATE
 ****************************************************/

function formatDate(value) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (isNaN(date.getTime())) {
    return value;
  }


  return date.toLocaleString();

}
