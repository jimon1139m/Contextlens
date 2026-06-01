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
      'div[aria-label*="Send"]',
      'div[aria-label*="send"]',
      '.ds-icon-button',
      '#chat-input ~ button',
      '.btn-primary',
    ]

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLElement
      if (btn && !btn.hasAttribute('disabled')) {
        btn.click()
        console.log('[ContextLens] Clicked send button via:', selector)
        return
      }
    }

    // DeepSeek heuristic: Find buttons or clickable divs near the textarea
    const textarea = document.querySelector('#chat-input, textarea') as HTMLElement
    if (textarea) {
      // Find a container that holds both textarea and the send button
      let parent = textarea.parentElement
      for (let i = 0; i < 3 && parent; i++) {
        const clickableElements = Array.from(parent.querySelectorAll('div[role="button"], button, span[role="button"]')) as HTMLElement[]
        const visibleElements = clickableElements.filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'))
        
        if (visibleElements.length > 0) {
          // The send button is typically the last clickable icon
          const sendBtn = visibleElements[visibleElements.length - 1]
          sendBtn.click()
          console.log('[ContextLens] Clicked send button via proximity heuristic')
          return
        }
        parent = parent.parentElement
      }
    }

    console.warn('[ContextLens] Could not find send button, falling back to Enter key')
    
    // Fallback: Dispatch an Enter keydown event
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
    const handleOptimization = async (e: Event) => {
      if (this.processing) return

      const prompt = this.getPromptText()
      if (!prompt?.trim()) return

      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      this.processing = true

      try {
        console.log('[ContextLens] Intercepted prompt, optimizing...')
        const optimized = await Promise.race([
          callback(prompt),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ])

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
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      
      const textarea = document.querySelector('#chat-input, textarea')
      const activeEl = document.activeElement
      if (!textarea || activeEl !== textarea) return

      handleOptimization(e)
    }, true)

    document.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const selectors = [
        'button[aria-label*="Send"]',
        'button[aria-label*="send"]',
        'div[aria-label*="Send"]',
        'div[aria-label*="send"]',
        '.ds-icon-button',
        '#chat-input ~ button',
        '.btn-primary',
      ]
      
      const isSendButton = selectors.some(sel => target.closest(sel))
      
      let isHeuristic = false
      if (!isSendButton) {
        const textarea = document.querySelector('#chat-input, textarea') as HTMLElement
        if (textarea && textarea.parentElement) {
          if (textarea.parentElement.contains(target) && target.closest('div[role="button"], button, span[role="button"]')) {
            isHeuristic = true
          }
        }
      }

      if (isSendButton || isHeuristic) {
        handleOptimization(e)
      }
    }, true)
  }

  destroy(): void {}
}
