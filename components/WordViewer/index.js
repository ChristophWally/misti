'use client'

// components/WordViewer/index.js
// Root shell for the word detail viewer: tabbed layout with data hydration

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { hydrateCanonicalWordBundle } from '../../lib/dictionary-bundle-compat'
import WordViewerHeader from './WordViewerHeader'
import SensesTab from './tabs/SensesTab'
import FormsTab from './tabs/FormsTab'
import SentencesTab from './tabs/SentencesTab'
import GrammarTab from './tabs/GrammarTab'
import EtymologyTab from './tabs/EtymologyTab'

const TABS = [
  { id: 'senses', label: 'Senses', icon: '📖' },
  { id: 'forms', label: 'Forms', icon: '🔠' },
  { id: 'sentences', label: 'Sentences', icon: '💬' },
  { id: 'grammar', label: 'Grammar', icon: '⚙️' },
  { id: 'etymology', label: 'Etymology', icon: '🌿' },
]

export default function WordViewer({ word, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('senses')
  const [fullBundle, setFullBundle] = useState(null)
  const [isLoadingBundle, setIsLoadingBundle] = useState(false)

  // Reset state when word changes
  useEffect(() => {
    if (word && isOpen) {
      setActiveTab('senses')
      setFullBundle(null)
      fetchBundle(word)
    }
  }, [word?.id, isOpen])

  const fetchBundle = async (w) => {
    if (!w?.id) return
    setIsLoadingBundle(true)
    try {
      const { data, error } = await supabase.rpc('app_get_word_bundle', { p_word_id: w.id })
      if (error) throw error
      const rawBundle = Array.isArray(data) ? data[0] : data
      const bundle = hydrateCanonicalWordBundle(rawBundle || {}, w)
      setFullBundle(bundle)
    } catch (err) {
      console.error('WordViewer: failed to fetch bundle', err)
      setFullBundle(null)
    } finally {
      setIsLoadingBundle(false)
    }
  }

  if (!word) return null

  return (
    <div
      className={`
        word-viewer-panel flex flex-col bg-white h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header: sticky on mobile */}
      <div className="sticky top-0 z-10 flex-shrink-0">
        <WordViewerHeader word={word} onClose={onClose} />

        {/* Desktop tab pill row */}
        <div className="hidden md:flex gap-1 px-4 py-2 border-b bg-white">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`word-viewer-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content: scrollable */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {activeTab === 'senses' && (
          <SensesTab word={word} fullBundle={fullBundle} isLoading={isLoadingBundle} />
        )}
        {activeTab === 'forms' && (
          <FormsTab word={word} fullBundle={fullBundle} isLoading={isLoadingBundle} />
        )}
        {activeTab === 'sentences' && (
          <SentencesTab word={word} fullBundle={fullBundle} isLoading={isLoadingBundle} />
        )}
        {activeTab === 'grammar' && (
          <GrammarTab word={word} fullBundle={fullBundle} isLoading={isLoadingBundle} />
        )}
        {activeTab === 'etymology' && (
          <EtymologyTab word={word} fullBundle={fullBundle} isLoading={isLoadingBundle} />
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <div className="word-viewer-tab-bar md:hidden">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`word-viewer-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
