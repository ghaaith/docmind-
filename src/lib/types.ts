export interface DocumentRecord {
  id: string;
  filename: string;
  uploadedAt: string;
  chunkCount: number;
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface VectorStoreData {
  documents: DocumentRecord[];
  chunks: ChunkRecord[];
}

export interface SourceCitation {
  id: string;
  documentName: string;
  text: string;
  chunkIndex: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
}
