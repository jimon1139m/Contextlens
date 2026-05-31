---
name: contextlens-developer
description: Skills and guidelines for working on the ContextLens Chrome Extension.
---

# ContextLens Developer Skill

When working on ContextLens, observe the following skills and rules:

1. **Vibe Coding Conventions**: 
   - Use Tailwind utility classes directly in `className`.
   - Prefer functional React components with hooks.
   - Use standard `lucide-react` icons.

2. **Chrome MV3 Constraints**:
   - The Background Service Worker uses `type: "module"`.
   - No `eval()` or dynamically generated code.
   - Service Workers are ephemeral; state must be persisted to `chrome.storage` or IndexedDB.
   - Content scripts should carefully target DOM selectors (use `data-testid` when possible) and dispatch synthetic events when updating React-controlled inputs (like ChatGPT textareas).

3. **Machine Learning Constraints**:
   - Ensure `@xenova/transformers` is loaded and cached efficiently in the background worker. Provide visual or non-blocking fallbacks if the 25MB model is still loading during user interactions.

4. **Testing**:
   - Write simple heuristic tests in `Vitest` when updating the compression engine.
