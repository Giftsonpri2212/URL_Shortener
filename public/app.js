const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const shortUrlLink = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const statusDiv = document.getElementById('status');
const authStateDiv = document.getElementById('authState');
const currentUserEmail = document.getElementById('currentUserEmail');
const logoutBtn = document.getElementById('logoutBtn');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const profileChip = document.getElementById('profileChip');
const linksSummary = document.getElementById('linksSummary');
const linksTableBody = document.getElementById('linksTableBody');
const linksEmpty = document.getElementById('linksEmpty');
const linksTableWrap = document.getElementById('linksTableWrap');
const refreshLinksBtn = document.getElementById('refreshLinksBtn');
const clearLinksBtn = document.getElementById('clearLinksBtn');
const clearConfirmPanel = document.getElementById('clearConfirmPanel');
const clearConfirmToggle = document.getElementById('clearConfirmToggle');
const confirmClearBtn = document.getElementById('confirmClearBtn');
const cancelClearBtn = document.getElementById('cancelClearBtn');

const AUTH_TOKEN_KEY = 'url_shortener_auth_token';
const AUTH_USER_KEY = 'url_shortener_auth_user';

function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = `status show ${isError ? 'error' : 'success'}`;
}

function hideStatus() {
  statusDiv.className = 'status';
}

function showResult(shortUrl) {
  shortUrlLink.textContent = shortUrl;
  shortUrlLink.href = shortUrl;
  resultDiv.className = 'result show';
  copyBtn.style.display = 'inline-block';
}

function hideResult() {
  resultDiv.className = 'result';
}

function setLoading(isLoading) {
  shortenBtn.disabled = isLoading;
  if (isLoading) {
    shortenBtn.innerHTML = '<span class="loading"></span>Shortening...';
  } else {
    shortenBtn.textContent = 'Shorten URL';
  }
}

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function getStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveAuth({ token, user }) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function renderAuthState() {
  const token = getStoredToken();
  const user = getStoredUser();
  const isLoggedIn = Boolean(token && user && user.email);

  if (!isLoggedIn) {
    window.location.href = '/login';
    return;
  }

  authStateDiv.classList.toggle('show', isLoggedIn);
  currentUserEmail.textContent = isLoggedIn ? user.email : '';
  if (loginLink) {
    loginLink.style.display = isLoggedIn ? 'none' : 'inline-flex';
  }
  if (registerLink) {
    registerLink.style.display = isLoggedIn ? 'none' : 'inline-flex';
  }
  if (profileChip) {
    profileChip.style.display = isLoggedIn ? 'inline-flex' : 'none';
  }
  if (logoutBtn) {
    logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  }
  shortenBtn.disabled = !isLoggedIn;
  hideStatus();
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Never';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return parsed.toLocaleString();
}

async function copyTextToClipboard(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  showStatus(successMessage, false);
}

function setLinksLoading(isLoading) {
  if (!refreshLinksBtn) {
    return;
  }

  refreshLinksBtn.disabled = isLoading;
  refreshLinksBtn.textContent = isLoading ? 'Refreshing...' : 'Refresh';
}

function setClearButtonLoading(isLoading) {
  if (!confirmClearBtn) {
    return;
  }

  if (isLoading) {
    confirmClearBtn.disabled = true;
    confirmClearBtn.textContent = 'Clearing...';
    return;
  }

  confirmClearBtn.textContent = 'Yes, Clear Everything';
  confirmClearBtn.disabled = !(clearConfirmToggle && clearConfirmToggle.checked);
}

function hideClearConfirmPanel() {
  if (clearConfirmPanel) {
    clearConfirmPanel.classList.remove('show');
  }

  if (clearConfirmToggle) {
    clearConfirmToggle.checked = false;
  }

  if (confirmClearBtn) {
    confirmClearBtn.disabled = true;
  }
}

