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

  // Get word type colors
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

  // Render tags
  const renderTags = (tags, type = 'essential') => {
    if (!tags || tags.length === 0) return null

    return tags.map((tag, index) => (
      <span
        key={index}
        className={`
          inline-block text-xs font-semibold px-2 py-1 rounded-full mx-0.5 my-0.5
          ${tag.class} 
          cursor-help border border-opacity-20
        `}
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
            
            {word.processedTags?.essential && renderTags(word.processedTags.essential, 'essential')}
          </div>
          
          <p className={`text-base mb-3 opacity-80 ${colors.text}`}>
            {word.english}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            <span className={`inline-block text-xs px-2 py-1 rounded-full ${colors.tag}`}>
              {word.word_type.toLowerCase()}
            </span>
            {word.processedTags?.detailed && renderTags(word.processedTags.detailed, 'detailed')}
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
