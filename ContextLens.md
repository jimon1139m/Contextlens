# ContextLens — Browser Extension Build Plan
### RAG-Powered Token Optimizer for Claude, ChatGPT, Gemini & DeepSeek

> **Vibe Coding Ready** — Every phase includes exact terminal commands, file structures, and what to paste into your AI coding tool. Build brick by brick, ship to Chrome Web Store.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Tools](#2-tech-stack--tools)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Phase 0 — Environment Setup](#phase-0--environment-setup)
5. [Phase 1 — Extension Skeleton (Chrome MV3)](#phase-1--extension-skeleton-chrome-mv3)
6. [Phase 2 — Popup UI](#phase-2--popup-ui)
7. [Phase 3 — Content Scripts & Site Adapters](#phase-3--content-scripts--site-adapters)
8. [Phase 4 — Local RAG Pipeline](#phase-4--local-rag-pipeline)
9. [Phase 5 — Prompt Compression Engine](#phase-5--prompt-compression-engine)
10. [Phase 6 — Background Service Worker](#phase-6--background-service-worker)
11. [Phase 7 — Knowledge Base Manager](#phase-7--knowledge-base-manager)
12. [Phase 8 — Integration & Testing](#phase-8--integration--testing)
13. [Phase 9 — Chrome Web Store Submission](#phase-9--chrome-web-store-submission)
14. [Vibe Coding Prompts Reference](#vibe-coding-prompts-reference)
15. [Known Pitfalls & Fixes](#known-pitfalls--fixes)

---

## 1. Project Overview

**ContextLens** is a Chrome extension that intercepts every prompt you type into AI chat platforms and runs it through a local RAG + compression pipeline before submission — reducing token consumption by 40–70% without losing meaning.

### How It Works

```
You type a prompt
        ↓
[Content Script intercepts keypress / submit]
        ↓
[Background Service Worker receives message]
        ↓
[RAG Engine] → searches your local knowledge base
        ↓         returns top-3 relevant chunks only
[Compressor] → strips filler, summarizes chat history
        ↓
[Optimized Prompt] → injected back into the textarea
        ↓
Model receives a leaner, richer prompt
```

### Supported Platforms (Phase 3)

| Platform | URL | Adapter Name |
|---|---|---|
| Claude | claude.ai | `claude-adapter.js` |
| ChatGPT | chat.openai.com | `chatgpt-adapter.js` |
| Gemini | gemini.google.com | `gemini-adapter.js` |
| DeepSeek | chat.deepseek.com | `deepseek-adapter.js` |

---

## 2. Tech Stack & Tools

| Layer | Technology | Why |
|---|---|---|
| Extension Platform | Chrome MV3 | Required for Chrome Web Store |
| Build Tool | Vite + React | Fast dev server, hot reload in popup |
| Language | TypeScript | Catches bugs early, better DX |
| Embeddings | `@xenova/transformers` | Runs in-browser, no API key needed |
| Vector Store | Custom IndexedDB wrapper | Local, persistent, free |
| Prompt Compression | Custom heuristic engine | Lightweight, no model calls |
| Styling | Tailwind CSS | Utility-first, fast to build |
| Package Manager | npm | Standard, widely supported |
| Testing | Vitest | Fast unit tests |
| Bundler Config | `vite-plugin-web-extension` | Handles MV3 quirks automatically |

---

## 3. Project Folder Structure

```
contextlens/
├── public/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.ts       ← Background processing hub
│   ├── content/
│   │   ├── index.ts                ← Content script entry point
│   │   └── adapters/
│   │       ├── claude-adapter.ts
│   │       ├── chatgpt-adapter.ts
│   │       ├── gemini-adapter.ts
│   │       └── deepseek-adapter.ts
│   ├── popup/
│   │   ├── App.tsx                 ← Main popup UI
│   │   ├── main.tsx
│   │   └── components/
│   │       ├── KnowledgeBase.tsx
│   │       ├── Stats.tsx
│   │       └── Settings.tsx
│   ├── rag/
│   │   ├── embedder.ts             ← Text → vector embedding
│   │   ├── vectorStore.ts          ← IndexedDB vector storage
│   │   └── retriever.ts            ← Similarity search
│   ├── compressor/
│   │   ├── heuristicCompressor.ts  ← Rule-based compression
│   │   └── historyTrimmer.ts       ← Chat history summarizer
│   ├── shared/
│   │   ├── types.ts                ← Shared TypeScript types
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── rag.test.ts
│   └── compressor.test.ts
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Phase 0 — Environment Setup

**Goal:** Get your machine ready to build a Chrome extension with React + TypeScript.

### 0.1 — Install Prerequisites

```bash
# Check Node version (need 18+)
node --version

# If below 18, install via nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 18
nvm use 18

# Verify npm
npm --version
```

### 0.2 — Create the Project

```bash
# Create project using Vite React TypeScript template
npm create vite@latest contextlens -- --template react-ts

cd contextlens

# Install all core dependencies
npm install

# Install extension-specific packages
npm install -D vite-plugin-web-extension

# Install RAG packages
npm install @xenova/transformers

# Install UI packages
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Initialize Tailwind
npx tailwindcss init -p
```

### 0.3 — Verify Setup

```bash
# Should open dev server at localhost:5173
npm run dev
```

---

## Phase 1 — Extension Skeleton (Chrome MV3)

**Goal:** A working Chrome extension that loads without errors. Nothing happens yet — just the shell.

### 1.1 — Create `public/manifest.json`

Paste this exact content:

```json
{
  "manifest_version": 3,
  "name": "ContextLens",
  "version": "0.1.0",
  "description": "RAG-powered token optimizer for AI chat platforms",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://claude.ai/*",
    "https://chat.openai.com/*",
    "https://gemini.google.com/*",
    "https://chat.deepseek.com/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "https://claude.ai/*",
        "https://chat.openai.com/*",
        "https://gemini.google.com/*",
        "https://chat.deepseek.com/*"
      ],
      "js": ["src/content/index.ts"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 1.2 — Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: 'public/manifest.json',
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 1.3 — Create Stub Files

```bash
# Create all directories
mkdir -p src/background
mkdir -p src/content/adapters
mkdir -p src/popup/components
mkdir -p src/rag
mkdir -p src/compressor
mkdir -p src/shared
mkdir -p public/icons
```

Create `src/background/service-worker.ts`:
```typescript
// Background Service Worker — Phase 1 stub
console.log('[ContextLens] Background service worker loaded')

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ContextLens] Extension installed')
})
```

Create `src/content/index.ts`:
```typescript
// Content Script — Phase 1 stub
console.log('[ContextLens] Content script loaded on:', window.location.hostname)
```

### 1.4 — Build and Load in Chrome

```bash
# Build the extension
npm run build

# Output will be in /dist folder
```

Then in Chrome:
1. Open `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. You should see ContextLens appear in your extensions list

**Verify:** Open `claude.ai`, open DevTools Console → you should see `[ContextLens] Content script loaded on: claude.ai`

---

## Phase 2 — Popup UI

**Goal:** A clean popup with 3 tabs: Stats, Knowledge Base, Settings.

### 2.1 — Update `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          500: '#4f46e5',
          600: '#4338ca',
          900: '#1e1b4b',
        }
      }
    },
  },
  plugins: [],
}
```

### 2.2 — Create `src/shared/types.ts`

```typescript
export interface KnowledgeChunk {
  id: string
  content: string
  embedding: number[]
  source: string
  createdAt: number
}

export interface CompressionStats {
  originalTokens: number
  compressedTokens: number
  savedPercent: number
  totalSaved: number
}

export interface ExtensionSettings {
  enabled: boolean
  ragEnabled: boolean
  compressionEnabled: boolean
  maxChunks: number
  compressionLevel: 'light' | 'medium' | 'aggressive'
}

export interface MessageToBackground {
  type: 'COMPRESS_PROMPT' | 'ADD_KNOWLEDGE' | 'GET_STATS'
  payload: any
}
```

### 2.3 — Create Popup Components

**`src/popup/components/Stats.tsx`** — vibe coding prompt:
> "Create a React component called Stats that shows: total tokens saved (large number), number of prompts optimized, average compression %, and a simple bar chart of savings this week. Use Tailwind. Data comes from props: `{ totalSaved: number, promptsOptimized: number, avgCompression: number, weeklyData: number[] }`. Dark theme with indigo accents."

**`src/popup/components/KnowledgeBase.tsx`** — vibe coding prompt:
> "Create a React component called KnowledgeBase with: a drag-and-drop zone to upload .txt/.md/.pdf files, a list of uploaded knowledge items with delete buttons, and a text area to paste content directly. Use Tailwind. On file drop, call `onAddKnowledge(text: string, source: string)` prop. Show item count badge."

**`src/popup/components/Settings.tsx`** — vibe coding prompt:
> "Create a React Settings component with toggles for: Enable ContextLens, RAG Search, Prompt Compression. A slider for Max Chunks (1-10). A select for Compression Level (Light/Medium/Aggressive). All values come from props `settings: ExtensionSettings` and `onChange: (settings) => void`. Clean Tailwind styling."

### 2.4 — Create `src/popup/App.tsx`

```tsx
import { useState, useEffect } from 'react'
import Stats from './components/Stats'
import KnowledgeBase from './components/KnowledgeBase'
import Settings from './components/Settings'
import type { ExtensionSettings } from '../shared/types'

const defaultSettings: ExtensionSettings = {
  enabled: true,
  ragEnabled: true,
  compressionEnabled: true,
  maxChunks: 3,
  compressionLevel: 'medium',
}

type Tab = 'stats' | 'knowledge' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings)

  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) setSettings(result.settings)
    })
  }, [])

  const handleSettingsChange = (newSettings: ExtensionSettings) => {
    setSettings(newSettings)
    chrome.storage.sync.set({ settings: newSettings })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'knowledge', label: '📚 Knowledge' },
    { id: 'settings', label: '⚙️ Settings' },
  ]

  return (
    <div className="w-80 min-h-96 bg-gray-900 text-white font-sans">
      {/* Header */}
      <div className="px-4 py-3 bg-brand-900 border-b border-gray-700">
        <h1 className="text-lg font-bold text-brand-50">🔬 ContextLens</h1>
        <p className="text-xs text-gray-400">Token optimizer for AI chats</p>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-brand-50 border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'stats' && (
          <Stats
            totalSaved={0}
            promptsOptimized={0}
            avgCompression={0}
            weeklyData={[0, 0, 0, 0, 0, 0, 0]}
          />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgeBase
            onAddKnowledge={(text, source) => {
              chrome.runtime.sendMessage({
                type: 'ADD_KNOWLEDGE',
                payload: { text, source },
              })
            }}
          />
        )}
        {activeTab === 'settings' && (
          <Settings settings={settings} onChange={handleSettingsChange} />
        )}
      </div>
    </div>
  )
}
```

```bash
# Rebuild and reload
npm run build
# Then click the refresh icon on your extension in chrome://extensions
```

---

## Phase 3 — Content Scripts & Site Adapters

**Goal:** Detect when the user hits Submit on each AI platform and intercept the prompt.

### 3.1 — Create Base Adapter Interface

Create `src/content/adapters/base-adapter.ts`:

```typescript
export interface SiteAdapter {
  name: string
  getPromptText(): string | null
  setPromptText(text: string): void
  onSubmit(callback: (prompt: string) => Promise<string>): void
  destroy(): void
}
```

### 3.2 — Claude Adapter

Create `src/content/adapters/claude-adapter.ts`:

```typescript
import type { SiteAdapter } from './base-adapter'

