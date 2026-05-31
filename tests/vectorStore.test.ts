import { describe, it, expect, beforeEach } from 'vitest'
import { saveChunk, getAllChunks, deleteChunk, type KnowledgeChunk } from '../src/rag/vectorStore'

// fake-indexeddb is loaded globally via setup.ts

describe('Vector Store (IndexedDB)', () => {
  beforeEach(async () => {
    // Clear out any old chunks before each test to maintain isolation
    const chunks = await getAllChunks()
    for (const c of chunks) {
      await deleteChunk(c.id)
    }
  })

  it('saves and retrieves chunks', async () => {
    const chunk: KnowledgeChunk = {
      id: 'test-123',
      content: 'Hello World',
      embedding: [0.1, 0.2, 0.3],
      source: 'test.md',
      createdAt: Date.now()
    }

    await saveChunk(chunk)
    const stored = await getAllChunks()

    expect(stored.length).toBe(1)
    expect(stored[0].id).toBe('test-123')
    expect(stored[0].content).toBe('Hello World')
    expect(stored[0].embedding).toEqual([0.1, 0.2, 0.3])
  })

  it('deletes chunks', async () => {
    const chunk: KnowledgeChunk = {
      id: 'test-456',
      content: 'Delete Me',
      embedding: [0.5, 0.5],
      source: 'delete.txt',
      createdAt: Date.now()
    }

    await saveChunk(chunk)
    await deleteChunk('test-456')
    const stored = await getAllChunks()
    
    expect(stored.length).toBe(0)
  })
})
