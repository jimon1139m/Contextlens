import { describe, it, expect } from 'vitest'
import { trimHistory, summarizeTurn } from '../src/compressor/historyTrimmer'

describe('trimHistory', () => {
  it('keeps history within token budget', () => {
    const history = [
      { role: 'user' as const, content: 'A'.repeat(400) }, // 100 tokens
      { role: 'assistant' as const, content: 'B'.repeat(400) }, // 100 tokens
      { role: 'user' as const, content: 'C'.repeat(400) }, // 100 tokens
    ]
    
    // With budget 250, we should only keep the last 2 turns
    const trimmed = trimHistory(history, 250)
    expect(trimmed.length).toBe(2)
    expect(trimmed[0].content).toBe('B'.repeat(400))
    expect(trimmed[1].content).toBe('C'.repeat(400))
  })

  it('handles empty history', () => {
    expect(trimHistory([], 100)).toEqual([])
  })

  it('always keeps the most recent turn if it fits', () => {
    const history = [
      { role: 'user' as const, content: 'A'.repeat(2000) } // 500 tokens
    ]
    expect(trimHistory(history, 100).length).toBe(0)
  })
})

describe('summarizeTurn', () => {
  it('truncates long content', () => {
    const turn = { role: 'user' as const, content: 'A'.repeat(300) }
    const summarized = summarizeTurn(turn, 200)
    expect(summarized.content.length).toBeLessThan(300)
    expect(summarized.content.endsWith('… [truncated]')).toBe(true)
  })

  it('leaves short content alone', () => {
    const turn = { role: 'user' as const, content: 'Short' }
    const summarized = summarizeTurn(turn, 200)
    expect(summarized).toEqual(turn)
  })
})
