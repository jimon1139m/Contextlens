export function simulateTextEntry(el: HTMLElement, text: string): boolean {
  if (!el) return false;
  
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, text);
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } else {
    // contenteditable
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const success = document.execCommand('insertText', false, text);
    if (!success) {
      el.innerHTML = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return true;
  }
}

export function simulateSubmit(btn: HTMLElement | null, textarea: HTMLElement | null): void {
  let btnClicked = false;
  if (btn && !btn.hasAttribute('disabled') && !btn.getAttribute('aria-disabled')) {
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
    const mouseup = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    
    // We add a tiny property so our own handlers know to ignore it
    ;(mousedown as any).__contextLensSimulated = true;
    ;(click as any).__contextLensSimulated = true;

    btn.dispatchEvent(mousedown);
    btn.dispatchEvent(mouseup);
    btn.dispatchEvent(click);
    btnClicked = true;
  }

  // Always fallback to Enter just in case the button click fails
  // But delay it slightly so it doesn't double-submit if the button worked
  if (textarea) {
    setTimeout(() => {
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      ;(enterEvent as any).__contextLensSimulated = true;
      textarea.dispatchEvent(enterEvent);
    }, btnClicked ? 100 : 0);
  }
}

export function showContextLensToast(textarea: HTMLElement | null, status: 'optimizing' | 'success', tokensSaved?: number): () => void {
  if (!textarea) return () => {};

  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.bottom = '10px';
  overlay.style.right = '10px';
  overlay.style.padding = '6px 12px';
  overlay.style.borderRadius = '20px';
  overlay.style.fontSize = '12px';
  overlay.style.fontWeight = 'bold';
  overlay.style.color = 'white';
  overlay.style.zIndex = '999999';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'all 0.3s ease';
  overlay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.gap = '6px';
  overlay.style.backdropFilter = 'blur(4px)';

  if (status === 'optimizing') {
    overlay.style.background = 'linear-gradient(90deg, rgba(139,92,246,0.9), rgba(59,130,246,0.9))';
    overlay.innerHTML = `
      <svg class="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
      </svg>
      ContextLens Optimizing...
    `;
    
    // Add simple spin animation style if not exists
    if (!document.getElementById('contextlens-toast-style')) {
      const style = document.createElement('style');
      style.id = 'contextlens-toast-style';
      style.textContent = `
        @keyframes contextlens-spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: contextlens-spin 1s linear infinite; }
      `;
      document.head.appendChild(style);
    }
  } else if (status === 'success') {
    overlay.style.background = 'linear-gradient(90deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))';
    overlay.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Optimized! ${tokensSaved ? `(-${tokensSaved} tokens)` : ''}
    `;
  }

  // Ensure textarea's parent is relative so we can position absolute inside it
  const parent = textarea.parentElement;
  if (parent) {
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(overlay);
  }

  // Auto cleanup function
  const remove = () => {
    if (overlay.parentNode) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  };

  if (status === 'success') {
    setTimeout(remove, 2000);
  }

  return remove;
}
