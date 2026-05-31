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
