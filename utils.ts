import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

export function parseGermanNum(s: string): number {
  return parseFloat(s.replace(",", "."));
}

export async function getPdfText(dir: string, file: string): Promise<string> {
  const buf = readFileSync(join(dir, file));
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = result.pages.map((p) => p.text).join("\n");
  await parser.destroy();
  return text;
}
