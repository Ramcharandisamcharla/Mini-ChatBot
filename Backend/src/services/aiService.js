const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function generateAIResponse(messages) {
  // MOCK fallback if API key not set
  if (!process.env.AI_API_KEY) {
    return "This is a mock AI response. AI API key is not configured.";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(OPENAI_URL, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          ...messages,
        ],
        temperature: 0.7,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error("AI provider error");
      error.statusCode = response.status;
      error.code = 'AI_PROVIDER_ERROR';
      error.details = errorData;
      throw error;
    }

    // Return the stream directly for SSE streaming
    return response.body;
  } catch (err) {
    console.error("AI error:", err.message);
    
    // Handle different error types
    if (err.name === 'AbortError') {
      const error = new Error('Request timed out. Please try again.');
      error.code = 'TIMEOUT';
      throw error;
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      const error = new Error('Unable to connect to AI service. Please check your connection.');
      error.code = 'NETWORK_ERROR';
      throw error;
    }
    
    if (err.type === 'system' || err.errno) {
      const error = new Error('Network error occurred. Please try again.');
      error.code = 'NETWORK_ERROR';
      throw error;
    }
    
    // Re-throw with original code if it has one
    throw err;
  }
}
