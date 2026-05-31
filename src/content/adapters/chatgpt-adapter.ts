import type { SiteAdapter } from './base-adapter'

export class ChatGPTAdapter implements SiteAdapter {
  name = 'chatgpt'

  getPromptText(): string | null {
    const textarea = document.querySelector('#prompt-textarea') as HTMLTextAreaElement
    return textarea?.value ?? null
  }

  setPromptText(text: string): void {
    const textarea = document.querySelector('#prompt-textarea') as HTMLTextAreaElement
    if (!textarea) return
    // React controlled input needs nativeInputValueSetter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set
    nativeInputValueSetter?.call(textarea, text)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
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
          const btn = document.querySelector('[data-testid="send-button"]') as HTMLButtonElement
          btn?.click()
        }, 50)
      }
    }, true)
  }

  destroy(): void {}
}
