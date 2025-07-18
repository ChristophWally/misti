'use client'

// components/ConjugationModal.js
// REDESIGNED: Complete new layout matching HTML mockup

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AudioButton from './AudioButton'
import SectionHeading from './SectionHeading'
import { VariantCalculator } from '../lib/variant-calculator'

export default function ConjugationModal({ 
  isOpen, 
  onClose, 
  word, 
  userAudioPreference = 'form-only' 
}) {
  const [conjugations, setConjugations] = useState({})
  const [selectedMood, setSelectedMood] = useState('indicativo')
  const [selectedTense, setSelectedTense] = useState('presente')
  const [isLoading, setIsLoading] = useState(false)
  const [audioPreference, setAudioPreference] = useState(userAudioPreference)
  const [selectedGender, setSelectedGender] = useState('male')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Extract tag values from tag array
  const extractTagValue = (tags, category) => {
    if (!tags || !Array.isArray(tags)) return null
    
    if (category === 'mood') {
      const moodTags = ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio']
      return tags.find(tag => moodTags.includes(tag)) || null
    }
    
    if (category === 'tense') {
      const tenseTags = [
        'presente', 'imperfetto', 'passato-prossimo', 'passato-remoto', 
        'trapassato-prossimo', 'trapassato-remoto', 'futuro-semplice', 'futuro-anteriore',
        'congiuntivo-presente', 'congiuntivo-imperfetto', 'congiuntivo-passato', 'congiuntivo-trapassato',
        'condizionale-presente', 'condizionale-passato',
        'imperativo-presente', 'infinito-presente', 'infinito-passato', 
        'participio-presente', 'participio-passato', 'gerundio-presente', 'gerundio-passato',
        'presente-progressivo'
      ]
      return tags.find(tag => tenseTags.includes(tag)) || null
    }
    
    if (category === 'pronoun') {
      const pronounTags = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']
      return tags.find(tag => pronounTags.includes(tag)) || null
    }
    
    return null
  }

  // Group conjugations by mood and tense
  const groupConjugationsByMoodTense = (conjugations) => {
    const grouped = {}
    
    conjugations.forEach((conj) => {
      const mood = extractTagValue(conj.tags, 'mood') || 'indicativo'
      const tense = extractTagValue(conj.tags, 'tense') || 'presente'
      
      if (!grouped[mood]) grouped[mood] = {}
      if (!grouped[mood][tense]) grouped[mood][tense] = []
      
      grouped[mood][tense].push(conj)
    })
    
    return grouped
  }

  // Load conjugations for the selected word
const loadConjugations = async () => {
  setIsLoading(true)
  try {
    console.log('🔍 DEBUG: Starting conjugation query for word:', word.id)
    
    const { data, error } = await supabase
      .from('word_forms')
      .select(`
        *,
        word_audio_metadata!audio_metadata_id(
          audio_filename,
          azure_voice_name,
          duration_seconds
        )
      `)
      .eq('word_id', word.id)
      .eq('form_type', 'conjugation')
      .order('tags')

    console.log('🔍 Raw query result:', { data, error })

    if (error) throw error
    
    // Check what we actually got
    console.log('🔍 First form raw data:', data?.[0])
    console.log('🔍 First form audio_metadata_id:', data?.[0]?.audio_metadata_id)
    console.log('🔍 First form word_audio_metadata:', data?.[0]?.word_audio_metadata)
    
    const processedData = (data || []).map(form => {
      const result = {
        ...form,
        audio_filename: form.word_audio_metadata?.audio_filename || null,
        azure_voice_name: form.word_audio_metadata?.azure_voice_name || null
      }

      console.log('🔍 Processed form:', {
        form_text: form.form_text,
        audio_metadata_id: form.audio_metadata_id,
        word_audio_metadata: form.word_audio_metadata,
        final_audio_filename: result.audio_filename
      })

      return result
    })

    // Generate all forms (stored + calculated variants)
    const allForms = VariantCalculator.getAllForms(processedData, word.tags || [])

    console.log('🔍 All forms (stored + calculated):', allForms.length, 'total forms')
    console.log('🔍 Calculated variants:', allForms.filter(f => f.tags?.includes('calculated-variant')))

    const groupedConjugations = groupConjugationsByMoodTense(allForms)
    setConjugations(groupedConjugations)
    
  } catch (error) {
    console.error('❌ Error loading conjugations:', error)
  } finally {
    setIsLoading(false)
  }
}
  // Get available mood/tense combinations for dropdown
  const getAvailableOptions = () => {
    const options = []
    Object.keys(conjugations).forEach(mood => {
      Object.keys(conjugations[mood]).forEach(tense => {
        const forms = conjugations[mood][tense]
        const hasIrregular = forms.some(form => form.tags?.includes('irregular'))
        const hasRegular = forms.some(form => form.tags?.includes('regular'))
        
        let regularity = '✅'
        if (hasIrregular && hasRegular) regularity = '🔄'
        else if (hasIrregular) regularity = '⚠️'
        
        options.push({
          mood,
          tense,
          regularity,
          count: forms.length,
          displayMood: mood.charAt(0).toUpperCase() + mood.slice(1),
          displayTense: tense.replace('-', ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        })
      })
    })
    return options
  }

  // Get current forms to display
  // Get current forms to display (ONLY base stored forms)
  const getCurrentForms = () => {
    const allForms = conjugations[selectedMood]?.[selectedTense] || []

    // Filter to show ONLY stored forms (not calculated variants)
    const baseStoredForms = allForms.filter(form => !form.tags?.includes('calculated-variant'))

    console.log('🔍 Base stored forms for', selectedMood, selectedTense, ':', baseStoredForms.length, 'forms')
    console.log('🔍 All forms available:', allForms.length, 'total (including calculated)')

    return baseStoredForms
  }

  // Order forms by pronoun sequence
  const orderFormsByPronoun = (forms) => {
    const pronounOrder = ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']
    
    return forms.sort((a, b) => {
      const aPronoun = extractTagValue(a.tags, 'pronoun')
      const bPronoun = extractTagValue(b.tags, 'pronoun')
      
      const aIndex = aPronoun ? pronounOrder.indexOf(aPronoun) : 999
      const bIndex = bPronoun ? pronounOrder.indexOf(bPronoun) : 999
      
      return aIndex - bIndex
    })
  }

  // Handle dropdown selection
  const handleDropdownSelect = (mood, tense) => {
    setSelectedMood(mood)
    setSelectedTense(tense)
    setDropdownOpen(false)
  }

  // Toggle audio preference
  const toggleAudioPreference = () => {
    setAudioPreference(prev => prev === 'form-only' ? 'with-pronoun' : 'form-only')
  }

  // Get display text for current selection
  const getCurrentSelectionText = () => {
    const options = getAvailableOptions()
    const current = options.find(opt => opt.mood === selectedMood && opt.tense === selectedTense)
    return current ? `${current.displayMood} → ${current.displayTense}` : 'Select Conjugation'
  }

  // Check if compound tense
  const isCompoundTense = () => {
    const currentForms = getCurrentForms()
    return currentForms.some(form => form.tags?.includes('compound'))
  }

  // Get pronoun display based on audio preference and gender toggle
  const getPronounDisplay = (form) => {
    const pronoun = extractTagValue(form.tags, 'pronoun')

    // For 3rd person pronouns
    if (pronoun === 'lui' || pronoun === 'lei') {
      // Check if this form has gender variants (ESSERE verbs with compound tenses)
      const hasGenderVariants = word?.tags?.includes('essere-auxiliary') &&
                                form.tags?.includes('compound')

      if (audioPreference === 'form-only') {
        // Form-only mode: show lui/lei for forms without gender variants
        return hasGenderVariants ? (selectedGender === 'male' ? 'lui' : 'lei') : 'lui/lei'
      } else {
        // With-pronoun mode: always show selected gender
        return selectedGender === 'male' ? 'lui' : 'lei'
      }
    }

    // For all other persons, show the base pronoun
    return pronoun || ''
  }

  // Get translation based on audio preference and gender toggle
  const getDynamicTranslation = (form) => {
    const pronoun = extractTagValue(form.tags, 'pronoun')
    let translation = form.translation

    // For 3rd person pronouns
    if (pronoun === 'lui' || pronoun === 'lei') {
      // Check if this form has gender variants
      const hasGenderVariants = word?.tags?.includes('essere-auxiliary') &&
                                form.tags?.includes('compound')

      if (audioPreference === 'form-only' && !hasGenderVariants) {
        // Form-only mode for non-gender-variant forms: show "he/she"
        translation = translation
          .replace(/^he /i, 'he/she ')
          .replace(/^she /i, 'he/she ')
          .replace(/^He /g, 'He/she ')
          .replace(/^She /g, 'He/she ')
      } else if (hasGenderVariants || audioPreference === 'with-pronoun') {
        // Gender-variant forms OR with-pronoun mode: show selected gender
        if (selectedGender === 'male') {
          // Clean up any existing replacements first, then set to "he"
          translation = translation
            .replace(/he\/she /gi, 'he ')
            .replace(/He\/she /g, 'He ')
            .replace(/she /gi, 'he ')
            .replace(/^She /g, 'He ')
        } else {
          // Clean up any existing replacements first, then set to "she"
          translation = translation
            .replace(/he\/she /gi, 'she ')
            .replace(/He\/she /g, 'She ')
            .replace(/he /gi, 'she ')
            .replace(/^He /g, 'She ')
        }
      }
    }

    return translation
  }

  // Get the appropriate form to display based on gender toggle
  const getDisplayForm = (baseForm) => {
    // If masculine gender selected, use base stored form
    if (selectedGender === 'male') {
      return baseForm
    }

    // If feminine gender selected, find the calculated variant
    const allForms = conjugations[selectedMood]?.[selectedTense] || []

    // Find matching calculated variant
    const calculatedVariant = allForms.find(form =>
      form.base_form_id === baseForm.id &&
      form.tags?.includes('calculated-variant') &&
      ((baseForm.tags?.includes('singolare') && form.variant_type === 'fem-sing') ||
       (baseForm.tags?.includes('plurale') && form.variant_type === 'fem-plur'))
    )

    // Return calculated variant if found, otherwise base form
    return calculatedVariant || baseForm
  }

  // Get audio text based on preference
  const getAudioText = (form) => {
    // Determine what form text to use based on gender toggle
    const displayForm = getDisplayForm(form)

    if (audioPreference === 'form-only') {
      return displayForm.form_text
    } else {
      const pronoun = getPronounDisplay(form)
      return `${pronoun} ${displayForm.form_text}`
    }
  }

  // Group forms into singular/plural
  const groupFormsBySingularPlural = (forms) => {
    console.log('🔍 Grouping forms:', forms.length, 'total forms')

    const orderedForms = orderFormsByPronoun(forms)

    const singular = orderedForms.filter(form => {
      const isPersonalSingular = form.tags?.includes('singolare') ||
        extractTagValue(form.tags, 'pronoun') === 'io' ||
        extractTagValue(form.tags, 'pronoun') === 'tu' ||
        extractTagValue(form.tags, 'pronoun') === 'lui' ||
        extractTagValue(form.tags, 'pronoun') === 'lei'

      const isCalculatedSingular = form.variant_type === 'fem-sing'

      return isPersonalSingular || isCalculatedSingular
    })

    const plural = orderedForms.filter(form => {
      const isPersonalPlural = form.tags?.includes('plurale') ||
        extractTagValue(form.tags, 'pronoun') === 'noi' ||
        extractTagValue(form.tags, 'pronoun') === 'voi' ||
        extractTagValue(form.tags, 'pronoun') === 'loro'

      const isCalculatedPlural = form.variant_type === 'fem-plur'

      return isPersonalPlural || isCalculatedPlural
    })

    const other = orderedForms.filter(form =>
      !singular.includes(form) && !plural.includes(form)
    )

    console.log('🔍 Grouped:', singular.length, 'singular,', plural.length, 'plural,', other.length, 'other')

    return { singular, plural, other }
  }

  useEffect(() => {
    if (isOpen && word) {
      loadConjugations()
    }
  }, [isOpen, word])

  useEffect(() => {
    // Set default tense when mood changes
    if (conjugations[selectedMood]) {
      const availableTenses = Object.keys(conjugations[selectedMood])
      if (!availableTenses.includes(selectedTense)) {
        setSelectedTense(availableTenses[0] || 'presente')
      }
    }
  }, [selectedMood, conjugations])

  const availableOptions = getAvailableOptions()
  const currentForms = getCurrentForms()
  const { singular, plural, other } = groupFormsBySingularPlural(currentForms)
  const compound = isCompoundTense()

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
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-teal-500 to-cyan-600">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                📝 Conjugations: {word?.italian}
              </h2>
              {/* Word Tags */}
              <div className="flex gap-1 ml-2">
                {word?.tags?.includes('are-conjugation') && (
                  <span className="text-sm bg-white bg-opacity-20 text-white px-2 py-1 rounded-full font-semibold">
                    🔸 -are
                  </span>
                )}
                {word?.tags?.includes('avere-auxiliary') && (
                  <span className="text-sm bg-white bg-opacity-20 text-white px-2 py-1 rounded-full font-semibold">
                    🤝 avere
                  </span>
                )}
                {word?.tags?.includes('transitive-verb') && (
                  <span className="text-sm bg-white bg-opacity-20 text-white px-2 py-1 rounded-full font-semibold">
                    ➡️ trans
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-cyan-200 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="p-4 border-b bg-gray-50 flex gap-5">
            {/* Left: Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Conjugation
              </label>
              <div className="relative">
                <div 
                  className="p-3 border-2 border-teal-600 bg-white rounded-lg font-semibold text-teal-600 cursor-pointer flex items-center justify-between min-h-12"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>{getCurrentSelectionText()}</span>
                  <span className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                    {/* Group by mood */}
                    {Object.keys(conjugations).map(mood => (
                      <div key={mood} className="border-b border-gray-100 last:border-b-0">
                        <div className="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700 border-b border-gray-200">
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </div>
                        {Object.keys(conjugations[mood]).map(tense => {
                          const option = availableOptions.find(opt => opt.mood === mood && opt.tense === tense)
                          const isSelected = mood === selectedMood && tense === selectedTense
                          
                          return (
                            <div
                              key={`${mood}-${tense}`}
                              className={`px-5 py-2 cursor-pointer text-sm flex items-center gap-2 hover:bg-gray-50 ${
                                isSelected ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600'
                              }`}
                              onClick={() => handleDropdownSelect(mood, tense)}
                            >
                              <span>{option?.regularity}</span>
                              <span>{option?.displayTense}</span>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Audio Controls */}
            <div className="w-48 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Audio Type
                </label>
                <button
                  onClick={toggleAudioPreference}
                  className={`w-full p-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
                    audioPreference === 'form-only' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {audioPreference === 'form-only' ? '📝 Form Only' : '👤 With Pronoun'}
                </button>
              </div>

              {/* Gender Controls - Only for ESSERE verbs */}
              {word?.tags?.includes('essere-auxiliary') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Gender
                  </label>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setSelectedGender('male')}
                      disabled={!currentForms.some(form => form.tags?.includes('compound'))}
                      className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-lg transition-colors ${
                        !currentForms.some(form => form.tags?.includes('compound'))
                          ? 'border-gray-300 text-gray-300 bg-gray-100 cursor-not-allowed'
                          : selectedGender === 'male'
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-blue-500 text-blue-500 bg-white hover:bg-blue-50'
                      }`}
                    >
                      ♂
                    </button>
                    <button
                      onClick={() => setSelectedGender('female')}
                      disabled={!currentForms.some(form => form.tags?.includes('compound'))}
                      className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-lg transition-colors ${
                        !currentForms.some(form => form.tags?.includes('compound'))
                          ? 'border-gray-300 text-gray-300 bg-gray-100 cursor-not-allowed'
                          : selectedGender === 'female'
                              ? 'border-pink-500 bg-pink-500 text-white'
                              : 'border-pink-500 text-pink-500 bg-white hover:bg-pink-50'
                      }`}
                    >
                      ♀
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conjugations...</p>
              </div>
            ) : currentForms.length > 0 ? (
              <div className="space-y-1">
                {/* Singular Section */}
                {singular.length > 0 && (
                  <>
                    <SectionHeading>Singular</SectionHeading>
                    {singular.map(form => {
                      const displayForm = getDisplayForm(form)
                      return (
                        <ConjugationRow
                          key={form.id}
                          form={{ ...displayForm, translation: getDynamicTranslation(displayForm) }}
                          audioText={getAudioText(form)}
                          pronounDisplay={getPronounDisplay(form)}
                          isCompound={compound}
                          selectedGender={selectedGender}
                          audioPreference={audioPreference}
                          wordTags={word?.tags || []}
                        />
                      )
                    })}
                  </>
                )}

                {/* Plural Section */}
                {plural.length > 0 && (
                  <>
                    <SectionHeading className="mt-5">Plural</SectionHeading>
                    {plural.map(form => {
                      const displayForm = getDisplayForm(form)
                      return (
                        <ConjugationRow
                          key={form.id}
                          form={{ ...displayForm, translation: getDynamicTranslation(displayForm) }}
                          audioText={getAudioText(form)}
                          pronounDisplay={getPronounDisplay(form)}
                          isCompound={compound}
                          selectedGender={selectedGender}
                          audioPreference={audioPreference}
                          wordTags={word?.tags || []}
                        />
                      )
                    })}
                  </>
                )}

                {/* Other Forms */}
                {other.length > 0 && (
                  <>
                    <SectionHeading className="mt-5">Other Forms</SectionHeading>
                    {other.map(form => (
                      <ConjugationRow
                        key={form.id}
                        form={form}
                        audioText={getAudioText(form)}
                      pronounDisplay={''}
                      isCompound={compound}
                      selectedGender={selectedGender}
                      audioPreference={audioPreference}
                      wordTags={word?.tags || []}
                    />
                    ))}
                  </>
                )}
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

// Individual conjugation row component
function ConjugationRow({
  form,
  audioText,
  pronounDisplay,
  isCompound,
  selectedGender,
  audioPreference,
  wordTags
}) {
  const isIrregular = form.tags?.includes('irregular')
  const isPlural = form.tags?.includes('plurale') || ['noi', 'voi', 'loro'].includes(pronounDisplay)
  
  // Determine colors based on gender variants and toggle state
  const getColors = () => {
    // Check if this form has gender variants (can change based on gender toggle)
    const hasGenderVariants =
      form.tags?.includes('compound') &&
      (wordTags.includes('essere-auxiliary') || form.base_form_id)

    if (!hasGenderVariants) {
      // No gender variants - always use default color
      return {
        form: 'text-teal-600',
        audio: 'bg-emerald-600'
      }
    }

    // Has gender variants - color based on current display
    if (selectedGender === 'male') {
      return {
        form: isPlural ? 'text-amber-500' : 'text-blue-500',
        audio: isPlural ? 'bg-amber-500' : 'bg-blue-500'
      }
    } else {
      return {
        form: 'text-pink-500',
        audio: 'bg-pink-500'
      }
    }
  }

  const colors = getColors()

  return (
    <div className="flex items-center py-2 px-3 rounded-md hover:bg-gray-50 even:bg-gray-50 even:hover:bg-gray-100 transition-colors min-h-12">
      {/* Pronoun */}
      <div className="w-16 flex-shrink-0 font-bold text-gray-600 text-lg">
        {pronounDisplay}
      </div>
      
      {/* Form */}
      <div className={`w-32 flex-shrink-0 font-bold text-lg ${colors.form} flex items-center gap-1`}>
        {form.form_text}
        {isIrregular && <span className="text-amber-500 text-base">⚠️</span>}
      </div>

      {/* Translation */}
      <div className="flex-1 text-gray-600 text-lg mr-4 ml-4">
        {form.translation}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <AudioButton
          wordId={form.id}
          italianText={audioText}
          audioFilename={form.audio_filename}
          size="lg"
          colorClass={colors.audio}
        />
        <button className="bg-emerald-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg font-semibold hover:bg-emerald-700 transition-colors">
          +
        </button>
      </div>
    </div>
  )
}
