'use client'

// components/WordViewer/ConjugationPanel.js
// Conjugation table panel: reuses conjugation-utils, accepts pre-fetched bundle

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AudioButton from '../AudioButton'
import { VariantCalculator } from '../../lib/variant-calculator'
import { AuxiliaryPatternService } from '../../lib/auxiliary-pattern-service'
import {
  hydrateCanonicalWordBundle,
  deriveWordTagsFromTranslations,
} from '../../lib/dictionary-bundle-compat'
import {
  moodOrder,
  sortMoods,
  sortTenses,
  groupConjugationsByMoodTense,
  extractTagValue,
} from '../../lib/conjugation-utils'

const MOOD_LABELS = {
  'indicativo': 'Indicativo',
  'indicativo-negativo': 'Negativo',
  'congiuntivo': 'Congiuntivo',
  'condizionale': 'Condizionale',
  'imperativo': 'Imperativo',
  'infinito': 'Infinito',
  'participio': 'Participio',
  'gerundio': 'Gerundio',
}

const PRONOUN_LABELS = {
  'io': 'io',
  'tu': 'tu',
  'lui': 'lui/lei',
  'lei': 'lui/lei',
  'noi': 'noi',
  'voi': 'voi',
  'loro': 'loro',
}

export default function ConjugationPanel({ word, resolvedBundle }) {
  const [conjugations, setConjugations] = useState({})
  const [selectedMood, setSelectedMood] = useState('indicativo')
  const [selectedTense, setSelectedTense] = useState('presente')
  const [isLoading, setIsLoading] = useState(false)
  const [wordTranslations, setWordTranslations] = useState([])
  const [storedForms, setStoredForms] = useState([])

  useEffect(() => {
    if (resolvedBundle) {
      initFromBundle(resolvedBundle)
    } else if (word?.id) {
      fetchAndInit()
    }
  }, [word?.id, resolvedBundle])

  useEffect(() => {
    if (storedForms.length > 0 || wordTranslations.length > 0) {
      buildConjugations()
    }
  }, [storedForms, wordTranslations])

  const initFromBundle = (bundle) => {
    const translations = bundle.translations || []
    const forms = (bundle.forms || []).filter(f => f.form_type === 'conjugation')
    setWordTranslations(translations)
    setStoredForms(forms)
  }

  const fetchAndInit = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('app_get_word_bundle', { p_word_id: word.id })
      if (error) throw error
      const rawBundle = Array.isArray(data) ? data[0] : data
      const bundle = hydrateCanonicalWordBundle(rawBundle || {}, word)
      initFromBundle(bundle)
    } catch (err) {
      console.error('ConjugationPanel: fetch error', err)
    } finally {
      setIsLoading(false)
    }
  }

  const buildConjugations = () => {
    const allForms = VariantCalculator.getAllForms(storedForms, word?.tags || [])
    const grouped = groupConjugationsByMoodTense(allForms)
    setConjugations(grouped)
  }

  const availableMoods = sortMoods(Object.keys(conjugations))
  const availableTenses = selectedMood && conjugations[selectedMood]
    ? sortTenses(selectedMood, Object.keys(conjugations[selectedMood]))
    : []

  // Auto-select first tense when mood changes
  useEffect(() => {
    if (availableTenses.length > 0 && !availableTenses.includes(selectedTense)) {
      setSelectedTense(availableTenses[0])
    }
  }, [selectedMood, availableTenses.join(',')])

  const currentForms = conjugations[selectedMood]?.[selectedTense] || []

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading conjugations...</div>
  }

  if (availableMoods.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No conjugation data available.</div>
  }

  const formatTenseLabel = (tense) =>
    String(tense || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="p-4 space-y-4">
      {/* Mood selector pills */}
      <div className="flex flex-wrap gap-1.5">
        {availableMoods.map(mood => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              selectedMood === mood
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
            }`}
          >
            {MOOD_LABELS[mood] || mood}
          </button>
        ))}
      </div>

      {/* Tense selector */}
      {availableTenses.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {availableTenses.map(tense => (
            <button
              key={tense}
              onClick={() => setSelectedTense(tense)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                selectedTense === tense
                  ? 'bg-teal-100 text-teal-800 border-teal-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'
              }`}
            >
              {formatTenseLabel(tense)}
            </button>
          ))}
        </div>
      )}

      {/* Form table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {currentForms.map((form, i) => {
              const pronoun = extractTagValue(form.tags || [], 'pronoun')
              const audioDesc = form.primary_audio_descriptor || null

              return (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-gray-500 text-xs w-16">
                    {pronoun ? (PRONOUN_LABELS[pronoun] || pronoun) : ''}
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-900">
                    {form.form_text || form.italian || ''}
                  </td>
                  <td className="py-2 px-3 w-8">
                    {audioDesc && (
                      <AudioButton audioDescriptor={audioDesc} size="sm" wordType={word?.word_type} />
                    )}
                  </td>
                </tr>
              )
            })}
            {currentForms.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 px-3 text-xs text-gray-400 text-center">
                  No forms for this tense.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
