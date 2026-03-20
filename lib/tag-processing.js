// lib/tag-processing.js
// Extracted from WordCard.js: comprehensive RPC tag → display chip mapping.

import { ATTRIBUTES, VALUES, TAG_DISPLAYS, isAttribute, isValue, hasAttributeValue } from './meta-constants'

export function processRpcTagsForDisplay(coreTags, wordType, optionalTags = []) {
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
    const hasAvere = auxiliaries.includes('avere')
    const hasEssere = auxiliaries.includes('essere')

    if (hasAvere && hasEssere) {
      detailed.push({
        tag: 'auxiliary-combined',
        display: 'av./ess.',
        class: 'bg-teal-500 text-white',
        description: 'Uses both avere and essere in compound tenses'
      })
    } else {
      detailed.push({
        tag: 'auxiliary-multiple',
        display: `${auxiliaries.map(aux => aux === 'avere' ? 'av.' : aux === 'essere' ? 'ess.' : aux).join('/')}`,
        class: 'bg-teal-500 text-white',
        description: `Uses multiple auxiliaries: ${auxiliaries.join(', ')}`
      })
    }
  } else if (auxiliaries.length === 1) {
    const aux = auxiliaries[0]
    if (aux === 'avere') {
      detailed.push({
        tag: 'avere-auxiliary',
        display: 'avere',
        class: 'bg-teal-500 text-white',
        description: 'Uses avere in compound tenses'
      })
    } else if (aux === 'essere') {
      detailed.push({
        tag: 'essere-auxiliary',
        display: 'essere',
        class: 'bg-teal-500 text-white',
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
    else if (isAttribute(tag, ATTRIBUTES.NUMBER) && wordType === 'NOUN' && !hasNumberRestrictions) {
      if (normalizedValue === 'singolare' || normalizedValue === 'singular') {
        essential.push({
          tag: 'singolare',
          display: 'sing.',
          class: 'bg-cyan-500 text-white',
          description: 'Singular number form'
        })
      } else if (normalizedValue === 'plurale' || normalizedValue === 'plural') {
        essential.push({
          tag: 'plurale',
          display: 'pl.',
          class: 'bg-cyan-500 text-white',
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

    // FORM PATTERN MAPPING (detailed for adjectives)
    else if (isAttribute(tag, ATTRIBUTES.FORM_PATTERN) && wordType === 'ADJECTIVE') {
      if (valueLabel === 'form-4') {
        detailed.push({ tag: 'form-4', display: '4F', class: 'bg-blue-500 text-white', description: 'Form pattern: full agreement (rosso/rossa/rossi/rosse)' })
      } else if (valueLabel === 'form-2') {
        detailed.push({ tag: 'form-2', display: '2F', class: 'bg-blue-500 text-white', description: 'Form pattern: limited agreement (grande/grandi)' })
      } else if (valueLabel === 'form-invariable') {
        detailed.push({ tag: 'form-invariable', display: 'INV', class: 'bg-blue-500 text-white', description: 'Form pattern: invariable adjective form' })
      }
    }

    // GRADABLE MAPPING (detailed for adjectives)
    else if (isAttribute(tag, ATTRIBUTES.GRADABLE) && wordType === 'ADJECTIVE') {
      if (valueLabel === 'analytical-gradability') {
        detailed.push({ tag: 'gradable-analytical', display: 'analytical', class: 'bg-blue-500 text-white', description: 'Can form analytical comparatives with più/meno' })
      } else if (valueLabel === 'full-gradability') {
        detailed.push({ tag: 'gradable-full', display: 'fully gradable', class: 'bg-blue-500 text-white', description: 'Can form both analytical and synthetic comparatives' })
      } else if (valueLabel === 'non-gradable') {
        detailed.push({ tag: 'gradable-none', display: 'non-gradable', class: 'bg-blue-500 text-white', description: 'Cannot form comparatives' })
      }
    }

    // AUXILIARY VERB MAPPING - Handled by combined logic at top, skip individual processing

    // CONJUGATION TYPE MAPPING (detailed for verbs)
    else if (isAttribute(tag, ATTRIBUTES.CONJUGATION_TYPE) && wordType === 'VERB') {
      const conjMap = { 'are': '🔸 -are', 'ere': '🔹 -ere', 'ire': '🔶 -ire', 'ire-isc': '-ISC' }
      if (conjMap[valueLabel]) {
        const isIsc = valueLabel === 'ire-isc'
        detailed.push({
          tag: `${valueLabel}-conjugation`,
          display: conjMap[valueLabel],
          class: isIsc ? 'bg-yellow-500 text-white' : 'bg-teal-500 text-white',
          description: isIsc ? 'Uses -isc- infix in present forms' : `${valueLabel} conjugation group`
        })
      }
    }

    // REFLEXIVE MAPPING (detailed for verbs)
    else if (isAttribute(tag, ATTRIBUTES.REFLEXIVE) && wordType === 'VERB') {
      if (valueLabel === 'reflexive') {
        detailed.push({ tag: 'reflexive-verb', display: 'reflexive', class: 'bg-teal-500 text-white', description: 'Action reflects back on the subject' })
      }
    }

    // REGISTER MAPPING (only show non-neutral)
    else if (isAttribute(tag, ATTRIBUTES.REGISTER)) {
      if (normalizedValue === 'formal') {
        detailed.push({ tag: 'formal-register', display: 'formal', class: 'bg-gray-500 text-white', description: 'Formal contexts only' })
      } else if (normalizedValue === 'casual') {
        detailed.push({ tag: 'casual-register', display: 'casual', class: 'bg-gray-500 text-white', description: 'Casual/colloquial usage' })
      } else if (normalizedValue === 'archaic') {
        detailed.push({ tag: 'archaic-register', display: 'archaic', class: 'bg-gray-500 text-white', description: 'Archaic register' })
      } else if (normalizedValue === 'informal') {
        detailed.push({ tag: 'informal-register', display: 'informal', class: 'bg-gray-500 text-white', description: 'Informal register' })
      } else if (normalizedValue === 'literary') {
        detailed.push({ tag: 'literary-register', display: 'literary', class: 'bg-gray-500 text-white', description: 'Literary register' })
      } else if (normalizedValue === 'regional') {
        detailed.push({ tag: 'regional-register', display: 'regional', class: 'bg-gray-500 text-white', description: 'Regional register' })
      } else if (normalizedValue === 'vulgar') {
        detailed.push({ tag: 'vulgar-register', display: 'vulgar', class: 'bg-gray-500 text-white', description: 'Vulgar register' })
      }
    }

    // ADVERB TYPE MAPPING (detailed)
    else if (isAttribute(tag, ATTRIBUTES.ADVERB_TYPE)) {
      const advMap = {
        'manner': { display: 'manner', desc: 'Adverb type: describes how something is done' },
        'time': { display: 'time', desc: 'Adverb type: indicates when something happens' },
        'place': { display: 'place', desc: 'Adverb type: indicates where something happens' },
        'quantity': { display: 'quantity', desc: 'Adverb type: indicates amount or degree' },
        'frequency': { display: 'frequency', desc: 'Adverb type: indicates how often' },
        'affirmation': { display: 'affirmation', desc: 'Adverb type: expresses agreement or certainty' },
        'doubt': { display: 'doubt', desc: 'Adverb type: expresses uncertainty' },
        'negation': { display: 'negation', desc: 'Adverb type: expresses denial or refusal' },
        'interrogative': { display: 'interrogative', desc: 'Adverb type: used in questions' },
        'conjunctive': { display: 'conjunctive', desc: 'Adverb type: connects clauses/ideas' },
        'evaluation': { display: 'evaluation', desc: 'Adverb type: expresses judgement or opinion' },
        'emphasis': { display: 'emphasis', desc: 'Adverb type: adds emphasis or intensity' }
      }
      if (advMap[valueLabel]) {
        detailed.push({ tag: `adverb-${valueLabel}`, display: advMap[valueLabel].display, class: 'bg-purple-500 text-white', description: advMap[valueLabel].desc })
      }
    }

    // REFLEXIVE MAPPING (essential)
    else if (isAttribute(tag, ATTRIBUTES.REFLEXIVE)) {
      if (valueLabel === 'reflexive') {
        essential.push({ tag: 'reflexive', display: 'REFL', class: 'bg-teal-500 text-white', description: 'Reflexive verb (action directed to subject)' })
      }
    }

    // PLURAL_FORMATION MAPPING (detailed for nouns)
    else if (isAttribute(tag, ATTRIBUTES.PLURAL_FORMATION) && wordType === 'NOUN') {
      const pluralMap = {
        'plural-e': { display: 'plural-e', desc: 'Forms plural by changing -a to -e' },
        'plural-i': { display: 'plural-i', desc: 'Forms plural by changing -o to -i' },
        'plural-e-to-i': { display: 'plural e→i', desc: 'Forms plural by changing -e to -i' },
        'plural-invariable': { display: 'plural inv.', desc: 'Invariable plural form' },
        'plural-irregular': { display: 'plural irreg.', desc: 'Irregular plural formation' }
      }
      if (pluralMap[valueLabel]) {
        detailed.push({ tag: `plural-formation-${valueLabel}`, display: pluralMap[valueLabel].display, class: 'bg-cyan-500 text-white', description: pluralMap[valueLabel].desc })
      }
    }

    else if (attributeStableId === 'metaattr030') {
      const adjectiveTypeMap = {
        'qualitative': { display: 'qualitative', description: 'Adjective type: expresses an inherent quality and is usually gradable' },
        'fixed-comparative': { display: 'fixed comp.', description: 'Adjective type: lexicalised comparative/superlative form, not regular gradation' },
        'relational': { display: 'relational', description: 'Adjective type: category/material/origin adjective, usually not gradable' }
      }
      if (adjectiveTypeMap[normalizedValue]) {
        detailed.push({ tag: `adjective-type-${normalizedValue}`, display: adjectiveTypeMap[normalizedValue].display, class: wordThemeClass, description: adjectiveTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr_matrix5_abbreviation_type') {
      const abbreviationTypeMap = {
        'initialism': { display: 'initialism', description: 'Abbreviation type: pronounced letter by letter' },
        'acronym': { display: 'acronym', description: 'Abbreviation type: pronounced like a word' }
      }
      if (abbreviationTypeMap[normalizedValue]) {
        detailed.push({ tag: `abbreviation-type-${normalizedValue}`, display: abbreviationTypeMap[normalizedValue].display, class: wordThemeClass, description: abbreviationTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr_matrix5_affix_type') {
      const affixTypeMap = {
        'prefix': { display: 'prefix', description: 'Affix type: morpheme attached before a base word' }
      }
      if (affixTypeMap[normalizedValue]) {
        detailed.push({ tag: `affix-type-${normalizedValue}`, display: affixTypeMap[normalizedValue].display, class: wordThemeClass, description: affixTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr062') {
      const conjunctionTypeMap = {
        'coordinating': { display: 'coord.', description: 'Conjunction type: links words/clauses of equal grammatical rank' },
        'subordinating': { display: 'subord.', description: 'Conjunction type: introduces a subordinate clause' },
        'correlative': { display: 'correl.', description: 'Conjunction type: paired construction (e.g. either...or)' }
      }
      if (conjunctionTypeMap[normalizedValue]) {
        detailed.push({ tag: `conjunction-type-${normalizedValue}`, display: conjunctionTypeMap[normalizedValue].display, class: wordThemeClass, description: conjunctionTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr061') {
      const determinerTypeMap = {
        'article': { display: 'article det.', description: 'Determiner type: article, marks definiteness' },
        'demonstrative': { display: 'demonstr. det.', description: 'Determiner type: points to a specific referent' },
        'indefinite-article': { display: 'indef. det.', description: 'Determiner type: introduces a non-specific referent' },
        'interrogative': { display: 'interrog. det.', description: 'Determiner type: used to ask which/what/how many' },
        'possessive': { display: 'possess. det.', description: 'Determiner type: marks possession or association' },
        'quantifier': { display: 'quant. det.', description: 'Determiner type: expresses amount or quantity' }
      }
      if (determinerTypeMap[normalizedValue]) {
        detailed.push({ tag: `determiner-type-${normalizedValue}`, display: determinerTypeMap[normalizedValue].display, class: wordThemeClass, description: determinerTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr069') {
      // expression_type is intentionally hidden
    }
    else if (attributeStableId === 'metaattr060') {
      const prepositionTypeMap = {
        'simple': { display: 'simple prep.', description: 'Preposition type: single-word basic preposition' },
        'complex': { display: 'complex prep.', description: 'Preposition type: multiword prepositional expression' },
        'contracted': { display: 'contracted prep.', description: 'Preposition type: fused preposition+article form' }
      }
      if (prepositionTypeMap[normalizedValue]) {
        detailed.push({ tag: `preposition-type-${normalizedValue}`, display: prepositionTypeMap[normalizedValue].display, class: wordThemeClass, description: prepositionTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr041') {
      const pronounFormMap = {
        'full': { display: 'full form', description: 'Pronoun form: full standalone form' },
        'clitic': { display: 'clitic form', description: 'Pronoun form: reduced form that attaches to a verb' },
        'combined': { display: 'combined form', description: 'Pronoun form: combined clitic cluster' },
        'elision': { display: 'elided form', description: 'Pronoun form: shortened before a vowel' }
      }
      if (pronounFormMap[normalizedValue]) {
        detailed.push({ tag: `pronoun-form-${normalizedValue}`, display: pronounFormMap[normalizedValue].display, class: wordThemeClass, description: pronounFormMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr040') {
      const pronounTypeMap = {
        'personal': { display: 'personal pron.', description: 'Pronoun type: personal pronoun' },
        'clitic': { display: 'clitic pron.', description: 'Pronoun type: clitic pronoun category' },
        'indefinite': { display: 'indef. pron.', description: 'Pronoun type: indefinite pronoun' },
        'relative': { display: 'relative pron.', description: 'Pronoun type: relative pronoun' },
        'demonstrative': { display: 'demonstr. pron.', description: 'Pronoun type: demonstrative pronoun' }
      }
      if (pronounTypeMap[normalizedValue]) {
        detailed.push({ tag: `pronoun-type-${normalizedValue}`, display: pronounTypeMap[normalizedValue].display, class: wordThemeClass, description: pronounTypeMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr035') {
      const phonologyPositionMap = {
        'after-noun': { display: 'post-nom.', description: 'Phonology position: form used after the noun' },
        'before-most-consonants': { display: 'pre consonant', description: 'Phonology position: form used before most consonant onsets' },
        'before-impure-consonant': { display: 'pre impure', description: 'Phonology position: form used before impure consonants' },
        'before-vowel-or-h': { display: 'pre vowel/h', description: 'Phonology position: form used before vowel or silent h' }
      }
      if (phonologyPositionMap[normalizedValue]) {
        detailed.push({ tag: `phonology-position-${normalizedValue}`, display: phonologyPositionMap[normalizedValue].display, class: wordThemeClass, description: phonologyPositionMap[normalizedValue].description })
      }
    }
    else if (attributeStableId === 'metaattr057' && wordType === 'NOUN') {
      const nounTypeMap = { common: 'common noun', proper: 'proper noun' }
      if (nounTypeMap[valueLabel]) {
        detailed.push({
          tag: `noun-type-${valueLabel}`,
          display: nounTypeMap[valueLabel],
          class: 'bg-cyan-500 text-white',
          description: valueLabel === 'common' ? 'Noun type: common noun' : 'Noun type: proper noun'
        })
      }
    }

    // TRANSITIVITY MAPPING (detailed for verbs)
    else if (isAttribute(tag, ATTRIBUTES.TRANSITIVITY) && wordType === 'VERB') {
      const displayConfig = TAG_DISPLAYS[valueId]
      if (displayConfig) {
        let display = displayConfig.display
        if (isValue(tag, VALUES.TRANSITIVITY_TRANSITIVE)) display = 'transitive'
        else if (isValue(tag, VALUES.TRANSITIVITY_INTRANSITIVE)) display = 'intransitive'
        else if (isValue(tag, VALUES.TRANSITIVITY_AMBITRANSITIVE)) display = 'ambitransitive'

        detailed.push({
          tag: `transitivity-${valueLabel}`,
          display: display,
          class: 'bg-teal-500 text-white',
          description: displayConfig.description
        })
      }
    }

    // NUMBER RESTRICTION MAPPING (essential)
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
