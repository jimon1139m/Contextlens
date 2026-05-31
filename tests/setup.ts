import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import 'fake-indexeddb/auto'

// Mock Chrome Extension API
globalThis.chrome = {
  // @ts-ignore
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  // @ts-ignore
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    }
  },
}
