import { NextResponse } from "next/server";
import { loadStore } from "@/lib/vector-store";

export const runtime = "nodejs";

export async function GET() {
  const store = await loadStore();

  return NextResponse.json({
    documents: store.documents.map(({ id, filename, uploadedAt, chunkCount }) => ({
      id,
      filename,
      uploadedAt,
      chunkCount,
    })),
    totalChunks: store.chunks.length,
  });
}
