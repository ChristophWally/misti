'use client'

// components/ConjugationModal.js
// ENHANCED: Smooth animations for translation switching

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AudioButton from './AudioButton'
import SectionHeading from './SectionHeading'
import { VariantCalculator } from '../lib/variant-calculator'
import TranslationSelector from './TranslationSelector'

// Desired display order for moods and tenses
const moodOrder = [
  'indicativo',
  'congiuntivo',
  'condizionale',
  'imperativo',
  'infinito',
  'participio',
  'gerundio'
]

const tenseOrderMap = {
  indicativo: [
    'presente',
    'passato-prossimo',
    'imperfetto',
    'trapassato-prossimo',
    'presente-progressivo',
    'passato-progressivo',
    'passato-remoto',
    'trapassato-remoto',
    'futuro-semplice',
    'futuro-anteriore'
  ],
  congiuntivo: [
    'congiuntivo-presente',
    'congiuntivo-passato',
    'congiuntivo-imperfetto',
    'congiuntivo-trapassato'
  ],
  condizionale: [
    'condizionale-presente',
    'condizionale-passato'
  ],
  imperativo: ['imperativo-presente'],
  infinito: ['infinito-presente', 'infinito-passato'],
  participio: ['participio-presente', 'participio-passato'],
  gerundio: ['gerundio-presente', 'gerundio-passato']
}

const sortMoods = moods =>
  moods.sort((a, b) => moodOrder.indexOf(a) - moodOrder.indexOf(b))

