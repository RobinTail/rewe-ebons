#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseReceipts } from "./parser.ts";

const help = `Usage: rewe-ebons <path>

Analyze REWE eBon PDF receipts.

Arguments:
  path    Directory containing PDF files (required)

Options:
  -h, --help    Show this help message`;

const args = process.argv.slice(2);
if (args.some(a => a === "-h" || a === "--help") || args.length === 0) {
  console.log(help);
  process.exit(0);
}

const bonsDir = resolve(args[0]!);

if (!existsSync(bonsDir)) {
  console.error(`Directory not found: ${bonsDir}`);
  process.exit(1);
}

await parseReceipts(bonsDir);
