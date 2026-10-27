
const menu = [
  { id: 1, name: "Espresso", category: "Coffee", price: 100, emoji: "☕" },
  { id: 2, name: "Cappuccino", category: "Coffee", price: 150, emoji: "☕" },
  { id: 3, name: "Cold Coffee", category: "Coffee", price: 130, emoji: "🧋" },
  { id: 4, name: "Cafe Latte", category: "Coffee", price: 160, emoji: "🥛" },
  { id: 5, name: "Masala Tea", category: "Tea", price: 40, emoji: "🍵" },
  { id: 6, name: "Green Tea", category: "Tea", price: 60, emoji: "🍵" },
  { id: 7, name: "Veg Sandwich", category: "Snacks", price: 100, emoji: "🥪" },
  { id: 8, name: "French Fries", category: "Snacks", price: 90, emoji: "🍟" },
  { id: 9, name: "Veg Burger", category: "Snacks", price: 120, emoji: "🍔" },
  { id: 10, name: "Chocolate Cake", category: "Dessert", price: 110, emoji: "🍰" },
  { id: 11, name: "Brownie", category: "Dessert", price: 90, emoji: "🍫" },
  { id: 12, name: "Chocolate Shake", category: "Drinks", price: 140, emoji: "🥤" }
];

const $ = (id) => document.getElementById(id);

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

let cart = [];
let orders = loadData("cafeOrders", []);
let activeCategory = "All";

function saveOrders() {
  localStorage.setItem("cafeOrders", JSON.stringify(orders));
}

function renderCategories() {
  const categories = ["All", ...new Set(menu.map(item => item.category))];

  $("categories").innerHTML = categories.map(category => `
    <button
      class="category ${activeCategory === category ? "active" : ""}"
      data-category="${category}">
      ${category}
    </button>
  `).join("");
}

function renderMenu() {
  const query = $("search").value.trim().toLowerCase();

  const filtered = menu.filter(item => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  $("menuGrid").innerHTML = filtered.length
    ? filtered.map(item => `
        <article class="menu-card">
          <div class="food-icon">${item.emoji}</div>
          <h3>${item.name}</h3>
          <p>${item.category}</p>
          <div class="menu-bottom">
            <span class="price">${money(item.price)}</span>
            <button class="add-btn" data-add="${item.id}">
              + Add
            </button>
          </div>
        </article>
      `).join("")
    : `<p class="empty">No menu items found.</p>`;
}

function addToCart(id) {
  const item = menu.find(product => product.id === id);
  if (!item) return;

  const existing = cart.find(product => product.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  renderCart();
}

function changeQuantity(id, change) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.quantity += change;
  cart = cart.filter(product => product.quantity > 0);

  renderCart();
}

function getTotals() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gst = Math.round(subtotal * 0.05 * 100) / 100;

  return {
    subtotal,
    gst,
    total: Math.round((subtotal + gst) * 100) / 100
  };
}

function renderCart() {
  if (cart.length === 0) {
    $("cartItems").innerHTML =
      `<p class="muted">Your cart is empty.</p>`;
  } else {
    $("cartItems").innerHTML = cart.map(item => `
      <div class="cart-row">
        <div>
          <h4>${item.emoji} ${item.name}</h4>
          <small>${money(item.price)} × ${item.quantity}</small>
        </div>
        <div class="quantity">
          <button data-change="-1" data-id="${item.id}"
            aria-label="Decrease ${item.name}">−</button>
          <strong>${item.quantity}</strong>
          <button data-change="1" data-id="${item.id}"
            aria-label="Increase ${item.name}">+</button>
        </div>
      </div>
    `).join("");
  }

  const totals = getTotals();
  $("subtotal").textContent = money(totals.subtotal);
  $("gst").textContent = money(totals.gst);
  $("grandTotal").textContent = money(totals.total);
}

function renderDashboard() {
  const today = new Date().toDateString();

  const todaysOrders = orders.filter(order =>
    new Date(order.createdAt).toDateString() === today
  );

  const sales = todaysOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  $("totalSales").textContent = money(sales);
  $("totalOrders").textContent = todaysOrders.length;
  $("menuCount").textContent = menu.length;

  renderHistory();
}

function renderHistory() {
  const recent = [...orders].reverse().slice(0, 20);

  $("orderHistory").innerHTML = recent.length
    ? recent.map(order => `
        <tr>
          <td>#${order.id}</td>
          <td>${escapeHTML(order.customer)}</td>
          <td>${new Date(order.createdAt).toLocaleString("en-IN")}</td>
          <td>${order.items.reduce((n, item) => n + item.quantity, 0)}</td>
          <td>${money(order.total)}</td>
          <td><button class="bill-link" data-bill="${order.id}">View</button></td>
        </tr>
      `).join("")
    : `<tr><td colspan="6" class="empty">No orders yet. Add an item to get started!</td></tr>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function placeOrder() {
  if (cart.length === 0) {
    alert("Please add at least one item to the cart.");
    return;
  }

  const customer = $("customerName").value.trim();

  if (!customer) {
    alert("Please enter the customer name.");
    $("customerName").focus();
    return;
  }

  const totals = getTotals();

  const order = {
    id: Date.now(),
    customer,
    createdAt: new Date().toISOString(),
    items: cart.map(item => ({ ...item })),
    subtotal: totals.subtotal,
    gst: totals.gst,
    total: totals.total
  };

  orders.push(order);
  saveOrders();

  cart = [];
  $("customerName").value = "";

  renderCart();
  renderDashboard();
  showReceipt(order);
}

function showReceipt(order) {
  $("receiptContent").innerHTML = `
    <div style="text-align:center">
      <h2>☕ Brew & Bite</h2>
      <p>Thank you for visiting!</p>
      <p>Order #${order.id}</p>
      <p>${new Date(order.createdAt).toLocaleString("en-IN")}</p>
    </div>
    <hr>
    <p><strong>Customer:</strong> ${escapeHTML(order.customer)}</p>
    ${order.items.map(item => `
      <div class="receipt-line">
        <span>${escapeHTML(item.name)} × ${item.quantity}</span>
        <span>${money(item.price * item.quantity)}</span>
      </div>
    `).join("")}
    <hr>
    <div class="receipt-line">
      <span>Subtotal</span><span>${money(order.subtotal)}</span>
    </div>
    <div class="receipt-line">
      <span>GST (5%)</span><span>${money(order.gst)}</span>
    </div>
    <div class="receipt-line">
      <strong>Total</strong><strong>${money(order.total)}</strong>
    </div>
    <p style="text-align:center;margin-top:22px">
      Please visit again!
    </p>
  `;

  $("receipt").showModal();
}

$("categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

$("menuGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

$("cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;

  changeQuantity(
    Number(button.dataset.id),
    Number(button.dataset.change)
  );
});

$("search").addEventListener("input", renderMenu);
$("placeOrder").addEventListener("click", placeOrder);

$("clearCart").addEventListener("click", () => {
  cart = [];
  renderCart();
});

$("orderHistory").addEventListener("click", event => {
  const button = event.target.closest("[data-bill]");
  if (!button) return;

  const order = orders.find(item => item.id === Number(button.dataset.bill));
  if (order) showReceipt(order);
});

$("printBill").addEventListener("click", () => window.print());
$("closeReceipt").addEventListener("click", () => $("receipt").close());

renderCategories();
renderMenu();
renderCart();
renderDashboard();
