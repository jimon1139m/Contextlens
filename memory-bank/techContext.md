# Technical Context

## Tech Stack
- **Framework:** React + Vite
- **Language:** TypeScript
- **Extension API:** Chrome Manifest V3
- **Styling:** Tailwind CSS + PostCSS
- **Machine Learning:** `@xenova/transformers` (all-MiniLM-L6-v2) for browser-based embeddings
- **Database:** IndexedDB (Native)
- **Testing:** Vitest

## Build and Bundling
- Relies on `vite-plugin-web-extension` to handle the complexities of bundling MV3 assets (background worker, content scripts, and HTML pages) natively within Vite.
