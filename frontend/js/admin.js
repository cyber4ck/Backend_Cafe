const API_URL = window.location.origin;
let editingId = null;
let currentTab = 'menu';
let selectedUserId = null;
let allUsers = [];

// ==================== AUTH CHECK ====================
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);

  if (user.role !== 'admin') {
    document.getElementById('adminContent').innerHTML = `
      <div class="admin-denied">
        <h2 style="font-family:var(--hand);font-size:1.6rem;margin-bottom:10px">Access denied 🚫</h2>
        <p>You need an admin account to view this page.</p>
        <a href="menu.html" class="btn btn-fill" style="margin-top:16px;display:inline-block">Back to Menu</a>
      </div>`;
    return;
  }

  document.getElementById('adminTabs').style.display = 'flex';
  switchTab('menu');
});

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ==================== TAB SWITCHING ====================
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabMenuBtn').classList.toggle('active', tab === 'menu');
  document.getElementById('tabUsersBtn').classList.toggle('active', tab === 'users');

  if (tab === 'menu') {
    renderMenuTab();
    loadMenuItems();
  } else {
    renderUsersTab();
    loadUsers();
  }
}

// ==================== MENU TAB ====================
function renderMenuTab() {
  document.getElementById('adminContent').innerHTML = `
    <div class="admin-grid">
      <div class="admin-form-card">
        <div class="admin-form-title" id="formTitle">Add New Item</div>
        <form id="menuForm">
          <div class="admin-field">
            <label for="name">Name</label>
            <input type="text" id="name" required placeholder="e.g. Cappuccino">
          </div>
          <div class="admin-field">
            <label for="description">Description</label>
            <textarea id="description" required placeholder="Short description"></textarea>
          </div>
          <div class="admin-row-2">
            <div class="admin-field">
              <label for="price">Price (₹)</label>
              <input type="number" id="price" min="0" required placeholder="250">
            </div>
            <div class="admin-field">
              <label for="category">Category</label>
              <select id="category" required>
                <option value="coffee">Coffee</option>
                <option value="snacks">Snacks</option>
                <option value="meals">Meals</option>
                <option value="desserts">Desserts</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
          </div>
          <div class="admin-field">
            <label for="image">Image URL (optional)</label>
            <input type="text" id="image" placeholder="https://...">
          </div>
          <div class="admin-field" id="availableField" style="display:none">
            <label><input type="checkbox" id="available" style="width:auto;display:inline;margin-right:8px">Available</label>
          </div>
          <button type="submit" class="btn btn-fill btn-full" id="submitBtn">Add Item</button>
          <button type="button" class="btn btn-full" id="cancelBtn" style="display:none;margin-top:8px" onclick="cancelEdit()">Cancel Edit</button>
          <div id="adminMessage"></div>
        </form>
      </div>

      <div>
        <div class="admin-list-title">Current Menu Items</div>
        <div id="itemsList"><p class="loading">Loading...</p></div>
      </div>
    </div>
  `;

  document.getElementById('menuForm').addEventListener('submit', handleSubmit);
}

// ==================== LOAD MENU ITEMS ====================
async function loadMenuItems() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/menu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Failed to load items');

    displayItems(data.items || []);
  } catch (error) {
    document.getElementById('itemsList').innerHTML = `<p class="loading">Error: ${error.message}</p>`;
  }
}

// ==================== DISPLAY MENU ITEMS ====================
function displayItems(items) {
  const list = document.getElementById('itemsList');

  if (items.length === 0) {
    list.innerHTML = '<p class="loading">No menu items yet. Add one!</p>';
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="admin-item-row">
      <div class="admin-item-info">
        <div class="admin-item-name">${escapeHtml(item.name)}</div>
        <div class="admin-item-meta">${escapeHtml(item.category)} ${item.available ? '<span class="admin-avail-badge">Available</span>' : '<span class="admin-empty-badge">Hidden</span>'}</div>
      </div>
      <div class="admin-item-price">₹${item.price}</div>
      <div class="admin-item-actions">
        <button class="edit-btn" onclick='editItem(${JSON.stringify(item).replace(/'/g, "&#39;")})'>Edit</button>
        <button class="danger" onclick="deleteItem('${item._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==================== ADD / UPDATE MENU ITEM ====================
async function handleSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const messageDiv = document.getElementById('adminMessage');
  messageDiv.innerHTML = '';
  messageDiv.classList.remove('success', 'error');

  const payload = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: Number(document.getElementById('price').value),
    category: document.getElementById('category').value,
    image: document.getElementById('image').value,
  };

  if (editingId) {
    payload.available = document.getElementById('available').checked;
  }

  try {
    const url = editingId ? `${API_URL}/api/menu/${editingId}` : `${API_URL}/api/menu`;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Operation failed');

    messageDiv.classList.add('success');
    messageDiv.innerHTML = `✓ ${data.message}`;

    cancelEdit();
    loadMenuItems();
  } catch (error) {
    messageDiv.classList.add('error');
    messageDiv.innerHTML = `✗ ${error.message}`;
  }
}

// ==================== EDIT MENU ITEM ====================
function editItem(item) {
  editingId = item._id;
  document.getElementById('formTitle').textContent = 'Edit Item';
  document.getElementById('name').value = item.name;
  document.getElementById('description').value = item.description;
  document.getElementById('price').value = item.price;
  document.getElementById('category').value = item.category;
  document.getElementById('image').value = item.image || '';
  document.getElementById('availableField').style.display = 'block';
  document.getElementById('available').checked = item.available;
  document.getElementById('submitBtn').textContent = 'Update Item';
  document.getElementById('cancelBtn').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId = null;
  document.getElementById('menuForm').reset();
  document.getElementById('formTitle').textContent = 'Add New Item';
  document.getElementById('availableField').style.display = 'none';
  document.getElementById('submitBtn').textContent = 'Add Item';
  document.getElementById('cancelBtn').style.display = 'none';
}

