import type { SiteAdapter } from './base-adapter'

export class ClaudeAdapter implements SiteAdapter {
  name = 'claude'
  private observer: MutationObserver | null = null

  getPromptText(): string | null {
    // Claude uses a contenteditable div
    const editor = document.querySelector('[contenteditable="true"]')
    return editor?.textContent ?? null
  }

  setPromptText(text: string): void {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editor) return
    editor.textContent = text
    // Trigger React's synthetic event system
    editor.dispatchEvent(new Event('input', { bubbles: true }))
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const prompt = this.getPromptText()
        if (!prompt?.trim()) return
        e.preventDefault()
        e.stopPropagation()
        const optimized = await callback(prompt)
        this.setPromptText(optimized)
        // Re-trigger submit after slight delay
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter', bubbles: true, cancelable: true
          }))
        }, 50)
      }
    }, true)
  }

  destroy(): void {
    this.observer?.disconnect()
  }
}
