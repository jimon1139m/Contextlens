# ContextLens — Detailed Project Report (DPR) Spreadsheet Model
*This document contains the tabular data sheets for ContextLens architecture, compatibility, and implementation metrics.*

---

## Sheet 1: System Components & Directory Map

| Sheet | Component / Module | File Path | File Size (Bytes) | Status | Key Functionality / Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RAG** | Embedder | `[embedder.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/rag/embedder.ts)` | 1,424 | **Verified** | Lightweight hash-based embedding generation suitable for MV3 workers. |
| **RAG** | Vector Store | `[vectorStore.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/rag/vectorStore.ts)` | 3,115 | **Verified** | Cosine similarity indexing and storage in browser's local IndexedDB. |
| **RAG** | Retriever | `[retriever.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/rag/retriever.ts)` | 1,894 | **Verified** | Semantic search querying and template compilation for local knowledge. |
| **Core** | Heuristic Compressor | `[heuristicCompressor.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/compressor/heuristicCompressor.ts)` | 4,210 | **Verified** | Multi-level rule-based prompt compression (Opener fluff, filler text, articles). |
| **Core** | History Trimmer | `[historyTrimmer.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/compressor/historyTrimmer.ts)` | 2,120 | **Verified** | Manages local prompt storage boundaries and recent optimization history. |
| **Extension** | Service Worker | `[service-worker.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/background/service-worker.ts)` | 7,650 | **Verified** | Central background page message routing and asynchronous operation wrapper. |
| **Extension** | Content Script Entry | `[index.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/content/index.ts)` | 4,139 | **Verified** | Selects appropriate platform adapter and connects page to background pipeline. |
| **Extension** | DOM Utilities | `[dom.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/content/utils/dom.ts)` | 5,120 | **Verified** | Simulates key inputs, handles pointer/mouse events, and coordinates submits. |
| **Popup** | Side Panel Root | `[App.tsx](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/popup/App.tsx)` | 3,646 | **Verified** | React side panel shell managing state sync and tab layouts. |
| **Popup** | Stats Component | `[Stats.tsx](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/popup/components/Stats.tsx)` | 4,812 | **Verified** | Renders analytics widgets, token savings chart, and historical optimizations. |
| **Popup** | Knowledge Base Component | `[KnowledgeBase.tsx](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/popup/components/KnowledgeBase.tsx)` | 5,230 | **Verified** | Document uploader UI, manual pasting form, and chunk deletion table. |
| **Popup** | Settings Component | `[Settings.tsx](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/src/popup/components/Settings.tsx)` | 3,110 | **Verified** | Master toggles, sliders for Top-K chunks, and compression level selector. |

---

## Sheet 2: AI Platform Compatibility Matrix

| Sheet | Platform Name | Domain Pattern | Adapter Class | Status | Input Element Type | Submit Trigger mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Adapter** | Gemini | `gemini.google.com` | `GeminiAdapter` | **Operational** | Contenteditable (`.ql-editor`) | Pointer events + mouse click on send buttons |
| **Adapter** | ChatGPT | `chatgpt.com` / `chat.openai.com` | `ChatGPTAdapter` | **Operational** | Contenteditable (`.ProseMirror`) | Pointer down / mouse click on send buttons |
| **Adapter** | Claude | `claude.ai` | `ClaudeAdapter` | **Operational** | Contenteditable (`div[contenteditable="true"]`) | Pointer down / mouse click on send buttons |
| **Adapter** | DeepSeek | `chat.deepseek.com` | `DeepSeekAdapter` | **Operational** | Textarea (`#chat-input`) | Pointer down / mouse click on send buttons |
| **Adapter** | Perplexity | `perplexity.ai` | `GenericAdapter` | **Operational** | Textarea / Contenteditable | Pointer down / Enter key fallback |
| **Adapter** | MS Copilot | `copilot.microsoft.com` | `GenericAdapter` | **Operational** | Textarea / Contenteditable | Pointer down / Enter key fallback |
| **Adapter** | Meta AI | `meta.ai` | `GenericAdapter` | **Operational** | Textarea / Contenteditable | Pointer down / Enter key fallback |
| **Adapter** | Poe | `poe.com` | `GenericAdapter` | **Operational** | Textarea / Contenteditable | Pointer down / Enter key fallback |

---

## Sheet 3: Project Verification & Test Coverage Metrics

| Sheet | Test File | Type | Checked Component | Coverage Area | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Test** | `[utils.test.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/utils.test.ts)` | Unit | Shared Utils | Text chunking, overlap limits, and unique ID generation | **100% Passed** |
| **Test** | `[vectorStore.test.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/vectorStore.test.ts)` | Unit | Vector Store | IndexedDB save, retrieve, and delete logic | **100% Passed** |
| **Test** | `[compressor.test.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/compressor.test.ts)` | Unit | Heuristic Compressor | Multi-level (light/medium/aggressive) prompt compression | **100% Passed** |
| **Test** | `[historyTrimmer.test.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/historyTrimmer.test.ts)` | Unit | History Trimmer | Local history pruning and token budgeting | **100% Passed** |
| **Test** | `[adapters.test.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/adapters.test.ts)` | Unit | Site Adapters | Validates adapter instantiation (Claude and ChatGPT names) | **100% Passed** |
| **Test** | `[components.test.tsx](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/components.test.tsx)` | Integration | React UI | Stats, Settings, and KnowledgeBase UI interactions | **100% Passed** |
| **Test** | `[extension.spec.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/e2e/extension.spec.ts)` | E2E | Chrome Sandbox | Background worker initialization, side panel rendering | **100% Passed** |
| **Test** | `[extension.spec.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/e2e/extension.spec.ts)` | E2E | ChatGPT Adapter | Value extraction, compression payload, and submit event hijacking | **100% Passed** |
| **Test** | `[extension.spec.ts](file:///c:/Users/Admin/Desktop/sujimo/Contextlens/tests/e2e/extension.spec.ts)` | E2E | Claude Adapter | Value extraction, compression payload, and keydown Enter submit | **100% Passed** |
