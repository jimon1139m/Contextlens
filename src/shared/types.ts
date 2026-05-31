export interface KnowledgeChunk {
  id: string
  content: string
  embedding: number[]
  source: string
  createdAt: number
}

export interface CompressionStats {
  originalTokens: number
  compressedTokens: number
  savedPercent: number
  totalSaved: number
}

export interface ExtensionSettings {
  enabled: boolean
  ragEnabled: boolean
  compressionEnabled: boolean
  maxChunks: number
  compressionLevel: 'light' | 'medium' | 'aggressive'
}

export interface MessageToBackground {
  type: 'COMPRESS_PROMPT' | 'ADD_KNOWLEDGE' | 'GET_STATS' | 'DELETE_KNOWLEDGE'
  payload: any
}
