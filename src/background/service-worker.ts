import { retrieveRelevantChunks, chunksToContext } from '../rag/retriever'
import { saveChunk, getAllChunks, deleteChunk } from '../rag/vectorStore'
import { embedText } from '../rag/embedder'
import { compressPrompt } from '../compressor/heuristicCompressor'
import { chunkText, estimateTokens, generateId } from '../shared/utils'
import type { MessageToBackground, ExtensionSettings, OptimizationHistoryItem } from '../shared/types'

interface StoredStats {
  totalSaved: number
  totalInputTokens: number
  totalOutputTokens: number
  promptsOptimized: number
  platformTokens?: Record<string, number>
}

interface LocalStorageData {
  stats?: StoredStats
  history?: OptimizationHistoryItem[]
}

interface SyncStorageData {
  settings?: ExtensionSettings
}

interface SidePanelChrome {
  sidePanel?: {
    setPanelBehavior?: (options: { openPanelOnActionClick: boolean }) => Promise<void>
  }
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  ragEnabled: true,
  compressionEnabled: true,
  maxChunks: 3,
  compressionLevel: 'medium',
}

const EMPTY_STATS: StoredStats = {
  totalSaved: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  promptsOptimized: 0,
  platformTokens: {},
}

function normalizeStats(stats?: Partial<StoredStats>): StoredStats {
  return {
    totalSaved: stats?.totalSaved ?? 0,
    totalInputTokens: stats?.totalInputTokens ?? 0,
    totalOutputTokens: stats?.totalOutputTokens ?? 0,
    promptsOptimized: stats?.promptsOptimized ?? 0,
    platformTokens: stats?.platformTokens ?? {},
  }
}

async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    try {
      chrome.storage?.sync?.get(['settings'], (result: SyncStorageData) => {
        resolve(result?.settings ?? DEFAULT_SETTINGS)
      })
    } catch {
      resolve(DEFAULT_SETTINGS)
    }
  })
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  // Allow users to open the side panel by clicking on the action toolbar icon
  try {
    (chrome as typeof chrome & SidePanelChrome).sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true })
      .catch((error: Error) => console.error('[ContextLens] sidePanel error:', error))
  } catch (e) {
    console.warn('[ContextLens] sidePanel API not available:', e)
  }

  console.log('[ContextLens] Extension installed / updated')
})

chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) => {
    console.log('[ContextLens] Received message:', message.type)
    handleMessage(message)
      .then((result) => {
        console.log('[ContextLens] Message handled:', message.type, result)
        sendResponse(result)
      })
      .catch(err => {
        console.error('[ContextLens] Error handling message:', err)
        sendResponse({ error: err.message })
      })
    return true // keep channel open for async response
  }
)

async function handleMessage(message: MessageToBackground) {
  const settings = await getSettings()

  switch (message.type) {
    case 'COMPRESS_PROMPT': {
      if (!settings.enabled) {
        return { optimizedPrompt: message.payload.prompt, originalTokens: 0, newTokens: 0 }
      }

      let prompt: string = message.payload.prompt
      const originalTokens = estimateTokens(prompt)

      // Step 1: Compress the prompt text
      if (settings.compressionEnabled) {
        prompt = compressPrompt(prompt, settings.compressionLevel)
      }
      const compressedTokens = estimateTokens(prompt)

      // Step 2: RAG — prepend relevant context (with error handling)
      let contextPrefix = ''
      if (settings.ragEnabled) {
        try {
          const chunks = await retrieveRelevantChunks(prompt, settings.maxChunks)
          contextPrefix = chunksToContext(chunks)
        } catch (e) {
          console.warn('[ContextLens] RAG retrieval failed, skipping:', e)
        }
      }

      const optimizedPrompt = contextPrefix + prompt
      const newTokens = estimateTokens(optimizedPrompt)
      const saved = Math.max(0, originalTokens - compressedTokens)
      const hostname = message.payload.hostname || 'Unknown'
      let platform = 'Unknown'
      if (hostname.includes('claude.ai')) platform = 'Claude'
      else if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) platform = 'ChatGPT'
      else if (hostname.includes('gemini.google.com')) platform = 'Gemini'
      else if (hostname.includes('deepseek.com')) platform = 'DeepSeek'

      // Update stats and history in storage
      try {
        const result = await new Promise<LocalStorageData>((resolve) => {
          chrome.storage.local.get(['stats', 'history'], (r: LocalStorageData) => resolve(r))
        })

        const stats = normalizeStats(result?.stats)

        const newHistoryItem = {
          timestamp: Date.now(),
          originalTokens,
          compressedTokens,
          newTokens,
          saved,
          platform,
        }

        const history = result?.history ?? []
        const newHistory = [newHistoryItem, ...history].slice(0, 50)

        const newPlatformTokens = { ...(stats.platformTokens ?? {}) }
        newPlatformTokens[platform] = (newPlatformTokens[platform] || 0) + newTokens

        await new Promise<void>((resolve) => {
          chrome.storage.local.set({
            stats: {
              totalSaved: stats.totalSaved + saved,
              totalInputTokens: stats.totalInputTokens + originalTokens,
              totalOutputTokens: stats.totalOutputTokens + newTokens,
              promptsOptimized: stats.promptsOptimized + 1,
              platformTokens: newPlatformTokens,
            },
            history: newHistory,
          }, () => resolve())
        })
      } catch (e) {
        console.error('[ContextLens] Failed to save stats:', e)
      }

      return { optimizedPrompt, originalTokens, newTokens }
    }

    case 'ADD_KNOWLEDGE': {
      const { text, source } = message.payload
      const chunks = chunkText(text)

      for (const chunkContent of chunks) {
        const embedding = await embedText(chunkContent)
        await saveChunk({
          id: generateId(),
          content: chunkContent,
          embedding,
          source,
          createdAt: Date.now(),
        })
      }

      return { success: true, chunksAdded: chunks.length }
    }

    case 'GET_STATS': {
      const [allChunks, storageResult] = await Promise.all([
        getAllChunks().catch(() => []),
        new Promise<LocalStorageData>((resolve) =>
          chrome.storage.local.get(['stats', 'history'], (r: LocalStorageData) =>
            resolve(r ?? {})
          )
        ),
      ])

      const stats = normalizeStats(storageResult?.stats ?? EMPTY_STATS)
      const history = storageResult?.history ?? []
      const knowledgeSources = Array.from(new Set(allChunks.map((chunk) => chunk.source))).sort()
      const historyTotals = history.reduce(
        (acc, item) => ({
          input: acc.input + item.originalTokens,
          output: acc.output + item.newTokens,
          saved: acc.saved + item.saved,
        }),
        { input: 0, output: 0, saved: 0 }
      )

      return {
        knowledgeChunks: allChunks.length,
        knowledgeSources,
        totalSaved: stats.totalSaved || historyTotals.saved,
        totalInputTokens: stats.totalInputTokens || historyTotals.input,
        totalOutputTokens: stats.totalOutputTokens || historyTotals.output,
        promptsOptimized: stats.promptsOptimized,
        history,
        platformTokens: stats.platformTokens || {},
      }
    }

    case 'DELETE_KNOWLEDGE': {
      const { source } = message.payload
      const allChunks = await getAllChunks()
      const chunksToDeleteList = allChunks.filter(c => c.source === source)
      for (const c of chunksToDeleteList) {
        await deleteChunk(c.id)
      }
      return { success: true, deletedCount: chunksToDeleteList.length }
    }

    default:
      return { error: 'Unknown message type' }
  }
}
