function normalizeTagValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function addTag(set, value) {
  const normalized = normalizeTagValue(value);
  if (normalized) set.add(normalized);
}

function getFirstValueByAttribute(tags = [], stableId) {
  const match = (tags || []).find((tag) => tag?.attribute_stable_id === stableId);
  return match?.value_label || null;
}

export function deriveLegacyWordTags(coreTags = [], optionalTags = []) {
  const out = new Set();

  [...coreTags, ...optionalTags].forEach((tag) => addTag(out, tag?.value_label));

  for (const tag of coreTags || []) {
    const stableId = tag?.attribute_stable_id;
    const value = normalizeTagValue(tag?.value_label);

    if (stableId === 'metaattr002' && value) {
      out.add(`${value}-auxiliary`);
    }

    if (stableId === 'metaattr017' && value === 'reflexive') {
      out.add('reflexive-verb');
    }

    if (stableId === 'metaattr004') {
      if (value === 'are') out.add('are-conjugation');
      if (value === 'ere') out.add('ere-conjugation');
      if (value === 'ire') out.add('ire-conjugation');
      if (value === 'ire-isc') out.add('ire-isc-conjugation');
    }

    if (stableId === 'metaattr020') {
      if (value === 'transitive') out.add('transitive-verb');
      if (value === 'intransitive') out.add('intransitive-verb');
      if (value === 'ambitransitive') out.add('both-transitivity');
    }

    if (stableId === 'metaattr005' && value === 'irregular') {
      out.add('irregular-pattern');
    }
  }

  return Array.from(out);
}

export function deriveWordTagsFromTranslations(translations = []) {
  const out = new Set();

  for (const translation of translations || []) {
    const coreTags = translation?.core_tags || [];
    for (const tag of coreTags) {
      const stableId = tag?.attribute_stable_id;
      const value = normalizeTagValue(tag?.value_label);

      if (stableId === 'metaattr002' && value) {
        out.add(`${value}-auxiliary`);
      }

      if (stableId === 'metaattr020') {
        if (value === 'transitive') out.add('transitive-verb');
        if (value === 'intransitive') out.add('intransitive-verb');
        if (value === 'ambitransitive') out.add('both-transitivity');
      }

      if (stableId === 'metaattr021' && value.includes('reflexive')) {
        out.add('reflexive-verb');
      }
    }
  }

  return Array.from(out);
}

export function deriveLegacyFormTags(coreTags = [], optionalTags = []) {
  const out = new Set();

  [...coreTags, ...optionalTags].forEach((tag) => addTag(out, tag?.value_label));

  for (const tag of coreTags || []) {
    const stableId = tag?.attribute_stable_id;
    const value = normalizeTagValue(tag?.value_label);

    if (stableId === 'metaattr002' && value) {
      out.add(`${value}-auxiliary`);
    }
  }

  const person = getFirstValueByAttribute(coreTags, 'metaattr014');
  const number = getFirstValueByAttribute(coreTags, 'metaattr012');

  if (person === 'prima-persona' && number === 'singolare') out.add('io');
  if (person === 'prima-persona' && number === 'plurale') out.add('noi');
  if (person === 'seconda-persona' && number === 'singolare') out.add('tu');
  if (person === 'seconda-persona' && number === 'plurale') out.add('voi');
  if (person === 'terza-persona' && number === 'singolare') {
    out.add('lui');
    out.add('lei');
  }
  if (person === 'terza-persona' && number === 'plurale') out.add('loro');

  if (!out.has('irregular') && coreTags.length > 0) {
    out.add('regular');
  }

  return Array.from(out);
}

export function deriveTranslationContextMetadata(coreTags = [], existing = null) {
  const derived = {
    auxiliary: getFirstValueByAttribute(coreTags, 'metaattr002'),
    number_restriction: getFirstValueByAttribute(coreTags, 'metaattr013'),
    register: getFirstValueByAttribute(coreTags, 'metaattr018'),
    transitivity: getFirstValueByAttribute(coreTags, 'metaattr020'),
    reflexive_type: getFirstValueByAttribute(coreTags, 'metaattr021'),
  };

  return {
    ...(existing || {}),
    ...Object.fromEntries(Object.entries(derived).filter(([, value]) => value)),
  };
}

export function hydrateBundleTranslation(translation) {
  const coreTags = translation?.core_tags || [];
  return {
    ...translation,
    core_tags: coreTags,
    optional_tags: translation?.optional_tags || [],
    context_metadata: deriveTranslationContextMetadata(coreTags, translation?.context_metadata || null),
  };
}

export function hydrateBundleForm(form) {
  const coreTags = form?.core_tags || [];
  const optionalTags = form?.optional_tags || [];

  return {
    ...form,
    core_tags: coreTags,
    optional_tags: optionalTags,
    tags: deriveLegacyFormTags(coreTags, optionalTags),
    form_translations: (form?.form_translations || []).map((assignment) => ({
      ...assignment,
      word_translation: null,
    })),
    azure_voice_name: form?.audio_voice_name || null,
  };
}

export function hydrateBundleWord(word) {
  const coreTags = word?.word_core_tags || [];
  const optionalTags = word?.word_optional_tags || [];

  return {
    ...word,
    word_core_tags: coreTags,
    word_optional_tags: optionalTags,
    tags: deriveLegacyWordTags(coreTags, optionalTags),
  };
}
