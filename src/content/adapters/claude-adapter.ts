import type { SiteAdapter } from './base-adapter'

export class ClaudeAdapter implements SiteAdapter {
  name = 'claude'
  private processing = false

  getPromptText(): string | null {
    // Claude uses a contenteditable div with class "ProseMirror"
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    return editor?.innerText?.trim() ?? null
  }

  setPromptText(text: string): void {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editor) return

    editor.focus()

    const range = document.createRange()
    range.selectNodeContents(editor)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    document.execCommand('insertText', false, text)
  }

  private clickSendButton(): void {
    const selectors = [
      'button[aria-label="Send Message"]',
      'button[aria-label="Send message"]',
      'button[data-testid="send-button"]',
      // Claude's send button is often the last button with an SVG arrow inside
      'fieldset button:last-of-type',
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
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      if (this.processing) return

      // Only intercept if focused on the editor
      const activeEl = document.activeElement
      const editor = document.querySelector('[contenteditable="true"]')
      if (!editor || !editor.contains(activeEl as Node)) return

      const prompt = this.getPromptText()
      if (!prompt?.trim()) return

      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      this.processing = true

      try {
        console.log('[ContextLens] Intercepted prompt, optimizing...')
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
