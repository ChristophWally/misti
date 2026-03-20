'use client'

// components/WordViewer/tabs/GrammarTab.js
// Renders grammar rules from the bundle. Word-level attributes are now in the header.

import { getWordTypeColors } from '../../../lib/word-type-utils'

export default function GrammarTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()
  const colors = getWordTypeColors(wordType)

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
      {sortedRules.map((rule, i) => (
        <div key={rule.id || i} className="rounded-lg border border-gray-200 overflow-hidden">
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

            {/* Applies to chip */}
            {rule.applies_to && (
              <div className="pt-2 flex flex-wrap gap-1">
                <span className={`text-xs px-2 py-1 rounded ${colors.tag}`}>
                  {rule.applies_to}
                </span>
              </div>
            )}

            {/* SRS mechanic if present */}
            {rule.srs_mechanic && (
              <div className="text-xs text-gray-500 italic pt-1">
                SRS: {rule.srs_mechanic}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
