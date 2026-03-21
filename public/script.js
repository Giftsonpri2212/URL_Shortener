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
  console.log('Button click event triggered');

  const url = urlInput.value.trim();
  console.log('URL value:', url);

  if (!url) {
    showStatus('Please enter a valid URL', true);
    return;
  }

  try {
    hideStatus();
    hideResult();
    setLoading(true);
    console.log('Making API request to:', 'http://localhost:3001/api/shorten');

    const response = await fetch('http://localhost:3001/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to shorten URL');
    }

    const shortUrl = data.shortUrl;
    if (!shortUrl) {
      throw new Error('Invalid response from server');
    }

    console.log('Short URL:', shortUrl);
    showResult(shortUrl);
    showStatus('URL shortened successfully!', false);

  } catch (error) {
    console.error('Error:', error);
    showStatus(error.message || 'An error occurred. Please try again.', true);
    // Restore the URL in the input field in case it was cleared
    urlInput.value = url;
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener('click', async () => {
  const url = shortUrlLink.textContent;
  console.log('Copying URL:', url);

  try {
    await navigator.clipboard.writeText(url);
    showStatus('Copied to clipboard!', false);
  } catch (error) {
    console.log('Clipboard error:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showStatus('Copied to clipboard!', false);
  }
});

// Test function to verify everything is working
window.testAPI = async () => {
  console.log('Testing API...');
  try {
    const response = await fetch('http://localhost:3001/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://test.com' })
    });
    const data = await response.json();
    console.log('API Test Result:', data);
    return data;
  } catch (error) {
    console.error('API Test Error:', error);
  }
};