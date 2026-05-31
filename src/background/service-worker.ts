import { retrieveRelevantChunks, chunksToContext } from '../rag/retriever'
import { saveChunk, getAllChunks, deleteChunk } from '../rag/vectorStore'
import { embedText } from '../rag/embedder'
import { compressPrompt } from '../compressor/heuristicCompressor'
import { chunkText, estimateTokens, generateId } from '../shared/utils'
import type { MessageToBackground, ExtensionSettings } from '../shared/types'

const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  ragEnabled: true,
  compressionEnabled: true,
  maxChunks: 3,
  compressionLevel: 'medium',
}

async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage?.sync?.get(['settings'], (result: { [key: string]: any }) => {
      resolve(result.settings ?? DEFAULT_SETTINGS)
    })
  })
}

// Preload embedder
chrome.runtime.onInstalled.addListener(() => {
  setTimeout(async () => {
    try {
      await embedText('warmup')
      console.log('[ContextLens] Embedder ready')
    } catch (e) {
      console.warn('[ContextLens] Embedder warmup failed:', e)
    }
  }, 500)
})

chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    handleMessage(message).then(sendResponse).catch(err => {
      console.error(err);
      sendResponse({ error: err.message });
    })
    return true // keep channel open for async response
  }
)

async function handleMessage(message: MessageToBackground) {
  const settings = await getSettings()

  switch (message.type) {
    case 'COMPRESS_PROMPT': {
      if (!settings.enabled) {
        return { optimizedPrompt: message.payload.prompt }
      }

      let prompt: string = message.payload.prompt
      const originalTokens = estimateTokens(prompt)

      // Step 1: Compress the prompt text
      if (settings.compressionEnabled) {
        prompt = compressPrompt(prompt, settings.compressionLevel)
      }

      // Step 2: RAG — prepend relevant context
      let contextPrefix = ''
      if (settings.ragEnabled) {
        const chunks = await retrieveRelevantChunks(prompt, settings.maxChunks)
        contextPrefix = chunksToContext(chunks)
      }

      const optimizedPrompt = contextPrefix + prompt
      const newTokens = estimateTokens(optimizedPrompt)

      // Update stats in storage
      chrome.storage?.local?.get(['stats'], (result: { [key: string]: any }) => {
        const stats = result.stats ?? { totalSaved: 0, promptsOptimized: 0 }
        const saved = Math.max(0, originalTokens - newTokens)
        chrome.storage.local.set({
          stats: {
            totalSaved: stats.totalSaved + saved,
            promptsOptimized: stats.promptsOptimized + 1,
          },
        })
      })

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
      const [allChunks, statsResult] = await Promise.all([
        getAllChunks(),
        new Promise<any>((resolve) =>
          chrome.storage?.local?.get(['stats'], (r: { [key: string]: any }) => resolve(r.stats ?? {}))
        ),
      ])
      return {
        knowledgeChunks: allChunks.length,
        ...statsResult,
      }
    }

    case 'DELETE_KNOWLEDGE': {
      const { source } = message.payload
      const allChunks = await getAllChunks()
      const chunksToDelete = allChunks.filter(c => c.source === source)
      for (const c of chunksToDelete) {
        await deleteChunk(c.id)
      }
      return { success: true, deletedCount: chunksToDelete.length }
    }

    default:
      return { error: 'Unknown message type' }
  }
}
