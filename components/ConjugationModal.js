'use client'

// components/ConjugationModal.js
// ENHANCED: Smooth animations for translation switching

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AudioButton from './AudioButton'
import SectionHeading from './SectionHeading'
import { VariantCalculator, calculateVariants } from '../lib/variant-calculator'
import TranslationSelector from './TranslationSelector'
import { AuxiliaryPatternService } from '../lib/auxiliary-pattern-service'
import {
  deriveWordTagsFromTranslations,
  hydrateCanonicalWordBundle,
} from '../lib/dictionary-bundle-compat'

// Helper utilities for dynamic compound generation
const mascEnding = (aux, isPlural) =>
  aux === 'essere' ? (isPlural ? 'i' : 'o') : 'o'

const buildPastParticiple = (base, aux, number) => {
  if (!base.endsWith('o')) return base
  const root = base.slice(0, -1)
  return root + mascEnding(aux, number === 'plurale')
}

// Desired display order for moods and tenses
const moodOrder = [
  'indicativo',
  'indicativo-negativo',
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
    'presente-progressivo',
    'imperfetto',
    'passato-progressivo',
    'passato-prossimo',
    'trapassato-prossimo',
    'passato-remoto',
    'trapassato-remoto',
    'futuro-semplice',
    'futuro-progressivo',
    'futuro-anteriore'
  ],
  'indicativo-negativo': [
    'presente',
    'presente-progressivo',
    'imperfetto',
    'passato-progressivo',
    'passato-prossimo',
    'trapassato-prossimo',
    'passato-remoto',
    'trapassato-remoto',
    'futuro-semplice',
    'futuro-progressivo',
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
  imperativo: ['imperativo-presente', 'imperativo-negativo'],
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
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [selectedTranslationId, setSelectedTranslationId] = useState(null)
  const [wordTranslations, setWordTranslations] = useState([])
  const [storedForms, setStoredForms] = useState([])
  const [resolvedWord, setResolvedWord] = useState(word)
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false)
  const [auxiliaryService] = useState(() => new AuxiliaryPatternService(supabase))

  // Quick scratch/erase animation state to fade forms out and back in
  const [isContentChanging, setIsContentChanging] = useState(false)
  const activeWord = resolvedWord || word

  // Extract tag values from tag array
  const extractTagValue = (tags, category) => {
    if (!tags || !Array.isArray(tags)) return null
    
    if (category === 'mood') {
      const moodTags = [
        'indicativo',
        'indicativo-negativo',
        'congiuntivo',
        'condizionale',
        'imperativo',
        'infinito',
        'participio',
        'gerundio'
      ]
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
        'futuro-progressivo',
        'congiuntivo-presente',
        'congiuntivo-passato',
        'congiuntivo-imperfetto',
        'congiuntivo-trapassato',
        'condizionale-presente',
        'condizionale-passato',
        'imperativo-presente',
        'imperativo-negativo',
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

    if (category === 'person') {
      const personTags = ['prima-persona', 'seconda-persona', 'terza-persona']
      return tags.find(tag => personTags.includes(tag)) || null
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

  // Get auxiliary type for selected translation
  const getAuxiliaryForTranslation = (translationId) => {
    if (!translationId) return 'avere'

    const translation = wordTranslations.find(t => t.id === translationId)
    const auxiliary = translation?.context_metadata?.auxiliary

    console.log('🔍 Auxiliary lookup:', {
      translationId,
      translation: translation?.translation,
      auxiliary,
      metadata: translation?.context_metadata
    })

    return auxiliary || 'avere'
  }

  const loadWordBundle = async () => {
    if (!activeWord?.id) return

    setIsLoading(true)
    setIsLoadingTranslations(true)
    try {
      const { data, error } = await supabase.rpc('app_get_word_bundle', {
        p_word_id: activeWord.id,
      })

      if (error) throw error

      const rawBundle = Array.isArray(data) ? data[0] : data
      const bundle = hydrateCanonicalWordBundle(rawBundle || {}, activeWord)
      const hydratedTranslations = bundle.translations || []
      const hydratedWord = bundle.word || activeWord
      const mergedWordTags = Array.from(
        new Set([
          ...(hydratedWord.tags || []),
          ...deriveWordTagsFromTranslations(hydratedTranslations),
        ])
      )
      const hydratedForms = (bundle?.forms || [])
        .filter((form) => form.form_type === 'conjugation')

      setResolvedWord({
        ...hydratedWord,
        tags: mergedWordTags,
      })
      setWordTranslations(hydratedTranslations)
      setStoredForms(hydratedForms)

      setSelectedTranslationId((currentSelected) => {
        if (currentSelected && hydratedTranslations.some((translation) => translation.id === currentSelected)) {
          return currentSelected
        }

        const primary = hydratedTranslations.find((translation) => translation.display_priority === 1) || hydratedTranslations[0]
        return primary?.id || null
      })
    } catch (error) {
      console.error('Error loading word bundle:', error)
      setWordTranslations([])
      setStoredForms([])
      setResolvedWord(activeWord)
    } finally {
      setIsLoading(false)
      setIsLoadingTranslations(false)
    }
  }

  // Load conjugations for the selected word
const loadConjugations = async () => {
  setIsLoading(true)
  try {
    console.log('🔄 Loading conjugations for:', activeWord?.italian)
    console.log('🔍 DIAGNOSTIC: selectedTranslationId:', selectedTranslationId)
    console.log('🔍 DIAGNOSTIC: wordTranslations length:', wordTranslations.length)
    const processedData = storedForms || []

    console.log('📊 Raw forms loaded:', processedData.length)

    // STEP 1: Start with stored forms + calculated variants (NO dynamic compounds yet)
    let allForms = VariantCalculator.getAllForms(processedData, activeWord?.tags || [])
    console.log('✅ Base forms (stored + variants):', allForms.length)

    // STEP 2: Generate dynamic compounds ONLY if translation is selected
    if (selectedTranslationId && wordTranslations.length > 0) {
      console.log('🚀 Generating dynamic compounds for translation:', selectedTranslationId)

      // CRITICAL FIX: Ensure we use the CURRENT selectedTranslationId
      const currentAuxiliary = getAuxiliaryForTranslation(selectedTranslationId)
      console.log('🎯 Current auxiliary for generation:', currentAuxiliary)

      const dynamicCompounds = await generateDynamicCompounds(processedData, currentAuxiliary)

      if (dynamicCompounds && dynamicCompounds.length > 0) {
        // CRITICAL FIX: Clear any old generated forms before adding new ones
        allForms = allForms.filter(form => !form.is_generated)

        const withVariants = dynamicCompounds.flatMap(f =>
          f.tags?.includes('compound')
            ? [f, ...calculateVariants(f)]
            : [f]
        )

        allForms = [...allForms, ...withVariants]
        console.log('✨ Dynamic compounds generated:', dynamicCompounds.length)
        console.log('🎯 Total forms after generation:', allForms.length)
      }
    } else {
      console.log('⚠️ Skipping dynamic generation - translation not selected or no translations loaded')
    }

    const groupedConjugations = groupConjugationsByMoodTense(allForms)
    setConjugations(groupedConjugations)

  } catch (error) {
    console.error('❌ Error loading conjugations:', error)
  } finally {
    setIsLoading(false)
  }
}

  // Generate dynamic compound forms based on selected translation
  const generateDynamicCompounds = async (storedForms, auxiliaryType) => {
    console.log('🔧 generateDynamicCompounds called with auxiliary:', auxiliaryType)

    // Find clean building blocks (not person-specific compound forms)
    const participle = storedForms.find(f =>
      f.tags?.includes('participio-passato') &&
      f.tags?.includes('simple') &&
      !f.tags?.includes('io') &&
      !f.tags?.includes('tu') &&
      !f.tags?.includes('lui')
    )
    const gerund = storedForms.find(f =>
      f.tags?.includes('gerundio-presente') &&
      f.tags?.includes('simple') &&
      !f.tags?.includes('io') &&
      !f.tags?.includes('tu') &&
      !f.tags?.includes('lui')
    )

    if (!participle && !gerund) {
      console.log('⚠️ No building blocks found for dynamic generation')
      return []
    }

    const generatedForms = []

    // Generate compound tenses that use participles
    if (participle) {
      console.log('🧱 Using participle:', participle.form_text)
      const perfectTenses = [
        'passato-prossimo',
        'trapassato-prossimo',
        'futuro-anteriore',
        'congiuntivo-passato',
        'congiuntivo-trapassato',
        'condizionale-passato'
      ]

      for (const tense of perfectTenses) {
        for (const person of ['prima-persona', 'seconda-persona', 'terza-persona']) {
          for (const plurality of ['singolare', 'plurale']) {
            // Get translation for this person/plurality combination
            const personTranslation = getTranslationForPersonPlurality(participle, person, plurality)

            const baseParticiple = buildPastParticiple(
              participle.form_text,
              auxiliaryType,
              plurality
            )

            const generated = await auxiliaryService.generateCompoundForm(
              auxiliaryType,
              tense,
              person,
              plurality,
              baseParticiple,
              personTranslation
            )

            if (generated) {
              // Carry canonical FTG-linked translation assignments forward.
              generated.resolved_translation_groups =
                participle.resolved_translation_groups || []
              // Attach pronoun tag for correct display
              const pronounMap = {
                'prima-persona': { singolare: 'io', plurale: 'noi' },
                'seconda-persona': { singolare: 'tu', plurale: 'voi' },
                'terza-persona': { singolare: 'lui', plurale: 'loro' }
              }
              const pronounTag = pronounMap[person]?.[plurality]
              if (pronounTag) {
                generated.tags.push(pronounTag)
              }
              // Ensure tagging for VariantCalculator
              generated.tags = [
                ...(generated.tags || []),
                'compound',
                plurality
              ]
              generated.variant_type = null

              if (
                auxiliaryType === 'essere' &&
                !activeWord?.tags?.includes('essere-auxiliary')
              ) {
                setResolvedWord((currentWord) => ({
                  ...(currentWord || activeWord),
                  tags: Array.from(new Set([...(currentWord?.tags || activeWord?.tags || []), 'essere-auxiliary'])),
                }))
              }

              generated.auxiliary_type = auxiliaryType
              generated.word_tags = [...(activeWord?.tags || [])]

              generatedForms.push(generated)
            }
          }
        }
      }
    }

    // Generate progressive tenses that use gerunds (always use 'stare')
    if (gerund) {
      console.log('🧱 Using gerund:', gerund.form_text)
      const progressiveTenses = [
        'presente-progressivo',
        'passato-progressivo',
        'futuro-progressivo'
      ]

      for (const tense of progressiveTenses) {
        for (const person of ['prima-persona', 'seconda-persona', 'terza-persona']) {
          for (const plurality of ['singolare', 'plurale']) {
            // Get translation for this person/plurality combination  
            const personTranslation = getTranslationForPersonPlurality(gerund, person, plurality)

            // Progressive tenses always use 'stare' patterns regardless of main auxiliary
            const generated = await auxiliaryService.generateCompoundForm(
              'avere', // Use avere column which contains stare patterns for progressive
              tense,
              person,
              plurality,
              gerund.form_text,
              personTranslation
            )

            if (generated) {
              // Carry canonical FTG-linked translation assignments forward.
              generated.resolved_translation_groups =
                gerund.resolved_translation_groups || []
              const pronounMap = {
                'prima-persona': { singolare: 'io', plurale: 'noi' },
                'seconda-persona': { singolare: 'tu', plurale: 'voi' },
                'terza-persona': { singolare: 'lui', plurale: 'loro' }
              }
              const pronounTag = pronounMap[person]?.[plurality]
              if (pronounTag) {
                generated.tags.push(pronounTag)
              }
              generated.tags = [
                ...(generated.tags || []),
                'compound',
                plurality
              ]
              generated.variant_type = null

              if (
                auxiliaryType === 'essere' &&
                !activeWord?.tags?.includes('essere-auxiliary')
              ) {
                setResolvedWord((currentWord) => ({
                  ...(currentWord || activeWord),
                  tags: Array.from(new Set([...(currentWord?.tags || activeWord?.tags || []), 'essere-auxiliary'])),
                }))
              }

              generated.auxiliary_type = 'avere'
              generated.word_tags = [...(activeWord?.tags || [])]

              generatedForms.push(generated)
            }
          }
        }
      }
    }

    console.log('🎯 Generated forms:', generatedForms.length)
    return generatedForms
  }

  // Get appropriate translation for person/plurality combination
  const getTranslationForPersonPlurality = (buildingBlock, person, plurality) => {
    // Find form_translation for selected translation
    const assignment = buildingBlock.resolved_translation_groups?.find(
      ft => ft.word_translation_id === selectedTranslationId
    )

    if (assignment) {
      let baseTranslation = assignment.translation

      // ENHANCED: Build proper compound translation based on auxiliary + participle
      const currentAuxiliary = getAuxiliaryForTranslation(
        selectedTranslationId,
        wordTranslations
      )

      if (currentAuxiliary === 'avere') {
        // AVERE compounds: "have/has + past participle"
        if (person === 'prima-persona') {
          return plurality === 'singolare'
            ? `I have ${baseTranslation}`
            : `we have ${baseTranslation}`
        } else if (person === 'seconda-persona') {
          return plurality === 'singolare'
            ? `you have ${baseTranslation}`
            : `you all have ${baseTranslation}`
        } else if (person === 'terza-persona') {
          return plurality === 'singolare'
            ? `he/she has ${baseTranslation}`
            : `they have ${baseTranslation}`
        }
      } else {
        // ESSERE compounds: "am/is/are + past participle"
        if (person === 'prima-persona') {
          return plurality === 'singolare'
            ? `I am ${baseTranslation}`
            : `we are ${baseTranslation}`
        } else if (person === 'seconda-persona') {
          return plurality === 'singolare'
            ? `you are ${baseTranslation}`
            : `you all are ${baseTranslation}`
        } else if (person === 'terza-persona') {
          return plurality === 'singolare'
            ? `he/she is ${baseTranslation}`
            : `they are ${baseTranslation}`
        }
      }
    }

    // Fallback
    return buildingBlock.translation || 'compound form'
  }

  // Load all translations for the current word
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
        
        const baseDisplayTense = tense
          .replace('-', ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        options.push({
          mood,
          tense,
          regularity,
          count: forms.length,
          displayMood: mood
            .replace('-', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          displayTense: baseDisplayTense
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
    console.log(
      `\u{1F50D} DISPLAY: Base forms for ${selectedMood}/${selectedTense}:`,
      baseForms.length
    )
    console.log('\u{1F50D} DISPLAY: Selected translation ID:', selectedTranslationId)

    if (!selectedTranslationId) {
      console.log('\u26A0\uFE0F DISPLAY: No translation selected, showing all forms')
      return baseForms
    }

    // Filter forms that have assignments for the selected translation
    const formsWithAssignments = baseForms.filter(form =>
      form.resolved_translation_groups?.some(
        ft => ft.word_translation_id === selectedTranslationId
      )
    )

    console.log(
      '\u{1F4CB} DISPLAY: Forms with assignments:',
      formsWithAssignments.length
    )

    // CRITICAL FIX: For compound tenses, prioritize generated forms over stored forms
    const isCompoundTense =
      selectedTense === 'passato-prossimo' ||
      selectedTense === 'trapassato-prossimo' ||
      selectedTense === 'futuro-anteriore' ||
      selectedTense === 'congiuntivo-passato' ||
      selectedTense === 'congiuntivo-trapassato' ||
      selectedTense === 'condizionale-passato' ||
      selectedTense === 'presente-progressivo' ||
      selectedTense === 'passato-progressivo' ||
      selectedTense === 'futuro-progressivo'

    if (isCompoundTense) {
      console.log(
        '\u{1F527} DISPLAY: Compound tense - prioritizing generated forms'
      )

      // For compound tenses: prefer generated forms, only use stored as fallback
      const generatedForms = formsWithAssignments.filter(form => form.is_generated)
      const storedForms = formsWithAssignments.filter(form => !form.is_generated)

      console.log('\u2728 DISPLAY: Generated forms:', generatedForms.length)
      console.log('\u{1F4C4} DISPLAY: Stored forms:', storedForms.length)

      if (generatedForms.length > 0) {
        // Use generated forms and filter out any stored forms that would duplicate
        const generatedPronouns = new Set(
          generatedForms.map(form => extractTagValue(form.tags, 'pronoun'))
        )

        const nonDuplicateStored = storedForms.filter(form => {
          const pronoun = extractTagValue(form.tags, 'pronoun')
          return !generatedPronouns.has(pronoun)
        })

        const result = [...generatedForms, ...nonDuplicateStored]
        console.log('\u{1F3AF} DISPLAY: Final compound forms:', result.length)
        return result
      } else {
        // Fallback to stored forms if no generated forms available
        console.log(
          '\u26A0\uFE0F DISPLAY: No generated forms, using stored as fallback'
        )
        return storedForms
      }
    } else {
      console.log('\u{1F4DD} DISPLAY: Simple tense - using stored forms')

      // For simple tenses: prefer stored forms
      const storedForms = formsWithAssignments.filter(form => !form.is_generated)

      if (storedForms.length > 0) {
        return storedForms
      } else {
        // Fallback to any available forms
        return formsWithAssignments
      }
    }
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

  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownOpen(false)
      setTimeout(() => setDropdownVisible(false), 200)
    } else {
      setDropdownVisible(true)
      setDropdownOpen(true)
    }
  }

  // Handle dropdown selection with quick fade
  const handleDropdownSelect = (mood, tense) => {
    if (mood === selectedMood && tense === selectedTense) {
      toggleDropdown()
      return
    }

    setIsContentChanging(true)
    toggleDropdown()

    setTimeout(() => {
      setSelectedMood(mood)
      setSelectedTense(tense)
      setIsContentChanging(false)
    }, 150)
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
    return currentForms.some(
      form =>
        form.tags?.includes('compound') &&
        !form.tags?.includes('presente-progressivo') &&
        !form.tags?.includes('passato-progressivo') &&
        !form.tags?.includes('futuro-progressivo')
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
        activeWord?.tags?.includes('essere-auxiliary') &&
        form.tags?.includes('compound') &&
        !form.tags?.includes('presente-progressivo') &&
        !form.tags?.includes('passato-progressivo') &&
        !form.tags?.includes('futuro-progressivo')

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
    const person = extractTagValue(form.tags, 'person')

    // Handle formality first
    if (selectedFormality === 'formal') {
      if (pronoun === 'tu' || (person === 'seconda-persona' && form.tags?.includes('singolare')))
        return 'Lei'
      if (pronoun === 'voi' || (person === 'seconda-persona' && form.tags?.includes('plurale')))
        return 'Loro'
    }

    // For 3rd person pronouns
    if (pronoun === 'lui' || pronoun === 'lei') {
      // Check if this form has gender variants (ESSERE verbs with compound tenses)
      const hasGenderVariants =
        activeWord?.tags?.includes('essere-auxiliary') &&
        form.tags?.includes('compound') &&
        !form.tags?.includes('presente-progressivo') &&
        !form.tags?.includes('passato-progressivo') &&
        !form.tags?.includes('futuro-progressivo')

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
    console.log('📋 Form translation assignments:', form.resolved_translation_groups?.map(ft => ({
      id: ft.word_translation_id,
      translation: ft.word_translation?.translation || ft.translation,
      method: 'canonical-ftg'
    })))

    const assignment = form.resolved_translation_groups?.find(
      ft => ft.word_translation_id === selectedTranslationId
    )

    // If this is a dynamically generated form, prefer the form's own translation
    if (form.is_generated && form.translation) {
      console.log('✨ Generated form translation used:', form.translation)
      return form.translation
    }

    const result =
      assignment?.translation ||
      assignment?.word_translation?.translation ||
      form.translation
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
      activeWord?.tags?.includes('essere-auxiliary') &&
      displayForm.tags?.includes('compound') &&
      !displayForm.tags?.includes('presente-progressivo') &&
      !displayForm.tags?.includes('passato-progressivo') &&
      !displayForm.tags?.includes('futuro-progressivo')

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
          // Fallback when translation doesn't use he/she placeholders
          .replace(/\b[Ss]he\b/g, match =>
            match === 'She' ? 'He' : 'he'
          )
          .replace(/\bherself\b/gi, 'himself')
      } else {
        translation = translation
          .replace(/\bhe\/she\b/gi, 'she')
          .replace(/^He\/she\b/, 'She')
          .replace(/\bhimself\/herself\b/gi, 'herself')
          .replace(/^Himself\/herself\b/, 'Herself')
          // Fallback when translation doesn't use he/she placeholders
          .replace(/\b[Hh]e\b/g, match =>
            match === 'He' ? 'She' : 'she'
          )
          .replace(/\bhimself\b/gi, 'herself')
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
      console.log('✅ Found feminine variant:', calculatedVariant.form_text, 'with translation assignments:', calculatedVariant.resolved_translation_groups?.length)
      return calculatedVariant
    }

    console.log('⚠️ No feminine variant found, using base form:', baseForm.form_text)
    return baseForm
  }

  // Get the appropriate form to display based on gender toggle AND formality
  const getDisplayFormWithFormality = (baseForm) => {
    const pronoun = extractTagValue(baseForm.tags, 'pronoun')
    const person = extractTagValue(baseForm.tags, 'person')

    const getAux = (form) =>
      extractTagValue(form.tags, 'aux') ||
      (/^(ho|hai|ha|abbiamo|avete|hanno)\b/i.test(form.form_text)
        ? 'avere'
        : /^(sono|sei|è|siamo|siete)\b/i.test(form.form_text)
        ? 'essere'
        : undefined)

    // Handle formality mapping first
    if (selectedFormality === 'formal') {
      // Map 2nd person to 3rd person forms when formal
      const isSecondSingular =
        pronoun === 'tu' ||
        (pronoun == null &&
          person === 'seconda-persona' &&
          baseForm.tags?.includes('singolare'))

      if (isSecondSingular) {
        const aux = getAux(baseForm)
        const allForms = conjugations[selectedMood]?.[selectedTense] || []
        const thirdPersonSingularForm = allForms.find((form) => {
          // ①  same gender variant (null, fem‑sing, fem‑plur, …)
          if (form.variant_type !== baseForm.variant_type) return false

          // ②  accept any spelling of the 3ᵗᵉˢ pronoun
          const pron = extractTagValue(form.tags, 'pronoun')
          const byPronoun = pron && /^(lui\/?lei?|lei|lui)$/i.test(pron)
          const byPerson =
            !pron &&
            extractTagValue(form.tags, 'person') === 'terza-persona' &&
            form.tags?.includes('singolare')

          if (!(byPronoun || byPerson)) return false

          // ③  stay on the same auxiliary track
          return getAux(form) === getAux(baseForm)
        })

        if (thirdPersonSingularForm) {
          console.log(
            `\ud83c\udfdb\ufe0f Formal mapping: tu \u2192 Lei using form: ${thirdPersonSingularForm.form_text}`
          )
          return getDisplayForm(thirdPersonSingularForm)
        }
      }

      const isSecondPlural =
        pronoun === 'voi' ||
        (pronoun == null &&
          person === 'seconda-persona' &&
          baseForm.tags?.includes('plurale'))

      if (isSecondPlural) {
        const aux = getAux(baseForm)
        const allForms = conjugations[selectedMood]?.[selectedTense] || []
        const thirdPersonPluralForm = allForms.find((form) => {
          if (form.variant_type !== baseForm.variant_type) return false

          const pron = extractTagValue(form.tags, 'pronoun')
          const byPronoun = pron && /^loro$/i.test(pron)
          const byPerson =
            !pron &&
            extractTagValue(form.tags, 'person') === 'terza-persona' &&
            form.tags?.includes('plurale')

          if (!(byPronoun || byPerson)) return false

          return getAux(form) === getAux(baseForm)
        })

        if (thirdPersonPluralForm) {
          console.log(
            `\ud83c\udfdb\ufe0f Formal mapping: voi \u2192 Loro using form: ${thirdPersonPluralForm.form_text}`
          )
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

  // Handle translation change with quick scratch effect
  const handleTranslationChange = (newTranslationId) => {
    if (newTranslationId === selectedTranslationId) return

    setIsContentChanging(true)
    setTimeout(() => {
      setSelectedTranslationId(newTranslationId)
      // Conjugations will reload via useEffect when the state updates
      setIsContentChanging(false)
    }, 150)
  }

  const getConjugationColors = (wordTags) => {
    if (wordTags?.includes('are-conjugation')) {
      return { primary: '#14b8a6', name: '-are' }
    }
    if (wordTags?.includes('ere-conjugation')) {
      return { primary: '#06b6d4', name: '-ere' }
    }
    if (
      wordTags?.includes('ire-conjugation') ||
      wordTags?.includes('ire-isc-conjugation')
    ) {
      const name = wordTags?.includes('ire-isc-conjugation') ? '-isc' : '-ire'
      return { primary: '#2dd4bf', name }
    }
    return { primary: '#14b8a6', name: '-verb' }
  }

  const renderTag = (tag, index) => {
    const base =
      'text-xs px-2 py-1 rounded-full font-semibold border inline-block'
    const style = tag.filled
      ? {
          backgroundColor: tag.color || '#e5e7eb',
          color: '#fff',
          borderColor: tag.color || '#e5e7eb'
        }
      : {
          color: tag.color || '#374151',
          borderColor: tag.color || '#d1d5db',
          backgroundColor: 'transparent'
        }
    return (
      <span key={index} className={base} style={style}>
        {tag.text}
      </span>
    )
  }

  const renderConjugationTags = () => {
    const colors = getConjugationColors(activeWord?.tags || [])
    const tags = []

    // Conjugation type (filled)
    tags.push({ text: colors.name, filled: true, color: colors.primary })

    // Irregularity (filled red) - using RPC data
    const hasIrregular = activeWord?.word_core_tags?.some(tag => 
      tag.attribute_stable_id === 'metaattr005' && tag.value_label === 'irregular'
    )
    if (hasIrregular) {
      tags.push({ text: '⚠️ IRREG', filled: true, color: '#ef4444' })
    }

    // Auxiliary (outlined)
    if (activeWord?.tags?.includes('avere-auxiliary')) {
      tags.push({ text: 'avere', filled: false })
    } else if (activeWord?.tags?.includes('essere-auxiliary')) {
      tags.push({ text: 'essere', filled: false })
    }

    // Reflexive (outlined)
    if (activeWord?.tags?.includes('reflexive-verb')) {
      tags.push({ text: 'reflexive', filled: false })
    }

    // Transitivity (outlined)
    if (activeWord?.tags?.includes('transitive-verb')) {
      tags.push({ text: 'transitive', filled: false })
    } else if (activeWord?.tags?.includes('intransitive-verb')) {
      tags.push({ text: 'intransitive', filled: false })
    }

    return tags.map((tag, index) => renderTag(tag, index))
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
      <div className="space-y-1">
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
                  wordTags={activeWord?.tags || []}
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
                  wordTags={activeWord?.tags || []}
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
                  wordTags={activeWord?.tags || []}
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
    if (isOpen && word?.id) {
      loadWordBundle()
    }
  }, [isOpen, word?.id])

  useEffect(() => {
    if (isOpen && storedForms.length > 0 && selectedTranslationId !== null) {
      loadConjugations()
    }
  }, [isOpen, storedForms, selectedTranslationId, wordTranslations, activeWord?.id])

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
                Conjugations: {activeWord?.italian}
              </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-200 text-xl transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {renderConjugationTags()}
          </div>
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
                  onClick={toggleDropdown}
                >
                  <span className="transition-colors duration-200">{getCurrentSelectionText()}</span>
                  <span
                    className={`transform transition-all duration-300 ease-out ${
                      /* Closed → arrow points right, open ↓ */
                      dropdownOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  >
                    ▼
                  </span>
                </div>
                
                {dropdownVisible && (
                  <div
                    className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto transform transition-all duration-200 ease-out"
                    style={{
                      transformOrigin: 'top',
                      animation: `${dropdownOpen ? 'dropdown-expand' : 'dropdown-collapse'} 200ms ease-out`
                    }}
                  >
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

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conjugations...</p>
              </div>
            ) : (
              <div className={`transition-all duration-150 ${
                isContentChanging ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
              }`}>
                {renderConjugationForms()}
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
      !form.tags?.includes('futuro-progressivo') &&
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
            audioObjectKey={form.audio_object_key}
            audioBucket={form.audio_bucket}
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