function renderLinks(links) {
  if (!linksTableBody || !linksSummary || !linksEmpty || !linksTableWrap) {
    return;
  }

  linksSummary.textContent = `${links.length} ${links.length === 1 ? 'link' : 'links'}`;
  linksTableBody.innerHTML = '';

  if (!Array.isArray(links) || links.length === 0) {
    linksEmpty.classList.add('show');
    linksTableWrap.style.display = 'none';
    return;
  }

  linksEmpty.classList.remove('show');
  linksTableWrap.style.display = 'block';

  links.forEach((link) => {
    const row = document.createElement('tr');

    const shortCell = document.createElement('td');
    const shortAnchor = document.createElement('a');
    shortAnchor.href = link.shortUrl;
    shortAnchor.target = '_blank';
    shortAnchor.rel = 'noopener noreferrer';
    shortAnchor.textContent = link.shortCode;
    shortCell.appendChild(shortAnchor);

    const originalCell = document.createElement('td');
    const originalAnchor = document.createElement('a');
    originalAnchor.href = link.originalUrl;
    originalAnchor.target = '_blank';
    originalAnchor.rel = 'noopener noreferrer';
    originalAnchor.textContent = link.originalUrl;
    originalAnchor.title = link.originalUrl;
    originalAnchor.className = 'original-link';
    originalCell.appendChild(originalAnchor);

    const clicksCell = document.createElement('td');
    const clicksPill = document.createElement('span');
    clicksPill.className = 'count-pill';
    clicksPill.textContent = String(link.clickCount || 0);
    clicksCell.appendChild(clicksPill);

    const createdCell = document.createElement('td');
    createdCell.textContent = formatDate(link.createdAt);

    const expiresCell = document.createElement('td');
    expiresCell.textContent = link.expiresAt ? formatDate(link.expiresAt) : 'Never';

    const actionsCell = document.createElement('td');
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'row-actions';

    const copyAction = document.createElement('button');
    copyAction.type = 'button';
    copyAction.className = 'mini-btn';
    copyAction.textContent = 'Copy';
    copyAction.dataset.action = 'copy';
    copyAction.dataset.url = link.shortUrl;

    const openAction = document.createElement('a');
    openAction.className = 'mini-btn';
    openAction.textContent = 'Open';
    openAction.href = link.shortUrl;
    openAction.target = '_blank';
    openAction.rel = 'noopener noreferrer';

    actionsWrap.appendChild(copyAction);
    actionsWrap.appendChild(openAction);
    actionsCell.appendChild(actionsWrap);

    row.appendChild(shortCell);
    row.appendChild(originalCell);
    row.appendChild(clicksCell);
    row.appendChild(createdCell);
    row.appendChild(expiresCell);
    row.appendChild(actionsCell);
    linksTableBody.appendChild(row);
  });
}

async function loadMyLinks() {
  if (!getStoredToken()) {
    return;
  }

  try {
    setLinksLoading(true);
    const response = await apiRequest('/api/my-links');
    renderLinks(response?.links || []);
  } catch (error) {
    console.error('Failed to load user links:', error);
    if (linksSummary) {
      linksSummary.textContent = 'Unavailable';
    }
    if (linksEmpty) {
      linksEmpty.classList.add('show');
      linksEmpty.textContent = 'Could not load links right now. Please try Refresh.';
    }
    if (linksTableWrap) {
      linksTableWrap.style.display = 'none';
    }
  } finally {
    setLinksLoading(false);
  }
}

async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage = payload?.message || payload?.error || 'Request failed';
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return payload;
}

logoutBtn.addEventListener('click', () => {
  clearAuth();
  hideResult();
  window.location.href = '/login';
});

shortenBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();

  if (!getStoredToken()) {
    showStatus('Please login first to create short URLs.', true);
    return;
  }

  if (!url) {
    showStatus('Please enter a valid URL', true);
    return;
  }

  try {
    hideStatus();
    hideResult();
    setLoading(true);

    const data = await apiRequest('/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url })
    });

    const shortUrl = data.shortUrl;
    if (!shortUrl) {
      throw new Error('Invalid response from server');
    }

    showResult(shortUrl);
    showStatus('URL shortened successfully!', false);
    await loadMyLinks();
  } catch (error) {
    console.error('Shorten request failed:', error);
    showStatus(error.message || 'An error occurred. Please try again.', true);
    urlInput.value = url;
  } finally {
    setLoading(false);
  }
});

renderAuthState();
loadMyLinks();

if (refreshLinksBtn) {
  refreshLinksBtn.addEventListener('click', () => {
    loadMyLinks();
  });
}

if (clearLinksBtn) {
  clearLinksBtn.addEventListener('click', () => {
    if (clearConfirmPanel) {
      clearConfirmPanel.classList.add('show');
    }
  });
}

if (cancelClearBtn) {
  cancelClearBtn.addEventListener('click', () => {
    hideClearConfirmPanel();
  });
}

if (clearConfirmToggle) {
  clearConfirmToggle.addEventListener('change', () => {
    if (!confirmClearBtn) {
      return;
    }

    confirmClearBtn.disabled = !clearConfirmToggle.checked;
  });
}

if (confirmClearBtn) {
  confirmClearBtn.addEventListener('click', async () => {
    if (!clearConfirmToggle || !clearConfirmToggle.checked) {
      showStatus('Please enable the confirmation toggle first.', true);
      return;
    }

    try {
      setClearButtonLoading(true);
      const response = await apiRequest('/api/my-links', { method: 'DELETE' });
      hideResult();
      hideClearConfirmPanel();
      await loadMyLinks();
      showStatus(`Cleared ${response.deleted || 0} links successfully.`, false);
    } catch (error) {
      console.error('Failed to clear links:', error);
      showStatus(error.message || 'Failed to clear links.', true);
    } finally {
      setClearButtonLoading(false);
    }
  });
}

if (linksTableBody) {
  linksTableBody.addEventListener('click', async (event) => {
    const trigger = event.target.closest('[data-action="copy"]');
    if (!trigger) {
      return;
    }

    const linkToCopy = trigger.dataset.url;
    if (!linkToCopy) {
      return;
    }

    await copyTextToClipboard(linkToCopy, 'Short URL copied!');
  });
}

copyBtn.addEventListener('click', async () => {
  const url = shortUrlLink.textContent;

  if (!url) {
    return;
  }

  await copyTextToClipboard(url, 'Copied to clipboard!');
});