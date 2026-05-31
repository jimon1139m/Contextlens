# IDE Model Task Distribution (By Complexity)

To optimize cost and performance, different phases of the ContextLens project are suited for different tiers of AI IDE models.

## 🟢 Low Complexity (Fast / Lightweight Models)
*Use fast models (e.g., Gemini 1.5 Flash, Claude 3 Haiku, GPT-4o-mini) for these tasks:*
- **Phase 0 & 1:** Environment setup, manifest.json creation, simple boilerplate.
- **Phase 2:** Popup UI layout (React + Tailwind). standard data binding and state management.
- **Phase 7:** Knowledge Base Manager (UI updates for file inputs and lists).
- **Phase 9:** Chrome Web store packaging and documentation updates.

## 🟡 Medium Complexity (Standard Models)
*Use standard reasoning models (e.g., Gemini 1.5 Pro, Claude 3.5 Sonnet) for these tasks:*
- **Phase 5:** Prompt Compression Engine. Writing precise regex heuristics and history trimming rules requires solid logical structuring.
- **Phase 8:** Integration & Testing. Writing Vitest unit tests and fixing generic DOM-related bugs.

## 🔴 High Complexity (Advanced / Reasoning Models)
*Use heavy reasoning models (e.g., DeepSeek-R1, OpenAI o1, or Claude 3.5 Sonnet heavily prompted) for these tasks:*
- **Phase 3:** Content Scripts & Site Adapters. Safely interacting with the React/Angular/Vue DOMs of Claude, ChatGPT, Gemini, and DeepSeek. Dealing with `nativeInputValueSetter` and synthetic events is highly nuanced.
- **Phase 4 & 6:** Local RAG Pipeline & Background Service Worker. Integrating `@xenova/transformers`, managing IndexedDB asynchronous transactions, cosine similarity math, and ensuring Chrome MV3 service worker lifecycle persistence.