const sortTenses = (mood, tenses) => {
  const order = tenseOrderMap[mood] || []
  return tenses.sort((a, b) => {
    const aIdx = order.indexOf(a)
    const bIdx = order.indexOf(b)
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
}

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
  const [selectedFormality, setSelectedFormality] = useState('informal')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedTranslationId, setSelectedTranslationId] = useState(null)
  const [wordTranslations, setWordTranslations] = useState([])
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false)

  // Animation states for translation switching
  const [isTranslationSwitching, setIsTranslationSwitching] = useState(false)
  const [formsVisible, setFormsVisible] = useState(true)

  // Extract tag values from tag array
  const extractTagValue = (tags, category) => {
    if (!tags || !Array.isArray(tags)) return null
    
    if (category === 'mood') {
      const moodTags = ['indicativo', 'congiuntivo', 'condizionale', 'imperativo', 'infinito', 'participio', 'gerundio']
      return tags.find(tag => moodTags.includes(tag)) || null
    }
    
    if (category === 'tense') {
      const tenseTags = [
        'presente',
        'passato-prossimo',
        'imperfetto',
        'trapassato-prossimo',
        'presente-progressivo',
        'passato-progressivo',
        'passato-remoto',
        'trapassato-remoto',
        'futuro-semplice',
        'futuro-anteriore',
        'congiuntivo-presente',
        'congiuntivo-passato',
        'congiuntivo-imperfetto',
        'congiuntivo-trapassato',
        'condizionale-presente',
        'condizionale-passato',
        'imperativo-presente',
        'infinito-presente',
        'infinito-passato',
        'participio-presente',
        'participio-passato',
        'gerundio-presente',
        'gerundio-passato'
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
    
    const { data, error } = await supabase
      .from('word_forms')
      .select(`
        *,
        word_audio_metadata!audio_metadata_id(
          audio_filename,
          azure_voice_name,
          duration_seconds
        ),
        form_translations (
          word_translation_id,
          translation,
          assignment_method,
          word_translations (
            id,
            translation
          )
        )
      `)
      .eq('word_id', word.id)
      .eq('form_type', 'conjugation')
      .order('tags')


    if (error) throw error
    
    
    const processedData = (data || []).map(form => {
      const result = {
        ...form,
        audio_filename: form.word_audio_metadata?.audio_filename || null,
        azure_voice_name: form.word_audio_metadata?.azure_voice_name || null,
        form_translations: (form.form_translations || []).map(ft => ({
          word_translation_id: ft.word_translation_id,
          translation: ft.translation,
          assignment_method: ft.assignment_method,
          word_translation: ft.word_translations || null
        }))
      }

      return result
    })

    // Generate all forms (stored + calculated variants)
    const allForms = VariantCalculator.getAllForms(processedData, word.tags || [])


    const groupedConjugations = groupConjugationsByMoodTense(allForms)
    setConjugations(groupedConjugations)
    
  } catch (error) {
    console.error('❌ Error loading conjugations:', error)
  } finally {
    setIsLoading(false)
  }
}

  // Load all translations for the current word
const loadWordTranslations = async () => {
  if (!word?.id) return

  setIsLoadingTranslations(true)
  try {
    const { data: translations, error } = await supabase
      .from('word_translations')
      .select(`
        id,
        translation,
        display_priority,
        context_metadata,
        usage_notes,
        frequency_estimate
      `)
      .eq('word_id', word.id)
      .order('display_priority')

    if (error) throw error

    setWordTranslations(translations)

    // Set default selection to primary translation
    if (translations.length > 0 && !selectedTranslationId) {
      const primary = translations.find(t => t.display_priority === 1) || translations[0]
      setSelectedTranslationId(primary.id)
    }

  } catch (error) {
    console.error('Error loading word translations:', error)
    setWordTranslations([])
  } finally {
    setIsLoadingTranslations(false)
  }
}
  // Get available mood/tense combinations for dropdown
  const getAvailableOptions = () => {
    const options = []
    sortMoods(Object.keys(conjugations)).forEach(mood => {
      sortTenses(mood, Object.keys(conjugations[mood])).forEach(tense => {
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

  // Get current forms to display (ONLY base stored forms)
  const getCurrentForms = () => {
    const allForms = conjugations[selectedMood]?.[selectedTense] || []

    // Filter to show ONLY stored forms (not calculated variants)
    const baseStoredForms = allForms.filter(form => !form.tags?.includes('calculated-variant'))

    return baseStoredForms
  }

  // Filter forms to those relevant for the selected translation
  const getFormsForSelectedTranslation = () => {
    const baseForms = getCurrentForms()
    console.log(`🔍 Step 1: Base forms for ${selectedMood}/${selectedTense}:`, baseForms.length)
    console.log('🔍 DEBUG: Selected translation ID:', selectedTranslationId)

    if (!selectedTranslationId) {
      console.log('⚠️ No translation selected, showing all forms')
      return baseForms
    }

    // Filter forms that have assignments for the selected translation
    const translationFilteredForms = baseForms.filter(form => {
      const hasAssignment = form.form_translations?.some(
        assignment => assignment.word_translation_id === selectedTranslationId
      )
      return hasAssignment
    })

    console.log('✅ Translation filtered forms:', translationFilteredForms.length)

    // Return only the base forms. Gender variants are applied dynamically
    return translationFilteredForms
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
    if (mood === selectedMood && tense === selectedTense) {
      setDropdownOpen(false)
      return
    }

    setSelectedMood(mood)
    setSelectedTense(tense)
    setDropdownOpen(false)
  }

  // Toggle audio preference with animation
  const toggleAudioPreference = () => {
    // Add a slight animation delay for visual feedback
    setAudioPreference(prev => prev === 'form-only' ? 'with-pronoun' : 'form-only')
  }

  // Enhanced gender toggle with animation
  const handleGenderToggle = () => {
    console.log('🎭 Gender toggle clicked')
    setSelectedGender(prev => (prev === 'male' ? 'female' : 'male'))
  }

  // Enhanced formality toggle with animation
  const handleFormalityToggle = () => {
    setSelectedFormality(prev => prev === 'formal' ? 'informal' : 'formal')
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
    return currentForms.some(form =>
      form.tags?.includes('compound') &&
      !form.tags?.includes('presente-progressivo') &&
      !form.tags?.includes('passato-progressivo')
    )
  }

  // Check if the CURRENT translation actually changes with gender toggle
  const hasGenderVariantsInCurrentMoodTense = () => {
    const formsForTranslation = getFormsForSelectedTranslation()

    // Look for any form that would change either the verb itself or the
    // accompanying pronoun when switching genders
    const hasChanges = formsForTranslation.some((form) => {
      const pronoun = extractTagValue(form.tags, 'pronoun')

      // Verb text changes only for essere compound tenses
      const verbChanges =
        word?.tags?.includes('essere-auxiliary') &&
        form.tags?.includes('compound') &&
        !form.tags?.includes('presente-progressivo') &&
        !form.tags?.includes('passato-progressivo')

      // Pronoun changes matter for ANY verb when audio includes pronouns
      const pronounChanges =
        (pronoun === 'lui' || pronoun === 'lei') &&
        audioPreference === 'with-pronoun'

      if (verbChanges) return true
      if (pronounChanges) return true
      return false
    })

    console.log(
      '🎭 Checking if gender variants available for current translation in',
      selectedMood,
      selectedTense,
      'Audio preference:',
      audioPreference,
      'Has changes:',
      hasChanges
    )

    return hasChanges
  }

  // Get pronoun display based on audio preference and gender toggle
  const getPronounDisplay = (form) => {
    const pronoun = extractTagValue(form.tags, 'pronoun')

    // Handle formality first
    if (selectedFormality === 'formal') {
      if (pronoun === 'tu') return 'Lei'
      if (pronoun === 'voi') return 'Loro'
    }

    // For 3rd person pronouns
    if (pronoun === 'lui' || pronoun === 'lei') {
      // Check if this form has gender variants (ESSERE verbs with compound tenses)
      const hasGenderVariants =
        word?.tags?.includes('essere-auxiliary') &&
        form.tags?.includes('compound') &&
        !form.tags?.includes('presente-progressivo') &&
        !form.tags?.includes('passato-progressivo')

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

  // Lookup translation text for the currently selected meaning
  const getTranslationForSelectedTranslation = (form) => {
    console.log('🔍 Looking up translation for form:', form.form_text, 'Selected translation ID:', selectedTranslationId)
    console.log('📋 Form translation assignments:', form.form_translations?.map(ft => ({
      id: ft.word_translation_id,
      translation: ft.word_translation?.translation || ft.translation,
      method: ft.assignment_method
    })))

    const assignment = form.form_translations?.find(
      (ft) => ft.word_translation_id === selectedTranslationId
    )

    const result = assignment?.translation || assignment?.word_translation?.translation || form.translation
    console.log('✅ Selected translation result:', result)
    return result
  }

  // Get translation - USE ORIGINAL TRANSLATION for formal contexts
  const getDynamicTranslation = (displayForm, originalForm) => {
    console.log('🔍 STEP 2: Getting dynamic translation for:', displayForm.form_text, 'Original:', originalForm.form_text)

    // For formal contexts, always use the ORIGINAL form's translation
    if (selectedFormality === 'formal') {
      const originalPronoun = extractTagValue(originalForm.tags, 'pronoun')
      if (originalPronoun === 'tu' || originalPronoun === 'voi') {
        const formalTranslation = getTranslationForSelectedTranslation(originalForm)
        console.log('👑 Using formal translation:', formalTranslation)
        return formalTranslation
      }
    }

    // For non-formal contexts, use the DISPLAY FORM for translation lookup
    const pronoun = extractTagValue(displayForm.tags, 'pronoun')

    // Translation text for the currently selected meaning from the DISPLAY FORM
    let translation = getTranslationForSelectedTranslation(displayForm)
    console.log('🎯 Base translation from display form:', translation)

    // Only modify gendered wording for 3rd person
    if (pronoun !== 'lui' && pronoun !== 'lei') {
      console.log('➡️ Non-3rd person, returning as-is:', translation)
      return translation
    }
    const hasGenderVariants =
      word?.tags?.includes('essere-auxiliary') &&
      displayForm.tags?.includes('compound') &&
      !displayForm.tags?.includes('presente-progressivo') &&
      !displayForm.tags?.includes('passato-progressivo')

    if (audioPreference === 'form-only' && !hasGenderVariants) {
      console.log('📝 Form-only mode, no gender variants:', translation)
      return translation
    } else if (hasGenderVariants || audioPreference === 'with-pronoun') {
      console.log('🎭 Applying gender-specific wording for:', selectedGender)
      if (selectedGender === 'male') {
        translation = translation
          .replace(/\bhe\/she\b/gi, 'he')
          .replace(/^He\/she\b/, 'He')
          .replace(/\bhimself\/herself\b/gi, 'himself')
          .replace(/^Himself\/herself\b/, 'Himself')
      } else {
        translation = translation
          .replace(/\bhe\/she\b/gi, 'she')
          .replace(/^He\/she\b/, 'She')
          .replace(/\bhimself\/herself\b/gi, 'herself')
          .replace(/^Himself\/herself\b/, 'Herself')
      }
      console.log('✨ Final gendered translation:', translation)
    }

    return translation
  }

  // Get the appropriate form to display based on gender toggle
  const getDisplayForm = (baseForm) => {
    console.log('🎭 STEP 2 FIXED: Getting display form for gender:', selectedGender, 'Form:', baseForm.form_text)
    // If masculine gender selected, use base stored form
    if (selectedGender === 'male') {
      console.log('✅ Using masculine base form:', baseForm.form_text)
      return baseForm
    }

    // If feminine gender selected, find the calculated variant
    const allFormsForMoodTense = conjugations[selectedMood]?.[selectedTense] || []

    // Find matching calculated variant that was generated from this base form
    const calculatedVariant = allFormsForMoodTense.find(form =>
      form.base_form_id === baseForm.id &&
      form.tags?.includes('calculated-variant') &&
      ((baseForm.tags?.includes('singolare') && form.variant_type === 'fem-sing') ||
       (baseForm.tags?.includes('plurale') && form.variant_type === 'fem-plur'))
    )

    if (calculatedVariant) {
      console.log('✅ Found feminine variant:', calculatedVariant.form_text, 'with translation assignments:', calculatedVariant.form_translations?.length)
      return calculatedVariant
    }

    console.log('⚠️ No feminine variant found, using base form:', baseForm.form_text)
    return baseForm
  }

  // Get the appropriate form to display based on gender toggle AND formality
  const getDisplayFormWithFormality = (baseForm) => {
    const pronoun = extractTagValue(baseForm.tags, 'pronoun')

    // Handle formality mapping first
    if (selectedFormality === 'formal') {
      // Map 2nd person to 3rd person forms when formal
      if (pronoun === 'tu') {
        const allForms = conjugations[selectedMood]?.[selectedTense] || []
        const thirdPersonForm = allForms.find(
          (form) =>
            !form.tags?.includes('calculated-variant') &&
            (extractTagValue(form.tags, 'pronoun') === 'lui' ||
              extractTagValue(form.tags, 'pronoun') === 'lei')
        )
        if (thirdPersonForm) {
          return getDisplayForm(thirdPersonForm)
        }
      }

      if (pronoun === 'voi') {
        const allForms = conjugations[selectedMood]?.[selectedTense] || []
        const thirdPersonPluralForm = allForms.find(
          (form) =>
            !form.tags?.includes('calculated-variant') &&
            extractTagValue(form.tags, 'pronoun') === 'loro'
        )
        if (thirdPersonPluralForm) {
          return getDisplayForm(thirdPersonPluralForm)
        }
      }
    }

    // For informal or non-2nd-person forms, use normal gender logic
    return getDisplayForm(baseForm)
  }

  // Get audio text based on preference
  const getAudioText = (form) => {
    // Determine what form text to use based on gender and formality toggles
    const displayForm = getDisplayFormWithFormality(form)

    if (audioPreference === 'form-only') {
      return displayForm.form_text
    } else {
      const pronoun = getPronounDisplay(form)
      return `${pronoun} ${displayForm.form_text}`
    }
  }

  // Group forms into singular/plural
  const groupFormsBySingularPlural = (forms) => {

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

    return { singular, plural, other }
  }

  // Handle translation change with fade animation
  const handleTranslationChange = (newTranslationId) => {
    if (newTranslationId === selectedTranslationId) return

    setIsTranslationSwitching(true)
    setFormsVisible(false)

    setTimeout(() => {
      setSelectedTranslationId(newTranslationId)

      setTimeout(() => {
        setFormsVisible(true)
        setIsTranslationSwitching(false)
      }, 50)
    }, 150)
  }

  // Render conjugation forms with filtering and helpful messages
  const renderConjugationForms = () => {
    const currentForms = getFormsForSelectedTranslation()
    console.log('🎭 RENDER: Current forms count:', currentForms.length, 'Selected gender:', selectedGender)

    if (currentForms.length === 0) {
      const selectedTranslation = wordTranslations.find(t => t.id === selectedTranslationId)
      const translationName = selectedTranslation?.translation || 'this translation'

      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">
            No forms available for "{translationName}" in {selectedMood} {selectedTense}.
          </p>
          <p className="text-sm text-gray-400">
            Try selecting a different translation or changing the mood/tense.
          </p>
        </div>
      )
    }

    const { singular, plural, other } = groupFormsBySingularPlural(currentForms)
    const compound = isCompoundTense()

    console.log('🎭 RENDER: Singular forms:', singular.length, 'Plural forms:', plural.length)
    console.log('🎭 RENDER: Is compound tense:', compound)

    return (
      <div className={`space-y-1 transition-all duration-300 ease-in-out ${
        formsVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
      }`}>
        {/* Singular Section */}
        {singular.length > 0 && (
          <>
            <SectionHeading>Singular</SectionHeading>
            {singular.map(form => {
              console.log('🎭 RENDER SINGULAR: Base form:', form.form_text, 'Gender:', selectedGender)
              const displayForm = getDisplayFormWithFormality(form)
              console.log('🎭 RENDER SINGULAR: Display form:', displayForm.form_text)
              return (
                <ConjugationRow
                  key={form.id}
                  form={{ ...displayForm, translation: getDynamicTranslation(displayForm, form) }}
                  audioText={getAudioText(form)}
                  pronounDisplay={getPronounDisplay(form)}
                  isCompound={compound}
                  selectedGender={selectedGender}
                  audioPreference={audioPreference}
                  wordTags={word?.tags || []}
                  selectedFormality={selectedFormality}
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
              console.log('🎭 RENDER PLURAL: Base form:', form.form_text, 'Gender:', selectedGender)
              const displayForm = getDisplayFormWithFormality(form)
              console.log('🎭 RENDER PLURAL: Display form:', displayForm.form_text)
              return (
                <ConjugationRow
                  key={form.id}
                  form={{ ...displayForm, translation: getDynamicTranslation(displayForm, form) }}
                  audioText={getAudioText(form)}
                  pronounDisplay={getPronounDisplay(form)}
                  isCompound={compound}
                  selectedGender={selectedGender}
                  audioPreference={audioPreference}
                  wordTags={word?.tags || []}
                  selectedFormality={selectedFormality}
                />
              )
            })}
          </>
        )}

        {/* Other Forms */}
        {other.length > 0 && (
          <>
            <SectionHeading className="mt-5">Other Forms</SectionHeading>
            {other.map(form => {
              const displayForm = getDisplayFormWithFormality(form)
              return (
                <ConjugationRow
                  key={form.id}
                  form={{ ...displayForm, translation: getDynamicTranslation(displayForm, form) }}
                  audioText={getAudioText(form)}
                  pronounDisplay={getPronounDisplay(form)}
                  isCompound={compound}
                  selectedGender={selectedGender}
                  audioPreference={audioPreference}
                  wordTags={word?.tags || []}
                  selectedFormality={selectedFormality}
                />
              )
            })}
          </>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (isOpen && word) {
      loadConjugations()
      loadWordTranslations()
    }
  }, [isOpen, word])

  useEffect(() => {
    // Set default tense when mood changes
    if (conjugations[selectedMood]) {
      const availableTenses = sortTenses(
        selectedMood,
        Object.keys(conjugations[selectedMood])
      )
      if (!availableTenses.includes(selectedTense)) {
        setSelectedTense(availableTenses[0] || 'presente')
      }
    }
  }, [selectedMood, conjugations])

  useEffect(() => {
    console.log('🎭 STEP 2: Gender changed to:', selectedGender)
  }, [selectedGender])

  const availableOptions = getAvailableOptions()
  const currentForms = getFormsForSelectedTranslation()

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
              className="text-white hover:text-cyan-200 text-xl transition-colors duration-200"
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
                  className="p-3 border-2 border-teal-600 bg-white rounded-lg font-semibold text-teal-600 cursor-pointer flex items-center justify-between min-h-12 transition-all duration-200 hover:border-teal-700 hover:shadow-md active:scale-[0.98]"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="transition-colors duration-200">{getCurrentSelectionText()}</span>
                  <span
                    className={`transform transition-all duration-300 ease-out ${
                      /* Closed → arrow points right, open ↓ */
                      dropdownOpen ? 'rotate-0' : 'rotate-90'
                    }`}
                  >
                    ▼
                  </span>
                </div>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto origin-top animate-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out">
                    {/* Group by mood */}
                      {sortMoods(Object.keys(conjugations)).map((mood, moodIndex) => (
                        <div key={mood} className="border-b border-gray-100 last:border-b-0">
                          <div className={`px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700 border-b border-gray-200 transition-colors duration-200 hover:bg-gray-100`}>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </div>
                          {sortTenses(mood, Object.keys(conjugations[mood])).map((tense) => {
                            const option = availableOptions.find(opt => opt.mood === mood && opt.tense === tense)
                            const isSelected = mood === selectedMood && tense === selectedTense
                          
                          return (
                            <div
                              key={`${mood}-${tense}`}
                              className={`px-5 py-3 cursor-pointer text-sm flex items-center gap-3 transition-all duration-200 hover:bg-gray-50 hover:transform hover:translate-x-1 active:bg-gray-100 ${
                                isSelected ? 'bg-green-50 text-green-700 font-semibold border-l-4 border-green-500' : 'text-gray-600'
                              }`}
                              onClick={() => handleDropdownSelect(mood, tense)}
                            >
                              <span className="text-lg transition-transform duration-200 hover:scale-110">{option?.regularity}</span>
                              <span className="transition-all duration-200">{option?.displayTense}</span>
                              {isSelected && (
                                <span className="ml-auto text-green-600">✓</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audio and Pronoun/Formality Controls */}
            <div className="w-48 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Audio Type</label>
                <button
                  onClick={toggleAudioPreference}
                  className={`w-full p-2 border border-gray-300 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-md active:scale-[0.98] transform hover:scale-105 ${
                    audioPreference === 'form-only' ? 'bg-teal-600 text-white shadow-lg' : 'bg-teal-600 text-white shadow-lg'
                  }`}
                >
                  <span className="transition-all duration-200">
                    {audioPreference === 'form-only' ? '📝 Form Only' : '👤 With Pronoun'}
                  </span>
                </button>
              </div>

              <div className="flex gap-2">
                {/* Formality Controls */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Formality</label>
                  <div className="flex justify-center">
                    <button
                      onClick={handleFormalityToggle}
                      className={`w-full h-10 border-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg active:scale-95 transform hover:scale-105 ${
                        selectedFormality === 'formal'
                          ? 'border-purple-500 bg-purple-500 text-white shadow-md'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-purple-300'
                      }`}
                      title={
                        selectedFormality === 'formal'
                          ? 'Formal (Lei/Loro) - Click for informal'
                          : 'Informal (tu/voi) - Click for formal'
                      }
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="drop-shadow-sm transition-all duration-300 hover:scale-110"
                      >
                        {/* British Royal Crown SVG */}
                        {/* Crown base band */}
                        <ellipse cx="12" cy="19" rx="10" ry="2" />

                        {/* Main crown body */}
                        <path d="M3 17h18l-1-8H4l-1 8z" />

                        {/* Crown points/peaks */}
                        <path d="M6 9l1-3 2 2 3-4 3 4 2-2 1 3" />

                        {/* Center arch */}
                        <path d="M8 9c0-2 1.5-3 4-3s4 1 4 3" strokeWidth="0.5" stroke="currentColor" fill="none" />

                        {/* Side arches */}
                        <path d="M4 12c2-1 4-1 6 0" strokeWidth="0.5" stroke="currentColor" fill="none" />
                        <path d="M14 12c2-1 4-1 6 0" strokeWidth="0.5" stroke="currentColor" fill="none" />

                        {/* Crown jewels */}
                        <circle cx="12" cy="8" r="1" opacity="0.8" />
                        <circle cx="7" cy="10" r="0.5" opacity="0.6" />
                        <circle cx="17" cy="10" r="0.5" opacity="0.6" />

                        {/* Cross on top */}
                        <path d="M11.5 5h1v3h-1z" />
                        <path d="M10.5 6h3v1h-3z" />

                        {/* Royal orb */}
                        <circle cx="12" cy="4" r="1.5" opacity="0.9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Gender Controls */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <div className="flex justify-center">
                    <button
                      onClick={handleGenderToggle}
                      disabled={!hasGenderVariantsInCurrentMoodTense()}
                      className={`w-full h-10 border-2 rounded-lg flex items-center justify-center text-lg transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 transform hover:scale-105 ${
                        !hasGenderVariantsInCurrentMoodTense()
                          ? 'border-gray-300 text-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                          : selectedGender === 'male'
                              ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 shadow-blue-200'
                              : 'border-pink-500 bg-pink-500 text-white hover:bg-pink-600 hover:border-pink-600 shadow-pink-200'
                      }`}
                      title={
                        !hasGenderVariantsInCurrentMoodTense()
                          ? 'Gender variants not available for this selection'
                          : selectedGender === 'male'
                              ? 'Switch to feminine'
                              : 'Switch to masculine'
                      }
                    >
                      <span className={`transition-all duration-300 ${
                        hasGenderVariantsInCurrentMoodTense() ? 'hover:scale-125' : ''
                      }`}>
                        {selectedGender === 'male' ? '♂' : '♀'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Translation Selector - only show if multiple translations exist */}
          {wordTranslations.length > 1 && (
            <div className="p-4 border-b bg-blue-50">
              <TranslationSelector
                translations={wordTranslations}
                selectedTranslationId={selectedTranslationId}
                onTranslationChange={handleTranslationChange}
              />
            </div>
          )}

          {/* Content with loading overlay */}
          <div className="flex-1 overflow-y-auto p-5 relative">
            {isTranslationSwitching && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                  <span className="text-teal-600 font-medium">Switching translation...</span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conjugations...</p>
              </div>
            ) : (
              renderConjugationForms()
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
  wordTags,
  selectedFormality
}) {
  const isIrregular = form.tags?.includes('irregular')
  const isPlural = form.tags?.includes('plurale') || ['noi', 'voi', 'loro'].includes(pronounDisplay)
  
  // Determine colors based on gender variants, toggle state, AND formality
  const getColors = () => {
    // Extract pronoun directly from tags
    const pronoun = form.tags?.find(tag =>
      ['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro'].includes(tag)
    )

    // Check if this form has actual gender variants in the verb form itself
    const hasVerbGenderVariants =
      form.tags?.includes('compound') &&
      !form.tags?.includes('presente-progressivo') &&
      !form.tags?.includes('passato-progressivo') &&
      (wordTags?.includes('essere-auxiliary') || form.base_form_id)

    // Check if this is a 3rd person form that changes pronouns
    const isThirdPerson =
      form.tags?.includes('lui') ||
      form.tags?.includes('lei') ||
      pronoun === 'lui' ||
      pronoun === 'lei'

    // CORRECT: Determine formal context based on displayed pronoun
    const isFormalContext = pronounDisplay === 'Lei' || pronounDisplay === 'Loro'

    // FORMAL CONTEXTS get purple color
    if (isFormalContext) {
      return {
        form: 'text-purple-600',
        audio: 'bg-purple-600'
      }
    }

    if (audioPreference === 'form-only') {
      if (hasVerbGenderVariants) {
        // Form-only + compound: verb form changes, use gender colors
        return {
          form:
            selectedGender === 'male'
              ? isPlural
                ? 'text-amber-500'
                : 'text-blue-500'
              : 'text-pink-500',
          audio:
            selectedGender === 'male'
              ? isPlural
                ? 'bg-amber-500'
                : 'bg-blue-500'
              : 'bg-pink-500'
        }
      }

      // Form-only + simple: no changes, default color
      return {
        form: 'text-teal-600',
        audio: 'bg-emerald-600'
      }
    } else {
      // With-pronoun mode
      if (hasVerbGenderVariants) {
        // Compound: both pronoun and verb change
        return {
          form:
            selectedGender === 'male'
              ? isPlural
                ? 'text-amber-500'
                : 'text-blue-500'
              : 'text-pink-500',
          audio:
            selectedGender === 'male'
              ? isPlural
                ? 'bg-amber-500'
                : 'bg-blue-500'
              : 'bg-pink-500'
        }
      } else if (isThirdPerson) {
        // Simple + 3rd person: only pronoun changes
        return {
          form: selectedGender === 'male' ? 'text-blue-500' : 'text-pink-500',
          audio: selectedGender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
        }
      }

      // Simple + 1st/2nd person: no changes
      return {
        form: 'text-teal-600',
        audio: 'bg-emerald-600'
      }
    }
  }

  const colors = getColors()

  return (
    <div className="py-1 px-2 sm:py-2 sm:px-3 rounded-md hover:bg-gray-50 even:bg-gray-50 even:hover:bg-gray-100 transition-all duration-200">
      <div className="flex items-center min-h-10 sm:min-h-12">
        {/* Pronoun */}
        <div className="w-12 sm:w-16 flex-shrink-0 font-bold text-gray-600 text-base sm:text-lg">
          {pronounDisplay}
        </div>

        {/* Form */}
        <div className={`w-28 sm:w-32 flex-shrink-0 font-bold text-base sm:text-lg ${colors.form} flex items-center gap-1 transition-colors duration-200`}>
          {form.form_text}
          {isIrregular && <span className="text-amber-500 text-sm sm:text-base">⚠️</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <AudioButton
            wordId={form.id}
            italianText={audioText}
            audioFilename={form.audio_filename}
            size="lg"
            colorClass={colors.audio}
          />
          <button className="bg-emerald-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg font-semibold hover:bg-emerald-700 transition-all duration-200 hover:shadow-md active:transform active:scale-95">
            +
          </button>
        </div>
      </div>
      {/* Translation */}
      <div className="text-gray-600 text-base sm:text-lg ml-12 sm:ml-16 mt-1 transition-colors duration-200">
        {form.translation}
      </div>
    </div>
  )
}
