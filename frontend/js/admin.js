const API_URL = window.location.origin;
let editingId = null;

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

  renderAdminUI();
  loadMenuItems();
});

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ==================== RENDER UI ====================
function renderAdminUI() {
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

// ==================== LOAD ITEMS ====================
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

// ==================== DISPLAY ITEMS ====================
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

// ==================== ADD / UPDATE ====================
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

// ==================== EDIT ====================
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

// ==================== DELETE ====================
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
