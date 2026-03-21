const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const shortUrlLink = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const statusDiv = document.getElementById('status');

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

shortenBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();

  if (!url) {
    showStatus('Please enter a valid URL', true);
    return;
  }

  try {
    hideStatus();
    hideResult();
    setLoading(true);

    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to shorten URL');
    }

    const shortUrl = data.shortUrl;
    if (!shortUrl) {
      throw new Error('Invalid response from server');
    }

    showResult(shortUrl);
    showStatus('URL shortened successfully!', false);
  } catch (error) {
    console.error('Shorten request failed:', error);
    showStatus(error.message || 'An error occurred. Please try again.', true);
    urlInput.value = url;
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener('click', async () => {
  const url = shortUrlLink.textContent;

  if (!url) {
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showStatus('Copied to clipboard!', false);
  } catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showStatus('Copied to clipboard!', false);
  }
});