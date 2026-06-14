const API_URL = 'http://localhost:5000';
const API_URL = window.location.origin; // Works both locally and when deployed
// Check authentication on page load
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Not logged in, redirect to login
    window.location.href = 'login.html';
    return;
  }

  // Load user orders
  loadOrders();
});

// ==================== LOAD ORDERS ====================
async function loadOrders() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/api/orders/myorders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      const orders = data.orders;

      if (orders.length === 0) {
        // Show empty state
        document.getElementById('ordersList').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
      } else {
        displayOrders(orders);
      }
    } else {
      document.getElementById('ordersList').innerHTML = 
        `<div class="loading">Error: ${data.message}</div>`;
    }
  } catch (error) {
    document.getElementById('ordersList').innerHTML = 
      `<div class="loading">Error loading orders: ${error.message}</div>`;
  }
}

// ==================== DISPLAY ORDERS ====================
function displayOrders(orders) {
  const ordersList = document.getElementById('ordersList');

  ordersList.innerHTML = orders.map(order => {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsHTML = order.items.map(item => `
      <div class="order-item">
        <div class="item-details">
          <div class="item-name">${item.menuItem.name}</div>
          <div class="item-qty">Qty: ${item.quantity}</div>
        </div>
        <div class="item-price">₹${item.price * item.quantity}</div>
      </div>
    `).join('');

    const deliveryFee = 50;
    const total = order.totalPrice + deliveryFee;

    const statusClass = `status-${order.status}`;
    const canCancel = order.status === 'pending';

    return `
      <div class="order-card-premium">
        <div class="order-header">
          <div class="order-id-info">
            <div class="order-id">Order #${order._id.substring(0, 8).toUpperCase()}</div>
            <div class="order-date">${date}</div>
          </div>
          <span class="order-status-badge ${statusClass}">${order.status}</span>
          <div class="order-total">₹${total}</div>
        </div>

        <div class="order-items">
          ${itemsHTML}
        </div>

        <div class="order-metadata">
          <div class="metadata-row">
            <div class="metadata-label">Delivery Address</div>
            <div class="metadata-value">${order.deliveryAddress}</div>
          </div>
          <div class="metadata-row">
            <div class="metadata-label">Order Date</div>
            <div class="metadata-value">${date}</div>
          </div>
        </div>

        <div class="order-actions">
          <button class="btn-secondary" onclick="reorder('${order._id}')">
            Order Again
          </button>
          ${canCancel ? `
            <button class="btn-secondary" onclick="cancelOrder('${order._id}')">
              Cancel Order
            </button>
          ` : `
            <button class="btn-secondary" disabled>
              Cannot Cancel
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// ==================== REORDER ====================
async function reorder(orderId) {
  const token = localStorage.getItem('token');

  try {
    // Fetch the order details
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      const order = data.order;
      
      // Add items to cart
      let cart = {};
      order.items.forEach(item => {
        const itemId = item.menuItem._id;
        cart[itemId] = {
          name: item.menuItem.name,
          price: item.price,
          quantity: item.quantity,
          image: item.menuItem.image || '',
        };
      });

      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Redirect to menu
      alert('✓ Items added to cart! Redirecting to menu...');
      window.location.href = 'menu.html';
    } else {
      alert('✗ Error loading order');
    }
  } catch (error) {
    alert('✗ Error: ' + error.message);
  }
}

// ==================== CANCEL ORDER ====================
async function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert('✓ Order cancelled successfully!');
      // Reload orders
      loadOrders();
    } else {
      alert('✗ ' + (data.message || 'Failed to cancel order'));
    }
  } catch (error) {
    alert('✗ Error: ' + error.message);
  }
}

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
}
