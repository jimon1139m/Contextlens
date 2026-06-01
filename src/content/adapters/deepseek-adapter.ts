import type { SiteAdapter } from './base-adapter'
import { simulateTextEntry, simulateSubmit } from '../utils/dom'

export class DeepSeekAdapter implements SiteAdapter {
  name = 'deepseek'
  private processing = false

  getPromptText(): string | null {
    const el = document.querySelector('#chat-input, [contenteditable="true"], textarea') as HTMLElement
    if (!el) return null
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      return el.value?.trim() ?? null
    }
    return el.textContent?.trim() ?? el.innerText?.trim() ?? null
  }

  setPromptText(text: string): void {
    const el = document.querySelector('#chat-input, [contenteditable="true"], textarea') as HTMLElement
    simulateTextEntry(el, text)
  }

  private clickSendButton(): void {
    const selectors = [
      'div[aria-label*="Send"]',
      'div[aria-label*="send"]',
      '.ds-icon-button',
      '#chat-input ~ button',
      '#chat-input ~ div[role="button"]',
      '.btn-primary',
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
      // DeepSeek heuristic: Find buttons or clickable divs near the textarea
      const textarea = document.querySelector('#chat-input, [contenteditable="true"], textarea') as HTMLElement
      if (textarea) {
        let parent = textarea.parentElement
        for (let i = 0; i < 3 && parent; i++) {
          const clickableElements = Array.from(parent.querySelectorAll('div[role="button"], button, span[role="button"]')) as HTMLElement[]
          const visibleElements = clickableElements.filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'))
          
          if (visibleElements.length > 0) {
            btn = visibleElements[visibleElements.length - 1]
            break
          }
          parent = parent.parentElement
        }
      }
    }
    
    const textarea = document.querySelector('#chat-input, [contenteditable="true"], textarea') as HTMLElement
    simulateSubmit(btn, textarea)
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
        console.log('[ContextLens] Intercepted prompt, optimizing...')
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
      
      const textarea = document.querySelector('#chat-input, [contenteditable="true"], textarea')
      const activeEl = document.activeElement
      if (!textarea || (activeEl !== textarea && !textarea.contains(activeEl as Node))) return

      handleOptimization(e)
    }, true)

    const onMouseOrClick = (e: MouseEvent) => {
      if ((e as any).__contextLensSimulated) return
      
      const target = e.target as HTMLElement
      const selectors = [
        'button[aria-label*="Send"]',
        'button[aria-label*="send"]',
        'div[aria-label*="Send"]',
        'div[aria-label*="send"]',
        '.ds-icon-button',
        '#chat-input ~ button',
        '#chat-input ~ div[role="button"]',
        '.btn-primary',
      ]
      
      const isSendButton = selectors.some(sel => target.closest(sel))
      
      let isHeuristic = false
      if (!isSendButton) {
        const textarea = document.querySelector('#chat-input, [contenteditable="true"], textarea') as HTMLElement
        if (textarea && textarea.parentElement) {
          if (textarea.parentElement.contains(target) && target.closest('div[role="button"], button, span[role="button"], svg, path')) {
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
  }

  destroy(): void {}
}
