'use client'

// components/WordCard.js
// Complete WordCard component with conjugation integration added

import { useState, useEffect } from 'react'
import AudioButton from './AudioButton'
import ConjugationModal from './ConjugationModal' // NEW IMPORT
import { checkPremiumAudio } from '../lib/audio-utils'

export default function WordCard({ word, onAddToDeck, className = '' }) {
  const [showForms, setShowForms] = useState(false)
  const [showRelationships, setShowRelationships] = useState(false)
  const [showConjugations, setShowConjugations] = useState(false) // NEW STATE
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 })

  // Get audio information
  const { hasPremiumAudio, audioFilename, voiceName } = checkPremiumAudio(word)

  // Mobile-friendly tag tooltip system
  const handleTagClick = (event) => {
    const tag = event.target.closest('.tag-essential, .tag-detailed')
    if (!tag || !tag.title) return
    
    event.preventDefault()
    event.stopPropagation()
    
    const rect = tag.getBoundingClientRect()
    const tooltipX = Math.min(rect.left, window.innerWidth - 250) // Prevent overflow
    const tooltipY = rect.top - 35 // Position above the tag
    
    setTooltip({
      show: true,
      content: tag.title,
      x: tooltipX,
      y: tooltipY
    })
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setTooltip(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  // Hide tooltip when clicking elsewhere
  const hideTooltip = (event) => {
    if (!event.target.closest('.tag-essential, .tag-detailed')) {
      setTooltip(prev => ({ ...prev, show: false }))
    }
  }

  // Set up click handlers for tooltips
  useEffect(() => {
    document.addEventListener('click', hideTooltip)
    return () => {
      document.removeEventListener('click', hideTooltip)
    }
  }, [])

  // Tag processing system with three-tier classification
  const processTagsForDisplay = (tags, wordType) => {
    const essential = [];
    const detailed = [];

    const tagMap = {
      // PRIMARY TAGS - Consistent across all word types, filled backgrounds with emojis
      'masculine': { 
        display: '♂', 
        class: 'tag-primary-gender-masc', 
        essential: wordType === 'NOUN', 
        description: 'Masculine gender requiring masculine articles (il, un)' 
      },
      'feminine': { 
        display: '♀', 
        class: 'tag-primary-gender-fem', 
        essential: wordType === 'NOUN', 
        description: 'Feminine gender requiring feminine articles (la, una)' 
      },
      'common-gender': { 
        display: '⚥', 
        class: 'tag-primary-gender-common', 
        essential: wordType === 'NOUN', 
        description: 'Same form for both genders, determined by article' 
      },
      
      // Irregularity (essential when present)
      'irregular-pattern': { 
        display: '⚠️ IRREG', 
        class: 'tag-primary-irregular', 
        essential: true, 
        description: 'Does not follow standard patterns' 
      },
      'form-irregular': { 
        display: '⚠️ IRREG', 
        class: 'tag-primary-irregular', 
        essential: true, 
        description: 'Special rules or position-dependent forms' 
      },
      
      // ISC Conjugation (essential for verbs)
      'ire-isc-conjugation': { 
        display: '-ISC', 
        class: 'tag-primary-isc', 
        essential: wordType === 'VERB', 
        description: 'Uses -isc- infix in present forms' 
      },
      
      // CEFR Levels (essential)
      'CEFR-A1': { display: '📚 A1', class: 'tag-primary-level', essential: true, description: 'Beginner level vocabulary' },
      'CEFR-A2': { display: '📚 A2', class: 'tag-primary-level', essential: true, description: 'Elementary level vocabulary' },
      'CEFR-B1': { display: '📚 B1', class: 'tag-primary-level', essential: true, description: 'Intermediate level vocabulary' },
      'CEFR-B2': { display: '📚 B2', class: 'tag-primary-level', essential: true, description: 'Upper intermediate vocabulary' },
      'CEFR-C1': { display: '📚 C1', class: 'tag-primary-level', essential: true, description: 'Advanced level vocabulary' },
      'CEFR-C2': { display: '📚 C2', class: 'tag-primary-level', essential: true, description: 'Proficiency level vocabulary' },
      
      // Frequency (essential)
      'freq-top100': { display: '⭐ 100', class: 'tag-primary-freq', essential: true, description: 'Top 100 most frequent words' },
      'freq-top200': { display: '⭐ 200', class: 'tag-primary-freq', essential: true, description: 'Top 200 most frequent words' },
      'freq-top300': { display: '⭐ 300', class: 'tag-primary-freq', essential: true, description: 'Top 300 most frequent words' },
      'freq-top500': { display: '⭐ 500', class: 'tag-primary-freq', essential: true, description: 'Top 500 most frequent words' },
      'freq-top1000': { display: '⭐ 1K', class: 'tag-primary-freq', essential: true, description: 'Top 1000 most frequent words' },
      'freq-top5000': { display: '⭐ 5K', class: 'tag-primary-freq', essential: true, description: 'Top 5000 most frequent words' },
      
      // Advanced Fluency (essential)
      'native': { display: '🗣️ NAT', class: 'tag-primary-level', essential: true, description: 'Natural native-speaker vocabulary' },
      'business': { display: '💼 BIZ', class: 'tag-primary-level', essential: true, description: 'Professional/commercial terminology' },
      'academic': { display: '🎓 ACAD', class: 'tag-primary-level', essential: true, description: 'Scholarly and technical vocabulary' },
      'literary': { display: '📜 LIT', class: 'tag-primary-level', essential: true, description: 'Literary and artistic language' },
      'regional': { display: '🗺️ REG', class: 'tag-primary-level', essential: true, description: 'Regional dialects and variants' },
      
      // SECONDARY TAGS - Unfilled, consistent emojis across word types
      'are-conjugation': { display: '🔸 -are', class: 'tag-secondary', essential: false, description: 'First conjugation group' },
      'ere-conjugation': { display: '🔹 -ere', class: 'tag-secondary', essential: false, description: 'Second conjugation group' },
      'ire-conjugation': { display: '🔶 -ire', class: 'tag-secondary', essential: false, description: 'Third conjugation group' },
      
      // Auxiliary Verbs (detailed)
      'avere-auxiliary': { display: '🤝 avere', class: 'tag-secondary', essential: false, description: 'Uses avere in compound tenses' },
      'essere-auxiliary': { display: '🫱 essere', class: 'tag-secondary', essential: false, description: 'Uses essere in compound tenses' },
      'both-auxiliary': { display: '🤜🤛 both', class: 'tag-secondary', essential: false, description: 'Can use either auxiliary' },
      
      // Transitivity (detailed)
      'transitive-verb': { display: '➡️ trans', class: 'tag-secondary', essential: false, description: 'Takes a direct object' },
      'intransitive-verb': { display: '↩️ intrans', class: 'tag-secondary', essential: false, description: 'Does not take direct object' },
      'both-transitivity': { display: '↔️ both', class: 'tag-secondary', essential: false, description: 'Can be both transitive and intransitive' },

      // Plural patterns (detailed)
      'plural-i': { display: '📝 plural-i', class: 'tag-secondary', essential: false, description: 'Forms plural by changing ending to -i' },
      'plural-e': { display: '📄 plural-e', class: 'tag-secondary', essential: false, description: 'Forms plural by changing ending to -e' },
      'plural-a': { display: '📃 plural-a', class: 'tag-secondary', essential: false, description: 'Masculine noun with feminine -a plural' },
      'plural-invariable': { display: '🔒 invariable', class: 'tag-secondary', essential: false, description: 'Identical singular and plural forms' },
      'plural-only': { display: '👥 plural-only', class: 'tag-secondary', essential: false, description: 'Noun exists only in plural form' },
      'singular-only': { display: '👤 sing-only', class: 'tag-secondary', essential: false, description: 'Mass/uncountable noun typically singular only' },
      'plural-irregular': { display: '🔄 plural-irreg', class: 'tag-secondary', essential: false, description: 'Unique irregular plural formation' },
      
      // Form patterns (detailed)
      'form-4': { display: '📋 form-4', class: 'tag-secondary', essential: false, description: 'Four distinct forms for gender/number' },
      'form-2': { display: '📑 form-2', class: 'tag-secondary', essential: false, description: 'Two forms: -e for singular, -i for plural' },
      'form-invariable': { display: '🔐 invariable', class: 'tag-secondary', essential: false, description: 'Form never changes' },
      'type-gradable': { display: '📈 gradable', class: 'tag-secondary', essential: false, description: 'Can be intensified or compared' },
      'type-absolute': { display: '🛑 absolute', class: 'tag-secondary', essential: false, description: 'Cannot be graded logically' },

      // Adverb types (detailed) - consistent emojis across all word types
      'type-manner': { display: '🎭 manner', class: 'tag-secondary', essential: false, description: 'Describes how action is performed' },
      'type-time': { display: '⏰ time', class: 'tag-secondary', essential: false, description: 'Indicates when action occurs' },
      'type-place': { display: '📍 place', class: 'tag-secondary', essential: false, description: 'Indicates where action occurs' },
      'type-quantity': { display: '📊 quantity', class: 'tag-secondary', essential: false, description: 'Expresses how much or degree' },
      'type-frequency': { display: '🔁 frequency', class: 'tag-secondary', essential: false, description: 'Indicates how often' },
      'type-affirming': { display: '✅ affirming', class: 'tag-secondary', essential: false, description: 'Used to affirm or confirm' },
      'type-negating': { display: '❌ negating', class: 'tag-secondary', essential: false, description: 'Used to negate or deny' },
      'type-doubting': { display: '🤔 doubting', class: 'tag-secondary', essential: false, description: 'Expresses doubt or uncertainty' },
      'type-interrogative': { display: '❔ question', class: 'tag-secondary', essential: false, description: 'Used to ask questions' },
      
      // Topics (detailed) - consistent emojis across all word types
      'topic-place': { display: '🌍 place', class: 'tag-secondary', essential: false, description: 'Geographical locations or spaces' },
      'topic-food': { display: '🍕 food', class: 'tag-secondary', essential: false, description: 'Food and drink vocabulary' },
      'topic-bodypart': { display: '👁️ body', class: 'tag-secondary', essential: false, description: 'Parts of the body' },
      'topic-profession': { display: '👩‍💼 job', class: 'tag-secondary', essential: false, description: 'Jobs and professional roles' },
      'topic-abstract': { display: '💭 abstract', class: 'tag-secondary', essential: false, description: 'Concepts, ideas, and feelings' },
      'topic-daily-life': { display: '🏡 daily', class: 'tag-secondary', essential: false, description: 'Everyday activities and household' },

      // Verb properties (detailed)
      'reflexive-verb': { display: '🪞 reflexive', class: 'tag-secondary', essential: false, description: 'Action reflects back on the subject' },
      'modal-verb': { display: '🔑 modal', class: 'tag-secondary', essential: false, description: 'Expresses necessity, possibility, or ability' },
      'impersonal-verb': { display: '☁️ impersonal', class: 'tag-secondary', essential: false, description: 'Used only in third person singular' },
      'defective-verb': { display: '🔧 defective', class: 'tag-secondary', essential: false, description: 'Missing certain tenses or persons' }
    };

    (tags || []).forEach(tag => {
      const tagInfo = tagMap[tag];
      if (tagInfo) {
        if (tagInfo.essential) {
          essential.push({
            tag,
            display: tagInfo.display,
            class: tagInfo.class,
            description: tagInfo.description
          });
        } else {
          detailed.push({
            tag,
            display: tagInfo.display,
            class: tagInfo.class,
            description: tagInfo.description
          });
        }
      }
    });

    return { essential, detailed };
  };

  // Word type colors
  const getWordTypeColors = (wordType) => {
    const colors = {
      'VERB': {
        border: 'border-teal-200',
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-100',
        tag: 'bg-teal-100 text-teal-800',
        text: 'text-teal-900'
      },
      'NOUN': {
        border: 'border-cyan-200',
        bg: 'bg-cyan-50',
        hover: 'hover:bg-cyan-100',
        tag: 'bg-cyan-100 text-cyan-800',
        text: 'text-cyan-900'
      },
      'ADJECTIVE': {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        tag: 'bg-blue-100 text-blue-800',
        text: 'text-blue-900'
      },
      'ADVERB': {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        tag: 'bg-purple-100 text-purple-800',
        text: 'text-purple-900'
      }
    }

    return colors[wordType] || {
      border: 'border-gray-200',
      bg: 'bg-gray-50',
      hover: 'hover:bg-gray-100',
      tag: 'bg-gray-100 text-gray-800',
      text: 'text-gray-900'
    }
  }

  const colors = getWordTypeColors(word.word_type)

  // Process tags using original system
  const processedTags = processTagsForDisplay(word.tags, word.word_type)

  // Article display for nouns with diamond separators
  const renderArticleDisplay = () => {
    if (word.word_type !== 'NOUN' || !word.articles) return null

    return (
      <div className="article-display mb-2">
        {word.articles.singular} • {word.articles.plural} • {word.articles.indefinite.singular}
      </div>
    )
  }

  // Tag rendering with proper classes and tooltip support
  const renderTags = (tags, type = 'essential') => {
    if (!tags || tags.length === 0) return null

    return tags.map((tag, index) => (
      <span
        key={index}
        className={`tag-${type} ${tag.class}`}
        title={tag.description}
        onClick={handleTagClick}
        style={{ cursor: 'pointer' }}
      >
        {tag.display}
      </span>
    ))
  }

  // Render word forms section
  const renderWordForms = () => {
    if (!word.forms || word.forms.length === 0) return null

    const formsPreview = word.forms.slice(0, 3)
      .map(form => (
        <span key={form.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
          {form.form_text}
        </span>
      ))

    return (
      <div className="mt-2">
        <button 
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-2 btn-sketchy"
          onClick={() => setShowForms(!showForms)}
        >
          <span>📝 {word.forms.length} forms</span>
          <div className="flex gap-1">
            {formsPreview}
          </div>
        </button>
        
        {showForms && (
          <div className="word-forms-container expanded mt-2 p-3 bg-gray-50 rounded transition-all duration-300">
            <div className="grid grid-cols-2 gap-2">
              {word.forms.map(form => (
                <div key={form.id} className="text-xs">
                  <strong>{form.form_text}</strong>
                  {form.translation && (
                    <div className="text-gray-600">{form.translation}</div>
                  )}
                  {(form.form_mood || form.form_tense) && (
                    <div className="text-gray-500">
                      {[form.form_mood, form.form_tense, form.form_person, form.form_number]
                        .filter(Boolean)
                        .join(' ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render relationships section
  const renderRelationships = () => {
    if (!word.relationships || word.relationships.length === 0) return null

    return (
      <div className="mt-2">
        <button 
          className="text-xs text-purple-600 hover:text-purple-800 btn-sketchy"
          onClick={() => setShowRelationships(!showRelationships)}
        >
          🔗 {word.relationships.length} related words
        </button>
        
        {showRelationships && (
          <div className="relationships-container expanded mt-2 p-3 bg-purple-50 rounded transition-all duration-300">
            {word.relationships.map((rel, index) => (
              <div key={index} className="text-xs mb-1">
                <strong>{rel.italian}</strong>
                <span className="text-gray-600"> ({rel.english})</span>
                <div className="text-purple-600">
                  {rel.relationship_type.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // NEW: Render verb-specific features
  const renderVerbFeatures = () => {
    if (word.word_type !== 'VERB') return null

    return (
      <div className="mt-2">
        <button
          onClick={() => setShowConjugations(true)}
          className="text-sm bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition-colors mr-2 btn-sketchy"
        >
          📝 Conjugations
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile-friendly tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-gray-800 text-white text-xs rounded px-2 py-1 z-50 max-w-xs pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.content}
        </div>
      )}

      <div className={`
        word-card border-2 rounded-lg p-4 transition-all duration-200
        ${colors.border} ${colors.bg} ${colors.hover}
        word-card-${word.word_type.toLowerCase()} sketchy-fill
        ${className}
      `}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {renderArticleDisplay()}
            
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-xl font-semibold ${colors.text}`}>
                {word.italian}
              </h3>
              
              <AudioButton
                wordId={word.id}
                italianText={word.italian}
                audioFilename={audioFilename}
                size="md"
                title={hasPremiumAudio ? `Play premium audio (${voiceName})` : 'Play pronunciation'}
              />
              
              {renderTags(processedTags.essential, 'essential')}
            </div>
            
            <p className={`text-base mb-3 opacity-80 ${colors.text}`}>
              {word.english}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <span className={`tag-essential tag-word-type ${colors.tag}`}>
                {word.word_type.toLowerCase()}
              </span>
              {renderTags(processedTags.detailed, 'detailed')}
            </div>
            
            {/* NEW: Add verb features */}
            {renderVerbFeatures()}
            
            {renderWordForms()}
            {renderRelationships()}
          </div>
          
          <button 
            onClick={() => onAddToDeck && onAddToDeck(word)}
            className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4 flex-shrink-0 btn-sketchy"
          >
            + Add
          </button>
        </div>
      </div>
      
      {/* NEW: Conjugation Modal */}
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
