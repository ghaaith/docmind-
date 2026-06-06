import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/ingest";
import { getGroqApiKey } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    getGroqApiKey();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestDocument(file.name, buffer);

    return NextResponse.json({
      message: "Document ingested successfully.",
      document: result.document,
      chunksCreated: result.chunksCreated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload document.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
