'use client'

// components/ConjugationModal.js
// Main conjugation display modal for Italian verbs

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { VariantCalculator } from '../lib/variant-calculator'

// Modified components/WordCard.js integration:
// Add this to existing WordCard component after existing buttons

export default function ConjugationModal({ 
  isOpen, 
  onClose, 
  word, // dictionary entry
  userAudioPreference = 'form-only' 
}) {
  const [conjugations, setConjugations] = useState([])
  const [allVariants, setAllVariants] = useState([])
  const [selectedMood, setSelectedMood] = useState('indicativo')
  const [selectedTense, setSelectedTense] = useState('presente')
  const [isLoading, setIsLoading] = useState(false)
  const [audioPreference, setAudioPreference] = useState(userAudioPreference)

  // Load conjugations and calculate variants
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
      
      // Calculate variants for each conjugation
      const conjugationsWithVariants = []
      const allCalculatedVariants = []
      
      data.forEach(conjugation => {
        // Add original conjugation
        conjugationsWithVariants.push({
          ...conjugation,
          isVariant: false
        })
        
        // Calculate and add variants
        const variants = VariantCalculator.calculateAllVariants(word, conjugation)
        if (variants) {
          variants.forEach(variant => {
            const variantConjugation = {
              id: `${conjugation.id}_${variant.variant_type}`, // Unique ID for variant
              word_id: conjugation.word_id,
              form_text: variant.form_text,
              form_type: conjugation.form_type,
              form_context: `${conjugation.form_context} (${variant.variant_type})`,
              translation: this.generateVariantTranslation(conjugation.translation, variant.variant_type),
              tags: variant.tags,
              isVariant: true,
              baseConjugationId: conjugation.id,
              variantType: variant.variant_type,
              patternType: variant.pattern_type,
              word_audio_metadata: [] // Variants don't have audio yet
            }
            
            conjugationsWithVariants.push(variantConjugation)
            allCalculatedVariants.push(variantConjugation)
          })
        }
      })
      
      // Group by mood and tense
      const groupedConjugations = groupConjugationsByMoodTense(conjugationsWithVariants)
      setConjugations(groupedConjugations)
      setAllVariants(allCalculatedVariants)
      
    } catch (error) {
      console.error('Error loading conjugations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate variant translations
  const generateVariantTranslation = (baseTranslation, variantType) => {
    switch (variantType) {
      case 'fem-sing':
        return baseTranslation.replace(/\(he\)/, '(she)')
      case 'masc-plur':
        return baseTranslation.replace(/I |he |she /, 'we ').replace(/\(.*\)/, '(masculine)')
      case 'fem-plur':
        return baseTranslation.replace(/I |he |she /, 'we ').replace(/\(.*\)/, '(feminine)')
      default:
        return baseTranslation
    }
  }

  // Group conjugations into organized structure for display
  const groupConjugationsByMoodTense = (conjugations) => {
    const grouped = {}
    conjugations.forEach(conj => {
      const mood = extractTagValue(conj.tags, 'mood') || 'indicativo'
      const tense = extractTagValue(conj.tags, 'tense') || 'presente'
      
      if (!grouped[mood]) grouped[mood] = {}
      if (!grouped[mood][tense]) grouped[mood][tense] = []
      
      grouped[mood][tense].push(conj)
    })
    return grouped
  }

  // Extract specific tag values from tag array
  const extractTagValue = (tags, category) => {
    const categoryMap = {
      mood: ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio'],
      tense: ['presente', 'imperfetto', 'passato-prossimo', 'passato-remoto', 'futuro-semplice', 'congiuntivo-presente', 'congiuntivo-imperfetto', 'condizionale-presente'],
    }
    return tags?.find(tag => categoryMap[category]?.includes(tag))
  }

  // Get available moods and tenses
  const getAvailableOptions = () => {
    const moods = Object.keys(conjugations)
    const tenses = selectedMood && conjugations[selectedMood] ? Object.keys(conjugations[selectedMood]) : []
    return { moods, tenses }
  }

  // Check if tense has irregular forms
  const getTenseRegularity = (mood, tense) => {
    const forms = conjugations[mood]?.[tense] || []
    const hasIrregular = forms.some(form => form.tags?.includes('irregular'))
    const hasRegular = forms.some(form => form.tags?.includes('regular'))
    
    if (hasIrregular && hasRegular) return 'mixed'
    if (hasIrregular) return 'irregular'
    return 'regular'
  }

  const getRegularityIndicator = (regularity) => {
    switch (regularity) {
      case 'regular': return '✅'
      case 'irregular': return '⚠️'
      case 'mixed': return '🔄'
      default: return ''
    }
  }

  useEffect(() => {
    if (isOpen && word) {
      loadConjugations()
    }
  }, [isOpen, word])

  const { moods, tenses } = getAvailableOptions()

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
            <h2 className="text-lg font-semibold text-white">
              📝 Conjugations: {word?.italian}
            </h2>
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

          {/* Tense Selection */}
          <div className="border-b bg-gray-50 p-4">
            {/* Mood Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood (Modo)
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
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
                ))}
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
                    const regularity = getTenseRegularity(selectedMood, tense)
                    const indicator = getRegularityIndicator(regularity)
                    
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

          {/* Conjugation Display */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conjugations...</p>
              </div>
            ) : conjugations[selectedMood]?.[selectedTense] ? (
              <ConjugationGrid
                conjugations={conjugations[selectedMood][selectedTense]}
                baseWord={word}
                audioPreference={audioPreference}
              />
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

// Simple conjugation grid component (placeholder)
function ConjugationGrid({ conjugations, baseWord, audioPreference }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Showing {conjugations.length} forms 
        ({conjugations.filter(c => c.isVariant).length} calculated variants)
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conjugations.map(conjugation => (
          <div
            key={conjugation.id}
            className={`
              border rounded-lg p-3 transition-all duration-200 hover:shadow-md
              ${conjugation.isVariant 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold text-base">
                    {conjugation.form_text}
                  </h5>
                  {conjugation.isVariant && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded" title="Calculated variant">
                      📊
                    </span>
                  )}
                  {conjugation.tags?.includes('irregular') && (
                    <span className="text-xs bg-orange-200 text-orange-800 px-1 rounded" title="Irregular form">
                      ⚠️
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {conjugation.translation}
                </p>
                {conjugation.isVariant && (
                  <p className="text-blue-600 text-xs mt-1">
                    Variant: {conjugation.variantType} ({conjugation.patternType})
                  </p>
                )}
              </div>
              
              <button
                className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                title="Add to deck"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
