// Key additions to existing ConjugationModal.js
// These are the specific changes needed for Story 8

import TranslationSelector from './TranslationSelector'

// ADD THESE STATE VARIABLES to existing ConjugationModal:
export default function ConjugationModal({ isOpen, onClose, word, userAudioPreference = 'form-only' }) {
  // ... existing state variables ...
  
  // NEW: Translation selection state
  const [selectedTranslationId, setSelectedTranslationId] = useState(null)
  const [wordTranslations, setWordTranslations] = useState([])
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false)

  // NEW: Load translations when modal opens
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

      // Add form counts to each translation
      const translationsWithCounts = await Promise.all(
        translations.map(async (translation) => {
          const { count } = await supabase
            .from('form_translations')
            .select('*', { count: 'exact', head: true })
            .eq('word_translation_id', translation.id)

          return {
            ...translation,
            assigned_forms: count || 0
          }
        })
      )

      setWordTranslations(translationsWithCounts)
      
      // Set default selection to primary translation
      if (translationsWithCounts.length > 0 && !selectedTranslationId) {
        const primary = translationsWithCounts.find(t => t.display_priority === 1) || translationsWithCounts[0]
        setSelectedTranslationId(primary.id)
      }
      
    } catch (error) {
      console.error('Error loading word translations:', error)
      setWordTranslations([])
    } finally {
      setIsLoadingTranslations(false)
    }
  }

  // NEW: Get current form context for translation availability
  const getCurrentFormContext = () => {
    const currentForms = getCurrentForms() // existing function
    if (currentForms.length === 0) return null
    
    // Determine if we're looking at singular or plural forms primarily
    const singularForms = currentForms.filter(form => 
      form.tags?.includes('singolare') || 
      ['io', 'tu', 'lui', 'lei'].some(p => form.tags?.includes(p))
    )
    const pluralForms = currentForms.filter(form =>
      form.tags?.includes('plurale') || 
      ['noi', 'voi', 'loro'].some(p => form.tags?.includes(p))
    )
    
    return {
      number: singularForms.length >= pluralForms.length ? 'singular' : 'plural',
      hasBoth: singularForms.length > 0 && pluralForms.length > 0
    }
  }

  // NEW: Get forms filtered by selected translation
  const getFormsForSelectedTranslation = () => {
    if (!selectedTranslationId) return getCurrentForms()
    
    const allForms = getCurrentForms()
    return allForms.filter(form => {
      // Check if form has assignment for selected translation
      const hasAssignment = form.form_translations?.some(
        assignment => assignment.word_translation_id === selectedTranslationId
      )
      return hasAssignment
    })
  }

  // NEW: Get translation text for form based on selected translation
  const getTranslationForForm = (form) => {
    if (!selectedTranslationId) return form.translation
    
    const assignment = form.form_translations?.find(
      assignment => assignment.word_translation_id === selectedTranslationId
    )
    
    return assignment?.translation || form.translation
  }

  // UPDATE: Load translations when modal opens
  useEffect(() => {
    if (isOpen && word) {
      loadConjugations() // existing function
      loadWordTranslations() // NEW function
    }
  }, [isOpen, word])

  // UPDATE: Reset translation selection when word changes
  useEffect(() => {
    setSelectedTranslationId(null)
  }, [word?.id])

  // ADD THIS TO EXISTING MODAL CONTENT, after mood/tense controls:
  const renderTranslationSelector = () => {
    if (isLoadingTranslations || wordTranslations.length <= 1) {
      return null // Don't show selector for single-translation words
    }

    return (
      <div className="mb-4">
        <TranslationSelector
          translations={wordTranslations}
          selectedTranslationId={selectedTranslationId}
          onTranslationChange={setSelectedTranslationId}
          currentFormContext={getCurrentFormContext()}
        />
      </div>
    )
  }

  // UPDATE: Use filtered forms in render
  const renderConjugationForms = () => {
    const currentForms = getFormsForSelectedTranslation() // NEW: filtered forms
    const { singular, plural, other } = groupFormsBySingularPlural(currentForms)

    if (currentForms.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">
            No forms available for the selected translation in {selectedMood} {selectedTense}.
          </p>
          <p className="text-sm text-gray-400">
            Try selecting a different translation or changing the mood/tense.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {/* Render singular, plural, other sections as before, but use getTranslationForForm */}
      </div>
    )
  }

  // INTEGRATION POINT: Add translation selector to modal content
  return (
    <>
      {/* Modal content structure stays the same, but add: */}
      <div className="modal-controls">
        {/* Existing mood/tense/gender controls */}
        
        {/* NEW: Translation Selector */}
        {renderTranslationSelector()}
      </div>
      
      <div className="forms-display">
        {renderConjugationForms()}
      </div>
    </>
  )
}
