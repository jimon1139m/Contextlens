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

export type MessageToBackground =
  | { type: 'COMPRESS_PROMPT'; payload: { prompt: string; hostname?: string } }
  | { type: 'ADD_KNOWLEDGE'; payload: { text: string; source: string } }
  | { type: 'GET_STATS'; payload?: undefined }
  | { type: 'DELETE_KNOWLEDGE'; payload: { source: string } }

export interface OptimizationHistoryItem {
  timestamp: number
  originalTokens: number
  compressedTokens: number
  newTokens: number
  saved: number
  platform?: string
}

export interface StatsResponse {
  knowledgeChunks: number
  knowledgeSources: string[]
  totalSaved: number
  totalInputTokens: number
  totalOutputTokens: number
  promptsOptimized: number
  history: OptimizationHistoryItem[]
  platformTokens: Record<string, number>
}
