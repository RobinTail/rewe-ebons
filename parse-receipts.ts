import { readdirSync } from "node:fs";
import { join } from "node:path";
import { parseGermanNum, getPdfText } from "./utils.ts";

const bonsDir = import.meta.dirname
  ? join(import.meta.dirname, "bons")
  : join(process.cwd(), "bons");
const files = readdirSync(bonsDir).filter(f => f.endsWith(".pdf"));

type Entry = { totalSpend: number; totalQty: number };
const items = new Map<string, Entry>();

const itemRe = /^(.+)\s+(-?\d+,\d{2})\s+([A-Z])\s*\*?$/;
const clarStk = /^\s*(\d+)\s+Stk\s+x\s+\d+,\d+/;
const clarKg = /^\s*(\d+,\d{3})\s+kg\s+x\s+\d+,\d+/;

let totalReceipts = 0;
let totalItems = 0;
let totalSpendAll = 0;
let totalLeergut = 0;
let totalPfand = 0;
const errors: string[] = [];

for (const file of files) {
  try {
    const text = await getPdfText(bonsDir, file);
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

      if (name.startsWith("LEERG")) {
        totalLeergut += price;
        continue;
      }

      if (name.startsWith("PFAND")) {
        totalPfand += price;
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
console.table(
  bySpend.slice(0, 10).map(([name, e]) => ({
    Product: name,
    "Total €": e.totalSpend.toFixed(2),
    Qty: e.totalQty,
  }))
);

console.log("\nTop 10 by total quantity");
console.table(
  byQty.slice(0, 10).map(([name, e]) => ({
    Product: name,
    Qty: e.totalQty,
    "Total €": e.totalSpend.toFixed(2),
  }))
);

console.log(`\nSummary: ${totalReceipts} receipts, ${totalItems} items, €${totalSpendAll.toFixed(2)} total spend, €${Math.abs(totalLeergut).toFixed(2)} leergut returned, €${totalPfand.toFixed(2)} pfand paid`);
if (errors.length > 0) {
  console.log(`Errors: ${errors.length}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
}
