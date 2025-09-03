// lib/tag-display-map.js
// Central mapping helpers for converting normalized tag objects into UI chips.

/**
 * Map translation-level optional tags (from RPC) to chip props.
 * Each input tag should be an object: { value, shorthand, label, description, attribute }
 */
export function mapOptionalTagsToChips(tags = []) {
  return (tags || [])
    .filter((t) => t && t.attribute === 'metaattr_opt_tag_translation')
    .filter((t) => !(t.value || '').startsWith('test_'))
    .map((t) => ({
      key: `${t.attribute}:${t.value}`,
      label: t.shorthand || t.label || t.value,
      title: t.description || '',
      className:
        'text-xs px-2 py-1 ml-1 rounded-full font-medium border bg-transparent text-gray-700 border-gray-400',
    }));
}

/**
 * Map word-level optional tags to chip props (not currently consumed by list view, but available).
 */
export function mapWordOptionalTagsToChips(tags = []) {
  return (tags || [])
    .filter((t) => t && t.attribute === 'metaattr_opt_tag_word')
    .filter((t) => !(t.value || '').startsWith('test_'))
    .map((t) => ({
      key: `${t.attribute}:${t.value}`,
      label: t.shorthand || t.label || t.value,
      title: t.description || '',
      className:
        'text-xs px-2 py-1 ml-1 rounded-full font-medium border bg-transparent text-gray-700 border-gray-400',
    }));
}

