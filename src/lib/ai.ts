/**
 * AI Integration Module - Uses OpenAI API for chat completions
 * Supports text and streaming responses with multi-language support
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  console.warn(
    "[AI] OpenAI API key is NOT set (OPENAI_API_KEY). " +
    "AI replies will fall back to static helper message. Add a key to enable live AI responses."
  );
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Detect the language of a message
 * @param text Message text to analyze
 * @returns Language code ('en', 'hi', 'mix' for mixed)
 */
export function detectLanguage(text: string): "en" | "hi" | "mix" {
  // Hindi Unicode range: U+0900 to U+097F
  const hindiRegex = /[\u0900-\u097F]/g;
  const englishRegex = /[a-zA-Z]/g;

  const hindiCount = (text.match(hindiRegex) || []).length;
  const englishCount = (text.match(englishRegex) || []).length;

  if (hindiCount === 0 && englishCount > 0) return "en";
  if (englishCount === 0 && hindiCount > 0) return "hi";
  if (hindiCount > 0 && englishCount > 0) return "mix";

  return "en"; // Default to English
}

/**
 * Get chat completion from OpenAI API
 * @param messages Chat history and current message
 * @param temperature Creativity level (0-1)
 * @param maxTokens Maximum tokens in response
 * @returns Generated text response
 */
export async function getChatCompletion(
  messages: ChatMessage[],
  temperature = 0.4,
  maxTokens = 1024
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", error);
      throw new Error(
        `OpenAI API error: ${response.status} - ${error?.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return content;
  } catch (error) {
    console.error("Chat completion failed:", error);
    throw error;
  }
}

/**
 * Get streaming chat completion from OpenAI API
 * Returns an async generator that yields text chunks
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  temperature = 0.4,
  maxTokens = 1024
) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
        top_p: 0.9,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();

          if (!line || line === "data: [DONE]") continue;
          if (!line.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(line.slice(6));
            const chunk = json?.choices?.[0]?.delta?.content;
            if (chunk) {
              yield chunk;
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Process any remaining data
      if (buffer.trim() && buffer.startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.slice(6));
          const chunk = json?.choices?.[0]?.delta?.content;
          if (chunk) {
            yield chunk;
          }
        } catch {
          // Skip malformed lines
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Stream chat completion failed:", error);
    throw error;
  }
}

/**
 * Embed text using OpenAI's embedding API
 * @param texts List of texts to embed
 * @returns List of embedding vectors
 */
export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  if (!OPENAI_API_KEY || texts.length === 0) return null;

  try {
    const response = await fetch(`${OPENAI_API_BASE}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error("Embedding API error:", response.status);
      return null;
    }

    const data = await response.json();
    const embeddings = data?.data?.map((item: { embedding: number[] }) => item.embedding);

    return Array.isArray(embeddings) && embeddings.length > 0 ? embeddings : null;
  } catch (error) {
    console.error("Embedding failed:", error);
    return null;
  }
}

/**
 * Check if OpenAI API is configured and available
 */
export function isAIEnabled(): boolean {
  return !!OPENAI_API_KEY;
}

/**
 * Get the configured AI model name
 */
export function getAIModel(): string {
  return OPENAI_MODEL;
}

/**
 * Get language-specific system prompt enhancement
 */
export function getLanguageEnhancement(language: "en" | "hi" | "mix"): string {
  const enhancements = {
    en: "Reply in clear, professional English. Keep sentences short and direct.",
    hi: "आप हिंदी में जवाब दें। वाक्य छोटे और सीधे रखें। Hinglish में भी ठीक है।",
    mix: "आप Hinglish में जवाब दें (मिश्रित English-Hindi)। Keep it natural और conversational। Short sentences रखें।",
  };

  return enhancements[language] || enhancements.en;
}
