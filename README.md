# NeuPrint DERIVE V2, Vercel Test Harness (Single-file)

This repo is a **minimal Next.js (App Router)** project meant for one purpose:

- Upload to GitHub
- Import to **Vercel**
- Confirm that `lib/derive.ts` runs on the backend and returns **JSON2-style** output

## What it does

- `GET /api/derive`
  - Reads `fixtures/raw_feature.json`
  - Runs `deriveAll()` from `lib/derive.ts`
  - Returns:
    - `ok` (boolean)
    - `problems` (missing-field/type checks)
    - `output` (the full derived JSON)

- `/` page
  - Button to call `/api/derive`
  - Shows status + raw JSON response

## Quick start (local)

```bash
npm i
npm run dev
```

Open:
- http://localhost:3000

## Determinism check

Replace `fixtures/raw_feature.json` with the same input and call `/api/derive` multiple times.
If any numeric outputs drift, that means your upstream extraction is unstable or your derive logic is non-deterministic.

## CI-style test

```bash
npm run test:derive
```

It writes:
- `artifacts/output.json`

## Notes

This harness uses **minimal stub options** for `rcLogisticModel`, `activeSignalIds`, `cohortFriList`, and `roleConfigs`.
To match production values, replace those stubs inside:
- `app/api/derive/route.ts`
- `scripts/test-derive.mjs`

