import type { SiteAdapter } from './base-adapter'

export class GeminiAdapter implements SiteAdapter {
  name = 'gemini'

  getPromptText(): string | null {
    const editor = document.querySelector('.ql-editor') as HTMLElement
    return editor?.innerText ?? null
  }

  setPromptText(text: string): void {
    const editor = document.querySelector('.ql-editor') as HTMLElement
    if (!editor) return
    editor.innerHTML = `<p>${text}</p>`
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
        setTimeout(() => {
          // Gemini's send button usually has an aria-label="Send message" or similar inside a mat-icon-button
          const btn = document.querySelector('button[aria-label*="Send"]') as HTMLButtonElement
          btn?.click()
        }, 50)
      }
    }, true)
  }

  destroy(): void {}
}