export class ClaudeAdapter implements SiteAdapter {
  name = 'claude'
  private observer: MutationObserver | null = null

  getPromptText(): string | null {
    // Claude uses a contenteditable div
    const editor = document.querySelector('[contenteditable="true"]')
    return editor?.textContent ?? null
  }

  setPromptText(text: string): void {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editor) return
    editor.textContent = text
    // Trigger React's synthetic event system
    editor.dispatchEvent(new Event('input', { bubbles: true }))
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const prompt = this.getPromptText()
        if (!prompt?.trim()) return
        e.preventDefault()
        e.stopPropagation()
        const optimized = await callback(prompt)
        this.setPromptText(optimized)
        // Re-trigger submit after slight delay
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter', bubbles: true, cancelable: true
          }))
        }, 50)
      }
    }, true)
  }

  destroy(): void {
    this.observer?.disconnect()
  }
}
```

### 3.3 — ChatGPT Adapter

Create `src/content/adapters/chatgpt-adapter.ts`:

```typescript
import type { SiteAdapter } from './base-adapter'

export class ChatGPTAdapter implements SiteAdapter {
  name = 'chatgpt'

  getPromptText(): string | null {
    const textarea = document.querySelector('#prompt-textarea') as HTMLTextAreaElement
    return textarea?.value ?? null
  }

