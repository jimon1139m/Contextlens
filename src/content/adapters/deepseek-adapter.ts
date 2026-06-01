import type { SiteAdapter } from './base-adapter'

export class DeepSeekAdapter implements SiteAdapter {
  name = 'deepseek'
  private processing = false

  getPromptText(): string | null {
    const textarea = document.querySelector('#chat-input, textarea') as HTMLTextAreaElement
    return textarea?.value?.trim() ?? null
  }

  setPromptText(text: string): void {
    const textarea = document.querySelector('#chat-input, textarea') as HTMLTextAreaElement
    if (!textarea) return
    
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, text)
    } else {
      textarea.value = text
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new Event('change', { bubbles: true }))
  }

  private clickSendButton(): void {
    const selectors = [
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      '#chat-input ~ button',
      '.btn-primary',
    ]

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLButtonElement
      if (btn && !btn.disabled) {
        btn.click()
        console.log('[ContextLens] Clicked send button via:', selector)
        return
      }
    }
    console.warn('[ContextLens] Could not find send button, falling back to Enter key')
    
    // Fallback: Dispatch an Enter keydown event
    const textarea = document.querySelector('#chat-input, textarea') as HTMLElement
    if (textarea) {
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      })
      textarea.dispatchEvent(enterEvent)
    }
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      if (this.processing) return

      const textarea = document.querySelector('#chat-input, textarea')
      const activeEl = document.activeElement
      if (!textarea || activeEl !== textarea) return

      const prompt = this.getPromptText()
      if (!prompt?.trim()) return

      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      this.processing = true

      try {
        const optimized = await callback(prompt)
        if (optimized !== prompt) {
          this.setPromptText(optimized)
        }

        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 100)
      } catch (err) {
        console.error('[ContextLens] Error during optimization:', err)
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
