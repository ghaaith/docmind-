import path from "path";
import { env, pipeline } from "@xenova/transformers";

env.cacheDir = path.join(process.cwd(), ".cache", "transformers");
env.allowLocalModels = true;

type FeatureExtractionPipeline = Awaited<
  ReturnType<typeof pipeline<"feature-extraction">>
>;

let extractor: FeatureExtractionPipeline | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }

  return extractor;
}

async function embedSingle(text: string): Promise<number[]> {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((text) => embedSingle(text)));
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedSingle(text);
}
