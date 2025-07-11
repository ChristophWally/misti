'use client'

// components/WordCard.js
// Individual word card component for dictionary display

import { useState } from 'react'
import AudioButton from './AudioButton'
import { checkPremiumAudio } from '../lib/audio-utils'

export default function WordCard({ word, onAddToDeck, className = '' }) {
  const [showForms, setShowForms] = useState(false)
  const [showRelationships, setShowRelationships] = useState(false)

  // Get audio information
  const { hasPremiumAudio, audioFilename, voiceName } = checkPremiumAudio(word)

  // Process tags for visual display with original tag system from main branch
  const processTagsForDisplay = (tags, wordType) => {
    const essential = [];
    const detailed = [];

    const tagMap = {
      // Gender (essential for nouns)
      'masculine': { display: '♂', class: 'bg-blue-100 text-blue-800', essential: wordType === 'NOUN', description: 'Masculine gender' },
      'feminine': { display: '♀', class: 'bg-pink-100 text-pink-800', essential: wordType === 'NOUN', description: 'Feminine gender' },
      'common-gender': { display: '⚥', class: 'bg-purple-100 text-purple-800', essential: wordType === 'NOUN', description: 'Common gender' },
      
      // Irregularity (essential when present)
      'irregular-pattern': { display: 'IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Irregular pattern' },
      'form-irregular': { display: 'IRREG', class: 'bg-red-100 text-red-800', essential: true, description: 'Irregular forms' },
      
      // ISC Conjugation (essential for verbs)
      'ire-isc-conjugation': { display: '-ISC', class: 'bg-yellow-100 text-yellow-800', essential: wordType === 'VERB', description: 'Uses -isc- infix' },
      
      // CEFR Levels (essential)
      'CEFR-A1': { display: 'A1', class: 'bg-green-100 text-green-800', essential: true, description: 'Beginner level' },
      'CEFR-A2': { display: 'A2', class: 'bg-green-100 text-green-800', essential: true, description: 'Elementary level' },
      'CEFR-B1': { display: 'B1', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Intermediate level' },
      'CEFR-B2': { display: 'B2', class: 'bg-blue-100 text-blue-800', essential: true, description: 'Upper intermediate' },
      'CEFR-C1': { display: 'C1', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Advanced level' },
      'CEFR-C2': { display: 'C2', class: 'bg-purple-100 text-purple-800', essential: true, description: 'Proficiency level' },
      
      // Frequency (essential)
      'freq-top100': { display: '★100', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 100 words' },
      'freq-top200': { display: '★200', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 200 words' },
      'freq-top300': { display: '★300', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 300 words' },
      'freq-top500': { display: '★500', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 500 words' },
      'freq-top1000': { display: '★1K', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 1000 words' },
      'freq-top5000': { display: '★5K', class: 'bg-yellow-100 text-yellow-800', essential: true, description: 'Top 5000 words' },
      
      // Conjugation Groups (detailed)
      'are-conjugation': { display: '-are', class: 'bg-teal-100 text-teal-800', essential: false, description: 'First conjugation' },
      'ere-conjugation': { display: '-ere', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Second conjugation' },
      'ire-conjugation': { display: '-ire', class: 'bg-teal-100 text-teal-800', essential: false, description: 'Third conjugation' },
      
      // Auxiliary Verbs (detailed)
      'avere-auxiliary': { display: 'avere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses avere' },
      'essere-auxiliary': { display: 'essere', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses essere' },
      'both-auxiliary': { display: 'both', class: 'bg-blue-100 text-blue-800', essential: false, description: 'Uses both auxiliaries' },
      
      // Transitivity (detailed)
      'transitive-verb': { display: 'trans', class: 'bg-green-100 text-green-800', essential: false, description: 'Transitive verb' },
      'intransitive-verb': { display: 'intrans', class: 'bg-green-100 text-green-800', essential: false, description: 'Intransitive verb' },
      'both-transitivity': { display: 'both', class: 'bg-green-100 text-green-800', essential: false, description: 'Both transitive/intransitive' },

      // Plural patterns (detailed)
      'plural-i': { display: 'plural-i', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Plural with -i' },
      'plural-e': { display: 'plural-e', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Plural with -e' },
      'plural-invariable': { display: 'invariable', class: 'bg-gray-100 text-gray-800', essential: false, description: 'Invariable plural' },
      
      // Topics (detailed)
      'topic-place': { display: 'place', class: 'bg-emerald-100 text-emerald-800', essential: false, description: 'Places and locations' },
      'topic-food': { display: 'food', class: 'bg-orange-100 text-orange-800', essential: false, description: 'Food and drink' },
      'topic-daily-life': { display: 'daily', class: 'bg-green-100 text-green-800', essential: false, description: 'Daily life' }
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

  // Render article display for nouns
  const renderArticleDisplay = () => {
    if (word.word_type !== 'NOUN' || !word.articles) return null

    return (
      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className="font-semibold text-emerald-600">{word.articles.singular}</span>
        <span className="text-gray-400">/</span>
        <span className="font-semibold text-emerald-600">{word.articles.plural}</span>
        <span className="text-gray-500">(definite)</span>
        <span className="font-semibold text-emerald-600 ml-2">{word.articles.indefinite.singular}</span>
        <span className="text-gray-500">(indefinite)</span>
      </div>
    )
  }

  // Render tags with original styling
  const renderTags = (tags, type = 'essential') => {
    if (!tags || tags.length === 0) return null

    return tags.map((tag, index) => (
      <span
        key={index}
        className={`tag-${type} ${tag.class}`}
        title={tag.description}
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
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-2"
          onClick={() => setShowForms(!showForms)}
        >
          <span>📝 {word.forms.length} forms</span>
          <div className="flex gap-1">
            {formsPreview}
          </div>
        </button>
        
        {showForms && (
          <div className="mt-2 p-3 bg-gray-50 rounded transition-all duration-300">
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
          className="text-xs text-purple-600 hover:text-purple-800"
          onClick={() => setShowRelationships(!showRelationships)}
        >
          🔗 {word.relationships.length} related words
        </button>
        
        {showRelationships && (
          <div className="mt-2 p-3 bg-purple-50 rounded transition-all duration-300">
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

  return (
    <div className={`
      word-card border-2 rounded-lg p-4 transition-all duration-200
      ${colors.border} ${colors.bg} ${colors.hover}
      hover:transform hover:-translate-y-1 hover:shadow-lg
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
            <span className={`inline-block text-xs px-2 py-1 rounded-full ${colors.tag}`}>
              {word.word_type.toLowerCase()}
            </span>
            {renderTags(processedTags.detailed, 'detailed')}
          </div>
          
          {renderWordForms()}
          {renderRelationships()}
        </div>
        
        <button 
          onClick={() => onAddToDeck && onAddToDeck(word)}
          className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 transition-colors ml-4 flex-shrink-0"
        >
          + Add
        </button>
      </div>
    </div>
  )
}
