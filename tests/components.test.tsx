import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/popup/App'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

describe('Popup App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock response for chrome.storage.sync.get
    // @ts-ignore
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({
        settings: {
          enabled: true,
          ragEnabled: true,
          compressionEnabled: true,
          maxChunks: 3,
          compressionLevel: 'medium',
        }
      })
    })

    // Default mock response for chrome.runtime.sendMessage (for KnowledgeBase GET_STATS)
    // @ts-ignore
    chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
      if (msg.type === 'GET_STATS' && callback) {
        callback({ knowledgeChunks: 5 })
      }
    })
  })

  it('renders the main header', () => {
    render(<App />)
    expect(screen.getByText(/ContextLens/i)).toBeInTheDocument()
    expect(screen.getByText(/Token Optimizer/i)).toBeInTheDocument()
  })

  it('navigates to Knowledge Base tab and displays chunk count', async () => {
    render(<App />)
    
    const user = userEvent.setup()
    
    // Click Knowledge Base tab
    const knowledgeTab = screen.getByText('📚 Knowledge')
    await user.click(knowledgeTab)

    // Check if the mock returned 5 chunks
    expect(screen.getByText('5 chunks')).toBeInTheDocument()
  })
})
