const API_URL = 'http://localhost:5000'; // Backend server URL
const API_URL = window.location.origin; // Works both locally and when deployed
// Get form and message elements
const signupForm = document.getElementById('signupForm');
const messageDiv = document.getElementById('message');

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Clear previous messages
  messageDiv.innerHTML = '';
  messageDiv.classList.remove('success', 'error');

  // Basic validation
  if (password.length < 6) {
    messageDiv.classList.add('error');
    messageDiv.innerHTML = '✗ Password must be at least 6 characters!';
    return;
  }

  if (password !== confirmPassword) {
    messageDiv.classList.add('error');
    messageDiv.innerHTML = '✗ Passwords do not match!';
    return;
  }

  try {
    // Send signup request to backend
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Success!
      messageDiv.classList.add('success');
      messageDiv.innerHTML = '✓ Account created successfully! Redirecting to login...';

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Error response
      messageDiv.classList.add('error');
      messageDiv.innerHTML = '✗ ' + (data.message || 'Signup failed!');
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
