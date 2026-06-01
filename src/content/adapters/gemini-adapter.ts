import type { SiteAdapter } from './base-adapter'

export class GeminiAdapter implements SiteAdapter {
  name = 'gemini'
  private processing = false

  getPromptText(): string | null {
    // Gemini uses a rich text editor — try multiple selectors
    const editor = document.querySelector('.ql-editor, [contenteditable="true"]') as HTMLElement
    return editor?.innerText?.trim() ?? null
  }

  setPromptText(text: string): void {
    const editor = document.querySelector('.ql-editor, [contenteditable="true"]') as HTMLElement
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
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      '.send-button',
      'button.send-button',
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

      const editor = document.querySelector('.ql-editor, [contenteditable="true"]')
      const activeEl = document.activeElement
      if (!editor || !editor.contains(activeEl as Node)) return

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
