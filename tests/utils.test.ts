import { describe, it, expect } from 'vitest'
import { chunkText, estimateTokens, generateId } from '../src/shared/utils'

describe('chunkText', () => {
  it('chunks text according to chunkSize and overlap', () => {
    const text = 'word1 word2 word3 word4 word5'
    // With chunk size 3, overlap 1:
    // chunk 1: word1 word2 word3
    // index increases by 3 - 1 = 2
    // chunk 2: word3 word4 word5
    const chunks = chunkText(text, 3, 1)
    expect(chunks).toEqual([
      'word1 word2 word3',
      'word3 word4 word5',
      'word5'
    ])
  })

  it('handles empty text', () => {
    expect(chunkText('')).toEqual([])
  })
})

describe('estimateTokens', () => {
  it('estimates tokens as length / 4', () => {
    expect(estimateTokens('1234')).toBe(1)
    expect(estimateTokens('12345')).toBe(2)
    expect(estimateTokens('')).toBe(0)
  })
})

describe('generateId', () => {
  it('generates a unique id', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
  })
})
