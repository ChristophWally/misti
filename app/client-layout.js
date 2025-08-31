'use client'

// app/client-layout.js
// Client-side layout component with fixed dictionary panel

import { useState } from 'react'
import DictionaryPanel from '../components/DictionaryPanel'

export default function ClientLayout({ children }) {
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false)
  // TODO: Implement admin check when authentication is ready
  // const isAdmin = () => {
  //   if (typeof window !== 'undefined') {
  //     return localStorage.getItem('userRole') === 'admin'
  //   }
  //   return false
  // }

  const openDictionary = () => {
    setIsDictionaryOpen(true)
  }

  const closeDictionary = () => {
    setIsDictionaryOpen(false)
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

              {/* ADMIN DROPDOWN - Always visible for now (TODO: Add admin check when auth is ready) */}
              <div className="relative group">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors shadow-md">
                  🔧 Admin ▼
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                  <div className="py-1">
                    <a
                      href="/admin/conjugation-validator"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      🔍 Verb Validator
                    </a>
                    <a
                      href="/admin/migration-tools"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      🔄 Migration Tools
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-2 text-xs text-gray-500">
                      Admin Tools
                    </div>
                  </div>
                </div>
              </div>

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

      {/* Dictionary Panel */}
      <DictionaryPanel 
        isOpen={isDictionaryOpen}
        onClose={closeDictionary}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
