"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, SourceCitation } from "@/lib/types";

interface DocumentSummary {
  id: string;
  filename: string;
  uploadedAt: string;
  chunkCount: number;
}

function SourceCard({ source, index }: { source: SourceCitation; index: number }) {
  return (
    <details className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-200">
        Source {index + 1}: {source.documentName} (chunk {source.chunkIndex + 1})
      </summary>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {source.text}
      </p>
    </details>
  );
}

export default function ChatApp() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    const response = await fetch("/api/documents");
    if (!response.ok) return;
    const data = (await response.json()) as { documents: DocumentSummary[] };
    setDocuments(data.documents);
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        chunksCreated?: number;
        document?: DocumentSummary;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      await fetchDocuments();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Uploaded "${file.name}" and created ${data.chunksCreated} searchable chunks.`,
        },
      ]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleAsk(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setQuestion("");
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = (await response.json()) as {
        error?: string;
        answer?: string;
        sources?: SourceCitation[];
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Chat request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? "No answer returned.",
          sources: data.sources,
        },
      ]);
    } catch (chatError) {
      setError(
        chatError instanceof Error ? chatError.message : "Chat request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          RAG Portfolio Project
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          DocMind
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Upload PDF, TXT, or Markdown files and ask questions. Answers are
          generated with Groq and grounded in your documents with citations.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Documents
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {documents.length} uploaded
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-8 text-center transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {uploading ? "Uploading..." : "Click to upload PDF, TXT, or MD"}
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>

          <ul className="space-y-2">
            {documents.length === 0 ? (
              <li className="text-sm text-zinc-500">No documents yet.</li>
            ) : (
              documents.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <p className="font-medium text-zinc-800 dark:text-zinc-100">
                    {doc.filename}
                  </p>
                  <p className="text-zinc-500">{doc.chunkCount} chunks</p>
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="flex min-h-[600px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[420px] items-center justify-center text-center text-zinc-500">
                <div>
                  <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                    Ask your documents anything
                  </p>
                  <p className="mt-2 text-sm">
                    Try: &quot;Summarize the main points&quot; or &quot;What
                    does the document say about...?&quot;
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {message.sources.map((source, sourceIndex) => (
                          <SourceCard
                            key={source.id}
                            source={source}
                            index={sourceIndex}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="text-sm text-zinc-500">Thinking...</div>
            )}
          </div>

          {error && (
            <div className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleAsk}
            className="flex gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800"
          >
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question about your documents..."
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </main>
      </section>
    </div>
  );
}
