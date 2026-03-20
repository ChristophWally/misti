// lib/word-type-utils.js
// Shared utility for word type colors and styling

export function getWordTypeColors(wordType) {
  const colors = {
    VERB: {
      border: 'border-teal-200',
      bg: 'bg-teal-50',
      hover: 'hover:bg-teal-100',
      badgeHover: 'hover:bg-teal-200',
      tag: 'bg-teal-100 text-teal-800 border-teal-300',
      text: 'text-teal-900'
    },
    NOUN: {
      border: 'border-cyan-200',
      bg: 'bg-cyan-50',
      hover: 'hover:bg-cyan-100',
      badgeHover: 'hover:bg-cyan-200',
      tag: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      text: 'text-cyan-900'
    },
    ADJECTIVE: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-100',
      badgeHover: 'hover:bg-blue-200',
      tag: 'bg-blue-100 text-blue-800 border-blue-300',
      text: 'text-blue-900'
    },
    ADVERB: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      hover: 'hover:bg-purple-100',
      badgeHover: 'hover:bg-purple-200',
      tag: 'bg-purple-100 text-purple-800 border-purple-300',
      text: 'text-purple-900'
    }
  }
  return colors[wordType] || colors.NOUN
}