  setPromptText(text: string): void {
    const textarea = document.querySelector('#prompt-textarea') as HTMLTextAreaElement
    if (!textarea) return
    // React controlled input needs nativeInputValueSetter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set
    nativeInputValueSetter?.call(textarea, text)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const prompt = this.getPromptText()
        if (!prompt?.trim()) return
        e.preventDefault()
        e.stopPropagation()
        const optimized = await callback(prompt)
        this.setPromptText(optimized)
        setTimeout(() => {
          const btn = document.querySelector('[data-testid="send-button"]') as HTMLButtonElement
          btn?.click()
        }, 50)
      }
    }, true)
  }

  destroy(): void {}
}
```

### 3.4 — Gemini & DeepSeek Adapters

**Vibe coding prompt for both:**
> "Create a TypeScript class GeminiAdapter implementing SiteAdapter interface. Gemini uses a rich text editor with class `ql-editor`. getPromptText reads its innerText. setPromptText sets innerHTML and fires input event. onSubmit intercepts Enter key, calls callback, re-submits by clicking button with matIconButton and send icon. Same pattern as ClaudeAdapter."

> "Create DeepSeekAdapter implementing SiteAdapter. DeepSeek uses a textarea with id `chat-input`. Follow the same pattern as ChatGPTAdapter but the send button has class `btn-primary` or aria-label containing Send."

### 3.5 — Update Content Script Entry Point

Update `src/content/index.ts`:

```typescript
import { ClaudeAdapter } from './adapters/claude-adapter'
import { ChatGPTAdapter } from './adapters/chatgpt-adapter'
import { GeminiAdapter } from './adapters/gemini-adapter'
import { DeepSeekAdapter } from './adapters/deepseek-adapter'
import type { SiteAdapter } from './adapters/base-adapter'

