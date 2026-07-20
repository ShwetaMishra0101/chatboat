import type { ChatRole } from "../Models/chat.model";

// Uses Google Gemini, which has a genuinely free tier (no credit card required).
// Get a free key at: https://aistudio.google.com/apikey
const MODEL = process.env.AI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT =
  "You are ChatBoat, a helpful, friendly AI assistant. Answer clearly and " +
  "concisely, and use Markdown formatting (lists, code blocks, bold) when it " +
  "improves readability. You have the full conversation so far as context — " +
  "use it to give relevant, on-topic replies.";

export interface AiMessage {
  role: ChatRole;
  content: string;
}

// The key is configured only if it's set and isn't the .env placeholder.
export function aiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && !key.startsWith("your-");
}

function endpoint(): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

function extractText(data: GeminiResponse): string {
  return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
}

// Call Gemini's generateContent with a system prompt + conversation turns.
async function callGemini(
  system: string,
  messages: AiMessage[],
  maxOutputTokens: number
): Promise<string> {
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      // Gemini uses "model" instead of "assistant" for the AI's turns.
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens },
    }),
  });

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini request failed (${res.status})`);
  }
  return extractText(data);
}

// Generate the assistant's reply given the full conversation history.
export async function generateReply(messages: AiMessage[]): Promise<string> {
  if (!aiConfigured()) {
    const last = messages[messages.length - 1]?.content ?? "";
    return (
      "⚠️ The AI isn't configured yet. Add a free `GEMINI_API_KEY` to " +
      "`backend/.env` (get one at https://aistudio.google.com/apikey) and " +
      "restart the server to get real replies.\n\n" +
      `You said: "${last}"`
    );
  }

  try {
    return (await callGemini(SYSTEM_PROMPT, messages, 2048)) || "(no response)";
  } catch (err) {
    console.error("AI generateReply error:", err);
    return "Sorry, I ran into an error generating a response. Please try again.";
  }
}

// Generate a short title from the first user message.
export async function generateTitle(firstMessage: string): Promise<string> {
  const fallback = firstMessage.trim().slice(0, 40) || "New Chat";
  if (!aiConfigured()) return fallback;

  try {
    const title = await callGemini(
      "Generate a concise 3-6 word title summarizing the conversation that " +
        "starts with the user's message. Respond with ONLY the title — no quotes, " +
        "no trailing punctuation.",
      [{ role: "user", content: firstMessage }],
      20
    );
    return title.replace(/^["']|["']$/g, "").slice(0, 60) || fallback;
  } catch {
    return fallback;
  }
}
