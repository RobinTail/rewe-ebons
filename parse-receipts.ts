import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";

const bonsDir = import.meta.dirname
  ? join(import.meta.dirname, "bons")
  : join(process.cwd(), "bons");
const files = readdirSync(bonsDir).filter(f => f.endsWith(".pdf"));

function parseGermanNum(s: string): number {
  return parseFloat(s.replace(",", "."));
}

type Entry = { totalSpend: number; totalQty: number };
const items = new Map<string, Entry>();

const itemRe = /^(.+)\s+(\d+,\d{2})\s+([AB])\s*\*?$/;
const clarStk = /^\s*(\d+)\s+Stk\s+x\s+\d+,\d+/;
const clarKg = /^\s*(\d+,\d{3})\s+kg\s+x\s+\d+,\d+/;

let totalReceipts = 0;
let totalItems = 0;
let totalSpendAll = 0;
let totalPfand = 0;
const errors: string[] = [];

for (const file of files) {
  try {
    const buf = readFileSync(join(bonsDir, file));
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    const text = result.pages.map(p => p.text).join("\n");
    await parser.destroy();

    const lines = text.split("\n");
    totalReceipts++;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;
      const m = line.match(itemRe);
      if (!m) continue;

      const name = m[1]?.trim();
      const price = m[2] ? parseGermanNum(m[2]) : 0;
      if (name === undefined) continue;

      let qty = 1;

      const nextIdx = i + 1;
      const next = nextIdx < lines.length ? lines[nextIdx] : undefined;
      if (next !== undefined) {
        const stk = next.match(clarStk);
        const kg = next.match(clarKg);
        if (stk) { qty = stk[1] ? parseInt(stk[1]) : 1; i++; }
        else if (kg) { qty = kg[1] ? parseGermanNum(kg[1]) : 1; i++; }
      }

      if (name.startsWith("PFAND")) {
        totalPfand += price;
        continue;
      }

      const prev = items.get(name) ?? { totalSpend: 0, totalQty: 0 };
      prev.totalSpend += price;
      prev.totalQty += qty;
      items.set(name, prev);
      totalItems++;
      totalSpendAll += price;
    }
  } catch (err) {
    errors.push(`${file}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Top 10 by spend
const bySpend = [...items.entries()].sort((a, b) => b[1].totalSpend - a[1].totalSpend);
// Top 10 by quantity
const byQty = [...items.entries()].sort((a, b) => b[1].totalQty - a[1].totalQty);

console.log("Top 10 by total spend");
console.log("────────────────────");
console.log("#  | Product" + " ".repeat(28) + " | Total €  | Qty");
console.log("─".repeat(55));
for (let i = 0; i < Math.min(10, bySpend.length); i++) {
  const entry = bySpend[i];
  if (!entry) break;
  const [name, e] = entry;
  console.log(
    `${String(i + 1).padStart(2)} | ${name.padEnd(35)} | ${e.totalSpend.toFixed(2).padStart(7)} € | ${e.totalQty}`
  );
}

console.log("\nTop 10 by total quantity");
console.log("───────────────────────");
console.log("#  | Product" + " ".repeat(28) + " | Qty     | Total €");
console.log("─".repeat(55));
for (let i = 0; i < Math.min(10, byQty.length); i++) {
  const entry = byQty[i];
  if (!entry) break;
  const [name, e] = entry;
  console.log(
    `${String(i + 1).padStart(2)} | ${name.padEnd(35)} | ${String(e.totalQty).padStart(5)} | ${e.totalSpend.toFixed(2)} €`
  );
}

console.log(`\nSummary: ${totalReceipts} receipts, ${totalItems} items, €${totalSpendAll.toFixed(2)} total spend, €${totalPfand.toFixed(2)} pfand returned`);
if (errors.length > 0) {
  console.log(`Errors: ${errors.length}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
}
