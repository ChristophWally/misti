function normalizeTagValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function addTag(set, value) {
  const normalized = normalizeTagValue(value)
  if (normalized) set.add(normalized)
}

function getFirstValueByAttribute(tags = [], stableId) {
  const match = (tags || []).find((tag) => tag?.attribute_stable_id === stableId)
  return match?.value_label || null
}

function indexById(rows = []) {
  return new Map((rows || []).filter((row) => row?.id).map((row) => [row.id, row]))
}

function sortByVariantOrder(a, b) {
  const aOrder = Number.isFinite(a?.variant_order) ? a.variant_order : 9999
  const bOrder = Number.isFinite(b?.variant_order) ? b.variant_order : 9999

  if (aOrder !== bOrder) return aOrder - bOrder
  return String(a?.id || '').localeCompare(String(b?.id || ''))
}

function enrichPronunciationLink(link, pronunciationsById, mediaAssetsById) {
  const pronunciation = pronunciationsById.get(link?.pronunciation_id) || null
  const mediaAsset = mediaAssetsById.get(
    link?.media_asset_id || pronunciation?.media_asset_id || null
  ) || null

  return {
    ...link,
    pronunciation,
    media_asset: mediaAsset,
    ipa_pronunciation: link?.ipa_pronunciation || pronunciation?.ipa_pronunciation || null,
    phonetic_pronunciation:
      link?.phonetic_pronunciation || pronunciation?.phonetic_pronunciation || null,
    accent: link?.accent || pronunciation?.accent || null,
  }
}

function getEntityPronunciationLinks(
  entityType,
  entityId,
  pronunciationLinks = [],
  pronunciationsById,
  mediaAssetsById
) {
  return (pronunciationLinks || [])
    .filter((link) => link?.entity_type === entityType && link?.entity_id === entityId)
    .sort(sortByVariantOrder)
    .map((link) => enrichPronunciationLink(link, pronunciationsById, mediaAssetsById))
}

function resolvePrimaryAudio(pronunciationLinks = []) {
  const primary = (pronunciationLinks || [])[0] || null
  if (!primary) return null

  const mediaAsset = primary.media_asset || null

  return {
    pronunciation_link_id: primary.pronunciation_link_id || primary.id || null,
    pronunciation_id: primary.pronunciation_id || primary.pronunciation?.id || null,
    media_asset_id: mediaAsset?.id || primary.media_asset_id || null,
    bucket: mediaAsset?.storage_bucket || primary.storage_bucket || null,
    object_key: mediaAsset?.object_key || primary.audio_filename || null,
    voice_name: mediaAsset?.voice_name || primary.voice_name || null,
    ipa_pronunciation: primary.ipa_pronunciation || null,
    phonetic_pronunciation: primary.phonetic_pronunciation || null,
    accent: primary.accent || null,
  }
}

function hydratePronunciationGroup(group) {
  if (!group) return null
  const primaryAudio = group?.primary_audio || null

  return {
    ...group,
    primary_audio: primaryAudio,
    primary_audio_bucket: primaryAudio?.storage_bucket || null,
    primary_audio_object_key: primaryAudio?.object_key || null,
    primary_audio_voice_name: primaryAudio?.voice_name || null,
  }
}

function resolveFormTranslationGroups(formId, ftgs = [], translationsById) {
  const assignments = []

  for (const ftg of ftgs || []) {
    for (const link of ftg?.links || []) {
      if (link?.form_id !== formId) continue

      assignments.push({
        id: link.id,
        external_id: link.external_id,
        form_translation_group_link_id: link.id,
        form_translation_group_id: ftg.id,
        word_translation_id: ftg.word_translation_id,
        translation: ftg.translation,
        usage_notes: ftg.usage_notes,
        usage_examples: ftg.usage_examples,
        variant_order: link.variant_order,
        usage_label: link.usage_label,
        note: link.note,
        word_translation: translationsById.get(ftg.word_translation_id) || null,
      })
    }
  }

  return assignments.sort(sortByVariantOrder)
}

export function deriveLegacyWordTags(coreTags = [], optionalTags = []) {
  const out = new Set()

  ;[...coreTags, ...optionalTags].forEach((tag) => addTag(out, tag?.value_label))

  for (const tag of coreTags || []) {
    const stableId = tag?.attribute_stable_id
    const value = normalizeTagValue(tag?.value_label)

    if (stableId === 'metaattr002' && value) {
      out.add(`${value}-auxiliary`)
    }

    if (stableId === 'metaattr017' && value === 'reflexive') {
      out.add('reflexive-verb')
    }

    if (stableId === 'metaattr004') {
      if (value === 'are') out.add('are-conjugation')
      if (value === 'ere') out.add('ere-conjugation')
      if (value === 'ire') out.add('ire-conjugation')
      if (value === 'ire-isc') out.add('ire-isc-conjugation')
    }

    if (stableId === 'metaattr020') {
      if (value === 'transitive') out.add('transitive-verb')
      if (value === 'intransitive') out.add('intransitive-verb')
      if (value === 'ambitransitive') out.add('both-transitivity')
    }

    if (stableId === 'metaattr005' && value === 'irregular') {
      out.add('irregular-pattern')
    }
  }

  return Array.from(out)
}

