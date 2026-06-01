import type { SiteAdapter } from './base-adapter'

export class ChatGPTAdapter implements SiteAdapter {
  name = 'chatgpt'
  private processing = false

  getPromptText(): string | null {
    // ChatGPT uses a contenteditable div with id="prompt-textarea"
    // It may also use a <textarea> in some versions
    const el = document.querySelector('#prompt-textarea') as HTMLElement | HTMLTextAreaElement
    if (!el) return null
    if (el instanceof HTMLTextAreaElement) {
      return el.value
    }
    // For contenteditable div, get the inner text
    return el.innerText?.trim() ?? el.textContent?.trim() ?? ''
  }

  setPromptText(text: string): void {
    const el = document.querySelector('#prompt-textarea') as HTMLElement | HTMLTextAreaElement
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
      
      // Use execCommand to replace — this triggers ProseMirror's internal handlers
      document.execCommand('insertText', false, text)
    }
  }

  private clickSendButton(): void {
    // Try multiple selectors — ChatGPT changes these frequently
    const selectors = [
      '[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send"]',
      'form button[type="submit"]',
      // The send button is usually the last button inside the form area
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
    console.warn('[ContextLens] Could not find send button')
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    // Listen for Enter key press in capture phase
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
      // Only intercept Enter (not Shift+Enter for newlines)
      if (e.key !== 'Enter' || e.shiftKey) return
      
      // Don't intercept if we're already processing
      if (this.processing) return

      // Only intercept if focus is in the prompt textarea
      const activeEl = document.activeElement
      const promptEl = document.querySelector('#prompt-textarea')
      if (!promptEl || !promptEl.contains(activeEl as Node)) return

      const prompt = this.getPromptText()
      if (!prompt?.trim()) return

      // Block the original Enter from submitting
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      this.processing = true

      try {
        console.log('[ContextLens] Intercepted prompt, optimizing...')
        const optimized = await callback(prompt)
        
        if (optimized !== prompt) {
          this.setPromptText(optimized)
          console.log('[ContextLens] Prompt optimized, sending...')
        }

        // Wait a moment for the DOM to update, then click send
        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 100)
      } catch (err) {
        console.error('[ContextLens] Error during optimization:', err)
        // If optimization fails, restore original and send
        this.setPromptText(prompt)
        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 100)
      }
    }, true)
  }

  destroy(): void {}
}
