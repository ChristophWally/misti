'use client'

// app/client-layout.js
// Client-side layout with split-view: WordViewer (left) + DictionaryPanel (right, 320px narrow)

import { useState } from 'react'
import DictionaryPanel from '../components/DictionaryPanel'
import WordViewer from '../components/WordViewer/index'

export default function ClientLayout({ children }) {
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)
  const [isWordViewerOpen, setIsWordViewerOpen] = useState(false)

  const openDictionary = () => setIsDictionaryOpen(true)
  const closeDictionary = () => setIsDictionaryOpen(false)

  const handleSelectWord = (word) => {
    setSelectedWord(word)
    setIsWordViewerOpen(true)
  }

  const handleCloseWordViewer = () => {
    setIsWordViewerOpen(false)
    setSelectedWord(null)
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Misti</h1>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={openDictionary}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-md"
              >
                📚 Dictionary
              </button>


              <button className="text-white hover:text-cyan-200 transition-colors">
                My Decks
              </button>
              <button className="text-white hover:text-cyan-200 transition-colors">
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop split-view: WordViewer left, DictionaryPanel right */}
      <div className="hidden md:block">
        {isWordViewerOpen && isDictionaryOpen && (
          <div className="fixed inset-y-0 right-0 flex flex-row z-50 top-16">
            {/* WordViewer fills remaining space */}
            <div className="flex-1 overflow-hidden border-r border-gray-200 shadow-xl bg-white">
              <WordViewer
                word={selectedWord}
                isOpen={isWordViewerOpen}
                onClose={handleCloseWordViewer}
              />
            </div>
            {/* DictionaryPanel narrow slice */}
            <div className="w-80 flex-shrink-0">
              <DictionaryPanel
                isOpen={isDictionaryOpen}
                onClose={closeDictionary}
                onSelectWord={handleSelectWord}
                isNarrow={true}
              />
            </div>
          </div>
        )}

        {/* DictionaryPanel alone (no word selected) */}
        {isDictionaryOpen && !isWordViewerOpen && (
          <DictionaryPanel
            isOpen={isDictionaryOpen}
            onClose={closeDictionary}
            onSelectWord={handleSelectWord}
            isNarrow={false}
          />
        )}
      </div>

      {/* Mobile: panels as full-screen overlays */}
      <div className="md:hidden">
        {/* DictionaryPanel overlay */}
        <DictionaryPanel
          isOpen={isDictionaryOpen && !isWordViewerOpen}
          onClose={closeDictionary}
          onSelectWord={handleSelectWord}
          isNarrow={false}
        />

        {/* WordViewer overlay */}
        {selectedWord && (
          <div className={`fixed inset-0 z-50 bg-white transition-transform duration-300 ${isWordViewerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <WordViewer
              word={selectedWord}
              isOpen={isWordViewerOpen}
              onClose={handleCloseWordViewer}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
