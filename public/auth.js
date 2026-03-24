const AUTH_TOKEN_KEY = 'url_shortener_auth_token';
const AUTH_USER_KEY = 'url_shortener_auth_user';

const authStatusDiv = document.getElementById('authStatus');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function showStatus(message, isError = false) {
  if (!authStatusDiv) {
    return;
  }

  authStatusDiv.textContent = message;
  authStatusDiv.className = `status show ${isError ? 'error' : 'success'}`;
}

function setLoading(button, isLoading, busyText, idleText) {
  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? busyText : idleText;
}

function saveAuth({ token, user }) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

async function apiRequest(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const validationDetails = Array.isArray(data?.details)
      ? data.details
          .map((item) => `${item.path || 'field'}: ${item.message || 'invalid value'}`)
          .join(', ')
      : '';

    const message = data?.message
      || (data?.error === 'ValidationError' && validationDetails)
      || data?.error
      || 'Request failed';

    throw new Error(message);
  }

  return data;
}

if (loginForm) {
  const loginBtn = document.getElementById('loginBtn');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      showStatus('Email and password are required.', true);
      return;
    }

    try {
      setLoading(loginBtn, true, 'Logging in...', 'Log In');
      showStatus('Signing in...');

      const data = await apiRequest('/auth/login', { email, password });
      saveAuth({ token: data.token, user: data.user });
      showStatus('Login successful. Redirecting...');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } catch (error) {
      showStatus(error.message || 'Login failed.', true);
    } finally {
      setLoading(loginBtn, false, 'Logging in...', 'Log In');
    }
  });
}

if (registerForm) {
  const registerBtn = document.getElementById('registerBtn');
  const registerEmail = document.getElementById('registerEmail');
  const registerPassword = document.getElementById('registerPassword');
  const planType = document.getElementById('planType');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!email || !password) {
      showStatus('Email and password are required.', true);
      return;
    }

    try {
      setLoading(registerBtn, true, 'Creating account...', 'Create Account');
      showStatus('Creating account...');

      const data = await apiRequest('/auth/register', {
        email,
        password,
        planType: planType.value
      });

      saveAuth({ token: data.token, user: data.user });
      showStatus('Registration successful. Redirecting...');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } catch (error) {
      showStatus(error.message || 'Registration failed.', true);
    } finally {
      setLoading(registerBtn, false, 'Creating account...', 'Create Account');
    }
  });
}
