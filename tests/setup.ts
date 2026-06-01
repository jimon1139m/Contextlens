import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import 'fake-indexeddb/auto'

type ChromeCallback = (value?: unknown) => void

const mockStorageArea = {
  get: vi.fn((_keys: string[] | string | null, cb?: ChromeCallback) => cb?.({})),
  set: vi.fn((_items: Record<string, unknown>, cb?: () => void) => cb?.()),
}

// @ts-expect-error tests provide the extension API surface used by the app
globalThis.chrome = {
  storage: {
    sync: mockStorageArea,
    local: mockStorageArea,
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn((_msg: unknown, cb?: ChromeCallback) => cb?.({})),
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
  },
  sidePanel: {
    setPanelBehavior: vi.fn(() => Promise.resolve()),
  },
}
