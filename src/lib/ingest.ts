import pdf from "pdf-parse";
import { v4 as uuidv4 } from "uuid";
import { chunkText } from "./chunking";
import { embedTexts } from "./embeddings";
import type { ChunkRecord, DocumentRecord } from "./types";
import { loadStore, saveStore } from "./vector-store";

export async function extractText(
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const result = await pdf(buffer);
    return result.text;
  }

  if (ext === "txt" || ext === "md") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: .${ext}. Use PDF, TXT, or MD.`);
}

export async function ingestDocument(filename: string, buffer: Buffer) {
  const text = await extractText(filename, buffer);
  const textChunks = chunkText(text);

  if (textChunks.length === 0) {
    throw new Error("No text could be extracted from this file.");
  }

  const embeddings = await embedTexts(textChunks);
  const documentId = uuidv4();
  const now = new Date().toISOString();

  const document: DocumentRecord = {
    id: documentId,
    filename,
    uploadedAt: now,
    chunkCount: textChunks.length,
  };

  const chunks: ChunkRecord[] = textChunks.map((chunkTextValue, index) => ({
    id: uuidv4(),
    documentId,
    documentName: filename,
    text: chunkTextValue,
    embedding: embeddings[index],
    chunkIndex: index,
  }));

  const store = await loadStore();
  store.documents.push(document);
  store.chunks.push(...chunks);
  await saveStore(store);

  return { document, chunksCreated: chunks.length };
}
