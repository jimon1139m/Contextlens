// Lightweight fallback embedder that works in service workers
// The @xenova/transformers library requires DOM/WASM which breaks in MV3 service workers
// This uses a fast bag-of-words approach until offscreen document support is added

const VOCAB_SIZE = 384 // Same dimensionality as MiniLM for compatibility

// Simple but effective: hash-based word embedding
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)
}

export async function embedText(text: string): Promise<number[]> {
  const tokens = tokenize(text)
  const vec = new Float32Array(VOCAB_SIZE).fill(0)

  for (const token of tokens) {
    const h = Math.abs(hashCode(token))
    // Each token contributes to multiple dimensions (simulates dense embedding)
    for (let j = 0; j < 3; j++) {
      const idx = (h + j * 127) % VOCAB_SIZE
      vec[idx] += 1
    }
  }

  // L2 normalize
  const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0))
  if (mag > 0) {
    for (let i = 0; i < vec.length; i++) {
      vec[i] /= mag
    }
  }

  return Array.from(vec)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}
