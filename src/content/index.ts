import { ClaudeAdapter } from './adapters/claude-adapter'
import { ChatGPTAdapter } from './adapters/chatgpt-adapter'
import { GeminiAdapter } from './adapters/gemini-adapter'
import { DeepSeekAdapter } from './adapters/deepseek-adapter'
import { GenericAdapter } from './adapters/generic-adapter'
import type { SiteAdapter } from './adapters/base-adapter'

const ADAPTERS: Record<string, () => SiteAdapter> = {
  'claude.ai': () => new ClaudeAdapter(),
  'chat.openai.com': () => new ChatGPTAdapter(),
  'chatgpt.com': () => new ChatGPTAdapter(),
  'gemini.google.com': () => new GeminiAdapter(),
  'chat.deepseek.com': () => new DeepSeekAdapter(),
  'www.perplexity.ai': () => new GenericAdapter(),
  'copilot.microsoft.com': () => new GenericAdapter(),
  'meta.ai': () => new GenericAdapter(),
  'huggingface.co': () => new GenericAdapter(),
  'poe.com': () => new GenericAdapter(),
}

function init() {
  const hostname = window.location.hostname
  const adapterFactory = ADAPTERS[hostname]

  const adapter = adapterFactory ? adapterFactory() : new GenericAdapter()
  console.log(`[ContextLens] ✅ Loaded adapter for ${adapter.name} on ${hostname}`)

  adapter.onSubmit(async (prompt: string) => {
    try {
      console.log(`[ContextLens] Sending prompt to background (${prompt.length} chars)`)
      
      const response = await chrome.runtime.sendMessage({
        type: 'COMPRESS_PROMPT',
        payload: { prompt, hostname },
      })

      if (response?.error) {
        console.error('[ContextLens] Background returned error:', response.error)
        return prompt
      }

      if (response?.optimizedPrompt) {
        const saved = (response.originalTokens || 0) - (response.newTokens || 0)
        console.log(
          `[ContextLens] ✅ Optimized: ${response.originalTokens} → ${response.newTokens} tokens (saved ${saved})`
        )
        return response.optimizedPrompt
      }

      return prompt
    } catch (err) {
      console.error('[ContextLens] Failed to communicate with background:', err)
      return prompt // Return original on failure
    }
  })
}

// Run immediately since we use document_idle
init()
