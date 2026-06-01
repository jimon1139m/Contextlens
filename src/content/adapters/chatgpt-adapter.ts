import type { SiteAdapter } from './base-adapter'

export class ChatGPTAdapter implements SiteAdapter {
  name = 'chatgpt'
  private processing = false

  private getEditor(): HTMLElement | null {
    // ChatGPT uses a ProseMirror contenteditable div — try multiple selectors
    const selectors = [
      '#prompt-textarea',
      '[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"][id*="prompt"]',
      'div[contenteditable="true"]',
    ]
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement
      if (el) return el
    }
    return null
  }

  getPromptText(): string | null {
    const el = this.getEditor()
    if (!el) return null
    if (el instanceof HTMLTextAreaElement) {
      return el.value?.trim() || null
    }
    // For contenteditable, get the inner text
    const text = el.innerText?.trim() ?? el.textContent?.trim() ?? ''
    return text || null
  }

  setPromptText(text: string): void {
    const el = this.getEditor()
    if (!el) return

    if (el instanceof HTMLTextAreaElement) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set
      nativeInputValueSetter?.call(el, text)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      // For contenteditable ProseMirror editor
      el.focus()

      // Select all existing content
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)

      // Try execCommand first (works with ProseMirror event listeners)
      const success = document.execCommand('insertText', false, text)
      if (!success) {
        // Fallback: direct innerHTML manipulation + synthetic input event
        el.innerHTML = `<p>${text}</p>`
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  private clickSendButton(): void {
    // Try multiple selectors — ChatGPT changes these frequently
    const selectors = [
      '[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send"]',
      'button[data-testid="composer-send-button"]',
      'form button[type="submit"]',
      '#composer-background button:last-of-type',
    ]

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLButtonElement
      if (btn && !btn.disabled) {
        btn.click()
        console.log('[ContextLens] Clicked send button via:', selector)
        return
      }
    }

    // Last resort: find any visible button with an SVG arrow icon near the editor
    const allButtons = document.querySelectorAll('button')
    for (const btn of allButtons) {
      if (btn.querySelector('svg') && !btn.disabled && btn.offsetParent !== null) {
        const rect = btn.getBoundingClientRect()
        if (rect.bottom > window.innerHeight - 200) {
          btn.click()
          console.log('[ContextLens] Clicked send button via heuristic')
          return
        }
      }
    }
    console.warn('[ContextLens] Could not find send button')
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      if (this.processing) return

      // Only intercept if focus is in the prompt area
      const activeEl = document.activeElement
      const promptEl = this.getEditor()
      if (!promptEl) return
      if (activeEl !== promptEl && !promptEl.contains(activeEl as Node)) return

      const prompt = this.getPromptText()
      if (!prompt?.trim()) return

      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      this.processing = true

      try {
        console.log('[ContextLens] Intercepted prompt, optimizing...')

        // Add timeout protection — don't hang forever
        const optimized = await Promise.race([
          callback(prompt),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ])

        if (optimized !== prompt) {
          this.setPromptText(optimized)
          console.log('[ContextLens] Prompt optimized, sending...')
        }

        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 150)
      } catch (err) {
        console.error('[ContextLens] Error during optimization:', err)
        // On failure, restore original and send anyway
        this.setPromptText(prompt)
        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 150)
      }
    }, true)
  }

  destroy(): void {}
}
