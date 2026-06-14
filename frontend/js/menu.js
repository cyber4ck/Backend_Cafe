const API_URL = window.location.origin; // Works both locally and when deployed

let cart = {}; // { itemId: { name, price, quantity, image } }
let menuItems = [];
let filteredItems = [];
let currentFilter = 'all';

// Check authentication on page load
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Not logged in, redirect to login
    window.location.href = 'login.html';
    return;
  }

  // Show admin link if user is admin
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      const adminLink = document.getElementById('adminLink');
      if (adminLink) adminLink.style.display = 'inline-block';
    }
  } catch (e) {}

  // Load menu items
  loadMenuItems();
  // Load cart from localStorage
  loadCartFromStorage();
});

// ==================== LOAD MENU ITEMS ====================
async function loadMenuItems() {
  try {
    const response = await fetch(`${API_URL}/api/menu`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load menu items');
    }

    const data = await response.json();
    menuItems = data.items;
    filteredItems = menuItems;
    displayMenuItems(filteredItems);
  } catch (error) {
    document.getElementById('menuItems').innerHTML = 
      `<div class="loading">Error loading menu: ${error.message}</div>`;
  }
}

// ==================== DISPLAY MENU ITEMS ====================
function displayMenuItems(items) {
  const menuContainer = document.getElementById('menuItems');

  if (items.length === 0) {
    menuContainer.innerHTML = '<div class="loading-premium">No items found</div>';
    return;
  }

  const gradients = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4'];
  const svgs = [
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
      <path d="M 35 30 Q 50 45 65 30" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.8"/>
      <path d="M 35 45 Q 50 60 65 45" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.6"/>
      <path d="M 35 60 Q 50 75 65 60" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.4"/>
    </svg>`,
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="20" width="40" height="60" rx="3" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.8"/>
      <line x1="35" y1="30" x2="65" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
      <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.4"/>
    </svg>`,
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 35 L 70 35 L 65 75 Q 50 85 35 75 Z" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.8"/>
      <ellipse cx="50" cy="35" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="2" opacity="0.6"/>
      <path d="M 40 50 Q 45 55 50 50 Q 55 55 60 50" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    </svg>`,
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2" opacity="0.6"/>
      <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
      <line x1="50" y1="25" x2="50" y2="40" stroke="currentColor" stroke-width="2" opacity="0.8"/>
      <path d="M 50 50 L 60 45" stroke="currentColor" stroke-width="2" opacity="0.7"/>
    </svg>`
  ];

  menuContainer.innerHTML = items.map((item, index) => `
    <div class="menu-card-premium" data-tilt>
      <div class="card-image ${gradients[index % 4]}">
        ${svgs[index % 4]}
      </div>
      <div class="menu-card-content">
        <div class="menu-card-title">${item.name}</div>
        <span class="menu-card-category">${item.category}</span>
        <div class="menu-card-description">${item.description}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">₹${item.price}</div>
          <button class="menu-card-btn" onclick="addToCart('${item._id}', '${item.name}', ${item.price}, '')">
            Add
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Initialize Vanilla Tilt on new cards
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.menu-card-premium[data-tilt]'), {
      max: 5,
      scale: 1.05,
      speed: 400,
    });
  }
}

// ==================== FILTER MENU ====================
function filterMenu(category) {
  currentFilter = category;

  // Update active button
  document.querySelectorAll('.filter-btn-premium').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Filter items
  if (category === 'all') {
    filteredItems = menuItems;
  } else {
    filteredItems = menuItems.filter(item => item.category === category);
  }

  displayMenuItems(filteredItems);
}

// ==================== ADD TO CART ====================
function addToCart(itemId, name, price, image) {
  if (cart[itemId]) {
    cart[itemId].quantity += 1;
  } else {
    cart[itemId] = {
      name,
      price,
      quantity: 1,
      image,
    };
  }

  saveCartToStorage();
  updateCartDisplay();
  showNotification(`✓ ${name} added to cart!`);
}

// ==================== REMOVE FROM CART ====================
function removeFromCart(itemId) {
  delete cart[itemId];
  saveCartToStorage();
  updateCartDisplay();
}

// ==================== UPDATE CART DISPLAY ====================
function updateCartDisplay() {
  const cartItemsDiv = document.getElementById('cartItems');
  const subtotalDiv = document.getElementById('subtotal');
  const totalDiv = document.getElementById('total');

  const cartItemsArray = Object.entries(cart);

  if (cartItemsArray.length === 0) {
    cartItemsDiv.innerHTML = '<p class="empty-cart">No items selected</p>';
    subtotalDiv.textContent = '₹0';
    totalDiv.textContent = '₹50';
    return;
  }

  // Display cart items
  cartItemsDiv.innerHTML = cartItemsArray.map(([itemId, item]) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">Qty: ${item.quantity}</div>
      </div>
      <div class="cart-item-price">₹${item.price * item.quantity}</div>
      <button class="cart-item-remove" onclick="removeFromCart('${itemId}')">Remove</button>
    </div>
  `).join('');

  // Calculate totals
  let subtotal = 0;
  cartItemsArray.forEach(([_, item]) => {
    subtotal += item.price * item.quantity;
  });

  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  subtotalDiv.textContent = `₹${subtotal}`;
  totalDiv.textContent = `₹${total}`;
}

// ==================== CHECKOUT ====================
async function checkout() {
  const token = localStorage.getItem('token');
  const deliveryAddress = document.getElementById('deliveryAddress').value;

  if (!deliveryAddress.trim()) {
    alert('Please enter delivery address');
    return;
  }

  const cartItemsArray = Object.entries(cart);
  if (cartItemsArray.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Format items for API
  const items = cartItemsArray.map(([itemId, item]) => ({
    menuItemId: itemId,
    quantity: item.quantity,
  }));

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        deliveryAddress,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Success!
      alert('✓ Order placed successfully! Order ID: ' + data.order._id);
      
      // Clear cart
      cart = {};
      saveCartToStorage();
      updateCartDisplay();
      document.getElementById('deliveryAddress').value = '';

      // Redirect to orders page
      setTimeout(() => {
        window.location.href = 'orders.html';
      }, 1000);
    } else {
      alert('✗ ' + (data.message || 'Failed to place order'));
    }
  } catch (error) {
    alert('✗ Error: ' + error.message);
  }
}

// ==================== CART STORAGE ====================
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
}

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
}

// ==================== NOTIFICATION ====================
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 2000;
    animation: slideInRight 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}
