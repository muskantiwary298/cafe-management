
const foodMenu = [
  { id: 1, name: "Espresso", category: "Coffee", price: 100, emoji: "☕", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Cappuccino", category: "Coffee", price: 150, emoji: "☕", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Cold Coffee", category: "Coffee", price: 130, emoji: "🧋", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Cafe Latte", category: "Coffee", price: 160, emoji: "🥛", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Masala Tea", category: "Tea", price: 40, emoji: "🍵", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Green Tea", category: "Tea", price: 60, emoji: "🍵", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80" },
  { id: 7, name: "Veg Sandwich", category: "Snacks", price: 100, emoji: "🥪", image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=600&q=80" },
  { id: 8, name: "French Fries", category: "Snacks", price: 90, emoji: "🍟", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80" },
  { id: 9, name: "Veg Burger", category: "Snacks", price: 120, emoji: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80" },
  { id: 10, name: "Chocolate Cake", category: "Dessert", price: 110, emoji: "🍰", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80" },
  { id: 11, name: "Brownie", category: "Dessert", price: 90, emoji: "🍫", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80" },
  { id: 12, name: "Chocolate Shake", category: "Drinks", price: 140, emoji: "🥤", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80" }
];

const pageMoney = amount =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("cafePageCart") || "[]");

    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      foodMenu.some(food => food.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    ).map(item => {
      const food = foodMenu.find(product => product.id === item.id);
      return { ...food, quantity: item.quantity };
    });
  } catch {
    return [];
  }
}

let pageCart = readCart();
let selectedCategory = "All";

function savePageCart() {
  localStorage.setItem("cafePageCart", JSON.stringify(pageCart));
}

function updateCartCount() {
  const count = pageCart.reduce((sum, item) => sum + item.quantity, 0);
  const element = document.getElementById("cartCount");

  if (element) element.textContent = count;
}

function addPageItem(id) {
  const food = foodMenu.find(item => item.id === id);
  if (!food) return;

  const existing = pageCart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    pageCart.push({ ...food, quantity: 1 });
  }

  savePageCart();
  updateCartCount();

  const button = document.querySelector(`[data-add="${id}"]`);

  if (button) {
    const originalText = button.textContent;
    button.textContent = "✓ Added";
    setTimeout(() => {
      if (button.isConnected) button.textContent = originalText;
    }, 800);
  }
}

function renderPageCategories() {
  const container = document.getElementById("pageCategories");
  if (!container) return;

  const categories = ["All", ...new Set(foodMenu.map(item => item.category))];

  container.innerHTML = categories.map(category => `
    <button class="filter-btn ${selectedCategory === category ? "active" : ""}"
      data-filter="${category}">
      ${category}
    </button>
  `).join("");
}

function renderPageMenu() {
  const grid = document.getElementById("pageMenuGrid");
  if (!grid) return;

  const query = document.getElementById("menuSearch").value.trim().toLowerCase();

  const filtered = foodMenu.filter(item =>
    (selectedCategory === "All" || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(query) ||
     item.category.toLowerCase().includes(query))
  );

  grid.innerHTML = filtered.length
    ? filtered.map(item => `
        <article class="product-card">
          <img
            src="${item.image}"
            alt="${item.name}"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"
          >
          <div class="image-fallback">${item.emoji}</div>
          <div class="product-info">
            <h3>${item.name}</h3>
            <p>${item.category} · Freshly prepared</p>
            <div class="product-footer">
              <span class="product-price">${pageMoney(item.price)}</span>
              <button class="btn" data-add="${item.id}">+ Add</button>
            </div>
          </div>
        </article>
      `).join("")
    : `<p class="empty-message">No items found. Try another search.</p>`;
}

function pageTotals() {
  const subtotal = pageCart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const gst = Math.round(subtotal * 5) / 100;

  return {
    subtotal,
    gst,
    total: Math.round((subtotal + gst) * 100) / 100
  };
}

function renderPageCart() {
  const container = document.getElementById("pageCartItems");
  if (!container) return;

  container.innerHTML = pageCart.length
    ? pageCart.map(item => `
        <div class="cart-line">
          <div>
            <strong>${item.emoji} ${item.name}</strong>
            <p>${pageMoney(item.price)} each</p>
          </div>
          <div class="cart-controls">
            <button data-qty="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <strong>${item.quantity}</strong>
            <button data-qty="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `).join("")
    : `<p class="empty-message">Your cart is empty. Visit the Menu page to add food.</p>`;

  const totals = pageTotals();

  document.getElementById("pageSubtotal").textContent = pageMoney(totals.subtotal);
  document.getElementById("pageGST").textContent = pageMoney(totals.gst);
  document.getElementById("pageTotal").textContent = pageMoney(totals.total);

  updateCartCount();
}

function changePageQuantity(id, amount) {
  const item = pageCart.find(product => product.id === id);
  if (!item) return;

  item.quantity += amount;
  pageCart = pageCart.filter(product => product.quantity > 0);

  savePageCart();
  renderPageCart();
}

function escapePageHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function submitPageOrder() {
  const message = document.getElementById("pageOrderMessage");

  if (!pageCart.length) {
    message.textContent = "Please add some items to your cart first.";
    return;
  }

  const customer = document.getElementById("pageCustomer").value.trim();

  if (!customer) {
    message.textContent = "Please enter the customer's name.";
    document.getElementById("pageCustomer").focus();
    return;
  }

  const totals = pageTotals();
  const order = {
    id: Date.now(),
    customer,
    createdAt: new Date().toISOString(),
    items: pageCart.map(item => ({ ...item })),
    subtotal: totals.subtotal,
    gst: totals.gst,
    total: totals.total
  };

  try {
    const existingOrders = JSON.parse(localStorage.getItem("cafeOrders") || "[]");

    if (!Array.isArray(existingOrders)) {
      throw new Error("Invalid order history");
    }

    existingOrders.push(order);
    localStorage.setItem("cafeOrders", JSON.stringify(existingOrders));
    localStorage.removeItem("cafePageCart");

    pageCart = [];
    renderPageCart();

    message.innerHTML = `
      <strong>✓ Order placed successfully!</strong><br>
      Order ID: #${order.id}<br>
      Customer: ${escapePageHTML(customer)}<br>
      Total: ${pageMoney(order.total)}<br><br>
      <button class="btn" id="printPageBill">Print Bill</button>
    `;

    document.getElementById("printPageBill").addEventListener("click", () => {
      const receipt = window.open("", "_blank", "width=420,height=650");

      if (!receipt) {
        message.insertAdjacentText("beforeend", " Please allow pop-ups to print the bill.");
        return;
      }

      const rows = order.items.map(item => `
        <tr>
          <td>${escapePageHTML(item.name)} × ${item.quantity}</td>
          <td>${pageMoney(item.price * item.quantity)}</td>
        </tr>
      `).join("");

      receipt.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cafe Bill #${order.id}</title>
          <meta charset="UTF-8">
          <style>
            body{font-family:Arial,sans-serif;padding:25px;color:#30231d}
            h1,p{text-align:center}
            table{width:100%;border-collapse:collapse}
            td{padding:10px 0;border-bottom:1px solid #ddd}
            td:last-child{text-align:right}
            .total{font-size:20px;font-weight:bold}
          </style>
        </head>
        <body>
          <h1>Brew &amp; Bite</h1>
          <p>Order #${order.id}</p>
          <p>${new Date(order.createdAt).toLocaleString("en-IN")}</p>
          <p>Customer: ${escapePageHTML(customer)}</p>
          <table>${rows}</table>
          <p>Subtotal: ${pageMoney(order.subtotal)}</p>
          <p>GST (5% demo): ${pageMoney(order.gst)}</p>
          <p class="total">Total: ${pageMoney(order.total)}</p>
          <p>Thank you for visiting!</p>
          <script>window.onload=()=>window.print();<\/script>
        </body>
        </html>
      `);

      receipt.document.close();
    });

  } catch {
    message.textContent =
      "Could not save the order. Please check browser storage and try again.";
  }
}

const menuGrid = document.getElementById("pageMenuGrid");

if (menuGrid) {
  renderPageCategories();
  renderPageMenu();

  document.getElementById("menuSearch").addEventListener("input", renderPageMenu);

  document.getElementById("pageCategories").addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    selectedCategory = button.dataset.filter;
    renderPageCategories();
    renderPageMenu();
  });

  menuGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addPageItem(Number(button.dataset.add));
  });
}

if (document.getElementById("pageCartItems")) {
  renderPageCart();

  document.getElementById("pageCartItems").addEventListener("click", event => {
    const button = event.target.closest("[data-qty]");
    if (!button) return;

    changePageQuantity(Number(button.dataset.id), Number(button.dataset.qty));
  });

  document.getElementById("pageClearCart").addEventListener("click", () => {
    pageCart = [];
    savePageCart();
    renderPageCart();
    document.getElementById("pageOrderMessage").textContent = "Cart cleared.";
  });

  document.getElementById("pagePlaceOrder").addEventListener("click", submitPageOrder);
}

updateCartCount();
