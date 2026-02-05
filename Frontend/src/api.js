const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to create fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Helper function to handle API errors
async function handleResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, create generic error
      errorData = {
        error: `Request failed with status ${response.status}`,
        code: 'HTTP_ERROR',
      };
    }
    throw errorData;
  }
  return response.json();
}

// Helper function to handle network errors
function handleNetworkError(error) {
  if (error.name === 'AbortError') {
    throw {
      error: 'Request timed out. Please check your connection and try again.',
      code: 'TIMEOUT',
    };
  }

  if (!navigator.onLine) {
    throw {
      error: 'No internet connection. Please check your network.',
      code: 'OFFLINE',
    };
  }

  if (error.code || error.error) {
    // Already formatted error from API
    throw error;
  }

  // Generic network error
  throw {
    error: 'Unable to connect to the server. Please try again later.',
    code: 'NETWORK_ERROR',
  };
}

// Helper function to determine if error is retryable
function isRetryable(error) {
  // Don't retry on user errors (4xx except 429)
  if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false;
  }

  // Retry on timeout, network errors, and server errors (5xx)
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'OFFLINE'];
  return retryableCodes.includes(error.code) || (error.status && error.status >= 500);
}

// Helper function to wait with exponential backoff
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper with exponential backoff
async function fetchWithRetry(url, options = {}, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, timeout);
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error or last attempt
      if (!isRetryable(error) || attempt === retries) {
        throw error;
      }

      // Calculate delay with exponential backoff: 1s, 2s, 4s
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`Request failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms...`);
      
      await wait(delay);
    }
  }

  throw lastError;
}

export async function createChat() {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/chats`, { 
      method: "POST" 
    });
    return handleResponse(res);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function getChats() {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/chats`);
    return handleResponse(res);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function getMessages(chatId) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/chats/${chatId}`);
    return handleResponse(res);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function sendMessage(chatId, content) {
  try {
    const res = await fetchWithRetry(
      `${API_URL}/api/chats/${chatId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
      45000 // Longer timeout for AI response
    );
    return handleResponse(res);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteChat(chatId) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/chats/${chatId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function checkHealth() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/health`, {}, 5000); // 5s timeout
    return handleResponse(res);
  } catch (error) {
    handleNetworkError(error);
  }
}
