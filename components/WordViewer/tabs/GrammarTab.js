'use client'

// components/WordViewer/tabs/GrammarTab.js
// Renders grammar rules from the bundle with colour bar, chips for applies_to/srs_mechanic/rule_tags.

import { getWordTypeColors } from '../../../lib/word-type-utils'

const POS_COLOUR_BAR = {
  VERB: 'bg-teal-500',
  NOUN: 'bg-cyan-500',
  ADJECTIVE: 'bg-blue-500',
  ADVERB: 'bg-purple-500',
}

export default function GrammarTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)
  const barClass = POS_COLOUR_BAR[wordType] || 'bg-gray-400'

  const grammarRules = Array.isArray(fullBundle?.grammar_rules) ? fullBundle.grammar_rules : []

  if (isLoading && !fullBundle) {
    return <div className="p-4 text-sm text-gray-500">Loading grammar data...</div>
  }

  if (grammarRules.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No grammar rules available for this word.
      </div>
    )
  }

  // Sort rules by display_order if available
  const sortedRules = grammarRules
    .slice()
    .sort((a, b) => {
      const aOrder = Number.isFinite(a.display_order) ? a.display_order : 9999
      const bOrder = Number.isFinite(b.display_order) ? b.display_order : 9999
      return aOrder - bOrder
    })

  return (
    <div className="p-4 space-y-3">
      {sortedRules.map((rule, i) => {
        const ruleTags = Array.isArray(rule.rule_tags) ? rule.rule_tags : []

        return (
          <div key={rule.id || i} className="rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
            {/* Left colour bar */}
            <div className={`w-1.5 flex-shrink-0 ${barClass}`} />

            <div className="flex-1 min-w-0">
              {/* Rule header */}
              <div className={`px-3 py-2 ${colors.bg} border-b ${colors.border}`}>
                <h3 className={`text-sm font-semibold ${colors.text}`}>
                  {rule.title || 'Grammar Rule'}
                </h3>
              </div>

              {/* Rule body */}
              <div className="px-3 py-3 space-y-2">
                {/* Rule text (with HTML if available) */}
                {rule.rule_text_html || rule.rule_text_raw ? (
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: rule.rule_text_html || rule.rule_text_raw
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-400">No rule text available.</p>
                )}

                {/* Chips row: applies_to + srs_mechanic + rule_tags */}
                {(rule.applies_to || rule.srs_mechanic || ruleTags.length > 0) && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {rule.applies_to && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${colors.tag} font-medium`}
                        title="What this rule applies to"
                      >
                        {rule.applies_to}
                      </span>
                    )}
                    {rule.srs_mechanic && (
                      <span
                        className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium"
                        title="SRS learning mechanic"
                      >
                        SRS: {rule.srs_mechanic}
                      </span>
                    )}
                    {ruleTags.map((rt, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                      >
                        {typeof rt === 'string' ? rt : rt.label || rt.value || ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