// ==================== DELETE MENU ITEM ====================
async function deleteItem(id) {
  if (!confirm('Delete this menu item?')) return;

  const token = localStorage.getItem('token');
  const messageDiv = document.getElementById('adminMessage');

  try {
    const response = await fetch(`${API_URL}/api/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Delete failed');

    loadMenuItems();
  } catch (error) {
    messageDiv.classList.add('error');
    messageDiv.innerHTML = `✗ ${error.message}`;
  }
}

// ==================== USERS TAB ====================
function renderUsersTab() {
  document.getElementById('adminContent').innerHTML = `
    <div class="users-grid">
      <div>
        <div class="admin-list-title">All Users</div>
        <div id="usersList"><p class="loading">Loading...</p></div>
      </div>
      <div id="userDetail">
        <div class="user-detail-card">
          <p class="loading">Select a user to view their orders and send a message.</p>
        </div>
      </div>
    </div>
  `;
}

// ==================== LOAD USERS ====================
async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load users');

    allUsers = data.users || [];
    displayUsers();
  } catch (error) {
    document.getElementById('usersList').innerHTML = `<p class="loading">Error: ${error.message}</p>`;
  }
}

// ==================== DISPLAY USERS ====================
function displayUsers() {
  const list = document.getElementById('usersList');

  if (allUsers.length === 0) {
    list.innerHTML = '<p class="loading">No users found.</p>';
    return;
  }

  list.innerHTML = allUsers.map(u => `
    <div class="user-card ${u._id === selectedUserId ? 'selected' : ''}" onclick="selectUser('${u._id}')">
      <div class="user-card-name">${escapeHtml(u.name)}</div>
      <div class="user-card-email">${escapeHtml(u.email)}</div>
      <span class="user-card-role ${u.role === 'admin' ? 'admin' : ''}">${u.role}</span>
    </div>
  `).join('');
}

// ==================== SELECT USER → SHOW ORDERS + MESSAGE BOX ====================
async function selectUser(userId) {
  selectedUserId = userId;
  displayUsers();

  const user = allUsers.find(u => u._id === userId);
  const detail = document.getElementById('userDetail');
  detail.innerHTML = `
    <div class="user-detail-card">
      <div class="user-detail-name">${escapeHtml(user.name)}</div>
      <div class="user-detail-email">${escapeHtml(user.email)} · ${user.role}</div>

      <div class="admin-list-title" style="font-size:1.1rem">Order History</div>
      <div id="userOrders"><p class="loading">Loading orders...</p></div>

      <div class="msg-box">
        <div class="admin-list-title" style="font-size:1.1rem">Send a Message</div>
        <textarea id="msgText" placeholder="Type a message to this user..."></textarea>
        <button class="btn btn-fill btn-full" style="margin-top:8px" onclick="sendMessage('${userId}')">Send Message</button>
        <div id="msgStatus"></div>

        <div class="admin-list-title" style="font-size:1.1rem;margin-top:14px">Message History</div>
        <div class="msg-history" id="msgHistory">
          ${(user.messages && user.messages.length > 0)
            ? user.messages.slice().reverse().map(m => `
              <div class="msg-item">
                ${escapeHtml(m.text)}
                <div class="msg-item-date">${new Date(m.createdAt).toLocaleString()}</div>
              </div>
            `).join('')
            : '<p class="loading">No messages sent yet.</p>'}
        </div>
      </div>
    </div>
  `;

  loadUserOrders(userId);
}

// ==================== LOAD A USER'S ORDERS ====================
async function loadUserOrders(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to load orders');

    const ordersDiv = document.getElementById('userOrders');
    const orders = data.orders || [];

    if (orders.length === 0) {
      ordersDiv.innerHTML = '<p class="loading">No orders placed yet.</p>';
      return;
    }

    ordersDiv.innerHTML = orders.map(o => `
      <div class="order-mini">
        <div class="order-mini-top">
          <span>Order #${o._id.slice(-6)}</span>
          <span>₹${o.totalAmount}</span>
        </div>
        <div class="order-mini-items">
          ${(o.items || []).map(it => `${it.menuItem ? escapeHtml(it.menuItem.name) : 'Item'} x${it.quantity}`).join(', ')}
        </div>
        <span class="order-mini-status">${o.status}</span>
        <div class="msg-item-date">${new Date(o.createdAt).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('userOrders').innerHTML = `<p class="loading">Error: ${error.message}</p>`;
  }
}

// ==================== SEND MESSAGE TO USER ====================
async function sendMessage(userId) {
  const text = document.getElementById('msgText').value.trim();
  const statusDiv = document.getElementById('msgStatus');
  statusDiv.innerHTML = '';

  if (!text) {
    statusDiv.innerHTML = '<p class="loading" style="color:var(--red)">Message cannot be empty.</p>';
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send message');

    document.getElementById('msgText').value = '';
    statusDiv.innerHTML = '<p class="loading" style="color:var(--green)">✓ Message sent!</p>';

    // Refresh user list (to get updated messages) and re-select user
    await loadUsers();
    selectUser(userId);
  } catch (error) {
    statusDiv.innerHTML = `<p class="loading" style="color:var(--red)">✗ ${error.message}</p>`;
  }
}
