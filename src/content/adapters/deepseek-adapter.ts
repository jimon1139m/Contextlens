import type { SiteAdapter } from './base-adapter'

export class DeepSeekAdapter implements SiteAdapter {
  name = 'deepseek'

  getPromptText(): string | null {
    const textarea = document.querySelector('#chat-input') as HTMLTextAreaElement
    return textarea?.value ?? null
  }

  setPromptText(text: string): void {
    const textarea = document.querySelector('#chat-input') as HTMLTextAreaElement
    if (!textarea) return
    
    // DeepSeek likely uses React or Vue, standard synthetic event trigger
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, text)
    } else {
        textarea.value = text;
    }
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
          // DeepSeek's send button typically has a btn-primary class or aria-label containing Send
          const btn = document.querySelector('button[aria-label*="Send"], .btn-primary') as HTMLButtonElement
          btn?.click()
        }, 50)
      }
    }, true)
  }

  destroy(): void {}
}
