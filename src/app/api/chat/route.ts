import { NextResponse } from "next/server";
import { getGroqApiKey } from "@/lib/env";
import { askQuestion } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    getGroqApiKey();

    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 },
      );
    }

    const result = await askQuestion(question);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
