import { embedText, cosineSimilarity } from './embedder'
import { getAllChunks } from './vectorStore'
import type { KnowledgeChunk } from '../shared/types'

export async function retrieveRelevantChunks(
  query: string,
  topK: number = 3
): Promise<KnowledgeChunk[]> {
  const [queryEmbedding, allChunks] = await Promise.all([
    embedText(query),
    getAllChunks(),
  ])

  if (allChunks.length === 0) return []

  const ranked = allChunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0.3) // Only include if meaningfully relevant

  return ranked.map((r) => r.chunk)
}

export function chunksToContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return ''
  const entries = chunks
    .map((c) => `[Source: ${c.source}]\n${c.content}`)
    .join('\n\n---\n\n')
  return `<context>\n${entries}\n</context>\n\n`
}
