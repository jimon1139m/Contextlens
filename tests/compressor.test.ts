import { describe, it, expect } from 'vitest'
import { compressPrompt } from '../src/compressor/heuristicCompressor'

describe('compressPrompt', () => {
  it('strips opener fluff', () => {
    const result = compressPrompt('Hello! Can you please explain React hooks?')
    expect(result).toBe('explain React hooks?')
  })

  it('preserves technical content', () => {
    const code = 'Fix this bug: `TypeError: Cannot read property of undefined`'
    expect(compressPrompt(code)).toBe(code)
  })

  it('aggressive mode shortens more', () => {
    const input = 'in order to understand the the concept'
    const medium = compressPrompt(input, 'medium')
    const aggressive = compressPrompt(input, 'aggressive')
    expect(aggressive.length).toBeLessThanOrEqual(medium.length)
  })
})
