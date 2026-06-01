import type { SiteAdapter } from './base-adapter'

export class GenericAdapter implements SiteAdapter {
  name = 'generic'
  private processing = false
  
  private getInput(): HTMLElement | null {
    const active = document.activeElement
    if (active && (active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true')) {
        return active as HTMLElement
    }
    const inputs = document.querySelectorAll('textarea, [contenteditable="true"]')
    return (inputs[inputs.length - 1] as HTMLElement) || null
  }

  getPromptText(): string | null {
    const el = this.getInput()
    if (!el) return null
    if (el instanceof HTMLTextAreaElement) return el.value?.trim() ?? null
    return el.innerText?.trim() ?? el.textContent?.trim() ?? null
  }

  setPromptText(text: string): void {
    const el = this.getInput()
    if (!el) return
    
    if (el instanceof HTMLTextAreaElement) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(el, text)
      } else {
        el.value = text
      }
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    } else {
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      document.execCommand('insertText', false, text)
    }
  }

  private clickSendButton(): void {
    const el = this.getInput()
    if (!el) return
    
    // For generic platforms, dispatching Enter is the safest bet
    console.log('[ContextLens] Dispatching Enter key to submit generic form')
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    })
    el.dispatchEvent(enterEvent)
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
      
      const activeEl = document.activeElement
      const input = this.getInput()
      if (!input || !input.contains(activeEl as Node)) return

      handleOptimization(e)
    }, true)

    document.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Generic check for things that look like a send button
      const isSendButton = target.closest('button[type="submit"]') || 
                           target.closest('button[aria-label*="end"]') || 
                           target.closest('div[role="button"][aria-label*="end"]')
                           
      if (isSendButton) {
        handleOptimization(e)
      }
    }, true)
  }

  destroy(): void {}
}
