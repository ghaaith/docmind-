import OpenAI from "openai";
import { getGroqApiKey } from "./env";

let client: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: getGroqApiKey(),
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return client;
}
