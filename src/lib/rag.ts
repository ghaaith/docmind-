import { embedQuery } from "./embeddings";
import { GROQ_CHAT_MODEL } from "./env";
import { getGroqClient } from "./groq";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import type { SourceCitation } from "./types";
import { searchSimilar } from "./vector-store";

export interface ChatResponse {
  answer: string;
  sources: SourceCitation[];
}

export async function askQuestion(question: string): Promise<ChatResponse> {
  const queryEmbedding = await embedQuery(question);
  const chunks = await searchSimilar(queryEmbedding, 5);

  if (chunks.length === 0) {
    return {
      answer:
        "I don't have any documents to search. Please upload a PDF or text file first.",
      sources: [],
    };
  }

  const labeledSources = chunks.map((chunk, index) => ({
    id: chunk.id,
    documentName: chunk.documentName,
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    label: `Source ${index + 1}`,
  }));

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_CHAT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(
          question,
          labeledSources.map(({ label, documentName, text }) => ({
            label,
            documentName,
            text,
          })),
        ),
      },
    ],
    temperature: 0.2,
  });

  const answer =
    completion.choices[0]?.message?.content ?? "No response generated.";

  return {
    answer,
    sources: labeledSources.map(
      ({ id, documentName, text, chunkIndex }) => ({
        id,
        documentName,
        text,
        chunkIndex,
      }),
    ),
  };
}
