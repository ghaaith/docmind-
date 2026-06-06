export const SYSTEM_PROMPT = `You are DocMind, a helpful document assistant.
Answer questions using ONLY the provided context.
If the context does not contain enough information, say "I don't have enough information in the uploaded documents to answer that."
Always cite your sources using [Source 1], [Source 2], etc., matching the source labels in the context.
Be concise, accurate, and professional.`;

interface PromptSource {
  label: string;
  documentName: string;
  text: string;
}

export function buildUserPrompt(question: string, sources: PromptSource[]): string {
  const context = sources
    .map(
      (source) =>
        `[${source.label}] (${source.documentName})\n${source.text}`,
    )
    .join("\n\n---\n\n");

  return `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer with citations:`;
}
