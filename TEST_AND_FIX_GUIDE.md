# ContextLens — Test & Fix Guide for AI Coding Agents

> Step-by-step instructions for verifying and debugging the ContextLens Chrome extension.
> Use this guide to ensure every component works end-to-end.

---

## Prerequisites

```bash
cd c:\Users\Admin\Desktop\sujimo\Contextlens
npm run build    # Must pass with zero TypeScript errors
npm run test     # All 18 unit tests must pass
```

---

## Component Checklist

### 1. Embedder (`src/rag/embedder.ts`)

**What it does:** Converts text into 384-dimensional vectors for similarity search.

**Critical constraint:** Must work inside a MV3 service worker (no DOM, no WASM).

**Test:**
```ts
import { embedText, cosineSimilarity } from '../rag/embedder'

const a = await embedText("hello world")
const b = await embedText("hello world")
const c = await embedText("quantum physics")

// Same text → similarity = 1.0
console.assert(cosineSimilarity(a, b) === 1.0)
// Different text → similarity < 1.0
console.assert(cosineSimilarity(a, c) < 0.5)
```

**Known failure:** `@xenova/transformers` crashes in service workers. The fix uses a hash-based embedder instead.

---

### 2. Compressor (`src/compressor/heuristicCompressor.ts`)

**What it does:** Strips filler phrases, verbose openers, and redundant wording from prompts.

**Test inputs & expected outputs:**

| Input | Level | Expected Output |
|-------|-------|-----------------|
| `"Hello, I hope you're doing well. Explain closures"` | light | `"Explain closures"` |
| `"I was wondering if you could kindly explain it"` | medium | `"explain it"` |
| `"In order to understand, due to the fact that..."` | aggressive | `"to understand, because..."` |

**Verify with:**
```bash
npm run test -- --grep "compressor"
```

---

### 3. Service Worker (`src/background/service-worker.ts`)

**What it does:** Central message hub. Receives `COMPRESS_PROMPT`, `GET_STATS`, `ADD_KNOWLEDGE`, `DELETE_KNOWLEDGE`.

