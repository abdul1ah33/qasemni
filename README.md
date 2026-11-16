# Qasemni · قسّمني

> Split the bill, not the friendship.

Snap a photo of a receipt (or upload one), fix anything the scanner misread, pick who ate what, and Qasemni works out what each person owes. VAT, service, delivery and discounts are included, down to the last piastre.

**No backend, no API keys, no sign-up.** Receipt reading (OCR) runs in the browser with [Tesseract.js](https://tesseract.projectnaptha.com/) (WebAssembly), so the photo never leaves the device.

## Features

- 📸 **Camera or photo library**, using the phone's own camera app
- 🔍 **On-device OCR** for English and Arabic receipts (Arabic-Indic digits supported)
- 🧠 **Receipt parser** that finds items, quantities, subtotal, service, VAT, delivery, tip, discounts and the total
- ✏️ **Editable review**, with a check against the receipt's printed total
- 👥 **Per-item assignment**: shared plates split automatically, or one tap to split everything equally
- ⚖️ **Fair extras**: tax and service are split in proportion to what each person ordered; flat fees like delivery can be split equally
- 💸 **Exact math**: integer piastres and largest-remainder rounding, so the shares always add up to the total
- 🌍 **English / Arabic** with full RTL layout, formatted in EGP
- 📤 **Share** to WhatsApp, the native share sheet or the clipboard
- 🪶 **Simple, flat UI**: no animations, system fonts, light & dark mode

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · Tesseract.js · Vitest

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (parser + split math)
npm run build     # production build in dist/
```

## Deploying to Vercel

Import the repo at [vercel.com/new](https://vercel.com/new). Vercel detects Vite automatically (`vercel.json` pins the build settings). There are no environment variables to set.

> The camera needs HTTPS, which Vercel provides. On `localhost` it works too.

## Architecture

```
src/
├── core/                    # Pure domain logic. No React, fully unit-tested.
│   ├── types.ts             #   Item, Extra, Person, ParsedReceipt (money = integer piastres)
│   ├── money.ts             #   parse/format EGP, Arabic digit normalisation
│   └── split.ts             #   computeSplit(): who owes what
│
├── features/                # One folder per step of the flow
│   ├── scan/
│   │   ├── ocr.service.ts         # Tesseract worker (lazy-loaded)
│   │   ├── parser/                # OCR text → ParsedReceipt (keyword rules + heuristics)
│   │   ├── useReceiptScanner.ts   # Orchestrates image → OCR → parser → store
│   │   └── ScanStep.tsx           # Photo picker + scan progress
│   ├── review/              # Edit items, taxes & fees
│   ├── people/              # Add the people at the table
│   ├── assign/              # Tap names to assign items
│   └── summary/             # Final split + sharing
│
├── store/billStore.ts       # Zustand store: the bill + step navigation (persisted to localStorage)
├── i18n/                    # en.ts / ar.ts dictionaries + useI18n() hook (RTL aware)
├── components/
│   ├── layout/              # Screen (shared step shell with bottom bar)
│   └── ui/                  # Button, MoneyInput, RemoveButton
└── lib/                     # Small browser helpers (image preprocessing, ids)
```

**Data flow:** `photo → preprocess (canvas) → Tesseract → parseReceiptText() → store → UI → computeSplit() → summary`

The split rules live in `core/split.ts`:

1. Each item is divided equally between the people assigned to it.
2. Each extra (tax, service, tip, discount…) is divided either **proportionally** to each person's item total or **equally**.
3. Every division uses `allocate()` (largest-remainder method), so no piastre is lost or invented.

## Accuracy tips

OCR works best with a flat, well-lit receipt that fills the frame. Whatever the parser gets wrong can be fixed on the Review step. The app compares your edited total with the receipt's printed total to help you catch mistakes.