export function deriveWordTagsFromTranslations(translations = []) {
  const out = new Set()

  for (const translation of translations || []) {
    const coreTags = translation?.core_tags || []
    for (const tag of coreTags) {
      const stableId = tag?.attribute_stable_id
      const value = normalizeTagValue(tag?.value_label)

      if (stableId === 'metaattr002' && value) {
        out.add(`${value}-auxiliary`)
      }

      if (stableId === 'metaattr020') {
        if (value === 'transitive') out.add('transitive-verb')
        if (value === 'intransitive') out.add('intransitive-verb')
        if (value === 'ambitransitive') out.add('both-transitivity')
      }

      if (stableId === 'metaattr021' && value.includes('reflexive')) {
        out.add('reflexive-verb')
      }
    }
  }

  return Array.from(out)
}

export function deriveLegacyFormTags(coreTags = [], optionalTags = []) {
  const out = new Set()

  ;[...coreTags, ...optionalTags].forEach((tag) => addTag(out, tag?.value_label))

  for (const tag of coreTags || []) {
    const stableId = tag?.attribute_stable_id
    const value = normalizeTagValue(tag?.value_label)

    if (stableId === 'metaattr002' && value) {
      out.add(`${value}-auxiliary`)
    }
  }

  const person = getFirstValueByAttribute(coreTags, 'metaattr014')
  const number = getFirstValueByAttribute(coreTags, 'metaattr012')

  if (person === 'prima-persona' && number === 'singolare') out.add('io')
  if (person === 'prima-persona' && number === 'plurale') out.add('noi')
  if (person === 'seconda-persona' && number === 'singolare') out.add('tu')
  if (person === 'seconda-persona' && number === 'plurale') out.add('voi')
  if (person === 'terza-persona' && number === 'singolare') {
    out.add('lui')
    out.add('lei')
  }
  if (person === 'terza-persona' && number === 'plurale') out.add('loro')

  if (!out.has('irregular') && coreTags.length > 0) {
    out.add('regular')
  }

  return Array.from(out)
}

export function deriveTranslationContextMetadata(coreTags = [], existing = null) {
  const derived = {
    auxiliary: getFirstValueByAttribute(coreTags, 'metaattr002'),
    number_restriction: getFirstValueByAttribute(coreTags, 'metaattr013'),
    register: getFirstValueByAttribute(coreTags, 'metaattr018'),
    transitivity: getFirstValueByAttribute(coreTags, 'metaattr020'),
    reflexive_type: getFirstValueByAttribute(coreTags, 'metaattr021'),
  }

  return {
    ...(existing || {}),
    ...Object.fromEntries(Object.entries(derived).filter(([, value]) => value)),
  }
}

export function hydrateBundleTranslation(translation) {
  const coreTags = translation?.core_tags || []
  return {
    ...translation,
    core_tags: coreTags,
    optional_tags: translation?.optional_tags || [],
    context_metadata: deriveTranslationContextMetadata(
      coreTags,
      translation?.context_metadata || null
    ),
  }
}

export function hydrateBundleForm(form, context = {}) {
  const coreTags = form?.core_tags || []
  const optionalTags = form?.optional_tags || []
  const translationsById = context.translationsById || new Map()
  const ftgs = context.formTranslationGroups || []
  const pronunciationLinks = context.pronunciationLinks || []
  const pronunciationsById = context.pronunciationsById || new Map()
  const mediaAssetsById = context.mediaAssetsById || new Map()

  const resolvedTranslationGroups = resolveFormTranslationGroups(
    form?.id,
    ftgs,
    translationsById
  )
  const resolvedPronunciationLinks = getEntityPronunciationLinks(
    'form',
    form?.id,
    pronunciationLinks,
    pronunciationsById,
    mediaAssetsById
  )
  const primaryAudio = resolvePrimaryAudio(resolvedPronunciationLinks)

  return {
    ...form,
    core_tags: coreTags,
    optional_tags: optionalTags,
    tags: deriveLegacyFormTags(coreTags, optionalTags),
    resolved_translation_groups: resolvedTranslationGroups,
    pronunciation_links: resolvedPronunciationLinks,
    primary_audio: primaryAudio,
    primary_ipa: primaryAudio?.ipa_pronunciation || form?.primary_ipa || null,
    primary_phonetic:
      primaryAudio?.phonetic_pronunciation || form?.primary_phonetic || null,
    audio_bucket: primaryAudio?.bucket || form?.primary_audio_bucket || null,
    audio_object_key: primaryAudio?.object_key || form?.primary_audio_object_key || null,
    audio_voice_name: primaryAudio?.voice_name || form?.primary_audio_voice_name || null,
    translation: resolvedTranslationGroups[0]?.translation || form?.translation || null,
  }
}

