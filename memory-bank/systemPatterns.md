# System Patterns

## Architecture
- **Content Scripts:** Inject into target platforms (Claude, ChatGPT, Gemini, DeepSeek). Intercept keypresses/submit events and interact with the DOM safely.
- **Service Worker:** Acts as the central brain. Receives intercepted prompts, processes them (Compression + RAG), and returns the optimized prompt.
- **Popup UI:** React + Tailwind application for user settings and uploading knowledge base files.

## Local Storage
- **Chrome Sync Storage:** User preferences and settings.
- **Chrome Local Storage:** Statistical metrics (tokens saved, prompts optimized).
- **IndexedDB:** Persistent storage for embedded knowledge chunks (Vector Store).

## RAG Flow
1. User types prompt.
2. Content Script sends `COMPRESS_PROMPT` to Service Worker.
3. Prompt is heuristically compressed.
4. Prompt is embedded into a vector.
5. Service Worker retrieves Top-K chunks from IndexedDB via cosine similarity.
6. Context is prepended to the prompt.
7. Optimized prompt is sent back to Content Script for submission.
