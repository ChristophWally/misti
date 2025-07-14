'use client'

// components/ConjugationModal.js
// Final implementation with 4-column layout and gender intelligence

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AudioButton from './AudioButton'

export default function ConjugationModal({ 
  isOpen, 
  onClose, 
  word, 
  userAudioPreference = 'form-only' 
}) {
  const [conjugations, setConjugations] = useState([])
  const [selectedMood, setSelectedMood] = useState('indicativo')
  const [selectedTense, setSelectedTense] = useState('presente')
  const [isLoading, setIsLoading] = useState(false)
  const [audioPreference, setAudioPreference] = useState(userAudioPreference)
  const [genderSelection, setGenderSelection] = useState('male')

  // Load conjugations and group by mood/tense
  const loadConjugations = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('word_forms')
        .select('*')
        .eq('word_id', word.id)
        .eq('form_type', 'conjugation')
        .order('tags')

      if (error) throw error
      
console.log('Raw conjugation data:', data)
console.log('Found', data?.length || 0, 'conjugations for', word.italian)

// Log each form's tags for debugging
data?.forEach((form, index) => {
  console.log(`Form ${index}: "${form.form_text}" has tags:`, form.tags)
})

// Group conjugations by mood and tense for organized display
const groupedConjugations = groupConjugationsByMoodTense(data || [])
      setConjugations(groupedConjugations)
      
    } catch (error) {
      console.error('Error loading conjugations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group conjugations by mood and tense
const groupConjugationsByMoodTense = (conjugations) => {
  console.log('groupConjugationsByMoodTense input:', conjugations)
  
  const grouped = {}
  conjugations.forEach((conj, index) => {
    const mood = extractTagValue(conj.tags, 'mood') || 'indicativo'
    const tense = extractTagValue(conj.tags, 'tense') || 'presente'
    
    console.log(`Form ${index}: "${conj.form_text}" tags:`, conj.tags, '→ mood:', mood, 'tense:', tense)
    
    if (!grouped[mood]) grouped[mood] = {}
    if (!grouped[mood][tense]) grouped[mood][tense] = []
    
    grouped[mood][tense].push(conj)
  })
  
  console.log('Final grouped structure:', grouped)
  return grouped
}

  // Extract tag values by category
const extractTagValue = (tags, category) => {
  if (!tags || !Array.isArray(tags)) {
    console.warn('Invalid tags:', tags)
    return null
  }
  
  if (category === 'mood') {
    const moodTags = ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio']
    const found = tags.find(tag => moodTags.includes(tag))
    console.log('Mood search in:', tags, 'found:', found) // Debug line
    return found || null
  }
  
  if (category === 'tense') {
    const tenseTags = [
      'presente', 'imperfetto', 'passato-prossimo', 'passato-remoto', 
      'trapassato-prossimo', 'trapassato-remoto', 'futuro-semplice', 'futuro-anteriore',
      'congiuntivo-presente', 'congiuntivo-imperfetto', 'congiuntivo-passato', 'congiuntivo-trapassato',
      'condizionale-presente', 'condizionale-passato',
      'imperativo-presente', 'infinito-presente', 'infinito-passato', 
      'participio-presente', 'participio-passato', 'gerundio-presente', 'gerundio-passato'
    ]
    const found = tags.find(tag => tenseTags.includes(tag))
    console.log('Tense search in:', tags, 'found:', found) // Debug line
    return found || null
  }
  
  if (category === 'pronoun') {
    const pronounTags = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']
    const found = tags.find(tag => pronounTags.includes(tag))
    return found || null
  }
  
  return null
}

  // Check if current selection needs gender toggle
  const needsGenderToggle = () => {
    if (audioPreference === 'form-only') return false
    
    const currentForms = conjugations[selectedMood]?.[selectedTense] || []
    const isCompoundTense = currentForms.some(form => form.tags?.includes('compound'))
    const usesEssere = word.tags?.includes('essere-auxiliary')
    
    return isCompoundTense && usesEssere
  }

  // Get pronoun for form
  const getPronounForForm = (form) => {
    const pronoun = extractTagValue(form.tags, 'pronoun')
    const person = extractTagValue(form.tags, 'person')
    const number = extractTagValue(form.tags, 'number')
    
    if (pronoun) return pronoun
    
    // Fallback based on person/number
    if (person === 'prima-persona' && number === 'singolare') return 'io'
    if (person === 'seconda-persona' && number === 'singolare') return 'tu'
    if (person === 'terza-persona' && number === 'singolare') return audioPreference === 'with-pronoun' ? (genderSelection === 'male' ? 'lui' : 'lei') : 'lui/lei'
    if (person === 'prima-persona' && number === 'plurale') return 'noi'
    if (person === 'seconda-persona' && number === 'plurale') return 'voi'
    if (person === 'terza-persona' && number === 'plurale') return 'loro'
    
    return ''
  }

  // Check if form is gender variant
  const isGenderVariant = (form) => {
    if (audioPreference === 'form-only') return false
    
    const isCompound = form.tags?.includes('compound')
    const usesEssere = word.tags?.includes('essere-auxiliary')
    const isThirdPerson = form.tags?.includes('terza-persona')
    
    return (isCompound && usesEssere) || (audioPreference === 'with-pronoun' && isThirdPerson)
  }

  // Get regularity indicator
  const getRegularityIndicator = (mood, tense) => {
    const forms = conjugations[mood]?.[tense] || []
    const hasIrregular = forms.some(form => form.tags?.includes('irregular'))
    const hasRegular = forms.some(form => form.tags?.includes('regular'))
    
    if (hasIrregular && hasRegular) return '🔄'
    if (hasIrregular) return '⚠️'
    return '✅'
  }

  useEffect(() => {
    if (isOpen && word) {
      loadConjugations()
    }
  }, [isOpen, word])

  const moods = Object.keys(conjugations)
  const tenses = selectedMood && conjugations[selectedMood] ? Object.keys(conjugations[selectedMood]) : []
  const currentForms = conjugations[selectedMood]?.[selectedTense] || []

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-50 
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`
          fixed inset-y-0 right-0 bg-white shadow-xl z-50
          w-full md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-4xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'transform translate-x-0' : 'transform translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-500">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">
                📝 Conjugations: {word?.italian}
              </h2>
              {/* Word tags */}
              <div className="flex gap-2">
                {word?.tags?.includes('are-conjugation') && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">🔸 -are</span>
                )}
                {word?.tags?.includes('ere-conjugation') && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">🔹 -ere</span>
                )}
                {word?.tags?.includes('ire-conjugation') && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">🔶 -ire</span>
                )}
                {word?.tags?.includes('essere-auxiliary') && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">🫱 essere</span>
                )}
                {word?.tags?.includes('avere-auxiliary') && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">🤝 avere</span>
                )}
                {word?.tags?.includes('irregular-pattern') && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">⚠️ IRREG</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Audio Preference Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">Audio:</span>
                <button
                  onClick={() => setAudioPreference(audioPreference === 'form-only' ? 'with-pronoun' : 'form-only')}
                  className={`
                    px-3 py-1 rounded text-sm transition-colors
                    ${audioPreference === 'form-only' 
                      ? 'bg-white text-teal-600' 
                      : 'bg-teal-700 text-white border border-white'
                    }
                  `}
                >
                  {audioPreference === 'form-only' ? '📝 Form Only' : '👤 With Pronoun'}
                </button>
              </div>
              
              <button 
                onClick={onClose}
                className="text-white hover:text-cyan-200 text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="border-b bg-gray-50 p-4">
            {/* Mood Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood (Modo)
              </label>
              <div className="flex flex-wrap gap-2">
                {['indicativo', 'condizionale', 'congiuntivo', 'imperativo', 'infinito', 'participio', 'gerundio'].map(mood => 
                  moods.includes(mood) && (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`
                        px-3 py-1 rounded-md text-sm font-medium transition-colors
                        ${selectedMood === mood 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tense Selection */}
            {selectedMood && tenses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tense (Tempo)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tenses.map(tense => {
                    const indicator = getRegularityIndicator(selectedMood, tense)
                    
                    return (
                      <button
                        key={tense}
                        onClick={() => setSelectedTense(tense)}
                        className={`
                          px-3 py-1 rounded-md text-sm font-medium transition-colors
                          flex items-center gap-1
                          ${selectedTense === tense 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span>{indicator}</span>
                        <span>{tense.replace('-', ' ')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Gender Toggle */}
            {needsGenderToggle() && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setGenderSelection('male')}
                  className={`
                    w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-colors
                    ${genderSelection === 'male' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-blue-500 border-blue-500'
                    }
                  `}
                >
                  ♂
                </button>
                <button
                  onClick={() => setGenderSelection('female')}
                  className={`
                    w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-colors
                    ${genderSelection === 'female' 
                      ? 'bg-pink-500 text-white border-pink-500' 
                      : 'bg-white text-pink-500 border-pink-500'
                    }
                  `}
                >
                  ♀
                </button>
              </div>
            )}

            {/* Conjugation Grid */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conjugations...</p>
              </div>
            ) : currentForms.length > 0 ? (
              <div className="space-y-3">
                {currentForms.map(form => {
                  const pronoun = getPronounForForm(form)
                  const isVariant = isGenderVariant(form)
                  const isPlural = form.tags?.includes('plurale')
                  const isIrregular = form.tags?.includes('irregular')
                  
                  return (
                    <div
                      key={form.id}
                      className={`
                        border-2 rounded-lg p-3 transition-all duration-200 hover:shadow-md
                        ${isVariant 
                          ? genderSelection === 'male' 
                            ? isPlural ? 'border-yellow-500' : 'border-blue-500'
                            : 'border-pink-500'
                          : 'border-teal-500'
                        }
                        bg-white hover:transform hover:-translate-y-0.5
                      `}
                    >
                      <div className="grid grid-cols-[60px_120px_1fr_auto] items-center gap-4">
                        <div className="font-bold text-gray-600 text-lg">
                          {pronoun}
                        </div>
                        <div className={`
                          font-bold text-lg transition-colors
                          ${isVariant 
                            ? genderSelection === 'male' 
                              ? isPlural ? 'text-yellow-600' : 'text-blue-600'
                              : 'text-pink-600'
                            : 'text-teal-600'
                          }
                        `}>
                          {form.form_text}
                        </div>
                        <div className="text-gray-600 text-lg">
                          {form.translation}
                        </div>
                        <div className="flex items-center gap-2">
                          {isIrregular && (
                            <span 
                              className="bg-yellow-200 text-yellow-800 px-1 rounded text-xs"
                              title="Irregular form"
                            >
                              ⚠️
                            </span>
                          )}
                          <AudioButton
                            wordId={form.id}
                            italianText={audioPreference === 'with-pronoun' ? `${pronoun} ${form.form_text}` : form.form_text}
                            audioFilename={form.audio_filename}
                            size="sm"
                          />
                          <button
                            className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                            title="Add to deck"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Conjugations for {selectedMood} {selectedTense} are not yet available.
                </p>
                <p className="text-sm text-gray-400">
                  Coming soon as we expand our conjugation database.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
