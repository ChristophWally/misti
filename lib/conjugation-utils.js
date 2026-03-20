// lib/conjugation-utils.js
// Shared utilities for conjugation display and ordering

// Desired display order for moods and tenses
export const moodOrder = [
  'indicativo',
  'indicativo-negativo',
  'congiuntivo',
  'condizionale',
  'imperativo',
  'infinito',
  'participio',
  'gerundio'
]

export const tenseOrderMap = {
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

export const sortMoods = moods =>
  moods.sort((a, b) => moodOrder.indexOf(a) - moodOrder.indexOf(b))

export const sortTenses = (mood, tenses) => {
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

export const extractTagValue = (tags, category) => {
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

export const groupConjugationsByMoodTense = (conjugations) => {
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
