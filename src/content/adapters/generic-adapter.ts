import type { SiteAdapter } from './base-adapter'
import { simulateTextEntry, simulateSubmit } from '../utils/dom'

export class GenericAdapter implements SiteAdapter {
  name = 'generic'
  private processing = false

  private getInput(): HTMLElement | null {
    // First try obvious textareas
    const textarea = document.querySelector('textarea')
    if (textarea) return textarea

    // Then try contenteditable divs (common in modern editors like ProseMirror/Draft.js)
    const contentEditable = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (contentEditable) return contentEditable

    // Last resort: standard input (less likely for multiline prompts, but possible)
    const input = document.querySelector('input[type="text"]')
    return (input as HTMLElement) || null
  }

  getPromptText(): string | null {
    const input = this.getInput()
    if (!input) return null

    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
      return input.value.trim()
    }
    return input.textContent?.trim() || null
  }

  setPromptText(text: string): void {
    const input = this.getInput()
    if (!input) return
    simulateTextEntry(input, text)
  }

  private clickSendButton(): void {
    const btn = document.querySelector('button[type="submit"], button[aria-label*="end"], div[role="button"][aria-label*="end"]') as HTMLElement
    simulateSubmit(btn, this.getInput())
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
      if ((e as any).__contextLensSimulated) return
      if (e.key !== 'Enter' || e.shiftKey) return
      
      const activeEl = document.activeElement
      const input = this.getInput()
      if (!input || !input.contains(activeEl as Node)) return

      handleOptimization(e)
    }, true)

    const onMouseOrClick = (e: MouseEvent) => {
      if ((e as any).__contextLensSimulated) return
      
      const target = e.target as HTMLElement
      // Generic check for things that look like a send button
      const isSendButton = target.closest('button[type="submit"]') || 
                           target.closest('button[aria-label*="end"]') || 
                           target.closest('div[role="button"][aria-label*="end"]')
                           
      if (isSendButton) {
        handleOptimization(e)
      }
    }

    document.addEventListener('click', onMouseOrClick, true)
    document.addEventListener('mousedown', onMouseOrClick, true)
  }

  destroy(): void {}
}
