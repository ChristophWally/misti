'use client'

// components/WordCard.js
// Updated for Story 10: Multiple Translations Display
// Shows top 2+ translations with individual "Study This Translation" buttons

import { useState, useEffect } from 'react'
import AudioButton from './AudioButton'
import ConjugationModal from './ConjugationModal'
import { ATTRIBUTES, VALUES, TAG_DISPLAYS, isAttribute, isValue, hasAttributeValue } from '../lib/meta-constants'

export default function WordCard({ word, onAddToDeck, className = '' }) {
  const [showConjugations, setShowConjugations] = useState(false)
  const [expandedMeaningGroups, setExpandedMeaningGroups] = useState({})
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 })

  // Get word type colors
  const getWordTypeColors = (wordType) => {
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

  // Process RPC tags for display - Comprehensive mapping of all original tags
  const processRpcTagsForDisplay = (coreTags, wordType, optionalTags = []) => {
    const essential = []
    const detailed = []

    if (!Array.isArray(coreTags)) {
      return { essential, detailed }
    }

    const normalizeValue = (value) => String(value || '').trim().toLowerCase()
    const formatSlugLabel = (value) =>
      String(value || '')
        .replace(/[_-]+/g, ' ')
        .trim()

    const wordThemeClass =
      wordType === 'VERB'
        ? 'bg-teal-500 text-white'
        : wordType === 'ADJECTIVE'
          ? 'bg-blue-500 text-white'
          : wordType === 'ADVERB'
            ? 'bg-purple-500 text-white'
            : 'bg-cyan-500 text-white'
    
    // Track number restrictions to implement hierarchical display
    const hasNumberRestrictions = coreTags.some(tag => isAttribute(tag, ATTRIBUTES.NUMBER_RESTRICTION))

    // AUXILIARY VERB COMBINATION LOGIC - Process all auxiliaries first to combine them
    const auxiliaries = coreTags
      .filter(tag => isAttribute(tag, ATTRIBUTES.AUXILIARY_VERB))
      .map(tag => tag.value_label?.toLowerCase())
      .filter(Boolean)
      .sort()

    if (auxiliaries.length > 1) {
      // Multiple auxiliaries - combine into single chip
      const hasAvere = auxiliaries.includes('avere')
      const hasEssere = auxiliaries.includes('essere')
      
      if (hasAvere && hasEssere) {
        detailed.push({
          tag: 'auxiliary-combined',
          display: 'av./ess.',
          class: 'bg-teal-500 text-white', // VERB theme
          description: 'Uses both avere and essere in compound tenses'
        })
      } else {
        // Fallback - multiple non-standard auxiliaries
        detailed.push({
          tag: 'auxiliary-multiple',
          display: `${auxiliaries.map(aux => aux === 'avere' ? 'av.' : aux === 'essere' ? 'ess.' : aux).join('/')}`,
          class: 'bg-teal-500 text-white', // VERB theme
          description: `Uses multiple auxiliaries: ${auxiliaries.join(', ')}`
        })
      }
    } else if (auxiliaries.length === 1) {
      // Single auxiliary - show individual chip
      const aux = auxiliaries[0]
      if (aux === 'avere') {
        detailed.push({
          tag: 'avere-auxiliary',
          display: 'avere',
          class: 'bg-teal-500 text-white', // VERB theme
          description: 'Uses avere in compound tenses'
        })
      } else if (aux === 'essere') {
        detailed.push({
          tag: 'essere-auxiliary',
          display: 'essere',
          class: 'bg-teal-500 text-white', // VERB theme
          description: 'Uses essere in compound tenses'
        })
      }
    }

    coreTags.forEach(tag => {
      const valueId = tag.value_id
      const valueLabel = tag.value_label || ''
      const normalizedValue = normalizeValue(valueLabel)
      const attributeStableId = tag.attribute_stable_id
      
      
      // CEFR LEVEL MAPPING (essential)
      if (isAttribute(tag, ATTRIBUTES.CEFR_LEVEL)) {
        if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(valueLabel)) {
          essential.push({
            tag: `CEFR-${valueLabel}`,
            display: valueLabel,
            class: 'bg-orange-500 text-white',
            description: `${valueLabel} level vocabulary`
          })
        } else if (['academic', 'literary', 'native', 'specialized', 'business', 'regional'].includes(valueLabel)) {
          essential.push({
            tag: valueLabel,
            display: valueLabel,
            class: 'bg-orange-500 text-white',
            description: `beyond ${valueLabel} level vocabulary`
          })
        }
      }

      // FREQUENCY RANK MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.FREQUENCY_TIER) || attributeStableId === 'metaattr007') {
        const freqMap = {
          'top100': '100',
          'top500': '500', 
          'top1000': '1K',
          'top2500': '2.5K',
          'top5000': '5K',
          'top10000': '10K'
        }
        if (freqMap[normalizedValue]) {
          essential.push({
            tag: `freq-rank-${normalizedValue}`,
            display: `⭐ ${freqMap[normalizedValue]}`,
            class: 'bg-yellow-500 text-white',
            description: `Frequency rank: this lemma is in the top ${normalizedValue.replace('top', '').replace('10000', '10,000')} most frequent words in the corpus`
          })
        }
      }

      // FREQUENCY TIER MAPPING (detailed)
      else if (attributeStableId === 'metaattr034') {
        const tierMap = {
          'very-common': 'very common',
          'common': 'common',
          'uncommon': 'uncommon',
          'rare': 'rare',
          'very-rare': 'very rare'
        }
        if (tierMap[normalizedValue]) {
          detailed.push({
            tag: `freq-tier-${normalizedValue}`,
            display: tierMap[normalizedValue],
            class: 'bg-yellow-500 text-white',
            description: `Frequency tier: ${tierMap[normalizedValue]}. This is a broad learning-priority band derived from corpus frequency`
          })
        }
      }

      // GENDER MAPPING (essential for nouns)
      else if (isAttribute(tag, ATTRIBUTES.WORD_GENDER)) {
        if (valueLabel === 'masculine') {
          essential.push({
            tag: 'masculine',
            display: '♂',
            class: 'bg-blue-500 text-white',
            description: 'Masculine gender requiring masculine articles (il, un)'
          })
        } else if (valueLabel === 'feminine') {
          essential.push({
            tag: 'feminine',
            display: '♀',
            class: 'bg-pink-500 text-white',
            description: 'Feminine gender requiring feminine articles (la, una)'
          })
        } else if (valueLabel === 'common-gender') {
          essential.push({
            tag: 'common-gender',
            display: '⚥',
            class: 'bg-purple-500 text-white',
            description: 'Same form for both genders, determined by article'
          })
        }
      }

      // NUMBER MAPPING (essential for nouns at word-level)
      // Skip if number restrictions exist (hierarchical priority)
      else if (isAttribute(tag, ATTRIBUTES.NUMBER) && wordType === 'NOUN' && !hasNumberRestrictions) {
        if (normalizedValue === 'singolare' || normalizedValue === 'singular') {
          essential.push({
            tag: 'singolare',
            display: 'sing.',
            class: 'bg-cyan-500 text-white', // NOUN theme
            description: 'Singular number form'
          })
        } else if (normalizedValue === 'plurale' || normalizedValue === 'plural') {
          essential.push({
            tag: 'plurale',
            display: 'pl.',
            class: 'bg-cyan-500 text-white', // NOUN theme
            description: 'Plural number form'
          })
        }
      }

      else if (attributeStableId === 'metaattr_matrix5_cefr_tier') {
        const cefrTierDisplay = valueLabel === 'core' ? 'core' : valueLabel === 'extended' ? 'extended' : valueLabel
        if (cefrTierDisplay) {
          detailed.push({
            tag: `cefr-tier-${cefrTierDisplay}`,
            display: cefrTierDisplay,
            class: 'bg-orange-500 text-white',
            description: `CEFR tier: ${cefrTierDisplay}`
          })
        }
      }

      // IRREGULAR FORMS MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.IRREGULAR_FORMS)) {
        if (valueLabel === 'irregular') {
          essential.push({
            tag: 'irregular-pattern',
            display: '⚠️ IRREG',
            class: 'bg-red-500 text-white',
            description: 'Does not follow standard patterns'
          })
        }
      }

      // FORM PATTERN MAPPING (detailed for adjectives) - moved to detailed to appear after frequency
      else if (isAttribute(tag, ATTRIBUTES.FORM_PATTERN) && wordType === 'ADJECTIVE') {
        if (valueLabel === 'form-4') {
          detailed.push({
            tag: 'form-4',
            display: '4F',
            class: 'bg-blue-500 text-white', // ADJECTIVE theme
            description: 'Form pattern - Full agreement: rosso/rossa/rossi/rosse'
          })
        } else if (valueLabel === 'form-2') {
          detailed.push({
            tag: 'form-2', 
            display: '2F',
            class: 'bg-blue-500 text-white', // ADJECTIVE theme
            description: 'Form pattern - Limited agreement: grande/grandi'
          })
        } else if (valueLabel === 'form-invariable') {
          detailed.push({
            tag: 'form-invariable',
            display: 'INV',
            class: 'bg-blue-500 text-white', // ADJECTIVE theme
            description: 'Form pattern - Invariable adjective form'
          })
        }
      }

      // GRADABLE MAPPING (detailed for adjectives)
      else if (isAttribute(tag, ATTRIBUTES.GRADABLE) && wordType === 'ADJECTIVE') {
        if (valueLabel === 'analytical-gradability') {
          detailed.push({
            tag: 'gradable-analytical',
            display: 'analytical',
            class: 'bg-blue-500 text-white', // ADJECTIVE theme
            description: 'Can form analytical comparatives with più/meno: più intelligente'
          })
        } else if (valueLabel === 'full-gradability') {
          detailed.push({
            tag: 'gradable-full',
            display: 'fully gradable',
            class: 'bg-blue-500 text-white', // ADJECTIVE theme
            description: 'Can form both analytical and synthetic comparatives: più bello, bellissimo'
          })
        } else if (valueLabel === 'non-gradable') {
          detailed.push({
            tag: 'gradable-none',
            display: 'non-gradable',
            class: 'bg-blue-500 text-white', // ADJECTIVE theme
            description: 'Cannot form comparatives: morto, perfetto'
          })
        }
      }

      // AUXILIARY VERB MAPPING - Handled by combined logic at top, skip individual processing

      // CONJUGATION TYPE MAPPING (detailed for verbs)
      else if (isAttribute(tag, ATTRIBUTES.CONJUGATION_TYPE) && wordType === 'VERB') {
        const conjMap = {
          'are': '🔸 -are',
          'ere': '🔹 -ere',
          'ire': '🔶 -ire',
          'ire-isc': '-ISC'
        }
        if (conjMap[valueLabel]) {
          const isIsc = valueLabel === 'ire-isc'
          detailed.push({
            tag: `${valueLabel}-conjugation`,
            display: conjMap[valueLabel],
            class: isIsc ? 'bg-yellow-500 text-white' : 'bg-teal-500 text-white', // VERB theme
            description: isIsc ? 'Uses -isc- infix in present forms' : `${valueLabel} conjugation group`
          })
        }
      }

      // REFLEXIVE MAPPING (detailed for verbs)
      else if (isAttribute(tag, ATTRIBUTES.REFLEXIVE) && wordType === 'VERB') {
        if (valueLabel === 'reflexive') {
          detailed.push({
            tag: 'reflexive-verb',
            display: 'reflexive',
            class: 'bg-teal-500 text-white', // VERB theme
            description: 'Action reflects back on the subject'
          })
        }
      }

      // REGISTER MAPPING (only show non-neutral)
      else if (isAttribute(tag, ATTRIBUTES.REGISTER)) {
        if (normalizedValue === 'formal') {
          detailed.push({
            tag: 'formal-register',
            display: 'formal',
            class: 'bg-gray-500 text-white', // Register is universal
            description: 'Formal contexts only'
          })
        } else if (normalizedValue === 'casual') {
          detailed.push({
            tag: 'casual-register', 
            display: 'casual',
            class: 'bg-gray-500 text-white', // Register is universal
            description: 'Casual/colloquial usage'
          })
        } else if (normalizedValue === 'archaic') {
          detailed.push({
            tag: 'archaic-register',
            display: 'archaic',
            class: 'bg-gray-500 text-white',
            description: 'Archaic register'
          })
        } else if (normalizedValue === 'informal') {
          detailed.push({
            tag: 'informal-register',
            display: 'informal',
            class: 'bg-gray-500 text-white',
            description: 'Informal register'
          })
        } else if (normalizedValue === 'literary') {
          detailed.push({
            tag: 'literary-register',
            display: 'literary',
            class: 'bg-gray-500 text-white',
            description: 'Literary register'
          })
        } else if (normalizedValue === 'regional') {
          detailed.push({
            tag: 'regional-register',
            display: 'regional',
            class: 'bg-gray-500 text-white',
            description: 'Regional register'
          })
        } else if (normalizedValue === 'vulgar') {
          detailed.push({
            tag: 'vulgar-register',
            display: 'vulgar',
            class: 'bg-gray-500 text-white',
            description: 'Vulgar register'
          })
        }
        // Skip 'neutral' register - don't display
      }

      // ADVERB TYPE MAPPING (detailed) - EXPANDED
      else if (isAttribute(tag, ATTRIBUTES.ADVERB_TYPE)) {
        const advMap = {
          'manner': { display: 'manner', desc: 'Adverb type - Describes how something is done' },
          'time': { display: 'time', desc: 'Adverb type - Indicates when something happens' },
          'place': { display: 'place', desc: 'Adverb type - Indicates where something happens' },
          'quantity': { display: 'quantity', desc: 'Adverb type - Indicates amount or degree' },
          'frequency': { display: 'frequency', desc: 'Adverb type - Indicates how often' },
          'affirmation': { display: 'affirmation', desc: 'Adverb type - Expresses agreement or certainty' },
          'doubt': { display: 'doubt', desc: 'Adverb type - Expresses uncertainty' },
          'negation': { display: 'negation', desc: 'Adverb type - Expresses denial or refusal' },
          'interrogative': { display: 'interrogative', desc: 'Adverb type - Used in questions' },
          'conjunctive': { display: 'conjunctive', desc: 'Adverb type - Connects clauses/ideas (therefore/however/instead)' },
          'evaluation': { display: 'evaluation', desc: 'Adverb type - Expresses judgment or opinion' },
          'emphasis': { display: 'emphasis', desc: 'Adverb type - Adds emphasis or intensity' }
        }
        if (advMap[valueLabel]) {
          detailed.push({
            tag: `adverb-${valueLabel}`,
            display: advMap[valueLabel].display,
            class: 'bg-purple-500 text-white', // ADVERB theme
            description: advMap[valueLabel].desc
          })
        }
      }


      // REFLEXIVE MAPPING (essential)
      else if (isAttribute(tag, ATTRIBUTES.REFLEXIVE)) {
        if (valueLabel === 'reflexive') {
          essential.push({
            tag: 'reflexive',
            display: 'REFL',
            class: 'bg-teal-500 text-white',
            description: 'Reflexive verb (action directed to subject)'
          })
        }
      }
      // PLURAL_FORMATION MAPPING (detailed for nouns)
      else if (isAttribute(tag, ATTRIBUTES.PLURAL_FORMATION) && wordType === 'NOUN') {
        if (valueLabel === 'plural-e') {
          detailed.push({
            tag: 'plural-formation-e',
            display: 'plural-e',
            class: 'bg-cyan-500 text-white', // NOUN theme
            description: 'Forms plural by changing -a to -e (casa → case)'
          })
        } else if (valueLabel === 'plural-i') {
          detailed.push({
            tag: 'plural-formation-i',
            display: 'plural-i',
            class: 'bg-cyan-500 text-white', // NOUN theme
            description: 'Forms plural by changing -o to -i (libro → libri)'
          })
        } else if (valueLabel === 'plural-e-to-i') {
          detailed.push({
            tag: 'plural-formation-e-to-i',
            display: 'plural e→i',
            class: 'bg-cyan-500 text-white',
            description: 'Forms plural by changing -e to -i'
          })
        } else if (valueLabel === 'plural-invariable') {
          detailed.push({
            tag: 'plural-formation-invariable',
            display: 'plural inv.',
            class: 'bg-cyan-500 text-white',
            description: 'Invariable plural form'
          })
        } else if (valueLabel === 'plural-irregular') {
          detailed.push({
            tag: 'plural-formation-irregular',
            display: 'plural irreg.',
            class: 'bg-cyan-500 text-white',
            description: 'Irregular plural formation'
          })
        }
      }
      else if (attributeStableId === 'metaattr030') {
        const adjectiveTypeMap = {
          'qualitative': {
            display: 'qualitative',
            description: 'Adjective type: expresses an inherent quality and is usually gradable'
          },
          'fixed-comparative': {
            display: 'fixed comp.',
            description: 'Adjective type: lexicalized comparative/superlative form, not regular gradation'
          },
          'relational': {
            display: 'relational',
            description: 'Adjective type: category/material/origin adjective, usually not gradable'
          }
        }
        if (adjectiveTypeMap[normalizedValue]) {
          detailed.push({
            tag: `adjective-type-${normalizedValue}`,
            display: adjectiveTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: adjectiveTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr_matrix5_abbreviation_type') {
        const abbreviationTypeMap = {
          'initialism': {
            display: 'initialism',
            description: 'Abbreviation type: pronounced letter by letter (e.g. U.S.A.)'
          },
          'acronym': {
            display: 'acronym',
            description: 'Abbreviation type: pronounced like a word (e.g. NATO)'
          }
        }
        if (abbreviationTypeMap[normalizedValue]) {
          detailed.push({
            tag: `abbreviation-type-${normalizedValue}`,
            display: abbreviationTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: abbreviationTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr_matrix5_affix_type') {
        const affixTypeMap = {
          'prefix': {
            display: 'prefix',
            description: 'Affix type: morpheme attached before a base word'
          }
        }
        if (affixTypeMap[normalizedValue]) {
          detailed.push({
            tag: `affix-type-${normalizedValue}`,
            display: affixTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: affixTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr062') {
        const conjunctionTypeMap = {
          'coordinating': {
            display: 'coord.',
            description: 'Conjunction type: links words/clauses of equal grammatical rank'
          },
          'subordinating': {
            display: 'subord.',
            description: 'Conjunction type: introduces a subordinate clause'
          },
          'correlative': {
            display: 'correl.',
            description: 'Conjunction type: paired construction (e.g. either...or)'
          }
        }
        if (conjunctionTypeMap[normalizedValue]) {
          detailed.push({
            tag: `conjunction-type-${normalizedValue}`,
            display: conjunctionTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: conjunctionTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr061') {
        const determinerTypeMap = {
          'article': {
            display: 'article det.',
            description: 'Determiner type: article. It marks definiteness or indefiniteness of a noun phrase'
          },
          'demonstrative': {
            display: 'demonstr. det.',
            description: 'Determiner type: demonstrative. It points to a specific referent (this/that)'
          },
          'indefinite-article': {
            display: 'indef. det.',
            description: 'Determiner type: indefinite article. It introduces a non-specific referent'
          },
          'interrogative': {
            display: 'interrog. det.',
            description: 'Determiner type: interrogative. It is used to ask which/what/how many'
          },
          'possessive': {
            display: 'possess. det.',
            description: 'Determiner type: possessive. It marks possession or association'
          },
          'quantifier': {
            display: 'quant. det.',
            description: 'Determiner type: quantifier. It expresses amount or quantity'
          }
        }
        if (determinerTypeMap[normalizedValue]) {
          detailed.push({
            tag: `determiner-type-${normalizedValue}`,
            display: determinerTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: determinerTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr069') {
        const expressionTypeMap = {
          'single-word': {
            display: 'single word',
            description: 'Expression type: one lexical word'
          },
          'multiword-expression': {
            display: 'multiword',
            description: 'Expression type: fixed or conventional multiword expression'
          }
        }
        if (expressionTypeMap[normalizedValue]) {
          detailed.push({
            tag: `expression-type-${normalizedValue}`,
            display: expressionTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: expressionTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr060') {
        const prepositionTypeMap = {
          'simple': {
            display: 'simple prep.',
            description: 'Preposition type: single-word basic preposition'
          },
          'complex': {
            display: 'complex prep.',
            description: 'Preposition type: multiword prepositional expression'
          },
          'contracted': {
            display: 'contracted prep.',
            description: 'Preposition type: fused preposition+article form'
          }
        }
        if (prepositionTypeMap[normalizedValue]) {
          detailed.push({
            tag: `preposition-type-${normalizedValue}`,
            display: prepositionTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: prepositionTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr041') {
        const pronounFormMap = {
          'full': {
            display: 'full form',
            description: 'Pronoun form: full standalone form. It appears independently, not attached to a verb'
          },
          'clitic': {
            display: 'clitic form',
            description: 'Pronoun form: clitic. It is a reduced form that attaches to a verb'
          },
          'combined': {
            display: 'combined form',
            description: 'Pronoun form: combined clitic cluster (two clitics fused into one sequence)'
          },
          'elision': {
            display: 'elided form',
            description: 'Pronoun form: elided. The pronoun is shortened before a vowel, often with an apostrophe'
          }
        }
        if (pronounFormMap[normalizedValue]) {
          detailed.push({
            tag: `pronoun-form-${normalizedValue}`,
            display: pronounFormMap[normalizedValue].display,
            class: wordThemeClass,
            description: pronounFormMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr040') {
        const pronounTypeMap = {
          'personal': {
            display: 'personal pron.',
            description: 'Pronoun type: personal pronoun, used for speaker/listener/third person reference'
          },
          'clitic': {
            display: 'clitic pron.',
            description: 'Pronoun type: clitic pronoun category (object/reflexive clitic behavior)'
          },
          'indefinite': {
            display: 'indef. pron.',
            description: 'Pronoun type: indefinite pronoun, referring to non-specific people/things'
          },
          'relative': {
            display: 'relative pron.',
            description: 'Pronoun type: relative pronoun that introduces a relative clause'
          },
          'demonstrative': {
            display: 'demonstr. pron.',
            description: 'Pronoun type: demonstrative pronoun pointing to a specific referent'
          }
        }
        if (pronounTypeMap[normalizedValue]) {
          detailed.push({
            tag: `pronoun-type-${normalizedValue}`,
            display: pronounTypeMap[normalizedValue].display,
            class: wordThemeClass,
            description: pronounTypeMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr035') {
        const phonologyPositionMap = {
          'after-noun': {
            display: 'post-nom.',
            description: 'Phonology position: form used after the noun'
          },
          'before-most-consonants': {
            display: 'pre consonant',
            description: 'Phonology position: form used before most consonant onsets'
          },
          'before-impure-consonant': {
            display: 'pre impure',
            description: 'Phonology position: form used before impure consonants (s+consonant, z, gn, ps, x)'
          },
          'before-vowel-or-h': {
            display: 'pre vowel/h',
            description: 'Phonology position: form used before vowel or silent h'
          }
        }
        if (phonologyPositionMap[normalizedValue]) {
          detailed.push({
            tag: `phonology-position-${normalizedValue}`,
            display: phonologyPositionMap[normalizedValue].display,
            class: wordThemeClass,
            description: phonologyPositionMap[normalizedValue].description
          })
        }
      }
      else if (attributeStableId === 'metaattr057' && wordType === 'NOUN') {
        const nounTypeMap = {
          common: 'common noun',
          proper: 'proper noun'
        }
        if (nounTypeMap[valueLabel]) {
          detailed.push({
            tag: `noun-type-${valueLabel}`,
            display: nounTypeMap[valueLabel],
            class: 'bg-cyan-500 text-white',
            description: valueLabel === 'common'
              ? 'Noun type: common noun (not a unique name)'
              : 'Noun type: proper noun (name of a specific person/place/entity)'
          })
        }
      }

      // TRANSITIVITY MAPPING (detailed for verbs)
      else if (isAttribute(tag, ATTRIBUTES.TRANSITIVITY) && wordType === 'VERB') {
        const displayConfig = TAG_DISPLAYS[valueId]
        if (displayConfig) {
          let display = displayConfig.display
          // Convert short forms to full terms without emojis
          if (isValue(tag, VALUES.TRANSITIVITY_TRANSITIVE)) {
            display = 'transitive'
          } else if (isValue(tag, VALUES.TRANSITIVITY_INTRANSITIVE)) {
            display = 'intransitive'
          } else if (isValue(tag, VALUES.TRANSITIVITY_AMBITRANSITIVE)) {
            display = 'ambitransitive'
          }
          
          detailed.push({
            tag: `transitivity-${valueLabel}`,
            display: display,
            class: 'bg-teal-500 text-white', // VERB theme
            description: displayConfig.description
          })
        }
      }

      // NUMBER RESTRICTION MAPPING (essential) - Replaces PLURAL_ONLY
      else if (isAttribute(tag, ATTRIBUTES.NUMBER_RESTRICTION)) {
        if (isValue(tag, VALUES.NUMBER_RESTRICTION_SINGULAR_ONLY)) {
          essential.push({
            tag: 'number-restriction-singular-only',
            display: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_SINGULAR_ONLY].display,
            class: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_SINGULAR_ONLY].class,
            description: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_SINGULAR_ONLY].description
          })
        } else if (isValue(tag, VALUES.NUMBER_RESTRICTION_PLURAL_ONLY)) {
          essential.push({
            tag: 'number-restriction-plural-only',
            display: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_PLURAL_ONLY].display,
            class: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_PLURAL_ONLY].class,
            description: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_PLURAL_ONLY].description
          })
        }
      }
    })

    if (Array.isArray(optionalTags)) {
      optionalTags.forEach((tag, index) => {
        const attributeStableId = tag?.attribute_stable_id
        const normalizedValue = normalizeValue(tag?.value_label)
        if (!normalizedValue) return
        if (!(attributeStableId === 'metaattr_optional_tag' || String(attributeStableId || '').startsWith('metaattr_opt_tag_'))) {
          return
        }

        const optionalTagMap = {
          'multi_word_expression': 'MWE',
          'prepositional_phrase': 'prep phrase',
          'temporal_expression': 'temporal expr.'
        }
        const display = optionalTagMap[normalizedValue] || formatSlugLabel(normalizedValue)

        detailed.push({
          tag: `optional-tag-${normalizedValue}-${index}`,
          display,
          class: 'bg-gray-500 text-white',
          description: `Optional tag: ${formatSlugLabel(normalizedValue)}`
        })
      })
    }

    return { essential, detailed }
  }

  // Mobile-friendly tag tooltip system
  const handleTagClick = (event) => {
    // Use currentTarget since onClick is attached to the tag element.
    const tag = event.currentTarget
    const description = tag?.dataset?.description
    if (!tag || !description) return

    event.preventDefault()
    event.stopPropagation()

    const tagRect = tag.getBoundingClientRect()
    const cardRect = tag.closest('.word-card').getBoundingClientRect()
    const panelRect = tag.closest('.dictionary-panel')?.getBoundingClientRect() || cardRect
    
    // Calculate position relative to the WordCard container - position above the tag
    let tooltipX = (tagRect.left - cardRect.left) + (tagRect.width / 2) // Center above tag
    const tooltipY = (tagRect.top - cardRect.top) - 35 // Position above tag
    
    // Prevent tooltip from going off the right edge of panel (estimate tooltip width ~200px for longer text)
    const panelWidth = panelRect.width
    const cardOffsetInPanel = cardRect.left - panelRect.left
    const estimatedTooltipWidth = 200
    const absoluteTooltipX = cardOffsetInPanel + tooltipX
    
    if (absoluteTooltipX + (estimatedTooltipWidth / 2) > panelWidth - 20) {
      tooltipX = (panelWidth - 20 - cardOffsetInPanel) - (estimatedTooltipWidth / 2) // Keep 20px margin from panel right edge
    }
    // Prevent tooltip from going off the left edge of panel  
    if (absoluteTooltipX - (estimatedTooltipWidth / 2) < 20) {
      tooltipX = (20 - cardOffsetInPanel) + (estimatedTooltipWidth / 2) // Keep 20px margin from panel left edge
    }

    setTooltip({ show: true, content: description, x: tooltipX, y: tooltipY })

    setTimeout(() => {
      setTooltip((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  const hideTooltip = (event) => {
    // document-level listener: event.target may be a Text node; guard for closest support
    const target = event.target
    const element = target && target.nodeType === 1 ? target : target?.parentElement
    if (!element?.closest || !element.closest('.tag-essential, .tag-detailed')) {
      setTooltip((prev) => ({ ...prev, show: false }))
    }
  }

  const formatPronunciationGroupLabel = (group) => {
    if (!group) return ''
    if (group.ipa_pronunciation) return group.ipa_pronunciation
    if (group.phonetic_pronunciation) return group.phonetic_pronunciation
    if (group.accent) return group.accent
    return 'Pronunciation'
  }

  useEffect(() => {
    document.addEventListener('click', hideTooltip)
    return () => {
      document.removeEventListener('click', hideTooltip)
    }
  }, [])

  const colors = getWordTypeColors(word.word_type)
  const displayCoreTags = word.word_display_core_tags || word.word_core_tags || []
  const wordOptionalTags = Array.isArray(word.word_optional_tags) ? word.word_optional_tags : []
  const processedTags = processRpcTagsForDisplay(displayCoreTags, word.word_type, wordOptionalTags)
  const pronunciationGroups = Array.isArray(word.pronunciation_groups)
    ? word.pronunciation_groups
    : []
  const maxVisibleMeaningsPerGroup = 2

  const wordTypeLabel = word.word_type

  // Convert filled tag classes to outlined style for less visual weight
  const outlinedClass = (cls) => {
    const map = {
      'bg-blue-500 text-white': 'border bg-transparent text-blue-500 border-blue-500',
      'bg-pink-500 text-white': 'border bg-transparent text-pink-500 border-pink-500',
      'bg-purple-500 text-white': 'border bg-transparent text-purple-500 border-purple-500',
      'bg-yellow-500 text-white': 'border bg-transparent text-yellow-500 border-yellow-500',
      'bg-orange-500 text-white': 'border bg-transparent text-orange-500 border-orange-500',
      'bg-green-500 text-white': 'border bg-transparent text-green-500 border-green-500',
      'bg-cyan-500 text-white': 'border bg-transparent text-cyan-500 border-cyan-500',
      'bg-teal-500 text-white': 'border bg-transparent text-teal-500 border-teal-500',
      'bg-indigo-500 text-white': 'border bg-transparent text-indigo-500 border-indigo-500',
      'bg-gray-500 text-white': 'border bg-transparent text-gray-500 border-gray-500',
      'bg-gray-200 text-gray-700': 'border bg-transparent text-gray-700 border-gray-400'
    }
    return map[cls] || cls
  }

  // Function to extract form-level tense chips from forms_json
  const renderFormTenseChips = () => {
    if (!word.forms_json || !Array.isArray(word.forms_json)) return []
    
    const tenseChips = []
    const seenTenses = new Set()
    
    // Collect unique tenses from all forms
    word.forms_json.forEach(form => {
      if (form.core_tags && Array.isArray(form.core_tags)) {
        form.core_tags.forEach(tag => {
          if (isAttribute(tag, ATTRIBUTES.TENSE)) {
            const valueId = tag.value_id
            const valueLabel = tag.value_label
            
            // Skip if we've already seen this tense
            if (!seenTenses.has(valueId)) {
              seenTenses.add(valueId)
              
              // Map to display configuration from TAG_DISPLAYS
              const displayConfig = TAG_DISPLAYS[valueId]
              if (displayConfig) {
                tenseChips.push({
                  tag: `tense-${valueLabel}`,
                  display: displayConfig.display,
                  class: displayConfig.class,
                  description: `Tense: ${valueLabel} (${form.form_text} example)`
                })
              }
            }
          }
        })
      }
    })
    
    return tenseChips
  }

  // Extract gender and irregularity tags for header
  const genderTag = processedTags.essential.find(tag =>
    tag.display === '♂' || tag.display === '♀' || tag.display === '⚥'
  )

  // All other tags go under translations
  const bottomTags = [
    ...processedTags.essential.filter(tag =>
      tag.display !== '♂' && tag.display !== '♀' && tag.display !== '⚥'
    ),
    ...processedTags.detailed.filter(tag =>
      ![
        'are-conjugation',
        'ere-conjugation',
        'ire-conjugation',
        'ire-isc-conjugation',
        'ire-isc',
        'are',
        'ere',
        'ire'
      ].includes(tag.tag)
    ),
    // Add form-level tense chips for verbs
    ...(word.word_type === 'VERB' ? renderFormTenseChips() : [])
  ]

  const orderedBottomTags = (() => {
    if (!Array.isArray(bottomTags) || bottomTags.length === 0) return []

    const cefrLevelTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('CEFR-'))
    const cefrTierTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('cefr-tier-'))
    const frequencyRankTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('freq-rank-'))
    const frequencyTierTags = bottomTags.filter((tag) => typeof tag?.tag === 'string' && tag.tag.startsWith('freq-tier-'))
    const otherTags = bottomTags.filter((tag) =>
      !(typeof tag?.tag === 'string' && (
        tag.tag.startsWith('CEFR-') ||
        tag.tag.startsWith('cefr-tier-') ||
        tag.tag.startsWith('freq-rank-') ||
        tag.tag.startsWith('freq-tier-')
      ))
    )

    return [...cefrLevelTags, ...cefrTierTags, ...frequencyRankTags, ...frequencyTierTags, ...otherTags]
  })()

  // Get translations - use processedTranslations from EnhancedDictionarySystem
  // Ensure translations are sorted by display_priority so the first item is truly the primary meaning

  // Count unique auxiliaries at word level to determine if translation-level auxiliary chips should be shown
  const wordLevelAuxiliaries = new Set()
  const wordCoreTags = displayCoreTags
  wordCoreTags.forEach(tag => {
    if (tag.attribute_stable_id === 'metaattr002') {
      wordLevelAuxiliaries.add(String(tag.value_label || '').toLowerCase())
    }
  })
  const hasMultipleWordLevelAuxiliaries = wordLevelAuxiliaries.size > 1

  // Translation-level chips: auxiliary, reciprocal, number restrictions, and gender restrictions
  const renderTranslationChips = (translation, hasMultipleWordLevelTransitivities = false) => {
    const chips = []
    const core = Array.isArray(translation.rpc_core) ? translation.rpc_core : []
    const normalizeValue = (value) => String(value || '').trim().toLowerCase()
    const defaultChipClass = 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400'
    const addTextChip = (symbol, title) => {
      if (!symbol) return
      chips.push({
        symbol,
        title,
        className: defaultChipClass
      })
    }

    // Auxiliary Verb (metaattr002): ONLY show when multiple auxiliaries exist at word level
    if (hasMultipleWordLevelAuxiliaries) {
      const auxTags = core.filter((t) => t.attribute_stable_id === 'metaattr002')
      if (auxTags.length > 0) {
        // Each translation has only one auxiliary - show individual chip
        const aux = auxTags[0]
        const v = String(aux.value_label || '').toLowerCase()
        const label = v === 'essere' ? 'ess.' : v === 'avere' ? 'av.' : (aux.value_shorthand || aux.value_label || '')
        if (label) chips.push({ 
          symbol: label, 
          title: `Auxiliary: ${aux.value_label || label}`, 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
        })
      }
    }

    // Reflexive Type (metaattr021): direct-reflexive/reciprocal
    const reflexiveTypeTags = core.filter((t) => isAttribute(t, ATTRIBUTES.REFLEXIVE_TYPE))
    reflexiveTypeTags.forEach(tag => {
      if (isValue(tag, VALUES.REFLEXIVE_TYPE_DIRECT)) {
        chips.push({ 
          symbol: '🔄', 
          title: TAG_DISPLAYS[VALUES.REFLEXIVE_TYPE_DIRECT].description, 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
        })
      } else if (isValue(tag, VALUES.REFLEXIVE_TYPE_RECIPROCAL)) {
        chips.push({ 
          symbol: '🫂', 
          title: TAG_DISPLAYS[VALUES.REFLEXIVE_TYPE_RECIPROCAL].description, 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
        })
      }
    })

    // Number Restriction: detect from core tags for translation-level restrictions (e.g., reciprocal verbs)
    const numberRestrictionTags = core.filter((t) => isAttribute(t, ATTRIBUTES.NUMBER_RESTRICTION))
    numberRestrictionTags.forEach(tag => {
      if (isValue(tag, VALUES.NUMBER_RESTRICTION_SOLO_SINGOLARE)) {
        chips.push({ 
          symbol: '👤', 
          title: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_SOLO_SINGOLARE].description, 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
        })
      } else if (isValue(tag, VALUES.NUMBER_RESTRICTION_SOLO_PLURALE)) {
        chips.push({ 
          symbol: '👥', 
          title: TAG_DISPLAYS[VALUES.NUMBER_RESTRICTION_SOLO_PLURALE].description, 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent text-gray-700 border-gray-400' 
        })
      }
    })

    // Gender Usage Restrictions: consolidated logic from restriction-utils.js
    core.forEach(tag => {
      // Check for gender usage restrictions using UUID-based attribute/value matching
      if (hasAttributeValue(tag, ATTRIBUTES.GENDER_USAGE, VALUES.GENDER_MALE_ONLY)) {
        chips.push({ 
          symbol: '♂', 
          title: 'Use only with masculine subjects', 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent border-blue-500 text-blue-600' 
        })
      } else if (hasAttributeValue(tag, ATTRIBUTES.GENDER_USAGE, VALUES.GENDER_FEMALE_ONLY)) {
        chips.push({ 
          symbol: '♀', 
          title: 'Use only with feminine subjects', 
          className: 'tag-detailed text-xs px-2 py-0.5 rounded-full font-semibold border bg-transparent border-pink-500 text-pink-600' 
        })
      }
    })

    // Position chips
    core.forEach(tag => {
      if (isAttribute(tag, ATTRIBUTES.POSITION)) {
        if (isValue(tag, VALUES.POSITION_BEFORE)) {
          chips.push({
            symbol: '⬅️',
            title: 'Positioned before another word',
            className: 'tag-detailed text-xs px-1 py-0.5 rounded border border-gray-300 text-gray-600 bg-transparent'
          })
        } else if (isValue(tag, VALUES.POSITION_AFTER)) {
          chips.push({
            symbol: '➡️',
            title: 'Positioned after another word',
            className: 'tag-detailed text-xs px-1 py-0.5 rounded border border-gray-300 text-gray-600 bg-transparent'
          })
        } else if (isValue(tag, VALUES.POSITION_BEFORE_AFTER)) {
          chips.push({
            symbol: '↔️',
            title: 'Can be positioned before or after another word',
            className: 'tag-detailed text-xs px-1 py-0.5 rounded border border-gray-300 text-gray-600 bg-transparent'
          })
        }
      }
    })

    // Register chips (translation-level, emoji-only display)
    core.forEach(tag => {
      if (isAttribute(tag, ATTRIBUTES.REGISTER)) {
        if (isValue(tag, VALUES.REGISTER_FORMAL)) {
          chips.push({
            symbol: TAG_DISPLAYS[VALUES.REGISTER_FORMAL].display,
            title: 'Formal register - use in professional/elevated contexts',
            className: TAG_DISPLAYS[VALUES.REGISTER_FORMAL].class
          })
        } else if (isValue(tag, VALUES.REGISTER_CASUAL)) {
          chips.push({
            symbol: TAG_DISPLAYS[VALUES.REGISTER_CASUAL].display,
            title: 'Casual register - informal/everyday speech',
            className: TAG_DISPLAYS[VALUES.REGISTER_CASUAL].class
          })
        } else if (isValue(tag, VALUES.REGISTER_MIXED)) {
          chips.push({
            symbol: TAG_DISPLAYS[VALUES.REGISTER_MIXED].display,
            title: 'Mixed register - appropriate in both formal and casual contexts',
            className: TAG_DISPLAYS[VALUES.REGISTER_MIXED].class
          })
        }
        // Note: REGISTER_NEUTRAL is intentionally excluded (not displayed)
      }
    })

    // Additional register values currently present locally
    core.forEach(tag => {
      if (!isAttribute(tag, ATTRIBUTES.REGISTER)) return
      const value = normalizeValue(tag.value_label)
      const registerLabelMap = {
        'archaic': 'archaic',
        'informal': 'informal',
        'literary': 'literary',
        'regional': 'regional',
        'vulgar': 'vulgar'
      }
      if (value === 'neutral') return
      if (registerLabelMap[value]) {
        addTextChip(registerLabelMap[value], `${registerLabelMap[value]} register`)
      }
    })

    // Transitivity chips (translation-level): ONLY show when multiple transitivity values exist at word level
    if (hasMultipleWordLevelTransitivities) {
      core.forEach(tag => {
        if (isAttribute(tag, ATTRIBUTES.TRANSITIVITY)) {
          const displayConfig = TAG_DISPLAYS[tag.value_id]
          if (displayConfig) {
            chips.push({
              symbol: displayConfig.display.split(' ')[0], // Use only emoji (🎯, 🌀, ⚖️)
              title: displayConfig.description,
              className: 'tag-detailed text-xs px-1 py-0.5 rounded border border-gray-300 text-gray-600 bg-transparent'
            })
          }
        }
      })
    }

    // Additional translation-level mapping coverage
    core.forEach(tag => {
      const attributeStableId = tag.attribute_stable_id
      const value = normalizeValue(tag.value_label)

      if (attributeStableId === 'metaattr031') {
        const articlePatternMap = {
          'definite-required': {
            display: 'def. article',
            description: 'Article pattern: this sense is normally used with a definite article'
          },
          'no-article': {
            display: 'no article',
            description: 'Article pattern: this sense is normally used without an article'
          },
          'flexible-article': {
            display: 'flex article',
            description: 'Article pattern: article choice varies by context'
          },
          'definite-or-partitive': {
            display: 'def/partitive',
            description: 'Article pattern: typically definite or partitive depending on meaning'
          },
          'optional-article': {
            display: 'opt article',
            description: 'Article pattern: article may be omitted in some standard contexts'
          },
          'fixed-no-article': {
            display: 'fixed no article',
            description: 'Article pattern: lexicalized fixed construction without article'
          }
        }
        if (articlePatternMap[value]) {
          addTextChip(articlePatternMap[value].display, articlePatternMap[value].description)
        }
      } else if (attributeStableId === 'metaattr059') {
        const cliticAvailabilityMap = {
          'core-clitic': {
            display: 'core clitic',
            description: 'Clitic availability: clitic usage is core/expected for this entry'
          },
          'supports_clitics': {
            display: 'supports clitics',
            description: 'Clitic availability: clitic usage is supported'
          },
          'no_clitics': {
            display: 'no clitics',
            description: 'Clitic availability: clitic forms are not used'
          },
          'no-clitics': {
            display: 'no clitics',
            description: 'Clitic availability: clitic forms are not used'
          },
          'reflexive-clitic': {
            display: 'refl clitic',
            description: 'Clitic availability: reflexive clitic usage'
          },
          'indirect-clitic': {
            display: 'indirect clitic',
            description: 'Clitic availability: indirect-object clitic usage'
          },
          'optional-clitic': {
            display: 'opt clitic',
            description: 'Clitic availability: clitic usage is optional'
          },
          'reciprocal-clitic': {
            display: 'recip clitic',
            description: 'Clitic availability: reciprocal clitic usage'
          }
        }
        if (cliticAvailabilityMap[value]) {
          addTextChip(cliticAvailabilityMap[value].display, cliticAvailabilityMap[value].description)
        }
      } else if (attributeStableId === 'metaattr032') {
        const countableMap = {
          'countable': {
            display: 'countable',
            description: 'Countability: can normally be counted and pluralized'
          },
          'uncountable': {
            display: 'uncountable',
            description: 'Countability: mass/uncountable usage in this sense'
          }
        }
        if (countableMap[value]) {
          addTextChip(countableMap[value].display, countableMap[value].description)
        }
      } else if (attributeStableId === 'metaattr055') {
        const governmentMap = {
          'governs_a': {
            display: 'gov. a',
            description: 'Government: this sense typically governs preposition "a"'
          },
          'governs_di': {
            display: 'gov. di',
            description: 'Government: this sense typically governs preposition "di"'
          },
          'governs_da': {
            display: 'gov. da',
            description: 'Government: this sense typically governs preposition "da"'
          },
          'governs_in': {
            display: 'gov. in',
            description: 'Government: this sense typically governs preposition "in"'
          },
          'governs_con': {
            display: 'gov. con',
            description: 'Government: this sense typically governs preposition "con"'
          },
          'governs_su': {
            display: 'gov. su',
            description: 'Government: this sense typically governs preposition "su"'
          },
          'governs_per': {
            display: 'gov. per',
            description: 'Government: this sense typically governs preposition "per"'
          },
          'invariable': {
            display: 'gov. invar',
            description: 'Government: no single fixed governing preposition'
          }
        }
        if (governmentMap[value]) {
          addTextChip(governmentMap[value].display, governmentMap[value].description)
        }
      } else if (attributeStableId === 'metaattr009') {
        const gradableMap = {
          'analytical-gradability': {
            display: 'analytical',
            description: 'Gradability: comparative/superlative usually formed analytically (più/meno)'
          },
          'full-gradability': {
            display: 'full grad.',
            description: 'Gradability: supports full gradation behavior'
          },
          'non-gradable': {
            display: 'non-grad.',
            description: 'Gradability: not normally gradable in this sense'
          }
        }
        if (gradableMap[value]) {
          addTextChip(gradableMap[value].display, gradableMap[value].description)
        }
      } else if (attributeStableId === 'metaattr050') {
        const interjectionTypeMap = {
          'acknowledgment': {
            display: 'acknowledgment',
            description: 'Interjection type: acknowledgment response'
          },
          'cognitive': {
            display: 'cognitive',
            description: 'Interjection type: expresses thought/realization'
          },
          'greeting': {
            display: 'greeting',
            description: 'Interjection type: greeting/farewell expression'
          },
          'exclamation': {
            display: 'exclamation',
            description: 'Interjection type: exclamatory reaction'
          },
          'cultural-phrase': {
            display: 'cultural phrase',
            description: 'Interjection type: fixed cultural expression'
          }
        }
        if (interjectionTypeMap[value]) {
          addTextChip(interjectionTypeMap[value].display, interjectionTypeMap[value].description)
        }
      } else if (attributeStableId === 'metaattr063') {
        const logicalRelationshipMap = {
          'addition': {
            display: 'addition',
            description: 'Logical relationship: adds information to the previous idea (e.g. and/also)'
          },
          'contrast': {
            display: 'contrast',
            description: 'Logical relationship: marks contrast or concession between ideas'
          },
          'disjunction': {
            display: 'disjunction',
            description: 'Logical relationship: presents alternatives or choices'
          },
          'causal': {
            display: 'causal',
            description: 'Logical relationship: introduces cause/reason'
          },
          'conditional': {
            display: 'conditional',
            description: 'Logical relationship: introduces a condition'
          },
          'temporal': {
            display: 'temporal',
            description: 'Logical relationship: links events by time/sequence'
          },
          'purpose': {
            display: 'purpose',
            description: 'Logical relationship: indicates goal or purpose'
          },
          'relative': {
            display: 'relative (logic)',
            description: 'Logical relationship: relative-linking function in discourse structure'
          }
        }
        if (logicalRelationshipMap[value]) {
          addTextChip(logicalRelationshipMap[value].display, logicalRelationshipMap[value].description)
        }
      } else if (attributeStableId === 'metaattr021') {
        const verbTypeMap = {
          'defective-verb': {
            display: 'defective',
            description: 'Verb type: some standard forms are missing from the paradigm'
          },
          'impersonal-verb': {
            display: 'impersonal',
            description: 'Verb type: used mainly in impersonal constructions, often third person'
          },
          'meteorological-verb': {
            display: 'meteorological',
            description: 'Verb type: weather/meteorological usage (e.g. rain/snow patterns)'
          },
          'modal-verb': {
            display: 'modal',
            description: 'Verb type: modal verb, typically combining with an infinitive'
          },
          'direct-reflexive': {
            display: 'direct reflexive',
            description: 'Verb type: direct reflexive meaning is central for this sense'
          },
          'reciprocal': {
            display: 'reciprocal',
            description: 'Verb type: reciprocal sense where participants act on each other'
          },
          'pronominal-variant': {
            display: 'pronominal',
            description: 'Verb type: pronominal variant with fixed clitic/particle behavior'
          },
          'transitive-verb': {
            display: 'transitive',
            description: 'Verb type: transitive class'
          },
          'intransitive-verb': {
            display: 'intransitive',
            description: 'Verb type: intransitive class'
          }
        }
        if (verbTypeMap[value]) {
          addTextChip(verbTypeMap[value].display, verbTypeMap[value].description)
        }
      } else if (attributeStableId === 'metaattr013') {
        const wordRestrictionMap = {
          'invariable': {
            display: 'invariable',
            description: 'Word restriction: this sense behaves as invariable in context'
          },
          'plural-only': {
            display: 'plural only',
            description: 'Word restriction: used only in plural forms'
          },
          'only-plural': {
            display: 'plural only',
            description: 'Word restriction: used only in plural forms'
          },
          'singular-only': {
            display: 'singular only',
            description: 'Word restriction: used only in singular forms'
          },
          'third-person-only': {
            display: '3rd person only',
            description: 'Word restriction: only third-person forms are used'
          },
          'third-singular-only': {
            display: '3rd singular only',
            description: 'Word restriction: only third-person singular is used'
          },
          'missing-first-second-person': {
            display: 'no 1st/2nd person',
            description: 'Word restriction: first and second person forms are not used'
          },
          'missing-imperative': {
            display: 'no imperative',
            description: 'Word restriction: imperative forms are not used'
          }
        }
        if (wordRestrictionMap[value]) {
          addTextChip(wordRestrictionMap[value].display, wordRestrictionMap[value].description)
        }
      }
    })

    return chips
  }

  const translations =
    word.processedTranslations ||
    (word.word_translations || [])
      .slice()
      .sort((a, b) => (a.display_priority || 999) - (b.display_priority || 999))
      .map(t => ({
        id: t.id,
        translation: t.translation,
        isPrimary: t.display_priority === 1,
        usageNotes: t.usage_notes,
        rpc_core: t.rpc_core || [],
        rpc_tags: t.rpc_tags || []
      })) || []

  // Word-level transitivity analysis - similar to auxiliaries
  const wordLevelTransitivities = new Set()
  translations.forEach(translation => {
    const transitivities = translation.rpc_core?.filter(tag => isAttribute(tag, ATTRIBUTES.TRANSITIVITY)) || []
    transitivities.forEach(tag => wordLevelTransitivities.add(tag.value_id))
  })
  const hasMultipleWordLevelTransitivities = wordLevelTransitivities.size > 1

  const normalizedPronunciationGroups = pronunciationGroups.length > 0
    ? (() => {
        const groupsById = new Map()

        pronunciationGroups.forEach((group, index) => {
          groupsById.set(group?.id || `pronunciation-group-${index}`, {
            ...group,
            key: group?.id || `pronunciation-group-${index}`,
            meaningItems: [],
            firstTranslationOrder: Number.MAX_SAFE_INTEGER
          })
        })

        translations.forEach((translation, translationIndex) => {
          const matchingGroup = pronunciationGroups.find((group) =>
            Array.isArray(group?.linked_translations) &&
            group.linked_translations.some((linkedTranslation) => linkedTranslation.id === translation.id)
          )

          if (!matchingGroup) return

          const groupKey = matchingGroup?.id || `pronunciation-group-${translationIndex}`
          const groupRef = groupsById.get(groupKey)
          if (!groupRef) return

          const linkedTranslation = matchingGroup.linked_translations.find((item) => item.id === translation.id)
          groupRef.meaningItems.push({
            key: linkedTranslation?.pronunciation_link_id || translation.id || `linked-translation-${translationIndex}`,
            kind: 'translation',
            translation,
            note: linkedTranslation?.note || ''
          })
          groupRef.firstTranslationOrder = Math.min(groupRef.firstTranslationOrder, translationIndex)
        })

        return Array.from(groupsById.values())
          .sort((a, b) => {
            if (a.firstTranslationOrder !== b.firstTranslationOrder) {
              return a.firstTranslationOrder - b.firstTranslationOrder
            }
            return 0
          })
          .filter(group => group.meaningItems.length > 0)
      })()
    : [
        {
          key: 'fallback-pronunciation-group',
          id: 'fallback-pronunciation-group',
          ipa_pronunciation: word.primary_ipa || null,
          phonetic_pronunciation: word.primary_phonetic || null,
          primary_audio: word.primary_audio || null,
          meaningItems: translations.map((translation, index) => ({
            key: translation.id || `fallback-translation-${index}`,
            kind: 'translation',
            translation
          }))
        }
      ].filter(group => group.meaningItems.length > 0)

  // Format context hint for display
  const formatContextHint = (usageNotes) => {
    if (usageNotes && usageNotes.length < 30) {
      return usageNotes
    }

    return ''
  }

  const toggleMeaningGroup = (groupKey) => {
    setExpandedMeaningGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  const renderMeaningRow = (item, index, groupKey) => {
    const isTranslation = item.kind === 'translation'
    const translation = item.translation
    const displayText = isTranslation ? translation?.translation : item.label
    const usageText = isTranslation
      ? formatContextHint(translation?.usageNotes || item.note)
      : formatContextHint(item.note)
    const meaningChips = isTranslation
      ? renderTranslationChips(translation, hasMultipleWordLevelTransitivities)
      : []

    return (
      <div key={item.key || `${groupKey}-${index}`}>
        <div className="flex items-start gap-2 py-1.5 min-h-[32px]">
          <div className="w-5 flex-shrink-0 pt-0.5 text-sm font-bold text-gray-500">
            {index}.
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-base ${isTranslation ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {displayText}
              </span>
              {meaningChips.length > 0 && (
                <span className="flex items-center gap-1 flex-wrap">
                  {meaningChips.map((chip, chipIndex) => (
                    <span
                      key={`meaning-chip-${groupKey}-${index}-${chipIndex}`}
                      className={`tag-essential ${chip.className}`}
                      data-description={chip.title}
                      onClick={handleTagClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {chip.symbol}
                    </span>
                  ))}
                </span>
              )}
            </div>
            {usageText && (
              <div className="mt-0.5 text-xs italic text-gray-500">
                {usageText}
              </div>
            )}
          </div>
          {isTranslation && (
            <div className="flex-shrink-0 pt-0.5">
              <button
                onClick={() => onAddToDeck && onAddToDeck(word, translation)}
                className="bg-emerald-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                title={`Study: ${translation.translation}`}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
  <div className={`
    word-card border-2 rounded-lg p-3 text-sm transition-all duration-200
    ${colors.border} ${colors.bg} ${colors.hover}
    word-card-${word.word_type.toLowerCase()} sketchy-fill
    relative
    ${className}
  `}>
      {/* Mobile-friendly tooltip */}
      {tooltip.show && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded px-2 py-1 max-w-xs pointer-events-none shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            zIndex: 10000
          }}
        >
          {tooltip.content}
        </div>
      )}
        {/* Main Word Header - New Layout */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Italian Word */}
            <h3 className={`text-3xl font-bold ${colors.text}`}>
              {word.italian}
            </h3>

            {/* Gender Tag */}
            {genderTag && (
              <span
                className={`tag-essential text-xs px-2 py-1 rounded-full font-semibold ${genderTag.class}`}
                data-description={genderTag.description}
                onClick={handleTagClick}
                style={{ cursor: 'pointer' }}
              >
                {genderTag.display}
              </span>
            )}

            {/* POS Chip */}
            {word.word_type === 'VERB' ? (
              <button
                onClick={() => setShowConjugations(true)}
                className={`px-3 py-1 rounded-full text-sm font-semibold border cursor-pointer active:translate-y-px transition-all ${colors.tag} ${colors.badgeHover}`}
                title="View conjugations"
              >
                {wordTypeLabel}
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colors.tag}`}>
                {wordTypeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Pronunciation-led meanings */}
        {normalizedPronunciationGroups.length > 0 && (
          <div className="mb-3 space-y-3">
            {normalizedPronunciationGroups.map((group) => {
              const groupLabel = formatPronunciationGroupLabel(group)
              const groupAudio = group?.primary_audio || null
              const visibleItems = group.meaningItems.slice(0, maxVisibleMeaningsPerGroup)
              const additionalItems = group.meaningItems.slice(maxVisibleMeaningsPerGroup)
              const isExpanded = !!expandedMeaningGroups[group.key]
              const translationItems = group.meaningItems.filter(item => item.kind === 'translation')
              const groupBaseNumber = translationItems.length > 0
                ? translations.findIndex(translation => translation.id === translationItems[0].translation?.id) + 1
                : 1

              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-white/70 bg-white/75 px-3 py-2 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-semibold text-gray-900">
                      {groupLabel}
                    </span>
                    <AudioButton
                      wordId={word.id}
                      italianText={word.italian}
                      audioObjectKey={groupAudio?.object_key || null}
                      audioBucket={groupAudio?.storage_bucket || null}
                      size="chip"
                      title={
                        groupAudio?.voice_name
                          ? `Play pronunciation variant (${groupAudio.voice_name})`
                          : 'Play pronunciation variant'
                      }
                      colorClass="bg-emerald-600 hover:bg-emerald-700"
                    />
                  </div>

                  <div className="space-y-1">
                    {visibleItems.map((item, index) => renderMeaningRow(item, groupBaseNumber + index, group.key))}

                    {additionalItems.length > 0 && (
                      <>
                        <button
                          onClick={() => toggleMeaningGroup(group.key)}
                          className="ml-7 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? '▾' : '▸'} {additionalItems.length} additional meaning{additionalItems.length === 1 ? '' : 's'}
                        </button>

                        {isExpanded && (
                          <div className="space-y-1">
                            {additionalItems.map((item, index) =>
                              renderMeaningRow(item, groupBaseNumber + visibleItems.length + index, group.key)
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Key Tags - Under Translations */}
        {orderedBottomTags.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-1">
            {orderedBottomTags.map((tag, index) => (
              <span
                key={index}
                className={`tag-detailed text-xs px-2 py-1 rounded-full font-semibold ${tag.class}`}
                data-description={tag.description}
                onClick={handleTagClick}
                style={{ cursor: 'pointer' }}
              >
                {tag.display}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Conjugation Modal */}
      {word.word_type === 'VERB' && (
        <ConjugationModal
          isOpen={showConjugations}
          onClose={() => setShowConjugations(false)}
          word={word}
          userAudioPreference="form-only"
        />
      )}
    </>
  )
}
