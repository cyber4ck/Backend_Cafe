const API_URL = 'http://localhost:5000'; // Backend server URL
const API_URL = window.location.origin; // Works both locally and when deployed
// Get form and message elements
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Clear previous messages
  messageDiv.innerHTML = '';
  messageDiv.classList.remove('success', 'error');

  try {
    // Send login request to backend
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Success! Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Show success message
      messageDiv.classList.add('success');
      messageDiv.innerHTML = '✓ Login successful! Redirecting...';

      // Redirect to menu page after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'menu.html';
      }, 1500);
    } else {
      // Error response
      messageDiv.classList.add('error');
      messageDiv.innerHTML = '✗ ' + (data.message || 'Login failed!');
    }
  } catch (error) {
    messageDiv.classList.add('error');
    messageDiv.innerHTML = '✗ Error: ' + error.message;
  }
});

// Check if user is already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // User already logged in, redirect to menu
    window.location.href = 'menu.html';
  }
});
