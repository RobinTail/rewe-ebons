# Deine REWE eBons — Receipt Analyzer

Analyze your REWE electronic receipts (eBons) in bulk. Download all your receipts from REWE's customer portal and get
insights into your spending habits.

## Data Source

REWE offers a downloadable archive of all your electronic receipts at:

**https://www.rewe.de/shop/mydata/meine-einkaeufe**

## Features

- Parses all the receipts in seconds
- Aggregates spending per product across all receipts
- Separates regular items from **Pfand** (bottle deposit paid) and **Leergut** (empty container returns)
- Handles piece items (`N Stk x price`) and weighted items (`weight kg x price/kg`)
- Top 10 rankings by total spend and total quantity

## Requirements

**Node.js >= 24** — required for native TypeScript execution. Starting with Node 24, `.ts` files can be run directly
with `node` without any flags or transpilation steps. No `tsx`, `ts-node`, or build step needed.

## Installation

```bash
pnpm install --prod
pnpm add -g . # register bin globally
```

## Usage

Unpack the downloaded archive and ensure placing all the PDFs in a single folder.

```bash
rewe-ebons /path/to/pdfs
```

## Sample Output

```
Top 10 by total spend
┌─────────┬────────────────────┬──────────┬─────┐
│ (index) │ Product            │ Total €  │ Qty │
├─────────┼────────────────────┼──────────┼─────┤
│ 0       │ Cheddar Block      │ 215.40   │ 52  │
│ 1       │ Apple Juice        │ 187.20   │ 94  │
│ 2       │ Chicken Wings      │ 152.60   │ 38  │
│ 3       │ Greek Yogurt       │ 134.75   │ 40  │
│ 4       │ Rye Bread          │ 129.60   │ 72  │
│ 5       │ Orange Marmalade   │ 112.20   │ 55  │
│ 6       │ Smoked Salmon      │ 105.30   │ 18  │
│ 7       │ Frozen Pizza       │ 98.60    │ 31  │
│ 8       │ Tortilla Chips     │ 82.50    │ 44  │
│ 9       │ Olive Oil          │ 78.00    │ 6   │
└─────────┴────────────────────┴──────────┴─────┘

Top 10 by total quantity
┌─────────┬────────────────────┬─────┬──────────┐
│ (index) │ Product            │ Qty │ Total €  │
├─────────┼────────────────────┼─────┼──────────┤
│ 0       │ Apple Juice        │ 94  │ 187.20   │
│ 1       │ Rye Bread          │ 72  │ 129.60   │
│ 2       │ Orange Marmalade   │ 55  │ 112.20   │
│ 3       │ Cheddar Block      │ 52  │ 215.40   │
│ 4       │ Tortilla Chips     │ 44  │ 82.50    │
│ 5       │ Greek Yogurt       │ 40  │ 134.75   │
│ 6       │ Chicken Wings      │ 38  │ 152.60   │
│ 7       │ Frozen Pizza       │ 31  │ 98.60    │
│ 8       │ Pfand 0,25 EUR     │ 28  │ 7.00     │
│ 9       │ Smoked Salmon      │ 18  │ 105.30   │
└─────────┴────────────────────┴─────┴──────────┘

Summary: 151 receipts, 1510 items, €4432.18 total spend, €25.68 leergut returned, €27.61 pfand paid
```