**Critical checks:**
- [ ] `COMPRESS_PROMPT` returns `{ optimizedPrompt, originalTokens, newTokens }`
- [ ] Stats are **awaited** before returning (not fire-and-forget)
- [ ] RAG errors are caught and skipped (don't crash the whole flow)
- [ ] `GET_STATS` returns `{ totalSaved, promptsOptimized, history, knowledgeChunks }`

**Debug in Chrome:**
1. Go to `chrome://extensions/`
2. Click **"Service worker"** on the ContextLens card
3. Console should show `[ContextLens] Extension installed / updated`
4. After sending a prompt, should show `[ContextLens] Message handled: COMPRESS_PROMPT`

---

### 4. Content Script (`src/content/index.ts`)

**What it does:** Entry point injected into AI chat pages. Loads the correct adapter based on hostname.

**Critical checks:**
- [ ] `chatgpt.com` → ChatGPTAdapter
- [ ] `chat.openai.com` → ChatGPTAdapter
- [ ] `claude.ai` → ClaudeAdapter
- [ ] `gemini.google.com` → GeminiAdapter
- [ ] `chat.deepseek.com` → DeepSeekAdapter
- [ ] `www.perplexity.ai` → GenericAdapter
- [ ] `copilot.microsoft.com` → GenericAdapter
- [ ] `meta.ai` → GenericAdapter
- [ ] `huggingface.co` → GenericAdapter
- [ ] `poe.com` → GenericAdapter
- [ ] Any other domain → GenericAdapter

**Debug:** Open DevTools (F12) on ChatGPT. Filter console for `[ContextLens]`. You should see:
```
[ContextLens] ✅ Loaded adapter for chatgpt on chatgpt.com
```

---

### 5. ChatGPT Adapter (`src/content/adapters/chatgpt-adapter.ts`)

**What it does:** Intercepts Enter key, reads prompt, sends to background, replaces text, clicks send button.

**Critical checks:**
- [ ] `processing` guard prevents double-intercept
- [ ] Only intercepts when `#prompt-textarea` is focused
- [ ] Uses `document.execCommand('insertText')` for contenteditable
- [ ] Tries 5 fallback selectors for the send button
- [ ] On error, restores original prompt and sends anyway

**Test prompt:**
```
Hello, I hope you're doing well! I was wondering if you could kindly explain basically how JavaScript closures work. Just to clarify, I would like you to explain it simply. Thank you for your help!
```

**Expected behavior:** Filler words stripped, tokens saved > 0, stats updated.

---

### 6. Generic Adapter & DeepSeek Adapter

**What it does:** DeepSeekAdapter handles quirks on `chat.deepseek.com`. GenericAdapter is a fallback that works on Perplexity, Copilot, Meta, HuggingFace, Poe, and any unrecognized AI chat site.

**Critical checks:**
- [ ] DeepSeek: Dispatches `Enter` via KeyboardEvent fallback due to volatile DOM structure.
- [ ] Generic: Checks `document.activeElement` for `contenteditable="true"` or `textarea`.
- [ ] Generic: Replaces prompt via standard DOM events, preventing infinite loops.
- [ ] Generic: Sends submission by dispatching an `Enter` KeyboardEvent on the active element.
- [ ] Works across disparate DOM layouts without hardcoded selectors.

**Test prompt on Perplexity or Poe:**
```
Hello! I hope you're doing really well. I was just wondering if you could kindly explain to me how quantum computing works.
```

**Expected behavior:** Console logs `Loaded adapter for generic`, prompt is optimized, and submission succeeds.

---

### 6. Side Panel UI (`src/popup/App.tsx`)

**What it does:** Renders Stats, Knowledge, and Settings tabs inside a Chrome side panel.

**Critical checks:**
- [ ] `chrome.storage.onChanged` listener fires on stats update
- [ ] `loadStats()` is called on mount and on every storage change
- [ ] History array is passed to Stats component
- [ ] Side panel stays open when clicking elsewhere (not a popup)

---

### 7. Stats Component (`src/popup/components/Stats.tsx`)

**What it does:** Shows tokens saved, prompts optimized, weekly chart, and recent optimization history.

**Critical checks:**
- [ ] `history` prop is optional (doesn't crash if undefined)
- [ ] Each history item shows timestamp, original tokens, new tokens, saved
- [ ] Max height with scrollbar for long history lists

---

### 8. Manifest (`public/manifest.json`)

**Critical checks:**
- [ ] `"sidePanel"` permission present
- [ ] `"side_panel": { "default_path": "index.html" }` present
- [ ] NO `"default_popup"` in `"action"` (would conflict with side panel)
- [ ] `"host_permissions"` includes all 5 AI chat domains
- [ ] `"run_at": "document_idle"` for content scripts

---

## End-to-End Test Flow

```
1. npm run build              → Zero errors
2. chrome://extensions/       → Reload ContextLens
3. Check service worker       → No red errors in console
4. Open chatgpt.com           → F12, filter "[ContextLens]"
5. See "Loaded adapter"       → Content script injected ✓
6. Type test prompt + Enter   → See "Intercepted" + "Optimized" logs
7. Open side panel             → Stats > 0 ✓
8. Send another prompt         → Stats update in real-time ✓
9. Knowledge tab              → Add text, chunk count updates ✓
10. Settings tab              → Toggle off, prompt goes unchanged ✓
```

---

## Common Failures & Solutions

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Stats always 0 | Service worker crash (embedder WASM) | Use hash-based embedder |
| Stats always 0 | Storage calls not awaited | Wrap in Promise + await |
| Prompt unchanged | Send button selector outdated | Add fallback selectors |
| Extension closes on click | Using popup instead of side panel | Use `side_panel` API |
| Page freezes | Adapter infinite loop (Claude) | Never re-dispatch Enter |
| Double-send | No processing guard | Add `processing` flag |
| Wrong page intercepted | No focus check | Check activeElement |
