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

// Wrapper to send messages to background with timeout + retry
function sendToBackground(message: { type: string; payload?: unknown }): Promise<{
  optimizedPrompt?: string
  originalTokens?: number
  newTokens?: number
  error?: string
}> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('[ContextLens] Background message timed out')
      resolve({ error: 'timeout' })
    }, 5000)

    try {
      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timeout)
        if (chrome.runtime.lastError) {
          console.warn('[ContextLens] Runtime error:', chrome.runtime.lastError.message)
          resolve({ error: chrome.runtime.lastError.message })
          return
        }
        resolve(response ?? { error: 'no response' })
      })
    } catch (err) {
      clearTimeout(timeout)
      console.error('[ContextLens] sendMessage threw:', err)
      resolve({ error: String(err) })
    }
  })
}

function init() {
  const hostname = window.location.hostname
  const adapterFactory = ADAPTERS[hostname]

  const adapter = adapterFactory ? adapterFactory() : new GenericAdapter()
  console.log(`[ContextLens] ✅ Loaded adapter for ${adapter.name} on ${hostname}`)

  adapter.onSubmit(async (prompt: string) => {
    try {
      console.log(`[ContextLens] Sending prompt to background (${prompt.length} chars)`)

      const response = await sendToBackground({
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

// Delay init slightly to ensure the page's own JS has fully loaded
// This prevents race conditions with frameworks like React/Next.js
setTimeout(init, 500)

