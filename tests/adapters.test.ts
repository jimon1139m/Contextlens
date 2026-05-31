import { describe, it, expect } from 'vitest'
import { ClaudeAdapter } from '../src/content/adapters/claude-adapter'
import { ChatGPTAdapter } from '../src/content/adapters/chatgpt-adapter'

describe('Site Adapters', () => {
  describe('ClaudeAdapter', () => {
    it('initializes with the correct name', () => {
      const adapter = new ClaudeAdapter()
      expect(adapter.name).toBe('claude')
    })
  })

  describe('ChatGPTAdapter', () => {
    it('initializes with the correct name', () => {
      const adapter = new ChatGPTAdapter()
      expect(adapter.name).toBe('chatgpt')
    })
  })
  
  // Note: Deep DOM mocking for React internal props (which Claude and ChatGPT use)
  // is complex in a jsdom/happy-dom environment because they depend on specific React fiber nodes.
  // We are verifying the base adapter instantiation here.
})