export function hydrateBundleWord(word, context = {}) {
  const directCoreTags = word?.word_direct_core_tags || []
  const inheritedCoreTags = word?.word_inherited_core_tags || []
  const displayCoreTags = word?.word_display_core_tags || word?.word_core_tags || []
  const optionalTags = word?.word_optional_tags || []
  const pronunciationLinks = context.pronunciationLinks || []
  const pronunciationsById = context.pronunciationsById || new Map()
  const mediaAssetsById = context.mediaAssetsById || new Map()
  const pronunciationGroups = (context.pronunciationGroups || word?.pronunciation_groups || [])
    .map(hydratePronunciationGroup)
    .filter(Boolean)

  const resolvedPronunciationLinks = getEntityPronunciationLinks(
    'word',
    word?.id,
    pronunciationLinks,
    pronunciationsById,
    mediaAssetsById
  )
  const primaryPronunciationGroup =
    hydratePronunciationGroup(word?.primary_pronunciation_group || pronunciationGroups[0] || null)
  const primaryAudio = primaryPronunciationGroup?.primary_audio || resolvePrimaryAudio(resolvedPronunciationLinks)

  return {
    ...word,
    word_direct_core_tags: directCoreTags,
    word_inherited_core_tags: inheritedCoreTags,
    word_display_core_tags: displayCoreTags,
    word_core_tags: displayCoreTags,
    word_optional_tags: optionalTags,
    tags: deriveLegacyWordTags(displayCoreTags, optionalTags),
    pronunciation_links: resolvedPronunciationLinks,
    pronunciation_groups: pronunciationGroups,
    primary_pronunciation_group: primaryPronunciationGroup,
    primary_audio: primaryAudio,
    primary_ipa: primaryAudio?.ipa_pronunciation || word?.primary_ipa || null,
    primary_phonetic:
      primaryAudio?.phonetic_pronunciation || word?.primary_phonetic || null,
    audio_bucket: primaryAudio?.bucket || word?.primary_audio_bucket || null,
    audio_object_key: primaryAudio?.object_key || word?.primary_audio_object_key || null,
    audio_voice_name: primaryAudio?.voice_name || word?.primary_audio_voice_name || null,
  }
}

export function hydrateCanonicalWordBundle(bundle = {}, fallbackWord = null) {
  const translations = (bundle?.translations || []).map(hydrateBundleTranslation)
  const translationsById = indexById(translations)
  const formTranslationGroups = bundle?.form_translation_groups || []
  const pronunciationLinks = bundle?.pronunciation_links || []
  const pronunciationGroups = bundle?.pronunciation_groups || bundle?.word?.pronunciation_groups || []
  const pronunciations = bundle?.pronunciations || []
  const mediaAssets = bundle?.media_assets || []
  const pronunciationsById = indexById(pronunciations)
  const mediaAssetsById = indexById(mediaAssets)

  const context = {
    translationsById,
    formTranslationGroups,
    pronunciationLinks,
    pronunciationGroups,
    pronunciationsById,
    mediaAssetsById,
  }

  const word = hydrateBundleWord(bundle?.word || fallbackWord || {}, context)
  const forms = (bundle?.forms || []).map((form) => hydrateBundleForm(form, context))

  return {
    ...bundle,
    word,
    translations,
    forms,
    form_translation_groups: formTranslationGroups,
    pronunciation_groups: pronunciationGroups,
    pronunciations,
    pronunciation_links: pronunciationLinks,
    media_assets: mediaAssets,
    media_links: bundle?.media_links || [],
    etymologies: bundle?.etymologies || [],
  }
}

export function getPrimaryAudioDescriptor(entity) {
  if (entity?.primary_audio) return entity.primary_audio
  if (entity?.primary_pronunciation_group?.primary_audio) {
    return entity.primary_pronunciation_group.primary_audio
  }
  if (Array.isArray(entity?.pronunciation_groups)) {
    const groupedAudio = entity.pronunciation_groups.find((group) => group?.primary_audio)?.primary_audio
    if (groupedAudio) return groupedAudio
  }

  const objectKey = entity?.audio_object_key || entity?.primary_audio_object_key || null
  const bucket = entity?.audio_bucket || entity?.primary_audio_bucket || null
  if (!objectKey) return null

  return {
    bucket,
    object_key: objectKey,
    voice_name: entity?.audio_voice_name || entity?.primary_audio_voice_name || null,
    ipa_pronunciation: entity?.primary_ipa || null,
    phonetic_pronunciation: entity?.primary_phonetic || null,
  }
}