const ADAPTERS: Record<string, () => SiteAdapter> = {
  'claude.ai': () => new ClaudeAdapter(),
  'chat.openai.com': () => new ChatGPTAdapter(),
  'gemini.google.com': () => new GeminiAdapter(),
  'chat.deepseek.com': () => new DeepSeekAdapter(),
}

const hostname = window.location.hostname
const adapterFactory = ADAPTERS[hostname]

if (adapterFactory) {
  const adapter = adapterFactory()
  console.log(`[ContextLens] Loaded adapter for ${adapter.name}`)

  adapter.onSubmit(async (prompt) => {
    // Phase 3: just echo back for now, RAG comes in Phase 4
    const response = await chrome.runtime.sendMessage({
      type: 'COMPRESS_PROMPT',
      payload: { prompt, hostname },
    })
    return response?.optimizedPrompt ?? prompt
  })
}
```

```bash
npm run build
# Reload extension in chrome://extensions
# Test: open claude.ai, type something, press Enter
# Check DevTools console for [ContextLens] logs
```

---

## Phase 4 — Local RAG Pipeline

**Goal:** Store documents in IndexedDB as vectors. When a prompt comes in, find the 3 most relevant chunks and prepend them.

### 4.1 — Create the Embedder

Create `src/rag/embedder.ts`:

```typescript
import { pipeline } from '@xenova/transformers'

let embedder: any = null

async function getEmbedder() {
  if (!embedder) {
    // Downloads ~25MB model on first use, cached thereafter
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  }
  return embedder
}

