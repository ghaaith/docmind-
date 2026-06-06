export function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it to .env.local and restart the server.",
    );
  }

  if (
    key.includes("REPLACE_WITH") ||
    key.includes("your-groq-api-key") ||
    key.includes("paste-your-key")
  ) {
    throw new Error(
      "GROQ_API_KEY is still a placeholder. Open .env.local, paste your real key from https://console.groq.com/keys, save, and restart npm run dev.",
    );
  }

  if (!key.startsWith("gsk_")) {
    throw new Error("GROQ_API_KEY looks invalid. It should start with gsk_.");
  }

  return key;
}

export const GROQ_CHAT_MODEL =
  process.env.GROQ_CHAT_MODEL?.trim() || "llama-3.1-8b-instant";
