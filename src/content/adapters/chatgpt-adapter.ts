import type { SiteAdapter } from './base-adapter'
import { simulateTextEntry, simulateSubmit } from '../utils/dom'

export class ChatGPTAdapter implements SiteAdapter {
  name = 'chatgpt'
  private processing = false

  private getEditor(): HTMLElement | null {
    // ChatGPT uses a ProseMirror contenteditable div — try multiple selectors
    const selectors = [
      '#prompt-textarea',
      '[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"][id*="prompt"]',
      'div[contenteditable="true"]',
    ]
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement
      if (el) return el
    }
    return null
  }

  getPromptText(): string | null {
    const el = this.getEditor()
    if (!el) return null
    if (el instanceof HTMLTextAreaElement) {
      return el.value?.trim() || null
    }
    // For contenteditable, get the inner text
    const text = el.innerText?.trim() ?? el.textContent?.trim() ?? ''
    return text || null
  }

  setPromptText(text: string): void {
    const el = this.getEditor()
    if (!el) return
    simulateTextEntry(el, text)
  }

  private clickSendButton(): void {
    const selectors = [
      '[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send"]',
      'button[data-testid="composer-send-button"]',
      'form button[type="submit"]',
      '#composer-background button:last-of-type',
    ]

    let btn: HTMLElement | null = null
    for (const selector of selectors) {
      const found = document.querySelector(selector) as HTMLElement
      if (found && !found.hasAttribute('disabled')) {
        btn = found
        break
      }
    }

    if (!btn) {
      const allButtons = document.querySelectorAll('button')
      for (const b of allButtons) {
        if (b.querySelector('svg') && !b.hasAttribute('disabled') && b.offsetParent !== null) {
          const rect = b.getBoundingClientRect()
          if (rect.bottom > window.innerHeight - 200) {
            btn = b
            break
          }
        }
      }
    }
    simulateSubmit(btn, this.getEditor())
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
          console.log('[ContextLens] Prompt optimized, sending...')
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
      
      const activeEl = document.activeElement
      const promptEl = this.getEditor()
      if (!promptEl) return
      if (activeEl !== promptEl && !promptEl.contains(activeEl as Node)) return

      handleOptimization(e)
    }, true)

    const onMouseOrClick = (e: Event) => {
      if ((e as any).__contextLensSimulated) return
      
      const target = e.target as HTMLElement
      const selectors = [
        '[data-testid="send-button"]',
        'button[aria-label="Send prompt"]',
        'button[aria-label="Send"]',
        'button[data-testid="composer-send-button"]',
        'form button[type="submit"]',
        '#composer-background button:last-of-type',
      ]

      const isSendButton = selectors.some(sel => target.closest(sel))
      let isHeuristic = false

      if (!isSendButton && target.closest('button')) {
        const btn = target.closest('button') as HTMLButtonElement
        if (btn.querySelector('svg') && !btn.disabled) {
          const rect = btn.getBoundingClientRect()
          if (rect.bottom > window.innerHeight - 200) {
            isHeuristic = true
          }
        }
      }

      if (isSendButton || isHeuristic) {
        handleOptimization(e)
      }
    }

    document.addEventListener('click', onMouseOrClick, true)
    document.addEventListener('mousedown', onMouseOrClick, true)
    document.addEventListener('pointerdown', onMouseOrClick, true)
  }

  destroy(): void {}
}