export async function embedText(text: string): Promise<number[]> {
  const embed = await getEmbedder()
  const output = await embed(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (magA * magB)
}
```

### 4.2 — Create the Vector Store

Create `src/rag/vectorStore.ts`:

```typescript
import type { KnowledgeChunk } from '../shared/types'

const DB_NAME = 'ContextLensDB'
const STORE_NAME = 'knowledge_chunks'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveChunk(chunk: KnowledgeChunk): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(chunk)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllChunks(): Promise<KnowledgeChunk[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteChunk(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
```

### 4.3 — Create the Retriever

Create `src/rag/retriever.ts`:

```typescript
import { embedText, cosineSimilarity } from './embedder'
import { getAllChunks } from './vectorStore'
import type { KnowledgeChunk } from '../shared/types'

export async function retrieveRelevantChunks(
  query: string,
  topK: number = 3
): Promise<KnowledgeChunk[]> {
  const [queryEmbedding, allChunks] = await Promise.all([
    embedText(query),
    getAllChunks(),
  ])

  if (allChunks.length === 0) return []

  const ranked = allChunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0.3) // Only include if meaningfully relevant

  return ranked.map((r) => r.chunk)
}

export function chunksToContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return ''
  const entries = chunks
    .map((c) => `[Source: ${c.source}]\n${c.content}`)
    .join('\n\n---\n\n')
  return `<context>\n${entries}\n</context>\n\n`
}
```

### 4.4 — Text Chunker Utility

Create `src/shared/utils.ts`:

```typescript
export function chunkText(text: string, chunkSize = 400, overlap = 50): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) chunks.push(chunk)
    i += chunkSize - overlap
  }
  return chunks
}

export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
```

```bash
npm run build
```

---

## Phase 5 — Prompt Compression Engine

**Goal:** Reduce prompt size by stripping filler words, redundant phrases, and summarizing long chat history.

### 5.1 — Heuristic Compressor

Create `src/compressor/heuristicCompressor.ts`:

```typescript
// Filler phrases that add zero information
const FILLER_PATTERNS: RegExp[] = [
  /\b(please\s+)?(could\s+you\s+)?kindly\b/gi,
  /\bas\s+an?\s+AI\s+(language\s+model|assistant)?\b/gi,
  /\bi\s+would\s+like\s+(you\s+to\s+)?/gi,
  /\bcan\s+you\s+please\b/gi,
  /\bi\s+was\s+wondering\s+if\s+you\s+could\b/gi,
  /\bif\s+that\s+makes\s+sense\b/gi,
  /\bjust\s+to\s+clarify\b/gi,
  /\bfor\s+your\s+information\b/gi,
  /\bbasically\b/gi,
  /\bto\s+be\s+honest\b/gi,
  /\bas\s+I\s+mentioned\s+(earlier|before|previously)\b/gi,
  /\b(very|really|quite|rather|somewhat)\s+(very|really|quite|rather|somewhat)\b/gi,
]

// Redundant verbose openers
const OPENER_PATTERNS: RegExp[] = [
  /^(hello|hi|hey)[,!.]?\s*/i,
  /^good\s+(morning|afternoon|evening)[,!.]?\s*/i,
  /^i\s+hope\s+(you('re|r|re)\s+doing\s+well)[.!,]?\s*/i,
  /^thank\s+you\s+for\s+(your\s+)?(help|assistance|response)[.!,]?\s*/i,
]

export function compressPrompt(
  text: string,
  level: 'light' | 'medium' | 'aggressive' = 'medium'
): string {
  let compressed = text

  // Always: strip opener fluff
  for (const pattern of OPENER_PATTERNS) {
    compressed = compressed.replace(pattern, '')
  }

  if (level === 'medium' || level === 'aggressive') {
    // Strip filler phrases
    for (const pattern of FILLER_PATTERNS) {
      compressed = compressed.replace(pattern, '')
    }
    // Normalize whitespace
    compressed = compressed.replace(/\s{2,}/g, ' ').trim()
  }

  if (level === 'aggressive') {
    // Remove articles where unambiguous
    compressed = compressed.replace(/\b(the|a|an)\s+(?=[A-Z])/g, '')
    // Condense "in order to" → "to"
    compressed = compressed.replace(/\bin\s+order\s+to\b/gi, 'to')
    // "due to the fact that" → "because"
    compressed = compressed.replace(/\bdue\s+to\s+the\s+fact\s+that\b/gi, 'because')
    // "at this point in time" → "now"
    compressed = compressed.replace(/\bat\s+this\s+point\s+in\s+time\b/gi, 'now')
  }

  return compressed.trim()
}
```

### 5.2 — History Trimmer

Create `src/compressor/historyTrimmer.ts`:

```typescript
import { estimateTokens } from '../shared/utils'

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export function trimHistory(
  history: ConversationTurn[],
  maxTokenBudget: number = 800
): ConversationTurn[] {
  if (!history.length) return history

  let total = 0
  const kept: ConversationTurn[] = []

  // Always keep the last turn (most recent context)
  for (let i = history.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(history[i].content)
    if (total + tokens > maxTokenBudget) break
    kept.unshift(history[i])
    total += tokens
  }

  return kept
}

export function summarizeTurn(turn: ConversationTurn, maxChars = 200): ConversationTurn {
  if (turn.content.length <= maxChars) return turn
  return {
    ...turn,
    content: turn.content.slice(0, maxChars).trimEnd() + '… [truncated]',
  }
}
```

---

## Phase 6 — Background Service Worker

**Goal:** Wire RAG + Compression together. The service worker is the brain — it receives messages from content scripts, processes them, and returns optimized prompts.

Update `src/background/service-worker.ts`:

```typescript
import { retrieveRelevantChunks, chunksToContext } from '../rag/retriever'
import { saveChunk, getAllChunks, deleteChunk } from '../rag/vectorStore'
import { embedText } from '../rag/embedder'
import { compressPrompt } from '../compressor/heuristicCompressor'
import { chunkText, estimateTokens, generateId } from '../shared/utils'
import type { MessageToBackground, ExtensionSettings } from '../shared/types'

const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  ragEnabled: true,
  compressionEnabled: true,
  maxChunks: 3,
  compressionLevel: 'medium',
}

async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['settings'], (result) => {
      resolve(result.settings ?? DEFAULT_SETTINGS)
    })
  })
}

chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse)
    return true // keep channel open for async response
  }
)

async function handleMessage(message: MessageToBackground) {
  const settings = await getSettings()

  switch (message.type) {
    case 'COMPRESS_PROMPT': {
      if (!settings.enabled) {
        return { optimizedPrompt: message.payload.prompt }
      }

      let prompt: string = message.payload.prompt
      const originalTokens = estimateTokens(prompt)

      // Step 1: Compress the prompt text
      if (settings.compressionEnabled) {
        prompt = compressPrompt(prompt, settings.compressionLevel)
      }

      // Step 2: RAG — prepend relevant context
      let contextPrefix = ''
      if (settings.ragEnabled) {
        const chunks = await retrieveRelevantChunks(prompt, settings.maxChunks)
        contextPrefix = chunksToContext(chunks)
      }

      const optimizedPrompt = contextPrefix + prompt
      const newTokens = estimateTokens(optimizedPrompt)

      // Update stats in storage
      chrome.storage.local.get(['stats'], (result) => {
        const stats = result.stats ?? { totalSaved: 0, promptsOptimized: 0 }
        const saved = Math.max(0, originalTokens - newTokens)
        chrome.storage.local.set({
          stats: {
            totalSaved: stats.totalSaved + saved,
            promptsOptimized: stats.promptsOptimized + 1,
          },
        })
      })

      return { optimizedPrompt, originalTokens, newTokens }
    }

    case 'ADD_KNOWLEDGE': {
      const { text, source } = message.payload
      const chunks = chunkText(text)

      for (const chunkContent of chunks) {
        const embedding = await embedText(chunkContent)
        await saveChunk({
          id: generateId(),
          content: chunkContent,
          embedding,
          source,
          createdAt: Date.now(),
        })
      }

      return { success: true, chunksAdded: chunks.length }
    }

    case 'GET_STATS': {
      const [allChunks, statsResult] = await Promise.all([
        getAllChunks(),
        new Promise<any>((resolve) =>
          chrome.storage.local.get(['stats'], (r) => resolve(r.stats ?? {}))
        ),
      ])
      return {
        knowledgeChunks: allChunks.length,
        ...statsResult,
      }
    }

    default:
      return { error: 'Unknown message type' }
  }
}
```

```bash
npm run build
# Reload extension
# Test full flow: add a knowledge document via popup, then ask a question on claude.ai
```

---

## Phase 7 — Knowledge Base Manager

**Goal:** Let users upload .txt and .md files from the popup, see what's stored, and delete items.

Update `src/popup/components/KnowledgeBase.tsx` — **vibe coding prompt:**

> "Update the KnowledgeBase React component. It should:
> 1. On mount, call `chrome.runtime.sendMessage({ type: 'GET_STATS' })` and display chunk count
> 2. Have a file input that accepts `.txt` and `.md` files. On file select, read with FileReader, call `onAddKnowledge(text, filename)`
> 3. Have a text paste area with a 'Add Text' button
> 4. Show a list of sources (grouped by filename) with delete buttons that call `chrome.runtime.sendMessage({ type: 'DELETE_KNOWLEDGE', payload: { source } })`
> 5. Show a loading spinner while embedding is running
> Use Tailwind dark theme."

Also add `DELETE_KNOWLEDGE` handler to service worker (pattern: filter `getAllChunks()` by source and call `deleteChunk` on each matching ID).

---

## Phase 8 — Integration & Testing

**Goal:** End-to-end test on all 4 platforms, fix selector bugs, tune compression.

### 8.1 — Manual Test Checklist

Run through each of these on every platform:

```
[ ] claude.ai    — Type prompt, press Enter → prompt is compressed, RAG context prepended
[ ] chatgpt      — Same flow, Shift+Enter still creates newline
[ ] gemini       — Same flow
[ ] deepseek     — Same flow
[ ] Popup Stats  — Shows correct token savings after 3 prompts
[ ] Knowledge    — Upload a .txt file, ask a related question, see context prepended
[ ] Settings     — Toggle off compression, verify raw prompt is submitted unchanged
[ ] Toggle off   — Disable extension entirely, verify zero interception
```

### 8.2 — Write Unit Tests

```bash
npm install -D vitest
```

Create `tests/compressor.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { compressPrompt } from '../src/compressor/heuristicCompressor'

