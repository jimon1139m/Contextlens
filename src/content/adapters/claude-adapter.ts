import type { SiteAdapter } from './base-adapter'
import { simulateTextEntry, simulateSubmit } from '../utils/dom'

export class ClaudeAdapter implements SiteAdapter {
  name = 'claude'
  private processing = false

  getPromptText(): string | null {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    return editor?.textContent?.trim() ?? null
  }

  setPromptText(text: string): void {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editor) return
    simulateTextEntry(editor, text)
  }

  private clickSendButton(): void {
    const selectors = [
      'button[aria-label="Send Message"]',
      'button[aria-label="Send message"]',
      'button[data-testid="send-button"]',
      'fieldset button:last-of-type',
    ]

    let btn: HTMLElement | null = null
    for (const selector of selectors) {
      const found = document.querySelector(selector) as HTMLElement
      if (found && !found.hasAttribute('disabled')) {
        btn = found
        break
      }
    }
    
    simulateSubmit(btn, document.querySelector('[contenteditable="true"]'))
  }

  onSubmit(callback: (prompt: string) => Promise<string>): void {
    const handleOptimization = async (e: Event) => {
      if (this.processing) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return
      }

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
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ])

        if (optimized !== prompt) {
          this.setPromptText(optimized)
        }

        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 150)
      } catch (err) {
        console.error('[ContextLens] Error during optimization:', err)
        this.setPromptText(prompt)
        setTimeout(() => {
          this.clickSendButton()
          this.processing = false
        }, 150)
      }
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e as any).__contextLensSimulated) return
      if (e.key !== 'Enter' || e.shiftKey) return
      
      const editor = document.querySelector('[contenteditable="true"]')
      const activeEl = document.activeElement
      if (!editor || !editor.contains(activeEl as Node)) return

      handleOptimization(e)
    }, true)

    const onMouseOrClick = (e: Event) => {
      if ((e as any).__contextLensSimulated) return
      
      const target = e.target as HTMLElement
      const selectors = [
        'button[aria-label="Send Message"]',
        'button[aria-label="Send message"]',
        'button[data-testid="send-button"]',
        'fieldset button:last-of-type',
      ]
      
      if (selectors.some(sel => target.closest(sel))) {
        handleOptimization(e)
      }
    }

    document.addEventListener('click', onMouseOrClick, true)
    document.addEventListener('mousedown', onMouseOrClick, true)
    document.addEventListener('pointerdown', onMouseOrClick, true)
  }

  destroy(): void {}
}
