'use client'

// components/WordViewer/tabs/FormsTab.js

import AudioButton from '../../AudioButton'
import ConjugationPanel from '../ConjugationPanel'

export default function FormsTab({ word, fullBundle, isLoading }) {
  const wordType = String(word?.word_type || '').toUpperCase()

  if (isLoading && !fullBundle) {
    return <div className="p-4 text-sm text-gray-500">Loading forms...</div>
  }

  if (wordType === 'VERB') {
    return <ConjugationPanel word={word} resolvedBundle={fullBundle} />
  }

  // Non-verb: render forms table
  const forms = Array.isArray(fullBundle?.forms)
    ? fullBundle.forms.filter(f => f.form_type !== 'conjugation')
    : []

  if (forms.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No forms data available.</div>
  }

  return (
    <div className="p-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Form</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Tags</th>
              <th className="py-2 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form, i) => {
              const audioDesc = form.primary_audio_descriptor || null
              const formTags = Array.isArray(form.tags) ? form.tags.join(', ') : ''
              // Show FTG translation if available
              const ftgTranslation = form.ftg_primary_translation || ''

              return (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 font-medium text-gray-900">
                    {form.form_text || form.italian || ''}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {ftgTranslation || formTags}
                  </td>
                  <td className="py-2 px-3 w-8">
                    {audioDesc && (
                      <AudioButton audioDescriptor={audioDesc} size="sm" wordType={word?.word_type} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
