import { useState, useEffect, useCallback } from 'react'
import Stats from './components/Stats'
import KnowledgeBase from './components/KnowledgeBase'
import Settings from './components/Settings'
import type { ExtensionSettings, OptimizationHistoryItem, StatsResponse } from '../shared/types'
import { BarChart3, BookOpen, Settings2 } from 'lucide-react'
import '../styles/globals.css'

const defaultSettings: ExtensionSettings = {
  enabled: true,
  ragEnabled: true,
  compressionEnabled: true,
  maxChunks: 3,
  compressionLevel: 'medium',
}

type Tab = 'stats' | 'knowledge' | 'settings'

interface PopupStats {
  totalSaved: number
  totalInputTokens: number
  totalOutputTokens: number
  promptsOptimized: number
  avgCompression: number
  weeklyData: number[]
  history: OptimizationHistoryItem[]
  knowledgeChunks: number
  knowledgeSources: string[]
  sourceChunkCounts: Record<string, number>
  platformTokens: Record<string, number>
  trend: number
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings)
  const [stats, setStats] = useState<PopupStats>({
    totalSaved: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    promptsOptimized: 0,
    avgCompression: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    history: [],
    knowledgeChunks: 0,
    knowledgeSources: [],
    sourceChunkCounts: {},
    platformTokens: {},
    trend: 0,
  })

  const loadStats = useCallback(() => {
    chrome.runtime?.sendMessage({ type: 'GET_STATS' }, (response: StatsResponse | { error?: string }) => {
      if (response && !('error' in response && response.error)) {
        const typedResponse = response as StatsResponse
        const totalSaved = typedResponse.totalSaved || 0
        const totalInput = typedResponse.totalInputTokens || 0
        const totalOutput = typedResponse.totalOutputTokens || 0

        const avgCompression = totalInput > 0
          ? Math.round((totalSaved / totalInput) * 1000) / 10
          : 0

        const now = new Date()
        const dayOfWeek = now.getDay()
        const jsDayToMonSun = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        const startOfThisWeek = startOfToday - (jsDayToMonSun * 24 * 60 * 60 * 1000)
        const oneDay = 24 * 60 * 60 * 1000

        const dynamicWeeklyData = [0, 0, 0, 0, 0, 0, 0]
        const wStats = typedResponse.weeklyStats || {}
        
        for (const [dateStr, savedTokens] of Object.entries(wStats)) {
          const [year, month, day] = dateStr.split('-').map(Number)
          const time = new Date(year, month - 1, day).getTime()
          const diffMs = time - startOfThisWeek
          if (diffMs >= 0 && diffMs < 7 * oneDay) {
            const dayIndex = Math.floor(diffMs / oneDay)
            if (dayIndex >= 0 && dayIndex < 7) {
              dynamicWeeklyData[dayIndex] += savedTokens
            }
          }
        }

        const hasData = dynamicWeeklyData.some(v => v > 0)
        const finalWeeklyData = hasData ? dynamicWeeklyData : [0, 0, 0, 0, 0, 0, 0]

        setStats(prev => ({
          ...prev,
          totalSaved,
          totalInputTokens: totalInput,
          totalOutputTokens: totalOutput,
          promptsOptimized: typedResponse.promptsOptimized || 0,
          avgCompression,
          weeklyData: finalWeeklyData,
          history: typedResponse.history || [],
          knowledgeChunks: typedResponse.knowledgeChunks || 0,
          knowledgeSources: typedResponse.knowledgeSources || [],
          sourceChunkCounts: typedResponse.sourceChunkCounts || {},
          platformTokens: typedResponse.platformTokens || {},
          trend: typedResponse.trend || 0,
        }))
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage?.sync?.get(['settings'], (result: { settings?: ExtensionSettings }) => {
      if (result.settings) {
        setSettings({ ...defaultSettings, ...result.settings })
      } else {
        setSettings(defaultSettings)
      }
    })

    loadStats()

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && (changes.stats || changes.history)) {
        loadStats()
      }
    }

    chrome.storage?.onChanged?.addListener(handleStorageChange)
    
    // Add interval polling as a robust fallback for Side Panel real-time updates
    const interval = setInterval(() => {
      loadStats()
    }, 2000)

    return () => {
      chrome.storage?.onChanged?.removeListener(handleStorageChange)
      clearInterval(interval)
    }
  }, [loadStats])

  const handleSettingsChange = (newSettings: ExtensionSettings) => {
    setSettings(newSettings)
    chrome.storage?.sync?.set({ settings: newSettings })
  }

  const addKnowledge = (text: string, source: string) => {
    return new Promise<void>((resolve, reject) => {
      chrome.runtime?.sendMessage({
        type: 'ADD_KNOWLEDGE',
        payload: { text, source },
      }, (response) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (response?.error) {
          reject(new Error(response.error))
          return
        }
        loadStats()
        resolve()
      })
    })
  }

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ]

  return (
    <div className="relative w-full h-full min-h-[400px] text-white font-sans flex flex-col shadow-2xl overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand-900 via-gray-900 to-black z-0"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-neon-purple rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob"></div>
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-neon-blue rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-24 left-1/2 w-64 h-64 bg-neon-pink rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col h-full bg-black/30 backdrop-blur-xl border-x border-b border-white/10 rounded-b-lg">
        <div className="px-5 py-4 bg-gradient-to-r from-brand-900/80 to-black/60 border-b border-white/10 flex justify-between items-center backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-brand-200 bg-clip-text text-transparent tracking-wide flex items-center drop-shadow-md">
              <span className="mr-2 text-xs font-black text-brand-200 drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]">CL</span> ContextLens
            </h1>
            <p className="text-[10px] text-brand-300/80 uppercase tracking-[0.2em] mt-0.5 font-medium">Token Optimizer</p>
          </div>
        </div>

        <div className="flex bg-black/40 border-b border-white/10 relative backdrop-blur-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-semibold transition-all duration-300 relative flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
            {activeTab === 'stats' && (
              <Stats
                totalSaved={stats.totalSaved}
                totalInputTokens={stats.totalInputTokens}
                totalOutputTokens={stats.totalOutputTokens}
                promptsOptimized={stats.promptsOptimized}
                avgCompression={stats.avgCompression}
                weeklyData={stats.weeklyData}
                history={stats.history}
                platformTokens={stats.platformTokens}
                trend={stats.trend}
              />
            )}
            {activeTab === 'knowledge' && (
              <KnowledgeBase
                chunksCount={stats.knowledgeChunks}
                sources={stats.knowledgeSources}
                sourceChunkCounts={stats.sourceChunkCounts}
                onRefresh={loadStats}
                onAddKnowledge={addKnowledge}
              />
            )}
            {activeTab === 'settings' && (
              <Settings settings={settings} onChange={handleSettingsChange} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