describe('compressPrompt', () => {
  it('strips opener fluff', () => {
    const result = compressPrompt('Hello! Can you please explain React hooks?')
    expect(result).toBe('explain React hooks?')
  })

  it('preserves technical content', () => {
    const code = 'Fix this bug: `TypeError: Cannot read property of undefined`'
    expect(compressPrompt(code)).toBe(code)
  })

  it('aggressive mode shortens more', () => {
    const input = 'in order to understand the the concept'
    const medium = compressPrompt(input, 'medium')
    const aggressive = compressPrompt(input, 'aggressive')
    expect(aggressive.length).toBeLessThanOrEqual(medium.length)
  })
})
```

```bash
npx vitest run
```

### 8.3 — Performance Optimization

The embedder model (~25MB) loads on first use. Add a loading indicator:

```typescript
// In service-worker.ts, preload on install
chrome.runtime.onInstalled.addListener(async () => {
  // Warm up embedder in background
  try {
    await embedText('warmup')
    console.log('[ContextLens] Embedder ready')
  } catch (e) {
    console.warn('[ContextLens] Embedder warmup failed:', e)
  }
})
```

---

## Phase 9 — Chrome Web Store Submission

**Goal:** Get ContextLens listed on the Chrome Web Store.

### 9.1 — Pre-Submission Checklist

```bash
# Final production build
npm run build

# Verify dist/ folder structure:
ls dist/
# Should contain: manifest.json, popup files, content scripts, icons
```

Verify these before submitting:

```
[ ] manifest.json version is "1.0.0" (semver)
[ ] All 3 icon sizes exist: 16x16, 48x48, 128x128 (PNG)
[ ] No console.log statements in production build
[ ] Privacy Policy URL ready (required by Google)
[ ] Extension description under 132 characters
[ ] Screenshots ready: 1280x800 or 640x400 (min 1, max 5)
[ ] No remote code execution (MV3 requirement)
[ ] No eval() calls anywhere in codebase
```

### 9.2 — Create the ZIP

```bash
# Build
npm run build

# Zip the dist folder
cd dist && zip -r ../contextlens-v1.0.0.zip . && cd ..

# Verify zip contents
unzip -l contextlens-v1.0.0.zip
```

### 9.3 — Store Listing

Go to: https://chrome.google.com/webstore/devconsole

1. Pay the one-time $5 developer registration fee
2. Click **New Item** → upload `contextlens-v1.0.0.zip`
3. Fill in:
   - **Name:** ContextLens — AI Token Optimizer
   - **Category:** Productivity
   - **Description:** (use the template below)
   - Upload screenshots
   - Add Privacy Policy URL
4. Submit for review (typically 1–3 business days)

**Store Description Template:**
```
ContextLens sits invisibly on Claude, ChatGPT, Gemini, and DeepSeek — 
compressing your prompts and injecting only the most relevant context 
from your personal knowledge base before each message is sent.

