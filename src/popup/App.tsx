import { useState, useEffect } from 'react'
import Stats from './components/Stats'
import KnowledgeBase from './components/KnowledgeBase'
import Settings from './components/Settings'
import type { ExtensionSettings } from '../shared/types'
import '../styles/globals.css'

const defaultSettings: ExtensionSettings = {
  enabled: true,
  ragEnabled: true,
  compressionEnabled: true,
  maxChunks: 3,
  compressionLevel: 'medium',
}

type Tab = 'stats' | 'knowledge' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings)

  useEffect(() => {
    chrome.storage?.sync?.get(['settings'], (result: { [key: string]: any }) => {
      if (result.settings) setSettings(result.settings)
    })
  }, [])

  const handleSettingsChange = (newSettings: ExtensionSettings) => {
    setSettings(newSettings)
    chrome.storage?.sync?.set({ settings: newSettings })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'knowledge', label: '📚 Knowledge' },
    { id: 'settings', label: '⚙️ Settings' },
  ]

  return (
    <div className="w-80 min-h-96 bg-gray-900 text-white font-sans flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-brand-900 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-brand-50 tracking-wide flex items-center">
            <span className="mr-2">🔬</span> ContextLens
          </h1>
          <p className="text-[10px] text-brand-200 opacity-70 uppercase tracking-widest mt-0.5">Token Optimizer</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-800 bg-gray-900/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-brand-400 border-b-2 border-brand-500 bg-gray-800/50'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'stats' && (
          <Stats
            totalSaved={0}
            promptsOptimized={0}
            avgCompression={0}
            weeklyData={[10, 45, 30, 80, 50, 20, 90]}
          />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgeBase
            onAddKnowledge={(text, source) => {
              chrome.runtime?.sendMessage({
                type: 'ADD_KNOWLEDGE',
                payload: { text, source },
              })
            }}
          />
        )}
        {activeTab === 'settings' && (
          <Settings settings={settings} onChange={handleSettingsChange} />
        )}
      </div>
    </div>
  )
}