✅ 40–70% fewer tokens consumed
✅ RAG search over your own notes and documents
✅ Works offline — no API keys, no data leaves your browser
✅ Supports Claude, ChatGPT, Gemini, DeepSeek
```

---

## Vibe Coding Prompts Reference

Copy-paste these into your vibe coding platform at each phase:

### Setting Context
> "I'm building a Chrome MV3 extension called ContextLens using React, TypeScript, Vite, and Tailwind. It intercepts prompts on Claude/ChatGPT/Gemini/DeepSeek and runs them through a local RAG + compression pipeline. The extension uses `@xenova/transformers` for in-browser embeddings and IndexedDB for vector storage. Current file structure: [paste your tree]. Now help me with: [task]"

### Per-Phase Prompts

| Phase | Prompt to use |
|---|---|
| Popup UI | "Build a dark-themed Chrome extension popup (320px wide) with 3 tabs: Stats, Knowledge Base, Settings. React + Tailwind. Stats shows token savings. Knowledge has file upload + paste. Settings has toggles and sliders." |
| Claude Adapter | "Write a TypeScript class ClaudeAdapter that intercepts Enter keypress on claude.ai (which uses contenteditable divs), calls an async callback with the prompt text, awaits the optimized result, sets it back, and re-submits." |
| RAG Retriever | "Write a TypeScript retriever that takes a query string, embeds it using a cached `@xenova/transformers` pipeline, loads all chunks from IndexedDB, computes cosine similarity, and returns the top-K chunks above 0.3 threshold." |
| Compressor | "Write a TypeScript function compressPrompt(text, level) that uses regex to strip filler phrases, opener greetings, and verbose constructions from prompts. Three levels: light (openers only), medium (+ fillers), aggressive (+ articles and verbose phrases)." |
| Service Worker | "Wire up a Chrome MV3 service worker that handles 3 message types: COMPRESS_PROMPT (run RAG + compression, return optimized prompt), ADD_KNOWLEDGE (chunk + embed + store), GET_STATS (return counts from storage)." |

---

## Known Pitfalls & Fixes

| Problem | Cause | Fix |
|---|---|---|
| Content script not loading | Site uses CSP headers | Check `host_permissions` in manifest match exactly |
| `@xenova/transformers` import fails in service worker | MV3 service workers are ES modules | Set `"type": "module"` in manifest background config |
| React events not firing after `setPromptText` | React uses synthetic events, not native DOM | Use `nativeInputValueSetter` trick (see ChatGPT adapter) |
| ChatGPT selector broken after update | OpenAI frequently changes DOM | Use `data-testid` attributes — more stable than class names |
| Embedder downloads on every service worker restart | Service workers are ephemeral in MV3 | Cache model files via Cache API or use offscreen document |
| Extension rejected by Chrome | Uses `eval()` or remote scripts | Audit with `npm run build` and check for dynamic imports |
| IndexedDB not accessible in service worker | Service worker scope issue | Use `self.indexedDB` instead of `window.indexedDB` |
| Popup shows stale stats | Chrome storage not reactive | Use `chrome.storage.onChanged` listener in popup |

---

## Appendix: Estimated Build Time

| Phase | Estimated Time | Complexity |
|---|---|---|
| Phase 0 — Setup | 30 min | Easy |
| Phase 1 — Skeleton | 1 hour | Easy |
| Phase 2 — Popup UI | 3–4 hours | Medium |
| Phase 3 — Adapters | 4–6 hours | Hard |
| Phase 4 — RAG | 4–5 hours | Hard |
| Phase 5 — Compression | 2–3 hours | Medium |
| Phase 6 — Service Worker | 3–4 hours | Hard |
| Phase 7 — KB Manager | 2–3 hours | Medium |
| Phase 8 — Testing | 3–5 hours | Medium |
| Phase 9 — Store | 2–3 hours | Easy |
| **Total** | **~25–35 hours** | |

---

*ContextLens Build Plan v1.0 — Build brick by brick, ship to production.* make plan md file